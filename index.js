'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.Promise = global.Promise;
// connection with db
mongoose.connect('mongodb://localhost:27017/api-rest-node', { useNewUrlParser: true })
                    .then(() => {

                        console.log('Connection successfully with db');
                        
                        // create server
                        app.listen(port, () => {
                            console.log('server is OK');
                            
                        });


                    }).catch(error => console.log(error));


