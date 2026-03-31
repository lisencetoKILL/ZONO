import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);
    const [institution, setInstitution] = useState(null);
    const [analytics, setAnalytics] = useState({
        summary: {
            totalAttendanceRecords: 0,
            uniqueStudents: 0,
            activeTeachers: 0,
        },
        teacherAnalytics: [],
    });
    const [teachers, setTeachers] = useState([]);
    const [teacherForm, setTeacherForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [savingTeacher, setSavingTeacher] = useState(false);

    const fetchAdminData = async () => {
        try {
            const [sessionResponse, institutionResponse, teachersResponse, analyticsResponse] = await Promise.all([
                axios.get('http://localhost:3001/auth/session', { withCredentials: true }),
                axios.get('http://localhost:3001/api/admin/institution', { withCredentials: true }),
                axios.get('http://localhost:3001/api/admin/teachers', { withCredentials: true }),
                axios.get('http://localhost:3001/api/admin/analytics', { withCredentials: true }),
            ]);

            const sessionUser = sessionResponse.data?.user || null;
            if (!sessionResponse.data?.loggedIn || sessionUser?.role !== 'admin') {
                navigate('/adminLogin');
                return;
            }

            setAdminUser(sessionUser);
            setInstitution(institutionResponse.data?.institution || null);
            setTeachers(teachersResponse.data?.teachers || []);
            setAnalytics(analyticsResponse.data || analytics);
        } catch (err) {
            setError('Could not load admin dashboard data.');
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        setError('');
        setSavingTeacher(true);

        try {
            await axios.post('http://localhost:3001/api/admin/teachers', teacherForm, { withCredentials: true });
            setTeacherForm({ firstName: '', lastName: '', email: '', password: '' });
            await fetchAdminData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create teacher');
        } finally {
            setSavingTeacher(false);
        }
    };

    const handleLogout = async () => {
        await axios.post('http://localhost:3001/auth/logout', {}, { withCredentials: true });
        navigate('/adminLogin');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] px-6 py-8 md:px-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl"></div>
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-blue-500/10 dark:ring-blue-400/20"></div>

                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Institution Admin Portal</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{institution?.name || 'Institution Dashboard'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Admin: {adminUser?.name || 'Admin'} {institution?.code ? `| Code: ${institution.code}` : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="relative z-10 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 h-12 rounded-2xl"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Attendance Records</p>
                        <h3 className="text-3xl font-extrabold mt-2">{analytics.summary.totalAttendanceRecords}</h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Unique Students Marked</p>
                        <h3 className="text-3xl font-extrabold mt-2">{analytics.summary.uniqueStudents}</h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Teachers Active</p>
                        <h3 className="text-3xl font-extrabold mt-2">{analytics.summary.activeTeachers}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-extrabold mb-4">Teacher Analytics</h2>
                        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                            {analytics.teacherAnalytics.length === 0 && (
                                <p className="text-sm text-slate-500">No attendance records captured yet.</p>
                            )}

                            {analytics.teacherAnalytics.map((teacherRow) => (
                                <div key={teacherRow.teacherId || teacherRow.teacherEmail} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/30">
                                    <p className="font-bold text-slate-900 dark:text-white">{teacherRow.teacherName}</p>
                                    <p className="text-xs text-slate-500">{teacherRow.teacherEmail}</p>
                                    <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        Records Marked: {teacherRow.attendanceCount}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Last Marked: {teacherRow.latestMarkedAt ? new Date(teacherRow.latestMarkedAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-extrabold mb-4">Create Teacher</h2>
                            <form onSubmit={handleCreateTeacher} className="space-y-3">
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                    placeholder="First name"
                                    value={teacherForm.firstName}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, firstName: e.target.value }))}
                                    required
                                />
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                    placeholder="Last name"
                                    value={teacherForm.lastName}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, lastName: e.target.value }))}
                                    required
                                />
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                    type="email"
                                    placeholder="teacher@institution.edu"
                                    value={teacherForm.email}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                    type="password"
                                    placeholder="Temporary password"
                                    value={teacherForm.password}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, password: e.target.value }))}
                                    required
                                />

                                <button
                                    className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all disabled:opacity-70"
                                    type="submit"
                                    disabled={savingTeacher}
                                >
                                    {savingTeacher ? 'Creating...' : 'Add Teacher'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-extrabold mb-4">Teachers in Institution</h2>
                            <div className="space-y-3 max-h-[260px] overflow-auto pr-1">
                                {teachers.length === 0 && <p className="text-sm text-slate-500">No teachers created yet.</p>}
                                {teachers.map((teacher) => (
                                    <div key={teacher._id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3">
                                        <p className="font-semibold">{`${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.email}</p>
                                        <p className="text-xs text-slate-500">{teacher.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;