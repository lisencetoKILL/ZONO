import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract role and hide selection config from route state
    const navState = location.state || {};
    const defaultRole = navState.role || 'staff';
    const hideRoleSelection = navState.hideRoleSelection || false;

    const [role, setRole] = useState(defaultRole); // 'staff' or 'parent'
    const [identifier, setIdentifier] = useState(''); // email for staff, ien for parent
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (role === 'staff') {
                const result = await axios.post('http://localhost:3001/login', { email: identifier, password }, { withCredentials: true });
                if (result.data.message === "Success") {
                    navigate('/home');
                } else {
                    setError(result.data.error || result.data.message || 'Login failed');
                }
            } else {
                const result = await axios.post('http://localhost:3001/loginParent', { email: identifier, password }, { withCredentials: true });
                if (result.data.message === "Success") {
                    // Assuming parent goes to home as well, or another dashboard
                    navigate('/home');
                } else {
                    setError(result.data.error || result.data.message || 'Login failed');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] min-h-screen flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-1 flex flex-col lg:flex-row w-full">
                {/* Left Image Side (hidden on small screens) */}
                <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] justify-center items-center relative overflow-hidden bg-slate-900">
                    {/* Complex overlay and gradients for premium feel */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-blue-900/60 via-transparent to-transparent mix-blend-multiply"></div>

                    <img
                        src="/loginImg.png"
                        alt="Login Illustration"
                        className="object-cover h-full w-full opacity-60 dark:opacity-40 transition-opacity duration-700 hover:scale-105"
                    />

                    {/* Glassmorphic feature highlight over the image */}

                </div>

                {/* Right Form Side */}
                <div className="flex-1 flex flex-col justify-center items-center relative px-6 py-12 sm:px-12 lg:px-20 transition-colors duration-300 min-h-screen">

                    {/* Subtle background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="w-full max-w-md relative z-10 my-auto pt-16">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                                Welcome Back
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Please select your role and sign in.
                            </p>
                        </div>

                        {/* Role Selection Tabs */}
                        {!hideRoleSelection && (
                            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl mb-8 shadow-inner">
                                <button
                                    onClick={() => { setRole('staff'); setIdentifier(''); setError(''); }}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === 'staff' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Faculty / Staff
                                </button>
                                <button
                                    onClick={() => { setRole('parent'); setIdentifier(''); setError(''); }}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === 'parent' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Parent
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold ml-1" htmlFor="identifier">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        {role === 'staff' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        )}
                                    </span>
                                    <input
                                        className="w-full pl-11 pr-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        id="identifier"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold ml-1" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        className="w-full pl-11 pr-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input type="checkbox" className="peer w-5 h-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-1 dark:focus:ring-offset-slate-900 transition-all bg-white dark:bg-slate-800" />
                                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Remember me</span>
                                </label>

                                <button type="button" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            <div className="pt-4">
                                <button
                                    className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-2xl transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Footer Auth Options */}
                        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Don't have an account?{' '}
                                <a href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Sign up now
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}

export default LoginPage;
