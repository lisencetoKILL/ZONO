import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const LogReportPage = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/students', {
                    credentials: 'include',
                });
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleReportClick = (studentId) => {
        navigate(`/report/${studentId}`); // Navigate to the report page with student ID
    };

    const filteredStudents = students.filter((student) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;
        return (
            student?.name?.toLowerCase().includes(query) ||
            student?.branch?.toLowerCase().includes(query) ||
            String(student?.batch || '').toLowerCase().includes(query) ||
            String(student?.year || '').toLowerCase().includes(query)
        );
    });


    return (
        <Header>
            <div className="space-y-6">
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl"></div>
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-blue-500/10 dark:ring-blue-400/20"></div>

                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Reports</p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Log Report</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
                        View student logs and open detailed reports from one place.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Logs</h2>
                            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
                                {filteredStudents.length} Visible
                            </span>
                        </div>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, branch, batch..."
                            className="w-full sm:w-80 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[780px]">
                            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">#</th>
                                    <th className="px-6 py-4 text-left">Student Name</th>
                                    <th className="px-6 py-4 text-left">Branch</th>
                                    <th className="px-6 py-4 text-left">Batch</th>
                                    <th className="px-6 py-4 text-left">Year</th>
                                    <th className="px-6 py-4 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-14 text-center text-slate-500 dark:text-slate-400 font-semibold">
                                            Loading reports...
                                        </td>
                                    </tr>
                                ) : filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, index) => (
                                        <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{index + 1}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{student.name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.branch}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.batch}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.year}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                                                    onClick={() => handleReportClick(student._id)}
                                                    type="button"
                                                >
                                                    Report
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-14 text-center text-slate-500 dark:text-slate-400 font-semibold">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Header>
    );
};

export default LogReportPage;
