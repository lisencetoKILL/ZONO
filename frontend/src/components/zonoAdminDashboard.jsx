import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    ZONO_ADMIN_API_BASE,
    ZONO_ADMIN_LOGIN_PATH,
} from '../constants/zonoAdminPaths';
import { API_BASE } from '../constants/api';

const ZonoAdminDashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({
        pendingApplications: 0,
        activeInstitutions: 0,
        totalInstitutions: 0,
    });
    const [institutions, setInstitutions] = useState([]);
    const [filter, setFilter] = useState('PENDING_APPROVAL');
    const [activeApprovalId, setActiveApprovalId] = useState('');
    const [generatedCredential, setGeneratedCredential] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async (selectedFilter = filter) => {
        try {
            setIsLoading(true);
            setError('');

            const [sessionRes, summaryRes, institutionsRes] = await Promise.all([
                axios.get(`${API_BASE}/auth/session`, { withCredentials: true }),
                axios.get(`${ZONO_ADMIN_API_BASE}/summary`, { withCredentials: true }),
                axios.get(`${ZONO_ADMIN_API_BASE}/institutions`, {
                    params: { status: selectedFilter },
                    withCredentials: true,
                }),
            ]);

            if (!sessionRes.data?.loggedIn || sessionRes.data?.user?.role !== 'zono_admin') {
                navigate(ZONO_ADMIN_LOGIN_PATH, { replace: true });
                return;
            }

            setSummary(summaryRes.data?.summary || summary);
            setInstitutions(institutionsRes.data?.institutions || []);
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) {
                navigate(ZONO_ADMIN_LOGIN_PATH, { replace: true });
                return;
            }
            setError(err.response?.data?.message || 'Failed to load ZonoAdmin dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData(filter);
    }, [filter]);

    const handleApprove = async (institutionId) => {
        try {
            setActiveApprovalId(institutionId);
            setGeneratedCredential(null);
            setError('');

            const response = await axios.post(
                `${ZONO_ADMIN_API_BASE}/institutions/${institutionId}/approve`,
                {},
                { withCredentials: true }
            );

            setGeneratedCredential(response.data?.credentials || null);
            await loadData(filter);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve institution');
        } finally {
            setActiveApprovalId('');
        }
    };

    const handleLogout = async () => {
        await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
        navigate(ZONO_ADMIN_LOGIN_PATH, { replace: true });
    };

    const statusOptions = useMemo(() => ['PENDING_APPROVAL', 'ACTIVE', 'ALL'], []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 px-6 py-8 md:px-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Confidential</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Zono Admin Control Center</h1>
                        <p className="text-sm text-slate-400 mt-2">Manage institution applications and generate secure onboarding credentials.</p>
                    </div>
                    <button
                        className="h-11 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold"
                        type="button"
                        onClick={handleLogout}
                    >
                        Secure Logout
                    </button>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                        {error}
                    </div>
                )}

                {generatedCredential && (
                    <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-wider font-bold text-emerald-300">Generated Credentials</p>
                        <p className="mt-2 text-sm text-emerald-100">
                            Email: <span className="font-bold">{generatedCredential.adminEmail}</span>
                        </p>
                        <p className="mt-1 text-sm text-emerald-100">
                            Temporary Password: <span className="font-bold">{generatedCredential.generatedPassword}</span>
                        </p>
                        <p className="mt-2 text-xs text-emerald-300/90">Copy this now. It is shown once for secure handling.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400">Pending</p>
                        <h3 className="text-3xl font-extrabold mt-1 text-amber-300">{summary.pendingApplications}</h3>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400">Active Institutions</p>
                        <h3 className="text-3xl font-extrabold mt-1 text-emerald-300">{summary.activeInstitutions}</h3>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400">Total Institutions</p>
                        <h3 className="text-3xl font-extrabold mt-1 text-cyan-300">{summary.totalInstitutions}</h3>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <h2 className="text-xl font-extrabold">Institution Applications</h2>
                        <div className="flex items-center gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setFilter(option)}
                                    className={`px-3 h-9 rounded-lg text-xs font-bold transition ${
                                        filter === option
                                            ? 'bg-cyan-500 text-slate-950'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    {option.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-8 text-center text-slate-400">Loading applications...</div>
                    ) : institutions.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">No institutions found for selected filter.</div>
                    ) : (
                        <div className="space-y-3">
                            {institutions.map((item) => (
                                <div key={item._id} className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-slate-100">{item.name}</p>
                                        <p className="text-sm text-slate-400 mt-1">{item.address || 'No address provided'}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Admin: {item.adminId?.name || 'N/A'} | {item.adminId?.email || 'No email'} | {item.adminId?.phone || 'No phone'}
                                        </p>
                                        <p className="text-xs mt-1">
                                            <span className={`font-bold ${item.status === 'ACTIVE' ? 'text-emerald-300' : 'text-amber-300'}`}>{item.status}</span>
                                        </p>
                                    </div>

                                    {item.status !== 'ACTIVE' && (
                                        <button
                                            className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold disabled:opacity-70"
                                            type="button"
                                            onClick={() => handleApprove(item._id)}
                                            disabled={activeApprovalId === item._id}
                                        >
                                            {activeApprovalId === item._id ? 'Approving...' : 'Approve + Generate Password'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZonoAdminDashboard;
