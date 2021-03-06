'use strict'

var express = require('express');
var empleadoController = require('../controllers/empleado.controller');
var api = express.Router();
var mdAuth = require('../middlewares/authenticated');

api.put('/createEmpleado/:id',mdAuth.ensureAuth,empleadoController.createEmpleado);
api.put('/:id/updateEmpleado/:idE',mdAuth.ensureAuth,empleadoController.updateEmpleado);
api.put('/:id/removeEmpleado/:idE',mdAuth.ensureAuth,empleadoController.removeEmpleado);
api.get("/getEmpleados/:id",mdAuth.ensureAuth,empleadoController.getEmpleados);
api.get('/searchEmpleado',mdAuth.ensureAuth,empleadoController.searchEmpleado);
api.post("/pdfEmpresa/:id",mdAuth.ensureAuth,empleadoController.pdfEmpresa);


module.exports = api;
