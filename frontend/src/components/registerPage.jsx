import React, { useState } from 'react'
import axios from 'axios';
import Navbar from './Navbar';

const RegisterPage = () => {

    const [name, setUserName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPasword] = useState()

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/register', { name, email, password, confirmPassword })
            .then(result => console.log(result))
            .catch(err => console.log(JSON.stringify(err, null, 2)));  // Pretty-print the error JSON
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] min-h-screen flex flex-col justify-center items-center py-24 transition-colors duration-300">
            <Navbar />
            <div className="w-full max-w-md mx-auto px-6">
                <div className="bg-white dark:bg-slate-900 shadow-xl dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 transition-colors">
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-8 text-slate-900 dark:text-white">Register</h2>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                className="w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                required
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
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
                                className="w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2" htmlFor="confirm-password">
                                Confirm Password
                            </label>
                            <input
                                className="w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm your password"
                                required
                                onChange={(e) => setConfirmPasword(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <button className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]" type="submit">
                                Register
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <a href="/login" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors">
                            Already have an account? Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage
