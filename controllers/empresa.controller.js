'use stric'

var Empresa = require('../models/empresa.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function prueba(req,res){
    res.send({message: 'Funcionando desde controlador de empresas'});
}

function admin(req,res){
    Empresa.findOne({username: 'ADMIN'},(err,adminFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor al iniciar'});
        }else if(adminFind){
            console.log('El usuario admin ya existe');
           // return res.send({message: 'El usuario ADMIN ya existe'});
        }else{
            var empresa = new Empresa();
            bcrypt.hash("12345",null,null,(err,passwordHashed)=>{
                if(err){
                    return res.status(500).send({message: 'Error al encriptar la contraseña de ADMIN'});
                }else if(passwordHashed){
                    empresa.username = 'ADMIN';
                    empresa.password = passwordHashed;
                    empresa.role = 'ROLE_ADMIN';
                    empresa.save((err,empresaSaved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al crear el usuario admin'});
                        }else if(empresaSaved){
                            console.log('El usuario ADMIN a sido creado exitosamente');
                            //return res.send({message: 'Usuario admin creado exitosamente',empresaSaved});
                        }else{
                            return res.status(404).send({message: 'No se creo el usuario admin'});
                        }
                    })
                }else{
                    return res.status(404).send({message: 'No se encriptó la contraseña'});
                }
            })
        }
    })
}

function login(req,res){
    var params = req.body;

    if(params.username && params.password){
        Empresa.findOne({username: params.username},(err,empresaFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'});
            }else if(empresaFind){
                bcrypt.compare(params.password,empresaFind.password,(err,chekPassword)=>{
                    if(err){
                        return res.status(500).send({message:'Error al comparar la contraseña'});
                    }else if (chekPassword){
                        if(params.gettoken){
                            return res.send({token:jwt.createToken(empresaFind)});
                        }else{
                            return res.send({message: 'Bienvenido'})
                        }
                    }else{
                        return res.status(404).send({message: 'Contraseña incorrecta'})
                    }
                })
            }else{
                return res.send({message: 'El usuario no existe'});
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese los datos minimos (usuario y contraseña)'});
    }
}

function createEmpresa(req,res){
    var params = req.body;
    var empresa = new Empresa();

    if(params.name && params.phone && params.email && params.username && params.password){
        Empresa.findOne({username: params.username},(err,empresaFind)=>{
            if(err){
                return res.status(500).send({message: 'Error en el servidor al buscar'});
            }else if(empresaFind){
                return res.send({message: 'Usuario ya utilizado, ingrese otro'});
            }else{
                bcrypt.hash(params.password,null,null,(err,passwordHashed)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al encriptar contraseña'});
                    }else if(passwordHashed){
                        empresa.name = params.name;
                        empresa.address = params.address;
                        empresa.phone = params.phone;
                        empresa.email = params.email;
                        empresa.username = params.username;
                        empresa.password = passwordHashed;
                        if(params.role == 'ROLE_ADMIN'){
                            empresa.role = 'ROLE_ADMIN';
                        }else{
                            empresa.role = 'ROLE_EMPRESA';
                        }
                        empresa.save((err,empresaSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error en el servidor al guardar'});
                            }else if(empresaSaved){
                                return res.send({message: 'Empresa guardada exitosamente',empresaSaved});
                            }else{
                                return res.status(404).send({message: 'No se guardó la empresa'});
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'No se encriptó la contraseña'});
                    }
                })
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese los datos mínimos'});
    }
}

function updateEmpresa(req,res){
    let empresaId = req.params.id;
    let update = req.body;

    if(update.password){
        return res.send({message: 'No se puede actualizar la contraseña'});
    }else{
        Empresa.findOne({username: update.username},(err,empresaFind)=>{
            if(err){
                return res.status(500).send({message: 'Error al buscar'});
            }else if(empresaFind){
                return res.send({message: 'Nombre de usuario ya utilizado'});
            }else{
                Empresa.findByIdAndUpdate(empresaId,update,{new:true},(err,empresaUpdated)=>{
                    if(err){
                        return res.status(500).send({message: 'Error en el servidor al actualizar'});
                    }else if(empresaUpdated){
                        return res.send({message: 'Empresa actualizada exitosamente',empresaUpdated});
                    }else{
                        return res.status(404).send({message: 'No se actualizó'});
                    }
                })
            }
        })
    }
}

function removeEmpresa(req,res){
    let empresaId = req.params.id;

    Empresa.findOne({_id:empresaId},(err,empresaFind)=>{
        if(err){
            return res.status(500).send({message: 'Error en el servidor al buscar'});
        }else if(empresaFind){
            Empresa.findByIdAndRemove(empresaId,(err,empresaRemoved)=>{
                if(err){
                    return res.status(500).send({message:'Error al intentar eliminar'});
                }else if(empresaRemoved){
                    return res.send({message: 'Empresa eliminada exitosamente'});
                }else{
                    return res.status(404).send({message: 'No se eliminó'});
                }
            })
        }else{
            return res.status(403).send({message: 'Empresa inexistente'});
        }
    })
}

function getEmpresas(req,res){
    Empresa.find({}).populate("employees").exec((err,empresas)=>{
        if(err){
            return res.status(500).send({message: "Error al obtener datos"});
        }else if(empresas){
            return res.send({message: "Empresas:", empresas});
        }else{
            return res.status(403).send({message: "No hay registros"});
        }
    })
}

module.exports= {
    prueba,
    admin,
    login,
    createEmpresa,
    updateEmpresa,
    removeEmpresa,
    getEmpresas
}
