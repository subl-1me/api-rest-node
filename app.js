'use strict'

// Requires
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json()); // convert htpp request to json

// cors

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// load routes file
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comments_routes = require('./routes/comments');

// Routes
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comments_routes);




module.exports = app;
