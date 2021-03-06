'use strict'

const { replaceOne } = require('../models/empleado.model');
var Empleado = require('../models/empleado.model');
var Empresa = require('../models/empresa.model');

function createEmpleado(req,res){
    var empresaId = req.params.id;
    var empleado = new Empleado();
    var params = req.body;

    if(empresaId == req.empresa.sub || req.empresa.role == 'ROLE_ADMIN'){
        if(params.name && params.charge && params.department){
            Empresa.findById(empresaId,(err,empresaFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error al buscar empresa'});
                }else if(empresaFind){
                    empleado.name = params.name;
                    empleado.charge = params.charge;
                    empleado.department = params.department;
                    empleado.save((err,empleadoSaved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al guardar empleado'});
                        }else if(empleadoSaved){
                            Empresa.findByIdAndUpdate(empresaId,{$push:{employees:empleadoSaved._id}},{new:true},(err,empleadoPushed)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error al conectar el empleado con empresa'});
                                }else if(empleadoPushed){
                                    return res.send({message: 'Empleado agregado exitosamente',empleadoPushed});
                                }else{
                                    return res.status(404).send({message: 'No se pudo conectar el empleado con empresa'});
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'No se guardó el empleado'});
                        }
                    })
                }else{
                    return res.status(403).send({message: 'No existe la empresa'});
                }
            })
        }else{
            return res.status(403).send({message: 'Ingrese los datos mínimos'});
        }
    }else{
        return res.status(401).send({message: 'No tienes permiso para crear un empleado en esta empresa'});
    }
}

function updateEmpleado(req,res){
    let empresaId = req.params.id;
    let empleadoId = req.params.idE;
    let update = req.body;

    if(empresaId == req.empresa.sub || req.empresa.role == 'ROLE_ADMIN'){
        if(update.name && update.charge && update.department){
            Empleado.findById(empleadoId,(err,empleadoFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error al buscar empleado'});
                }else if(empleadoFind){
                    Empresa.findOne({_id:empresaId,employees: empleadoId},(err,empresaFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al buscar empresa'});
                        }else if(empresaFind){
                            Empleado.findByIdAndUpdate(empleadoId,update,{new:true},(err,empleadoUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error al intentar actualizar'});
                                }else if(empleadoUpdated){
                                    return res.send({message: 'Empleado actualizado",empleadoUpdated'});
                                }else{
                                    return res.status(404).send({message: 'No se actualizó'});
                                }
                            })
                        }else{
                            return res.status(403).send({message: 'El empleado no existe'});
                        }
                    })
                }else{
                    return res.status(403).send({message: 'No existe el empleado'});
                }
            })
        }else{
            return res.status(403).send({message: 'Ingrese los datos mínimos'});
        }
    }else{
        return res.status(401).send({message: 'No tienes permiso para actualizar un empleado de esta empresa'});
    }
}

function removeEmpleado(req,res){
    let empresaId = req.params.id;
    let empleadoId = req.params.idE;

    if(empresaId == req.empresa.sub || req.empresa.role == 'ROLE_ADMIN'){
        Empresa.findOneAndUpdate({_id: empresaId,employees:empleadoId},{$pull:{employees:empleadoId}},{new:true},(err,empleadoPulled)=>{
            if(err){
                return res.status(500).send({message: 'Error en el servidor al intentar eliminar'});
            }else if(empleadoPulled){
                return res.send({message: 'Empleado eliminado exitosamente'});
            }else{
                return res.status(404).send({message: 'El empleado no existe o ya fue eliminado'});
            }
        })
    }else{
        return res.status(401).send({message: 'No tienes permiso para eliminar un empleado de esta empresa'});
    }
}

function getEmpleados(req,res){
    let empresaId = req.params.id;

    if(empresaId == req.empresa.sub || req.empresa.role == "ROLE_ADMIN"){
        Empresa.find({_id:empresaId}).populate("employees").exec((err,empleadosFind)=>{
            if(err){
                return res.status(500).send({message: "Error en el servidor al buscar"});
            }else if(empleadosFind){
                return res.send({message: "Empleados de la empresa:",empleadosFind});
            }else{
                return res.status(403).send({message: "No hay registros"});
            }
        })
    }else{
        return res.status(401).send({message: "No tienes permiso para listar empleados de esta empresa"});
    }
}

