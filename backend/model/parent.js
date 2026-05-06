const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

module.exports = mongoose.model('parent', parentSchema);
