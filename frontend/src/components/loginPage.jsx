import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { fetchSessionCached, setSessionCache } from '../utils/sessionClient';
import { API_BASE } from '../constants/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract role and hide selection config from route state
    const navState = location.state || {};
    const defaultRole = navState.role || 'staff';
    const hideRoleSelection = navState.hideRoleSelection || false;

    const [role, setRole] = useState(defaultRole); // 'staff' or 'parent'
    const [identifier, setIdentifier] = useState(''); // email for staff, parent mobile for OTP
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState('request');
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const autoLoginStaffFromSession = async () => {
            try {
                const data = await fetchSessionCached();

                if (!isMounted) return;

                if (data?.loggedIn && data?.user?.role === 'staff') {
                    navigate('/home', { replace: true });
                    return;
                }
            } catch (sessionError) {
                // Keep user on login page if session check fails.
            } finally {
                if (isMounted) {
                    setIsCheckingSession(false);
                }
            }
        };

        autoLoginStaffFromSession();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    useEffect(() => {
        if (role !== 'parent') {
            setOtpStep('request');
            setOtp('');
            setOtpExpiresIn(0);
            setSuccessMessage('');
            return;
        }

        setPassword('');
        setError('');
        setSuccessMessage('');
    }, [role]);

    const resetParentOtpFlow = () => {
        setOtpStep('request');
        setOtp('');
        setOtpExpiresIn(0);
    };

    const handleParentRequestOtp = async () => {
        const result = await axios.post(
            `${API_BASE}/parent/request-otp`,
            { identifier },
            { withCredentials: true }
        );

        setOtpStep('verify');
        setOtp('');
        setOtpExpiresIn(Number(result.data?.otpExpiresInSeconds || 0));
        if (result.data?.deliveryFallback && result.data?.devOtp) {
            setSuccessMessage(`${result.data?.message || 'OTP generated'} OTP: ${result.data.devOtp}`);
            return;
        }

        setSuccessMessage(result.data?.message || 'OTP sent successfully');
    };

    const handleParentVerifyOtp = async () => {
        const result = await axios.post(
            `${API_BASE}/parent/verify-otp`,
            { identifier, otp },
            { withCredentials: true }
        );

        if (result.data?.message === 'Success') {
            setSessionCache({ loggedIn: true, user: result.data?.user || null });
            navigate('/parentTest');
            return;
        }

        setError(result.data?.message || 'OTP verification failed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (role === 'staff') {
                const result = await axios.post(`${API_BASE}/login`, { email: identifier, password }, { withCredentials: true });
                if (result.data.message === "Success") {
                    setSessionCache({ loggedIn: true, user: result.data?.user || null });
                    navigate('/home');
                } else {
                    setError(result.data.error || result.data.message || 'Login failed');
                }
            } else {
                if (otpStep === 'request') {
                    await handleParentRequestOtp();
                } else {
                    await handleParentVerifyOtp();
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    }

    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center px-6">
                <div className="h-10 w-10 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin" />
            </div>
        );
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
                                    onClick={() => { setRole('staff'); setIdentifier(''); setError(''); setSuccessMessage(''); resetParentOtpFlow(); }}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === 'staff' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Faculty / Staff
                                </button>
                                <button
                                    onClick={() => { setRole('parent'); setIdentifier(''); setError(''); setSuccessMessage(''); resetParentOtpFlow(); }}
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

                            {successMessage && (
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl text-sm font-medium text-center">
                                    {successMessage}
                                </div>
                            )}

                            {role === 'parent' && otpStep === 'verify' && otpExpiresIn > 0 && (
                                <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 font-semibold">
                                    <div className="text-center">OTP valid for about {Math.max(1, Math.ceil(otpExpiresIn / 60))} minute(s).</div>
                                    <div className="mt-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIdentifier('');
                                                setError('');
                                                setSuccessMessage('');
                                                resetParentOtpFlow();
                                            }}
                                            className="text-xs font-bold underline decoration-2 underline-offset-2 text-blue-700 dark:text-blue-300"
                                        >
                                            Use a different number
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold ml-1" htmlFor="identifier">
                                    {role === 'parent' ? 'Parent Mobile Number' : 'Email Address'}
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
                                        type={role === 'parent' ? 'text' : 'email'}
                                        placeholder={role === 'parent' ? 'Enter parent mobile number' : 'name@example.com'}
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        readOnly={role === 'parent' && otpStep === 'verify'}
                                    />
                                </div>
                            </div>

                            {role === 'staff' ? (
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
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold ml-1" htmlFor="otp">
                                        Enter OTP
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </span>
                                        <input
                                            className="w-full pl-11 pr-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm tracking-[0.35em] text-center font-semibold"
                                            id="otp"
                                            type="text"
                                            placeholder="______"
                                            maxLength={6}
                                            required={otpStep === 'verify'}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            disabled={otpStep !== 'verify'}
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {otpStep === 'request'
                                            ? 'Request OTP first, then enter the 6-digit code sent to your registered mobile number.'
                                            : 'Enter the 6-digit code sent to your registered mobile number.'}
                                    </p>
                                </div>
                            )}

                            {role === 'staff' ? (
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
                            ) : (
                                <div className="flex items-center justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!identifier || isLoading) return;
                                            try {
                                                setError('');
                                                setSuccessMessage('');
                                                setIsLoading(true);
                                                await handleParentRequestOtp();
                                            } catch (err) {
                                                setError(err.response?.data?.message || 'Failed to resend OTP');
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                        className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                                        disabled={otpStep !== 'verify' || isLoading}
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-2xl transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                                    type="submit"
                                    disabled={isLoading || !identifier || (role === 'staff' ? !password : otpStep === 'verify' ? otp.length !== 6 : false)}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        role === 'staff'
                                            ? 'Sign In'
                                            : otpStep === 'request'
                                                ? 'Send OTP'
                                                : 'Verify OTP'
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
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">
                                Institution admin?{' '}
                                <a href="/adminLogin" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Login here
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
