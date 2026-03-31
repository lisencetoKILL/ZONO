const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    role: { type: String, default: 'teacher' },
    institutionId: { type: String, default: '' },
    managedByAdmin: { type: String, default: '' },


})

module.exports = mongoose.model('staff', staffSchema);