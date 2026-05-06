import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const ParentTestPage = () => {
    const navigate = useNavigate();
    const [sessionUser, setSessionUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [calendarEntries, setCalendarEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const statusColor = {
        green: 'bg-emerald-500',
        yellow: 'bg-yellow-400',
        orange: 'bg-orange-500',
        red: 'bg-rose-500',
    };

    const fetchCalendar = async ({ monthValue, studentId } = {}) => {
        setIsLoading(true);
        setError('');

        try {
            const query = new URLSearchParams();
            query.set('month', monthValue || month);
            if (studentId || selectedStudentId) {
                query.set('studentId', studentId || selectedStudentId);
            }

            const response = await fetch(`http://localhost:3001/api/parent/calendar?${query.toString()}`, {
                credentials: 'include',
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                navigate('/login', { replace: true, state: { role: 'parent' } });
                return;
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to load attendance calendar');
            }

            setStudents(data.students || []);
            setCalendarEntries(data.calendar || []);

            const apiSelected = String(data.selectedStudentId || '');
            if (apiSelected && apiSelected !== selectedStudentId) {
                setSelectedStudentId(apiSelected);
            }
        } catch (calendarError) {
            setError(calendarError.message || 'Failed to load attendance calendar');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadSession = async () => {
            try {
                const response = await fetch('http://localhost:3001/auth/session', {
                    credentials: 'include',
                });
                const data = await response.json();

                if (!isMounted) return;

                if (data?.loggedIn && data?.user?.role === 'parent') {
                    setSessionUser(data.user);
                    await fetchCalendar();
                } else {
                    navigate('/login', { replace: true, state: { role: 'parent' } });
                }
            } catch (error) {
                if (isMounted) {
                    navigate('/login', { replace: true, state: { role: 'parent' } });
                }
            }
        };

        loadSession();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    useEffect(() => {
        if (!sessionUser) return;
        fetchCalendar({ monthValue: month, studentId: selectedStudentId });
    }, [month, selectedStudentId]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('http://localhost:3001/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            navigate('/login', { replace: true, state: { role: 'parent' } });
            setIsLoggingOut(false);
        }
    };

    const currentMonthDate = new Date(`${month}-01T00:00:00`);
    const totalDays = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay();

    const dateStatusMap = new Map(calendarEntries.map((entry) => [entry.date, entry]));
    const cells = [];

    for (let i = 0; i < firstDay; i += 1) {
        cells.push(<div key={`blank-${i}`} className="h-16" />);
    }

    for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day);
        const key = date.toISOString().split('T')[0];
        const entry = dateStatusMap.get(key);
        const colorClass = entry ? (statusColor[entry.status] || 'bg-slate-300') : 'bg-slate-200 dark:bg-slate-700';

        cells.push(
            <div key={key} className="h-16 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-1">
                <div className={`w-8 h-8 rounded-full ${colorClass} text-white text-xs font-bold flex items-center justify-center`}>
                    {day}
                </div>
                {entry && (
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {entry.percentage}%
                    </span>
                )}
            </div>
        );
    }

    return (
        <Header>
            <main className="flex-1 px-0 py-0 sm:px-2 lg:px-4">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="relative z-10">
                            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-3">Parent Portal</p>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Attendance Calendar</h1>
                            <p className="text-slate-600 dark:text-slate-300 mt-3">Track daily attendance status with color indicators.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Student</label>
                                <select
                                    className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                >
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} {student.roll ? `- Roll ${student.roll}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Month</label>
                                <input
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-3 text-xs font-semibold">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" />Green: 100%</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" />Orange: ≤ 50%</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" />Yellow: 51% - 90%</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" />Red: 0% (Absent)</div>
                        </div>

                        {isLoading ? (
                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">Loading calendar...</div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase">{day}</div>
                                ))}
                                {cells}
                            </div>
                        )}

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold h-11 px-5 transition-all disabled:opacity-60"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </Header>
    );
};

export default ParentTestPage;
