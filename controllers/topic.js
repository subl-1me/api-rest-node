'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {

    test: function(req, res){
        return res.status(200).send({
            message: 'im topic controller!'
        }); 
    },

    save: function(req, res){
        //get params
        var params = req.body;

        // validate data
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        }catch(err){
            return res.status(200).send({
                message: 'Please, fill the fields.'
            }); 
        }   

        if(validate_content && validate_title && validate_lang){
            // create topic
            var topic = new Topic();

            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            //save topic
            topic.save((err, topicStored) => {

                if(err || !topicStored){
                    return res.status(200).send({
                        status: 'error',
                        message: 'Error saving topic'
                    });
                }

                return res.status(200).send({
                 status: 'success',
                 topic: topicStored
                });  
            });

        }else{
            return res.status(200).send({
                message: 'Invalid data.'
            });  
        }

    },

    getTopics: function(req, res){
        
        // get actual page
        if(req.params.page == null || req.params.page == undefined || req.params.page == "0"){
            var page = 1;
        } else{
            var page = parseInt(req.params.page);
        }   

        // Paginate options
        var options = {
            sort: { date: -1},
            populate: 'user',
            limit: 5,
            page: page
        };

        Topic.paginate({}, options, (err, topics) => {
            if(err || !topics){
                return res.status(400).send({
                    message: 'Error loading topics'
                }); 
            }

            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            }); 
        }); 



    },

    getTopicsByUser: function(req, res){

        var userId = req.params.user;

        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {

            if(err){
                return res.status(400).send({
                    message: 'Error loading topics.'
                }); 
            }

            if(!topics){
                return res.status(400).send({
                    message: 'There are not topics to show.'
                });  
            }

            return res.status(200).send({
                status: 'success',
                topics
            }); 

        }); 

    },

    getTopic: function(req, res){
        // get topic id
        var topicId = req.params.id;

        Topic.findById(topicId)
        .populate('user')
        .populate('comments.user')
        .exec((err, topic) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Request error'
                });
            }

            if(!topic){
                return res.status(400).send({
                    status: 'error',
                    message: 'Error loading topic'
                });
            }

            return res.status(200).send({
                status: 'success',
                topic
            }); 
        }); 
    },

    update: function(req, res){
        var topicId = req.params.id;
        var params = req.body;

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        }catch(err){
            return res.status(200).send({
                message: 'please, fill the fields.'
            }); 
        }

        if(validate_title && validate_content && validate_lang){
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang

            };

            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdated) => {

                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Request error',
        
                    });
                } 

                if(!topicUpdated){
                    return res.status(200).send({
                        status: 'error',
                        message: 'Error updating topic.'
                    });
                }

                return res.status(200).send({
                    message: 'post updated successfully',
                    topic: topicUpdated
                });
            });

        }else{
            return res.status(400).send({
                message: 'Error validating data. Try again.'
            });
        }   
        // json with editable data
        


    },

    delete: function(req, res){
        var topicId = req.params.id;

        Topic.findByIdAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Request error'
                });
            }

            if(!topicRemoved){
                return res.status(400).send({
                    status: 'error',
                    message: 'Error removing topic. Try again later.'
                });
            }

            return res.status(200).send({
                status: 'success',
                topic: topicRemoved
            });
        }); 
    },

    search: function(req, res){
        var search = req.params.search;

        Topic.find({ "$or": [
            { "title": { "$regex": search, "$options": "i"} },
            { "content": { "$regex": search, "$options": "i"} },
            { "code": { "$regex": search, "$options": "i"} },
            { "lang": { "$regex": search, "$options": "i"} },
        ]})
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Request error'
                }); 
            }

            if(!topics){
                return res.status(400).send({
                    status: 'error',
                    message: 'There are not topics availables.'
                }); 
            }

            return res.status(200).send({
                status: 'success',
                topics: topics
            }); 
        }); 
    }

};

module.exports = controller;