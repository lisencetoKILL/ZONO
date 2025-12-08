const Student = require('../model/student');

// Function to save student data
exports.saveStudentData = async (req, res) => {
    const {
        'Student Name': studentName,
        Branch,
        IEN,
        UID,
        Batch,
        'e-Mail ID': email,
        'Admission Year': admissionYear,
        'Blood Group': bloodGroup,
        'Date of Birth': dobString,
        Address,
        "Parent's contact": parentsContact,
        "Student's contact": studentsContact,
        Category,
        Year
    } = req.body;

    console.log('Request body:', req.body);

    // Basic validation check for required fields
    if (!studentName || !Branch || !IEN || !UID || !Batch || !email || !admissionYear || !bloodGroup || !dobString || !Address || !parentsContact || !studentsContact || !Category || !Year) {
        return res.status(400).json({ message: 'Invalid data. Required fields are missing.' });
    }

    try {
        console.log('Received Student Name:', studentName);

        // Validate and parse 'Date of Birth'
        if (typeof dobString !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing date of birth.' });
        }

        const [day, month, year] = dobString.split('-');
        const dateOfBirth = new Date(`${year}-${month}-${day}`);

        if (isNaN(dateOfBirth.getTime())) {
            return res.status(400).json({ message: 'Invalid date of birth format.' });
        }

        const qrData = req.body.qrData || {};

        // Find the student by IEN
        const student = await Student.findOne({ ien: IEN });

        if (student) {
            console.log("Student In DB");

            // Determine which time field to update
            if (!student.outTime || (student.createdAt && student.outTime && student.createdAt > student.outTime)) {
                // If 'outTime' is missing or 'createdAt' is more recent, update 'outTime'
                student.outTime = new Date(); // Set current time for 'outTime'
                console.log("Updated outTime");
            } else {
                // Otherwise, update 'createdAt'
                student.createdAt = new Date(); // Set current time for 'createdAt'
                console.log("Updated createdAt (Intime)");
            }

            // Preserve qrData while updating the student record
            student.qrData = qrData;

            // Save the updated student record
            await student.save();
            console.log("Updated student in DB with new scan time");
        } else {
            // If student doesn't exist, create a new record
            const newStudent = new Student({
                name: studentName,
                branch: Branch,
                ien: IEN,
                uid: UID,
                batch: Batch,
                email: email,
                admissionYear: admissionYear,
                bloodGroup: bloodGroup,
                dateOfBirth: dateOfBirth,
                address: Address,
                parentsContact: parentsContact,
                studentsContact: studentsContact,
                category: Category,
                year: Year,
                createdAt: new Date(),
                timestamp: new Date(),
                qrData: qrData,
                scanCount: 1 // Initialize scan count
            });

            await newStudent.save();
            console.log("Stored new student in DB");
        }

        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error.message);
        res.status(500).json({ message: 'Failed to save data', error: error.message });
    }
};
