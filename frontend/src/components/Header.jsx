import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, ClipboardCheck, LogOut, Sun, Moon, Users, UserCog, ShieldCheck, BellRing } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ZONO_ADMIN_DASHBOARD_PATH, ZONO_ADMIN_LOGIN_PATH } from '../constants/zonoAdminPaths';
import { clearSessionCache, fetchSessionCached, getCachedSession } from '../utils/sessionClient';

const ROLE_NAVIGATION = {
    staff: [
        { label: 'Dashboard', href: '/home', icon: LayoutDashboard },
        { label: 'Log Report', href: '/logReport', icon: FileText },
        { label: 'Attendance', href: '/attendence', icon: ClipboardCheck },
        { label: 'Parent Link', href: '/parents', icon: Users },
        { label: 'Notifications', href: '/notifications', icon: BellRing },
    ],
    admin: [
        { label: 'Dashboard', href: '/adminDashboard', icon: LayoutDashboard },
        { label: 'Teachers', href: '/adminDashboard/teachers', icon: Users },
        { label: 'Parents', href: '/adminDashboard/parents', icon: Users },
        { label: 'Profile', href: '/adminDashboard/profile', icon: UserCog },
    ],
    parent: [
        { label: 'Parent Home', href: '/parentTest', icon: LayoutDashboard },
    ],
    zono_admin: [
        { label: 'Control Center', href: ZONO_ADMIN_DASHBOARD_PATH, icon: ShieldCheck },
    ],
};

const ROLE_LABELS = {
    staff: 'Faculty Portal',
    admin: 'Institution Admin Portal',
    parent: 'Parent Portal',
    zono_admin: 'Zono Admin Console',
};

const Header = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sessionUser, setSessionUser] = useState(() => getCachedSession()?.user || null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [teacherInviteCount, setTeacherInviteCount] = useState(0);
    const [dark, setDark] = useState(() => {
        const saved = localStorage.getItem('sisi-dark');
        if (saved !== null) return saved === 'true';
        return document.documentElement.classList.contains('dark');
    });

    const userRole = sessionUser?.role || null;
    const staffHasInstitution = !!sessionUser?.institutionId;
    const navItems = (() => {
        if (!userRole) return [];

        const roleNav = ROLE_NAVIGATION[userRole] || ROLE_NAVIGATION.staff;
        if (userRole !== 'staff') return roleNav;
        if (staffHasInstitution) return roleNav;
        return roleNav.filter((item) => item.href === '/home' || item.href === '/notifications');
    })();

    const normalizedPath = location.pathname;
    const activeItem = navItems.find((item) => normalizedPath === item.href);
    const activeLabel = activeItem?.label || '';

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('sisi-dark', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('sisi-dark', 'false');
        }
    }, [dark]);

    useEffect(() => {
        let isMounted = true;

        const syncSession = async () => {
            try {
                const data = await fetchSessionCached();
                if (!isMounted) return;
                setSessionUser(data?.loggedIn ? data?.user || null : null);
            } catch {
                if (!isMounted) return;
                setSessionUser(null);
            }
        };

        const onSessionUpdated = () => {
            const cached = getCachedSession();
            setSessionUser(cached?.loggedIn ? cached?.user || null : null);
        };

        syncSession();
        window.addEventListener('zono-session-updated', onSessionUpdated);

        return () => {
            isMounted = false;
            window.removeEventListener('zono-session-updated', onSessionUpdated);
        };
    }, []);

    useEffect(() => {
        if (userRole !== 'staff' || !sessionUser?.email) {
            setTeacherInviteCount(0);
            return;
        }

        let isMounted = true;

        const loadTeacherInviteCount = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/teacher/invitations?status=pending', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (isMounted) setTeacherInviteCount(0);
                    return;
                }

                const data = await response.json();
                if (isMounted) {
                    setTeacherInviteCount(Array.isArray(data?.invitations) ? data.invitations.length : 0);
                }
            } catch {
                if (isMounted) setTeacherInviteCount(0);
            }
        };

        loadTeacherInviteCount();

        const socket = io('http://localhost:3001', {
            withCredentials: true,
        });

        socket.on('connect', () => {
            socket.emit('join-teacher-room', { email: sessionUser.email });
        });

        socket.on('teacher-invite-created', loadTeacherInviteCount);
        socket.on('teacher-invite-updated', loadTeacherInviteCount);

        return () => {
            isMounted = false;
            socket.off('teacher-invite-created', loadTeacherInviteCount);
            socket.off('teacher-invite-updated', loadTeacherInviteCount);
            socket.disconnect();
        };
    }, [userRole, sessionUser?.email]);

    const initials = (sessionUser?.name || 'User')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'U';

    const getLogoutRedirectPath = () => {
        if (sessionUser?.role === 'admin') return '/adminLogin';
        if (sessionUser?.role === 'parent') return '/login';
        if (sessionUser?.role === 'zono_admin') return ZONO_ADMIN_LOGIN_PATH;
        return '/login';
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('http://localhost:3001/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setSessionUser(null);
            clearSessionCache();
            navigate(getLogoutRedirectPath(), { replace: true });
        } catch {
            clearSessionCache();
            navigate(getLogoutRedirectPath(), { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] flex transition-colors duration-300 font-sans">
            {/* Sidebar */}
            <div className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800/60 shadow-sm fixed inset-y-0 z-50">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1 overflow-hidden">
                        <img src="/logo.png" alt="Zono Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Zono</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = normalizedPath === item.href;
                        const showTeacherBadge = userRole === 'staff' && item.href === '/notifications' && teacherInviteCount > 0;

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="relative inline-flex">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                                    {showTeacherBadge && (
                                        <span className="absolute -top-2 -left-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-[18px] text-center border border-white dark:border-[#0F172A]">
                                            {teacherInviteCount > 99 ? '99+' : teacherInviteCount}
                                        </span>
                                    )}
                                </span>
                                <span className="font-semibold text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Logged in as</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">{initials}</div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{sessionUser?.name || 'Faculty Member'}</p>
                                <p className="text-[10px] text-slate-500 truncate italic">{sessionUser?.email || sessionUser?.username || 'Portal Session'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Wrapper */}
            <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
                {/* Header/Topnav */}
                <header className="h-20 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/40 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1 hidden sm:block">{ROLE_LABELS[userRole] || 'Portal'}</p>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeLabel || (userRole ? 'Dashboard' : '')}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center"
                            onClick={() => setDark((prev) => !prev)}
                            type="button"
                            aria-label="Toggle dark mode"
                        >
                            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {userRole && userRole !== 'staff' && (
                            <button className="relative p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors group">
                                <BellRing size={20} />
                            </button>
                        )}
                        <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800 mx-1"></div>
                     

                        <button
                            className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-sm font-semibold disabled:opacity-60"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            type="button"
                        >
                            <LogOut className="w-4 h-4" />
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 sm:p-8 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Header;
