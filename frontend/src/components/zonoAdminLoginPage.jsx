import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ZONO_ADMIN_API_BASE, ZONO_ADMIN_DASHBOARD_PATH } from '../constants/zonoAdminPaths';
import { API_BASE } from '../constants/api';

const ZonoAdminLoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkSession = async () => {
            try {
                const response = await axios.get(`${API_BASE}/auth/session`, { withCredentials: true });
                if (!isMounted) return;

                if (response.data?.loggedIn && response.data?.user?.role === 'zono_admin') {
                    navigate(ZONO_ADMIN_DASHBOARD_PATH, { replace: true });
                    return;
                }
            } catch (sessionError) {
                // Stay on login page when session is unavailable.
            } finally {
                if (isMounted) {
                    setIsCheckingSession(false);
                }
            }
        };

        checkSession();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${ZONO_ADMIN_API_BASE}/login`, {
                username,
                password,
            }, { withCredentials: true });

            if (response.data?.message === 'Success') {
                navigate(ZONO_ADMIN_DASHBOARD_PATH, { replace: true });
                return;
            }

            setError('Login failed');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login ZonoAdmin');
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
                <div className="h-10 w-10 rounded-full border-4 border-blue-900 border-t-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 px-6 py-10 flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/30">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3">Restricted Access</p>
                <h1 className="text-3xl font-extrabold">ZonoAdmin Console</h1>
                <p className="mt-2 text-sm text-slate-400">Authorized operations only. All actions are logged.</p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                    {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                            {error}
                        </div>
                    )}

                    <input
                        className="w-full px-4 h-12 rounded-xl border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />

                    <input
                        className="w-full px-4 h-12 rounded-xl border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <button
                        className="w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold disabled:opacity-70"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Authorizing...' : 'Enter Console'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ZonoAdminLoginPage;
