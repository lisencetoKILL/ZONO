const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
    name: { type: String }, // Classroom name (e.g., C101)
    year: { type: String },  // Year (e.g., 2025)
    department: { type: String }, // Department (e.g., CS)
    boundaries: {
        lat1: { type: Number }, // Bottom-left latitude
        lon1: { type: Number }, // Bottom-left longitude
        lat2: { type: Number }, // Top-right latitude
        lon2: { type: Number }  // Top-right longitude
    }
});

module.exports = mongoose.model("Classroom", ClassroomSchema);
