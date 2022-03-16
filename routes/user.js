'use strict'

var express = require('express');
var userController = require('../controllers/user');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

//var multipart = require('connect-multiparty');
//var md_upload = multipart({ uploadDir: './uploads/users' });

// upload files

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/users/');
    },
    filename: function(req, file, cb){
        cb(null, 'user' + Date.now() + file.originalname);
    }
});
const upload = multer({storage: storage});


// Test routes
//router.get('/test', userController.test);

// User routes
router.post('/register', userController.save);
router.post('/login', userController.login);
router.put('/user/update', md_auth.authenticated, userController.update);
router.post('/upload-avatar', [md_auth.authenticated, upload.single('file0')], userController.uploadAvatar);
router.get('/avatar/:fileName', userController.avatar);
router.get('/users', userController.getUsers);
router.get('/user/:userId', userController.getUser);


module.exports = router;