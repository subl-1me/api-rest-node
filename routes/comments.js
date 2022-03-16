'use strict'

var express = require('express');
var commentsController = require('../controllers/comments');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

router.post('/comment/topic/:topicId', md_auth.authenticated, commentsController.add);
router.put('/comment/:commentId', md_auth.authenticated, commentsController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, commentsController.delete);


module.exports = router;