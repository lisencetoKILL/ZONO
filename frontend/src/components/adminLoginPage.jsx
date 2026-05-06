import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE } from '../constants/api';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/admin/login`, {
                email,
                password,
            }, { withCredentials: true });

            if (response.data.message === 'Success') {
                navigate('/adminDashboard');
                return;
            }

            setError(response.data.error || response.data.message || 'Login failed');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to login admin');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] min-h-screen flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-1 flex flex-col lg:flex-row w-full">
                <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] justify-center items-center relative overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-blue-900/60 via-transparent to-transparent mix-blend-multiply"></div>

                    <img
                        src="/loginImg.png"
                        alt="Admin Login Illustration"
                        className="object-cover h-full w-full opacity-60 dark:opacity-40 transition-opacity duration-700 hover:scale-105"
                    />
                </div>

                <div className="flex-1 flex flex-col justify-center items-center relative px-6 py-12 sm:px-12 lg:px-20 transition-colors duration-300 min-h-screen">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="w-full max-w-md relative z-10 my-auto pt-16">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                                Admin Login
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Access institution analytics and teacher management.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <input
                                className="w-full px-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                type="email"
                                placeholder="admin@institution.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <input
                                className="w-full px-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-2xl transition-all disabled:opacity-70"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In as Admin'}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Need an admin account?{' '}
                                <a href="/adminRegister" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Register Institution
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

export default AdminLoginPage;