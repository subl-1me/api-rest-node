'use strict'

var Topic = require('../models/topic');
var validator = require('validator');

const topic = require("../models/topic");

var controller = {
    add: function(req, res){
        var topicId = req.params.topicId;

        Topic.findById(topicId).exec((err, topic) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Request error'
                }); 
            }

            if(!topic){
                return res.status(500).send({
                    status: 'error',
                    message: 'Topic not exists'
                }); 
            }

            if(req.body.content){
                // validate data
                try{
                    var validate_content = !validator.isEmpty(req.body.content);
                }catch(err){
                    return res.status(200).send({
                        status: 'error',
                        message: "Please, enter a valid comment."
                    });
                }   

                if(validate_content){
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,
                    };

                    topic.comments.push(comment);

                    // Save
                    topic.save((err) => {
                        if(err){
                            return res.status(200).send({
                                status: 'error',
                                message: "Error saving comment."
                            });
                        }

                        Topic.findById(topic._id)
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

                    }); 

                }else{
                    return res.status(200).send({
                        message: "Comment data is not valid."
                    }); 
                }   
            }

        }); 
    },
    
    update: function(req, res){
        var commentId = req.params.commentId;

        var params = req.body;

        // validate data
        try{
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                message: 'Empty comments are not valid'
            }); 
        }

        if(validate_content){
            // find subdocument
            Topic.findOneAndUpdate(
                { "comments._id": commentId } ,
                {
                    "$set":{
                        "comments.$.content": params.content
                    }   
                },
                {new: true},
                (err, topicUpdated) => {
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Request error'
                        }); 
                    }

                    if(!topicUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Topic not exists'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        topic: topicUpdated
                    }); 
                });
        }

    },

    delete: function(req, res){
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        Topic.findById(topicId, (err, topic) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Request error'
                }); 
            }

            if(!topic){
                return res.status(200).send({
                    status: 'error',
                    message: 'Topic not exists'
                });
            }

            var comment = topic.comments.id(commentId);

            if(comment){
                comment.remove();
                topic.save((err) => {   

                    if(err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Request error'
                        }); 
                    }

                    Topic.findById(topic._id)
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
                });
            } else {
                return res.status(500).send({
                    status: 'error',
                    message: 'Comment not exists'
                }); 
            }
        }); 
    }
};

module.exports = controller;