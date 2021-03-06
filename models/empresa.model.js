'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var empresaSchema = Schema({
    name: String,
    address: String,
    phone: Number,
    email: String,
    username: String,
    password: String,
    role: String,
    employees: [{type: Schema.ObjectId, ref : 'employee'}]
})

module.exports = mongoose.model('empresa', empresaSchema);