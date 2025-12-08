import React, { useState, useEffect } from 'react';
import Header from './Header';

const Home = () => {
    const [counter, setCounter] = useState(1); // Example counter state
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/students'); // Replace with your backend URL
                const data = await response.json();
                console.log('Fetched data:', data); // Debugging: Check the data
                setStudents(data); // Ensure data is being set correctly

                // Filter students added today based on 'createdAt'
                const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
                const todaysEntries = data.filter(student =>
                    new Date(student.createdAt).toISOString().split('T')[0] === today
                );
                setCounter(todaysEntries.length); // Set the count of today's entries
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, []);

    const formatDate = (date) => {
        const utcDate = new Date(date);

        // Convert to IST by specifying the 'Asia/Kolkata' time zone
        const options = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, // For 24-hour format
        };

        const istDate = utcDate.toLocaleString('en-GB', options);

        // Format the output as DD MM YYYY HH MM SS
        const formattedDate = istDate.replace(",", "").replace(/\//g, " ").replace(/:/g, " ");

        return formattedDate;
    }

    return (
        <Header>
            {/* Home Page Specific Content */}
            <div className='w-full flex justify-end mt-6 pr-6'>
                <div className="card bg-base-300 rounded-box grid h-20 w-52 place-items-center shadow-lg">
                    <div className="font-semibold">Total Entries Today</div>
                    <span className="countdown font-mono text-4xl">
                        {counter}
                    </span>
                </div>
            </div>
            {/* Add other home page content here */}
            <div className="overflow-x-auto">
                <table className="table table-xs">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Branch</th>
                            <th>Batch</th>
                            <th>Year</th>
                            <th>Email</th>
                            <th>Admission Year</th>
                            <th>In Time</th>
                            <th>Out Time</th>
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
                                    <td>{student.email}</td>
                                    <td>{student.admissionYear}</td>
                                    <td>{formatDate(student.createdAt)}</td>
                                    <td>{student.outTime ? formatDate(student.outTime) : 'N/A'}</td> {/* Conditionally render outTime */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No data available</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Branch</th>
                            <th>Batch</th>
                            <th>Year</th>
                            <th>Email</th>
                            <th>Admission Year</th>
                            <th>In Time</th>
                            <th>Out Time</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Header>
    );
};

export default Home;
