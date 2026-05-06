import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE } from '../constants/api';

const AdminRegisterPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        instituteName: '',
        instituteAddress: '',
        name: '',
        email: '',
        phone: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const stepConfig = [
        {
            id: 1,
            title: 'Institution Details',
            subtitle: 'Tell us about your institution.',
        },
        {
            id: 2,
            title: 'Admin Details',
            subtitle: 'Provide your admin contact information.',
        },
        {
            id: 3,
            title: 'Review & Submit',
            subtitle: 'Confirm details and send your request.',
        },
    ];

    const updateField = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateStep = (currentStep) => {
        const nextErrors = {};

        if (currentStep === 1) {
            if (!formData.instituteName.trim()) {
                nextErrors.instituteName = 'Institution name is required';
            }
        }

        if (currentStep === 2) {
            if (!formData.name.trim()) {
                nextErrors.name = 'Admin full name is required';
            }

            if (!formData.email.trim()) {
                nextErrors.email = 'Email is required';
            } else if (!isValidEmail(formData.email.trim())) {
                nextErrors.email = 'Enter a valid email address';
            }

            if (!formData.phone.trim()) {
                nextErrors.phone = 'Phone is required';
            }
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNextStep = () => {
        setError('');
        setSuccess('');

        if (!validateStep(step)) {
            return;
        }

        setStep((prev) => Math.min(prev + 1, 3));
    };

    const handlePreviousStep = () => {
        setError('');
        setSuccess('');
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateStep(1) || !validateStep(2)) {
            setStep(!formData.instituteName.trim() ? 1 : 2);
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(`${API_BASE}/api/admin/register`, {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                instituteName: formData.instituteName.trim(),
                instituteAddress: formData.instituteAddress.trim(),
            }, { withCredentials: true });

            setSuccess('ZonoAdmins will review it and contact you for Email and password in 4 to 5 business days.');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to register admin');
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
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-cyan-900/60 via-transparent to-transparent mix-blend-multiply"></div>

                    <img
                        src="/loginImg.png"
                        alt="Admin Register Illustration"
                        className="object-cover h-full w-full opacity-60 dark:opacity-40 transition-opacity duration-700 hover:scale-105"
                    />
                </div>

                <div className="flex-1 flex flex-col justify-center items-center relative px-6 py-12 sm:px-12 lg:px-20 transition-colors duration-300 min-h-screen">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="w-full max-w-md relative z-10 my-auto pt-16">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                                Register Institute Admin
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Create your institution profile in three quick steps.
                            </p>
                        </div>

                        <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                {stepConfig.map((item, index) => {
                                    const isComplete = step > item.id;
                                    const isActive = step === item.id;
                                    return (
                                        <React.Fragment key={item.id}>
                                            <div className="flex flex-col items-center gap-2 min-w-[86px]">
                                                <div
                                                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                                                        isComplete
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : isActive
                                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-600 dark:text-blue-300'
                                                                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {isComplete ? '✓' : item.id}
                                                </div>
                                                <p
                                                    className={`text-[11px] text-center font-semibold ${
                                                        isActive
                                                            ? 'text-blue-600 dark:text-blue-300'
                                                            : 'text-slate-500 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {item.title}
                                                </p>
                                            </div>
                                            {index < stepConfig.length - 1 && (
                                                <div className="flex-1 h-[2px] mx-2 bg-slate-200 dark:bg-slate-800 relative overflow-hidden rounded-full">
                                                    <span
                                                        className={`absolute left-0 top-0 h-full bg-blue-600 transition-all ${step > item.id ? 'w-full' : 'w-0'}`}
                                                    />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            <div className="mt-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                    Step {step} of 3
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                                    {stepConfig[step - 1].subtitle}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/15 dark:to-teal-500/15 border border-emerald-300 dark:border-emerald-500/35 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-2xl text-sm font-semibold text-center shadow-sm">
                                    {success}
                                </div>
                            )}

                            {step === 1 && (
                                <>
                                    <div className="space-y-1.5">
                                        <input
                                            className="w-full px-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                            type="text"
                                            placeholder="Institution name"
                                            value={formData.instituteName}
                                            onChange={(e) => updateField('instituteName', e.target.value)}
                                            required
                                        />
                                        {fieldErrors.instituteName && (
                                            <p className="text-xs text-red-600 dark:text-red-400 ml-1">{fieldErrors.instituteName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <textarea
                                            className="w-full px-4 py-3 min-h-[96px] rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                                            placeholder="Institution address (optional)"
                                            value={formData.instituteAddress}
                                            onChange={(e) => updateField('instituteAddress', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="space-y-1.5">
                                        <input
                                            className="w-full px-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                            type="text"
                                            placeholder="Admin full name"
                                            value={formData.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            required
                                        />
                                        {fieldErrors.name && (
                                            <p className="text-xs text-red-600 dark:text-red-400 ml-1">{fieldErrors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <input
                                            className="w-full px-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                            type="email"
                                            placeholder="admin@institution.edu"
                                            value={formData.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            required
                                        />
                                        {fieldErrors.email && (
                                            <p className="text-xs text-red-600 dark:text-red-400 ml-1">{fieldErrors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <input
                                            className="w-full px-4 h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                            type="text"
                                            placeholder="Phone number"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            required
                                        />
                                        {fieldErrors.phone && (
                                            <p className="text-xs text-red-600 dark:text-red-400 ml-1">{fieldErrors.phone}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Details</h3>
                                    <div className="grid grid-cols-1 gap-3 text-sm">
                                        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Institution:</span> {formData.instituteName || '-'}</p>
                                        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Address:</span> {formData.instituteAddress || 'Not provided'}</p>
                                        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Admin Name:</span> {formData.name || '-'}</p>
                                        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Email:</span> {formData.email || '-'}</p>
                                        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Phone:</span> {formData.phone || '-'}</p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            By submitting, your institution will be marked for approval review.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                {step > 1 && (
                                    <button
                                        className="flex-1 inline-flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold h-12 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/70"
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={isLoading}
                                    >
                                        Back
                                    </button>
                                )}

                                {step < 3 ? (
                                    <button
                                        className="flex-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-2xl transition-all disabled:opacity-70"
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={isLoading}
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <button
                                        className="flex-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-2xl transition-all disabled:opacity-70"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Submitting request...' : 'Submit Registration Request'}
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Already registered?{' '}
                                <a href="/adminLogin" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Admin Login
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

export default AdminRegisterPage;