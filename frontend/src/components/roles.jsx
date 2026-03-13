import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Roles = () => {
    const [selectedRole, setSelectedRole] = useState(null);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/login');
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] min-h-screen pt-28 pb-10 px-6 flex flex-col transition-colors duration-300 relative overflow-hidden">
            {/* Background elements to match landing page */}
            <div className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[800px] h-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
            </div>

            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full relative z-10">
                <div className="mb-12">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] mb-3">Welcome</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Choose Your Account Type
                    </h1>
                    <p className="mt-4 text-[#64748B] dark:text-[#94A3B8] text-lg max-w-md mx-auto">
                        Select the role that best describes you to personalize your portal experience.
                    </p>
                </div>

                {/* Role Selection Grid */}
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl px-4">

                    {/* Parent Card */}
                    <div
                        onClick={() => handleRoleSelect('parent')}
                        className={`group relative p-8 rounded-3xl border text-left cursor-pointer transition-all duration-300 ${selectedRole === 'parent'
                                ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/10'
                                : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700/50 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === 'parent' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500'
                                }`}>
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === 'parent' ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-700'
                                }`}>
                                {selectedRole === 'parent' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${selectedRole === 'parent' ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>Parent/Guardian</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View attendance records, receive notifications, and track academic progress.</p>
                    </div>

                    {/* Faculty Card */}
                    <div
                        onClick={() => handleRoleSelect('staff')}
                        className={`group relative p-8 rounded-3xl border text-left cursor-pointer transition-all duration-300 ${selectedRole === 'staff'
                                ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/10'
                                : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700/50 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === 'staff' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500'
                                }`}>
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === 'staff' ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-700'
                                }`}>
                                {selectedRole === 'staff' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${selectedRole === 'staff' ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>Faculty/Teacher</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage sessions, generate QR codes, and access detailed analytics.</p>
                    </div>

                </div>

                <div className="mt-14 h-16">
                    <button
                        onClick={handleClick}
                        disabled={!selectedRole}
                        className={`inline-flex items-center justify-center font-bold text-sm px-10 py-4 rounded-xl transition-all shadow-xl w-fit ${selectedRole
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 active:scale-[0.97] cursor-pointer'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed'
                            }`}
                    >
                        Continue to Login
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Roles;
