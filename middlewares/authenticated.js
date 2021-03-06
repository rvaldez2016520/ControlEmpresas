'use strict'

var jwt = require('jwt-simple');
var moment =require ('moment');
var secretKey = 'IN6AM';

exports.ensureAuth = (req,res,next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'El header no lleva token'});
    }else{
        var token = req.headers.authorization.replace(/[""]+/g,"");
        try{
            var payload = jwt.decode(token,secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'El token a expirado'});
            }
        }catch(err){
            return res.status(404).send({message: 'El token no es válido'})
        }
    }
    req.empresa = payload;
    console.log(req.empresa);
    next();
}

exports.ensureAuthAdmin =(req,res,next)=>{
    var payload = req.empresa;
    if(payload.role != "ROLE_ADMIN"){
        return res.status(401).send({message:"solo los administradores tienen acceso"});
    }else{
        return next();
    }
}
