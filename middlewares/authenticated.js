'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'key--params--t0k3n-01597534-bacon';

exports.authenticated = function(req, res, next){

    // check if back-end recieve auth
    if(!req.headers.authorization){
        return res.status(403).send({
            message: "header doesn't have authorization"
        }); 
    }

    // clean
    var token = req.headers.authorization.replace(/['"]+/g, '');

    // decode token;
    try{
        var payload = jwt.decode(token, secret);

        if(payload.exp <= moment().unix){
            return res.status(404).send({
                message: 'Expired token'
            });
        }

    }catch(ex){
        return res.status(404).send({
            message: 'Invalid token'
        });
    }

    req.user = payload;

    next();
}