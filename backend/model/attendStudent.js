const mongoose = require("mongoose");

const attendStudentSchema = new mongoose.Schema({
    name: String,
    year: String,
    department: String,
    roll: Number,
    ien: Number,
    password: String

})

module.exports = mongoose.model('attendStudent', attendStudentSchema);