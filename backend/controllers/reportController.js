const Report = require('../model/report');
const Student = require('../model/student');

// Controller to handle report submission
exports.createReport = async (req, res) => {
    const { studentId } = req.params;
    const { report } = req.body;

    try {

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Create new report
        const newReport = new Report({
            studentId,
            report,
        });

        // Save report to the database
        await newReport.save();
        res.status(201).json({ message: 'Report submitted successfully!' });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Server error while submitting report' });
    }
};
