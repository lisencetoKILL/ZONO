import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ZONO_ADMIN_DASHBOARD_PATH, ZONO_ADMIN_LOGIN_PATH } from '../constants/zonoAdminPaths';

const ProtectedRoute = ({ children, allowedRoles, requireInstitution = false }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [session, setSession] = useState({ loggedIn: false, user: null });

    useEffect(() => {
        let isMounted = true;

        const runChecks = async () => {
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
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        };

        runChecks();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center px-6">
                <div className="h-10 w-10 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin" />
            </div>
        );
    }

    if (!session.loggedIn) {
        if (allowedRoles?.includes('zono_admin')) {
            return <Navigate to={ZONO_ADMIN_LOGIN_PATH} state={{ from: location }} replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles?.length && !allowedRoles.includes(session.user?.role)) {
        if (session.user?.role === 'admin') {
            return <Navigate to="/adminDashboard" replace />;
        }
        if (session.user?.role === 'parent') {
            return <Navigate to="/parentTest" replace />;
        }
        if (session.user?.role === 'zono_admin') {
            return <Navigate to={ZONO_ADMIN_DASHBOARD_PATH} replace />;
        }
        return <Navigate to="/home" replace />;
    }

    if (requireInstitution && session.user?.role === 'staff' && !session.user?.institutionId) {
        return <Navigate to="/home" replace state={{ institutionRequired: true }} />;
    }

    return children;
};

export default ProtectedRoute;