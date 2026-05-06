import React, { useEffect, useState } from 'react';
import Header from './Header';

const TeacherParentsPage = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingStudentId, setSavingStudentId] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const loadStudents = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/staff/parent-students', {
                credentials: 'include',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to load students');
            }

            const rows = Array.isArray(data?.students) ? data.students : [];
            setStudents(rows.map((student) => ({
                ...student,
                parentContactDraft: student.parentContact || '',
            })));
        } catch (err) {
            setError(err.message || 'Failed to load students');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const updateDraft = (studentId, value) => {
        setStudents((prev) => prev.map((student) => (
            String(student._id) === String(studentId)
                ? { ...student, parentContactDraft: value }
                : student
        )));
    };

    const handleSave = async (studentId) => {
        const target = students.find((student) => String(student._id) === String(studentId));
        if (!target) return;

        setSavingStudentId(String(studentId));
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`http://localhost:3001/api/staff/parent-students/${studentId}/contact`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ parentContact: target.parentContactDraft }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to update parent contact');
            }

            setSuccessMessage(data?.message || 'Parent contact updated successfully');
            await loadStudents();
        } catch (err) {
            setError(err.message || 'Failed to update parent contact');
        } finally {
            setSavingStudentId('');
        }
    };

    return (
        <Header>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl"></div>
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-blue-500/10 dark:ring-blue-400/20"></div>

                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Teacher Portal</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Parent Linking</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Add parent contact number/email for students so parents can login using OTP.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl text-sm font-medium">
                        {successMessage}
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
                        {isLoading && <p className="text-sm text-slate-500">Loading students...</p>}
                        {!isLoading && students.length === 0 && <p className="text-sm text-slate-500">No students found.</p>}

                        {!isLoading && students.map((student) => (
                            <div key={student._id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                                        <p className="text-xs text-slate-500">Roll {student.roll || '-'} | {student.department || '-'} | {student.year || '-'}</p>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <input
                                            className="w-full md:w-72 px-3 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm"
                                            placeholder="Parent contact number or email"
                                            value={student.parentContactDraft || ''}
                                            onChange={(e) => updateDraft(student._id, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSave(student._id)}
                                            disabled={savingStudentId === String(student._id)}
                                            className="h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-60"
                                        >
                                            {savingStudentId === String(student._id) ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Header>
    );
};

export default TeacherParentsPage;
