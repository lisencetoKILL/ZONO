import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const ParentTestPage = () => {
    const navigate = useNavigate();
    const [sessionUser, setSessionUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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
                } else {
                    navigate('/login', { replace: true, state: { role: 'parent' } });
                }
            } catch (error) {
                if (isMounted) {
                    navigate('/login', { replace: true, state: { role: 'parent' } });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSession();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

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

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 px-6 py-10 sm:px-10 lg:px-16">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="relative z-10">
                            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-3">Parent Test Page</p>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Parent Login Works</h1>
                            <p className="text-slate-600 dark:text-slate-300 mt-3">This is a temporary page to validate parent route access after OTP authentication.</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                        {isLoading ? (
                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">Loading parent session...</div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{sessionUser?.name || 'Parent User'}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{sessionUser?.email || 'No email found'}</p>
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Role: {sessionUser?.role || 'parent'}</p>
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

            <Footer />
        </div>
    );
};

export default ParentTestPage;
