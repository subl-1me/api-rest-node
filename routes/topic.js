'use strict'

var express = require('express');
var topiController = require('../controllers/topic');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

router.get('/test', topiController.test);
router.post('/topic', md_auth.authenticated, topiController.save);
router.get('/topics/:page?', topiController.getTopics);
router.get('/user-topics/:user', topiController.getTopicsByUser);
router.get('/topic/:id', topiController.getTopic);
router.put('/topic/:id', md_auth.authenticated, topiController.update);
router.delete('/topic/:id', md_auth.authenticated, topiController.delete);
router.get('/search/:search', topiController.search);

module.exports = router;