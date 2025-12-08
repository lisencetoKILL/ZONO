const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,


})

module.exports = mongoose.model('staff', staffSchema);