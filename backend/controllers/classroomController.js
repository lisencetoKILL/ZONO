const Classroom = require("../model/classroom");

// **1. Add a New Classroom**
exports.addClassroom = async (req, res) => {
    try {
        const { name, year, department, boundaries } = req.body;

        // Validation: Check if all fields are provided
        if (!name || !year || !department || !boundaries || !boundaries.lat1 || !boundaries.lon1 || !boundaries.lat2 || !boundaries.lon2) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Create a new classroom entry
        const newClassroom = new Classroom({
            name,
            year,
            department,
            boundaries
        });

        await newClassroom.save();

        return res.status(201).json({ success: true, message: "Classroom added successfully", classroom: newClassroom });
    } catch (error) {
        console.error("Error adding classroom:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// **2. Get All Classrooms**
exports.getClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find();
        return res.status(200).json({ success: true, classrooms });
    } catch (error) {
        console.error("Error fetching classrooms:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// **4. Update Classroom Boundaries**
exports.updateClassroom = async (req, res) => {
    try {
        const { id } = req.params; // Classroom ID from URL
        const { name, department, boundaries } = req.body; // Fields to update

        // Validation: At least one field must be provided for update
        if (!name && !department && !boundaries) {
            return res.status(400).json({ success: false, message: "At least one field is required to update" });
        }

        // Validation: If boundaries are provided, ensure all fields are present
        if (boundaries) {
            const { lat1, lon1, lat2, lon2 } = boundaries;
            if (!lat1 || !lon1 || !lat2 || !lon2) {
                return res.status(400).json({ success: false, message: "All boundary coordinates are required" });
            }
        }

        // Find classroom by ID and update fields dynamically
        const updatedClassroom = await Classroom.findByIdAndUpdate(
            id,
            { $set: { ...(name && { name }), ...(department && { department }), ...(boundaries && { boundaries }) } },
            { new: true } // Return updated document
        );

        if (!updatedClassroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Classroom details updated successfully",
            classroom: updatedClassroom
        });

    } catch (error) {
        console.error("Error updating classroom:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// **5. Delete a Classroom**
exports.deleteClassroom = async (req, res) => {
    try {
        const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);

        if (!deletedClassroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        res.json({ success: true, message: "Classroom deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting classroom", error });
    }
};

//------------


exports.checkIfInClassroom = async (req, res) => {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    try {
        const classrooms = await Classroom.find();

        const EPSILON = 0.0000005; // ~5 cm precision buffer

        const matchedClassroom = classrooms.find((classroom) => {
            const { lat1, lon1, lat2, lon2 } = classroom.boundaries;

            // Normalize rectangle coordinates
            const minLat = Math.min(lat1, lat2);
            const maxLat = Math.max(lat1, lat2);
            const minLon = Math.min(lon1, lon2);
            const maxLon = Math.max(lon1, lon2);

            return (
                latitude >= (minLat - EPSILON) &&
                latitude <= (maxLat + EPSILON) &&
                longitude >= (minLon - EPSILON) &&
                longitude <= (maxLon + EPSILON)
            );
        });

        if (matchedClassroom) {
            return res.json({
                inside: true,
                classroom: {
                    id: matchedClassroom._id,
                    name: matchedClassroom.name,
                    department: matchedClassroom.department,
                    year: matchedClassroom.year
                }
            });
        } else {
            return res.json({ inside: false });
        }
    } catch (error) {
        console.error("Error checking location:", error);
        return res.status(500).json({ error: "Server error while checking location" });
    }
};


