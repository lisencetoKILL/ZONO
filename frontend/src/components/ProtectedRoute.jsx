import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const LOADER_SECONDS = 3;

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [secondsLeft, setSecondsLeft] = useState(LOADER_SECONDS);
    const [session, setSession] = useState({ loggedIn: false, user: null });

    useEffect(() => {
        let isMounted = true;
        let intervalId;

        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:3001/auth/session', {
                    credentials: 'include',
                });
                const data = await response.json();

                if (isMounted) {
                    setSession({
                        loggedIn: !!data?.loggedIn,
                        user: data?.user || null,
                    });
                }
            } catch (error) {
                if (isMounted) {
                    setSession({ loggedIn: false, user: null });
                }
            }
        };

        const runChecks = async () => {
            setSecondsLeft(LOADER_SECONDS);

            intervalId = window.setInterval(() => {
                if (!isMounted) return;
                setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            const minLoadingDelay = new Promise((resolve) => {
                window.setTimeout(resolve, LOADER_SECONDS * 1000);
            });

            await Promise.all([checkSession(), minLoadingDelay]);

            if (isMounted) {
                setIsChecking(false);
            }
        };

        runChecks();

        return () => {
            isMounted = false;
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, []);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
                    <div className="mx-auto mb-5 h-10 w-10 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin" />

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Checking your session</h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Please wait while we securely sign you in.
                    </p>

                    <p className="mt-4 inline-block rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        We are gathering your data and getting you in.
                    </p>

                    <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {secondsLeft}s
                    </p>
                </div>
            </div>
        );
    }

    if (!session.loggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles?.length && !allowedRoles.includes(session.user?.role)) {
        if (session.user?.role === 'admin') {
            return <Navigate to="/adminDashboard" replace />;
        }
        if (session.user?.role === 'parent') {
            return <Navigate to="/parentTest" replace />;
        }
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;