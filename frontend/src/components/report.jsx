import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';

const Report = () => {
    const navigate = useNavigate();
    const { studentId } = useParams();
    const [reportText, setReportText] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle the form submission
    const handleSubmit = async () => {
        if (!reportText.trim()) {
            setMessage("Please provide report details.");
            setIsSuccess(false);
            return;
        }

        setIsSubmitting(true);  // Disable the button while submitting

        try {
            const response = await fetch(`http://localhost:3001/api/students/${studentId}/report`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report: reportText,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Report submitted successfully!');
                setReportText('');  // Clear the text area after success
                setIsSuccess(true);  // Set success status to true

                // Clear success message after 3 seconds
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(`Failed to submit report: ${data.error}`);
                setIsSuccess(false);
            }
        } catch (error) {
            setMessage(`Error submitting report: ${error.message}`);
            setIsSuccess(false);
        }

        setIsSubmitting(false);  // Enable the button again
    };

    // Navigate back to the LogReport page
    const handleClick = () => {
        navigate('/logReport');
    }

    return (
        <Header>
            <div className="space-y-6">
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl"></div>
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-blue-500/10 dark:ring-blue-400/20"></div>

                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Reports</p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Submit Student Report</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
                            Add notes for this student and save them to the report log.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="report">
                            Report Details
                        </label>
                        <textarea
                            id="report"
                            className="w-full min-h-44 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Write your report here..."
                            disabled={isSubmitting}
                        />
                    </div>

                    {message && (
                        <div
                            className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold border ${
                                isSuccess
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40'
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <button
                            className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60"
                            onClick={handleClick}
                            disabled={isSubmitting}
                            type="button"
                        >
                            Back to Log Report
                        </button>

                        <button
                            className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-60"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            type="button"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </div>
        </Header>
    );
}

export default Report;
