import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE } from '../constants/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navState = location.state || {};
    const role = navState.role || 'staff';

    const [name, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const result = await axios.post(`${API_BASE}/register`, { name, email, password, confirmPassword, role });
            if (result.data) {
                navigate('/login', { state: { role: role, hideRoleSelection: false } });
            } else {
                setError('Registration failed');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] min-h-screen flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-1 flex flex-col lg:flex-row w-full">
                {/* Left Image Side (hidden on small screens) */}
                <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] justify-center items-center relative overflow-hidden bg-slate-900">
                    {/* Complex overlay and gradients for premium feel */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-cyan-900/60 via-transparent to-transparent mix-blend-multiply"></div>

                    <img
                        src="/loginImg.png"
                        alt="Register Illustration"
                        className="object-cover h-full w-full opacity-60 dark:opacity-40 transition-opacity duration-700 hover:scale-105"
                    />


                </div>

                {/* Right Form Side */}
                <div className="flex-1 flex flex-col justify-center items-center relative px-6 py-12 sm:px-12 lg:px-20 transition-colors duration-300 min-h-screen">

                    {/* Subtle background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="w-full max-w-md relative z-10 my-auto pt-16">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                                Create an Account
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Get started by entering your details below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold ml-1" htmlFor="username">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <input
                                        className="w-full pl-11 pr-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        id="username"
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        value={name}
                                        onChange={(e) => setUserName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold ml-1" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </span>
                                    <input
                                        className="w-full pl-11 pr-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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

                            <div className="space-y-1.5">
                                <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold ml-1" htmlFor="confirm-password">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </span>
                                    <input
                                        className="w-full pl-11 pr-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Confirm your password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
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
                                        'Register'
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Footer Auth Options */}
                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Already have an account?{' '}
                                <a href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Log in
                                </a>
                            </p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">
                                Registering as institution admin?{' '}
                                <a href="/adminRegister" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Create admin account
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
};

export default RegisterPage;
