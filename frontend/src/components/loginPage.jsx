import React, { useState } from 'react';
import loginImg from '../loginImg.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState(''); // Initial value as an empty string
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Include credentials to send cookies
        axios.post('http://localhost:3001/login', { email, password }, { withCredentials: true })
            .then(result => {
                console.log(result.data);
                if (result.data.message === "Success") {
                    // Redirect to homepage
                    navigate('/home');
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] min-h-screen flex flex-col lg:flex-row transition-colors duration-300">
            <Navbar />

            {/* Left Image Side (hidden on small screens) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] justify-center items-center relative overflow-hidden bg-slate-900">
                {/* Complex overlay and gradients for premium feel */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-blue-900/60 via-transparent to-transparent mix-blend-multiply"></div>

                <img
                    src={loginImg}
                    alt="Login Illustration"
                    className="object-cover h-full w-full opacity-60 dark:opacity-40 transition-opacity duration-700 hover:scale-105"
                />

                {/* Glassmorphic feature highlight over the image */}
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Lightning Fast</h3>
                                <p className="text-blue-200 text-sm">Secure your session instantly</p>
                            </div>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-medium">
                            "Scan In Step In completely transformed how our faculty handles daily attendance tracking. It's effortless and incredibly reliable."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Form Side */}
            <div className="flex-1 flex justify-center items-center relative px-6 py-24 sm:px-12 lg:px-20 transition-colors duration-300">

                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                            Welcome Back
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <button className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-2xl transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] active:scale-[0.98]" type="submit">
                                Sign In
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
    );
}

export default LoginPage;
