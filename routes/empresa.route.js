'use strict'

var express = require('express');
var empresaController = require('../controllers/empresa.controller');
var api = express.Router();
var mdAuth = require('../middlewares/authenticated');

api.get('/prueba', empresaController.prueba);
api.post('/admin', empresaController.admin);
api.post('/login',empresaController.login);
api.post('/createEmpresa',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],empresaController.createEmpresa);
api.put('/updateEmpresa/:id',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],empresaController.updateEmpresa);
api.delete('/removeEmpresa/:id',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],empresaController.removeEmpresa);
api.get('/getEmpresas',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],empresaController.getEmpresas);

module.exports = api;