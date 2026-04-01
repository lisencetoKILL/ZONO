import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentSection = location.pathname === '/adminDashboard/teachers'
        ? 'teachers'
        : location.pathname === '/adminDashboard/profile'
            ? 'profile'
            : 'overview';

    const [adminUser, setAdminUser] = useState(null);
    const [institution, setInstitution] = useState(null);
    const [profile, setProfile] = useState(null);
    const [analytics, setAnalytics] = useState({
        summary: {
            totalAttendanceRecords: 0,
            uniqueStudents: 0,
            activeTeachers: 0,
        },
        teacherAnalytics: [],
    });
    const [inviteMode, setInviteMode] = useState('single');
    const [inviteRole, setInviteRole] = useState('teacher');
    const [singleInvite, setSingleInvite] = useState({
        name: '',
        email: '',
    });
    const [bulkRows, setBulkRows] = useState([]);
    const [bulkPreviewError, setBulkPreviewError] = useState('');
    const [invitations, setInvitations] = useState([]);
    const [inviteResult, setInviteResult] = useState(null);
    const [inviteFilter, setInviteFilter] = useState('all');
    const [isSendingInvites, setIsSendingInvites] = useState(false);
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

    const parseCsvText = (text) => {
        const rows = String(text || '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (!rows.length) {
            return [];
        }

        const header = rows[0].split(',').map((cell) => cell.trim().toLowerCase());
        const nameIndex = header.indexOf('name');
        const emailIndex = header.indexOf('email');

        if (nameIndex === -1 || emailIndex === -1) {
            throw new Error('CSV must include name,email headers');
        }

        return rows.slice(1).map((row) => {
            const columns = row.split(',').map((cell) => cell.trim());
            return {
                name: columns[nameIndex] || '',
                email: columns[emailIndex] || '',
            };
        }).filter((item) => item.name || item.email);
    };

    const loadInvitations = async (roleFilter = inviteFilter) => {
        setIsLoadingInvitations(true);
        try {
            const response = await axios.get('http://localhost:3001/api/admin/invitations', {
                params: { role: roleFilter },
                withCredentials: true,
            });
            setInvitations(response.data?.invitations || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch invitations');
        } finally {
            setIsLoadingInvitations(false);
        }
    };

    const handleBulkFileChange = async (event) => {
        setBulkPreviewError('');
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsed = parseCsvText(text);
            if (!parsed.length) {
                setBulkPreviewError('No valid rows found in CSV');
                setBulkRows([]);
                return;
            }
            setBulkRows(parsed);
        } catch (err) {
            setBulkRows([]);
            setBulkPreviewError(err.message || 'Invalid CSV format');
        }
    };

    const submitInvites = async (entries) => {
        setError('');
        setSuccessMessage('');
        setInviteResult(null);
        setIsSendingInvites(true);

        try {
            const response = await axios.post('http://localhost:3001/api/admin/invitations', {
                role: inviteRole,
                entries,
            }, { withCredentials: true });

            setInviteResult(response.data?.result || null);
            setSuccessMessage(`${response.data?.result?.createdCount || 0} invite(s) added successfully.`);
            setSingleInvite({ name: '', email: '' });
            setBulkRows([]);
            await loadInvitations(inviteFilter);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send invites');
        } finally {
            setIsSendingInvites(false);
        }
    };

    const handleSingleInviteSubmit = async (e) => {
        e.preventDefault();
        await submitInvites([{ name: singleInvite.name, email: singleInvite.email }]);
    };

    const handleBulkInviteSubmit = async (e) => {
        e.preventDefault();
        if (!bulkRows.length) {
            setBulkPreviewError('Please upload a valid CSV first');
            return;
        }
        await submitInvites(bulkRows);
    };

    const sampleCsv = 'name,email\nJohn Doe,john@example.com\nJane Doe,jane@example.com';

    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const fetchAdminData = async () => {
        try {
            const [sessionResponse, institutionResponse, analyticsResponse, profileResponse] = await Promise.all([
                axios.get('http://localhost:3001/auth/session', { withCredentials: true }),
                axios.get('http://localhost:3001/api/admin/institution', { withCredentials: true }),
                axios.get('http://localhost:3001/api/admin/analytics', { withCredentials: true }),
                axios.get('http://localhost:3001/api/admin/profile', { withCredentials: true }),
            ]);

            const sessionUser = sessionResponse.data?.user || null;
            if (!sessionResponse.data?.loggedIn || sessionUser?.role !== 'admin') {
                navigate('/adminLogin');
                return;
            }

            setAdminUser(sessionUser);
            setInstitution(institutionResponse.data?.institution || null);
            setAnalytics(analyticsResponse.data || analytics);
            setProfile(profileResponse.data?.profile || null);
            setProfileForm({
                name: profileResponse.data?.profile?.name || '',
                email: profileResponse.data?.profile?.email || '',
                phone: profileResponse.data?.profile?.phone || '',
            });
        } catch (err) {
            setError('Could not load admin dashboard data.');
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    useEffect(() => {
        if (currentSection === 'teachers') {
            loadInvitations(inviteFilter);
        }
    }, [currentSection, inviteFilter]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSavingProfile(true);

        try {
            const response = await axios.put('http://localhost:3001/api/admin/profile', {
                name: profileForm.name,
                email: profileForm.email,
                phone: profileForm.phone,
            }, { withCredentials: true });

            setProfile(response.data?.profile || null);
            setSuccessMessage(response.data?.message || 'Profile updated successfully.');
            await fetchAdminData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await axios.put('http://localhost:3001/api/admin/password', {
                newPassword: passwordForm.newPassword,
            }, { withCredentials: true });

            setPasswordForm({ newPassword: '', confirmPassword: '' });
            setSuccessMessage(response.data?.message || 'Password updated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <Header>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl"></div>
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-blue-500/10 dark:ring-blue-400/20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Institution Admin Portal</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{institution?.name || 'Institution Dashboard'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                                Admin: {adminUser?.name || profile?.name || 'Admin'}
                                {profile?.status ? ` | Status: ${profile.status}` : ''}
                        </p>
                        </div>
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

                {currentSection === 'overview' && (
                    <>
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

                <div className="grid grid-cols-1 gap-6">
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
                </div>
                    </>
                )}

                {currentSection === 'teachers' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-extrabold mb-4">Invite Teachers or Students</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Invite Type</label>
                                    <select
                                        className="w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                        value={inviteMode}
                                        onChange={(e) => setInviteMode(e.target.value)}
                                    >
                                        <option value="single">Single Invite</option>
                                        <option value="bulk">Bulk CSV Invite</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Role</label>
                                    <select
                                        className="w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                    >
                                        <option value="teacher">Teacher</option>
                                        <option value="student">Student</option>
                                    </select>
                                </div>
                            </div>

                            {inviteMode === 'single' ? (
                                <form onSubmit={handleSingleInviteSubmit} className="space-y-3">
                                    <input
                                        className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                        placeholder="Full name"
                                        value={singleInvite.name}
                                        onChange={(e) => setSingleInvite((prev) => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                    <input
                                        className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                        type="email"
                                        placeholder={`${inviteRole}@institution.edu`}
                                        value={singleInvite.email}
                                        onChange={(e) => setSingleInvite((prev) => ({ ...prev, email: e.target.value }))}
                                        required
                                    />

                                    <button
                                        className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all disabled:opacity-70"
                                        type="submit"
                                        disabled={isSendingInvites}
                                    >
                                        {isSendingInvites ? 'Inviting...' : `Invite ${inviteRole}`}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleBulkInviteSubmit} className="space-y-3">
                                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4">
                                        <p className="text-xs text-slate-500 mb-2">Upload CSV with headers: name,email</p>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv"
                                            onChange={handleBulkFileChange}
                                            className="block w-full text-sm"
                                        />
                                        <p className="text-[11px] text-slate-500 mt-2">Sample: {sampleCsv}</p>
                                    </div>

                                    {bulkPreviewError && (
                                        <div className="text-xs font-semibold text-red-600 dark:text-red-400">{bulkPreviewError}</div>
                                    )}

                                    {bulkRows.length > 0 && (
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 max-h-40 overflow-auto text-xs">
                                            <p className="font-bold mb-2">Preview ({bulkRows.length} rows)</p>
                                            {bulkRows.slice(0, 10).map((row, idx) => (
                                                <p key={`${row.email}-${idx}`} className="text-slate-600 dark:text-slate-300">{row.name} | {row.email}</p>
                                            ))}
                                            {bulkRows.length > 10 && <p className="mt-1 text-slate-500">+ {bulkRows.length - 10} more rows</p>}
                                        </div>
                                    )}

                                    <button
                                        className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all disabled:opacity-70"
                                        type="submit"
                                        disabled={isSendingInvites}
                                    >
                                        {isSendingInvites ? 'Processing CSV...' : `Invite ${inviteRole}s from CSV`}
                                    </button>
                                </form>
                            )}

                            {inviteResult && (
                                <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                                    Requested: {inviteResult.requested} | Created: {inviteResult.createdCount} | Skipped: {inviteResult.skippedCount}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h2 className="text-xl font-extrabold">Invited Members</h2>
                                <select
                                    className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm"
                                    value={inviteFilter}
                                    onChange={(e) => setInviteFilter(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>

                            <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                                {isLoadingInvitations && <p className="text-sm text-slate-500">Loading invites...</p>}
                                {!isLoadingInvitations && invitations.length === 0 && <p className="text-sm text-slate-500">No invites yet.</p>}
                                {!isLoadingInvitations && invitations.map((invite) => (
                                    <div key={invite._id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3">
                                        <p className="font-semibold">{invite.name}</p>
                                        <p className="text-xs text-slate-500">{invite.email}</p>
                                        <p className="text-[11px] mt-1 uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                                            {invite.role} | {invite.status}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentSection === 'profile' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-extrabold mb-4">Edit Profile</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-3">
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    placeholder="Full name"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    type="email"
                                    placeholder="Email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    placeholder="Phone"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                                    required
                                />

                                <button
                                    className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all disabled:opacity-70"
                                    type="submit"
                                    disabled={isSavingProfile}
                                >
                                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-extrabold mb-4">Edit Password</h2>
                            <form onSubmit={handleChangePassword} className="space-y-3">
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    type="password"
                                    placeholder="New password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                    required
                                />
                                <input
                                    className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                    required
                                />

                                <button
                                    className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all disabled:opacity-70"
                                    type="submit"
                                    disabled={isChangingPassword}
                                >
                                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Header>
    );
};

export default AdminDashboard;