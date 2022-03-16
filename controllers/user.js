'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
const user = require('../models/user');

var controller = {
    /*test: function(req, res){
        return res.status(200).send({
            message: "i am get method"
        });
    },*/

    save: function(req, res){
        // get params
        var params = req.body;

        // validate
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(400).send({
                message: "Please, fill the fields."
            });
        }

        if(validate_email && validate_name && validate_password && validate_surname){
            var user = new User();

            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;
            user.password = params.password;

            // user exists?
            User.findOne({email: user.email}, (err, issetUser) => {
                if(err){
                    return res.status(500).send({
                        message: "Error to verify user's duplicity."
                    });
                }

                if(!issetUser){
                    // password bcrypt
                    const saltRounds = 10;

                    bcrypt.hash(user.password, saltRounds, function(err, hash) {
                        user.password = hash;

                        user.save((err, userStored) => {
                            if(err){
                                return res.status(500).send({
                                    message: "Error saving user."
                                });
                            }

                            if(!userStored){
                                if(err){
                                    return res.status(500).send({
                                        message: "Error saving user."
                                    });
                                }
                            }

                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });
                        }); // close saved
                    }); // close bcrypt
                
                   
                }else{
                    return res.status(500).send({
                        message: "The email address is already take. Please choose another."
                    });
                }
             });

        }else{
            return res.status(400).send({
                message: "Error validating data."
            });
        }
    },

    login: function(req, res){
        // get params
        var params = req.body;

        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(400).send({
                message: "Please, fill the fields."
            });
        }

        if(!validate_email || !validate_password){
            return res.status(200).send({
                message: "Error validating data, try again."
            }); 
        }

        User.findOne({email: params.email.toLowerCase()}, (err, user) => {

            if(err){
                return res.status(500).send({
                    message: "Error trying login"
                });
            }

            if(!user){
                return res.status(500).send({
                    message: "User doesn't exists"
                });
            }

            //if exists
            bcrypt.compare(params.password, user.password, (err, check) => {

                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error trying login. Try again.'
                    }); 
                }

                if(check){

                    // generate token
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                         // clean object
                        user.password = undefined;

                        return res.status(200).send({
                            status: 'success',
                            user
                         });
                    }

                   
                }else{
                    return res.status(200).send({
                        message: "Error to login. Check your credentials."
                    });
                }
            }); // bcrypt ends
        })
    },

    update: function(req, res){
        // Get params
        var params = req.body;

        // validate
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }catch(err){
            return res.status(400).send({
                message: "Please, check the fields."
            });
        }   

        delete params.password;

        // check if email exists
        var userId = req.user.sub;
        User.findOne({_id: userId}, (err, getUser) => {
            var userEmail = getUser.email;

            if(err){
                return res.status(400).send({
                    message: "User doesn't exists"
                });
            }

            if(userEmail != params.email){
                User.findOne({email: params.email.toLowerCase()}, (err, temp) => {

                    if(err){
                        return res.status(400).send({
                            message: "Error updating email. Try again."
                        });
                    }

                    // email taken
                    if( temp != null){
                        return res.status(400).send({
                            message: "Email already taken."
                        }); 
                    }else{
                        // email can be used
                        User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                            if(err){
                                return res.status(400).send({
                                    message: "Error updating user. Try again later."
                                });  
                            }
                
                            delete userUpdated.password;
                            return res.status(200).send({
                                status: 'success',
                                userUpdated: userUpdated,
                            }); 
                        });
                    }
                });
            }else{
                User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                    if(err){
                        return res.status(400).send({
                            message: "Error updating user. Try again later."
                        });  
                    }
        
                    delete userUpdated.password;
                    console.log(userUpdated);
                    return res.status(200).send({
                        status: 'success',
                        userUpdated: userUpdated,
                    }); 
                });
            }

        });
    },

    uploadAvatar: function(req, res){
        var file_name = 'No avatar';

        if(!req.file){
            return res.status(404).send({
                status: 'error',
                message: file_name
            }); 
        }

        // get name and extension file
        var file_path = req.file.path;
        var file_split = file_path.split('\\');

        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // verify ext
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err) => {
                return res.status(400).send({
                    status: 'error',
                    message: 'file ext is not valid.',
                    file: file_ext
                });
            });
        }else{

            var userId = req.user.sub;

            User.findOneAndUpdate({_id: userId}, {image: file_name}, {new: true}, (err, userUpdated) => {
                if(err || !userUpdated){
                    // response fail
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error to upload image'
                    }); 
                } else {
                    // response ok
                    return res.status(200).send({
                        status: 'success',
                        image: file_name,
                        user: userUpdated
                    }); 
                }
            });
        }
     
    },

    avatar: function(req, res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(pathFile));
            }else{
                // response ok
                return res.status(404).send({
                    status: 'error',
                    message: 'Image does not exists.'
                }); 
            }
        });

    },

    getUsers: function(req, res){
        User.find().exec((err, users) => {
            if(err || !users){
                return res.status(404).send({
                    status: 'error',
                    message: 'There are not users to show.',
                });  
            }

            return res.status(200).send({
                status: 'success',
                users
            });  
        });
    },

    getUser: function(req, res){
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if(err || !user){
                return res.status(404).send({
                    status: 'error',
                    message: 'User not exists in database.'
                });  
            }

            return res.status(200).send({
                status: 'success',
                user
            }); 
        });
    }   
};

module.exports = controller;