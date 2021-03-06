'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'IN6AM';

exports.createToken = (empresa)=>{
    var payload = {
        sub: empresa._id,
        name: empresa.name,
        address: empresa.address,
        phone: empresa.phone,
        email: empresa.email,
        role: empresa.role,
        iat: moment().unix(),
        exp: moment().add(3, 'minutes').unix()
    }
    return jwt.encode(payload,secretKey);
}