function searchEmpleado(req,res){
    var params = req.body;

    if(params.search){
        Empleado.find({$or:[{name: params.search},{charge: params.search},{department: params.search}]},(err,resultSearch)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar"});
            }else if(resultSearch){
                return res.send({message: "Coincidencias encontradas",resultSearch});
            }else{
                return res.status(403).send({message: "No se encontraron coincidencias"});
            }
        })
    }else if(params.search == ""){
        Empleado.find({}).exec((err,empleados)=>{
            if(err){
                return res.status(500).send({message: "Error al obtener todos los empleados"});
            }else if(empleados){
                return res.send({message: "Empleados encontrados:",empleados});
            }else{
                return res.status(403).send({message: "No se encontraron empleados"});
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese el campo de búsqueda"});
    }
}

function pdfEmpresa(req, res){
    let empresaId = req.params.id;

    if(empresaId == req.empresa.sub || "ROLE_ADMIN" == req.empresa.role){
        Empresa.findOne({_id: empresaId}).populate().exec((err, empresaFind)=>{
            if(err){
                res.status(500).send({message: 'Error al mostrar datos'})
            }else if(empresaFind){
                let empleados = empresaFind.employees;
                let empleadosFinded = [];
                var empleadosPDF = [];
    
                empleados.forEach(elemento =>{
                    empleadosFinded.push(elemento);
                })
    
                empleadosFinded.forEach(elemento=>{
                    Empleado.find({_id: elemento}).exec((err, empleadoFind)=>{
                        if(err){
                            console.log(err);
                            return res.status(500).send({message: "Error al buscar empleado"});
                        }else if(empleadosFinded.length >= 0){
                            let empleados = empleadoFind;
                            empleados.forEach(elemento =>{
                                empleadosPDF.push(elemento);
                            })
                            let content = `
                                <!doctype html>
                                <html>
                                    <head>
                                        <meta charset = "utf-8">
                                        <title>PDF</title>
                                    </head>
                                    <body>
                                        <div style="text-align:center; margin-top:70px">
                                            <table border = "1" style="margin: 0 auto; border-collapse: collapse;" >
                                                <tbody>
                                                    <tr>
                                                        <th>Nombre</th>
                                                        <th>Puesto</th>
                                                        <th>Departamento</th>
                                                    </tr>
                                                    <tr>
                                                        ${empleadosPDF.map(empleados => `
                                                                                        <tr>
                                                                                        <td>${empleados.name}</td>
                                                                                        <td>${empleados.puesto}</td>
                                                                                        <td>${empleados.departamento}</td>
                                                                                        </tr>                                                                                  
                                                                        `).join(``)}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </body>
                                </html>
                            `;
                            let options = {
                                paginationOffset :1,
                                "header":{
                                    "height": "45px",
                                    "font-size":"70px;",
                                    "contents" : '<div style="text-align: center;font-size:60px;background-color:3945AA;color:white;font-family:Helvetica">' + empresaFind.name + '</div>'
                                }
                            }
                            pdf.create(content, options).toFile('./PDF/Empleados de '+ empresaFind.name + '.pdf', 
                            function (err, res){
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log(res);
                                }
                            })
                        }else{
                            res.status(404).send({message: 'No se encontró ningun dato'})
                        }
                    })
                })
                res.status(200).send({message: "El PDF creado exitosamente"});
            }else{
                res.status(404).send({message: "No hay registros"});
            }
        })
    }else{
        return res.status(401).send({message: "No tienes permisos para realizar un PDF de esta empresa"});
    }
}

module.exports= {
    createEmpleado,
    updateEmpleado,
    removeEmpleado,
    getEmpleados,
    searchEmpleado,
    pdfEmpresa
}
