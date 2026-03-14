import React from 'react';
import { LayoutDashboard, FileText, ClipboardCheck } from 'lucide-react';
import { IoIosNotifications } from 'react-icons/io';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ children }) => {
    const location = useLocation();

    const routeToStateMap = {
        '/home': 'Dashboard',
        '/logReport': 'LogReport',
        '/attendence': 'Take Attendence',
    };

    const active = routeToStateMap[location.pathname] || '';

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
                    <Link
                        to="/home"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active === 'Dashboard'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <LayoutDashboard className={`w-5 h-5 ${active === 'Dashboard' ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                        <span className="font-semibold text-sm">Dashboard</span>
                    </Link>

                    <Link
                        to="/logReport"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active === 'LogReport'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <FileText className={`w-5 h-5 ${active === 'LogReport' ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                        <span className="font-semibold text-sm">LogReport</span>
                    </Link>

                    <Link
                        to="/attendence"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active === 'Take Attendence'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <ClipboardCheck className={`w-5 h-5 ${active === 'Take Attendence' ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                        <span className="font-semibold text-sm">Take Attendence</span>
                    </Link>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Logged in as</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">F</div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Faculty Member</p>
                                <p className="text-[10px] text-slate-500 truncate italic">Faculty Portal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Wrapper */}
            <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
                {/* Header/Topnav */}
                <header className="h-20 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/40 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{active}</h2>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Zono Attendance Platform</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors group">
                            <IoIosNotifications size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-[#020617] rounded-full"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800 mx-1"></div>
                        <button className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group">
                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Logout</span>
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
