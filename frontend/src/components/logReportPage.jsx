import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const LogReportPage = () => {
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/students'); // Replace with your backend URL
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, []);

    const handleReportClick = (studentId) => {
        navigate(`/report/${studentId}`); // Navigate to the report page with student ID
    };


    return (
        <Header>
            <div className='container mx-auto mt-10'>
                <h1 className="text-2xl font-semibold mb-4">Log Report</h1>
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>Branch</th>
                                <th>Batch</th>
                                <th>Year</th>
                                <th>Action</th> {/* Added Action column */}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student, index) => (
                                    <tr key={student._id}>
                                        <th>{index + 1}</th>
                                        <td>{student.name}</td>
                                        <td>{student.branch}</td>
                                        <td>{student.batch}</td>
                                        <td>{student.year}</td>
                                        <td>
                                            <button className="btn btn-error" onClick={() => handleReportClick(student._id)}>
                                                Report
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Header>
    );
};

export default LogReportPage;
