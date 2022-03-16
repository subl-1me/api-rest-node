'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function(user){

    var payload = { // object to generate token
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    }

    return jwt.encode(payload, 'key--params--t0k3n-01597534-bacon');
};
