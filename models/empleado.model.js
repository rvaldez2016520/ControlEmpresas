'use strict'

var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var empleadoSchema = Schema({
    name: String,
    charge: String,
    department: String
})

module.exports = mongoose.model('employee', empleadoSchema);