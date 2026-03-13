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
        <div className="bg-white dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] min-h-screen flex flex-col lg:flex-row transition-colors duration-300">
            <Navbar />

            {/* Left Image Side (hidden on small screens) */}
            <div className="hidden lg:flex lg:w-2/5 justify-start items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply dark:mix-blend-overlay z-10" />
                <img
                    src={loginImg}
                    alt="Login Illustration"
                    className="object-cover h-full w-full dark:opacity-80 transition-opacity"
                />
            </div>

            {/* Right Form Side */}
            <div className="flex-1 flex justify-center items-center bg-[#F8FAFC] dark:bg-[#020617] px-6 py-24 sm:px-12 transition-colors duration-300">
                <div className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-slate-900 shadow-xl dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-8 text-slate-900 dark:text-white">Welcome Back!</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="w-full px-4 h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <button className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]" type="submit">
                                Log In
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors">
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
