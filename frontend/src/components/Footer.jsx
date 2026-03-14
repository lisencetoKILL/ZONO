import React from 'react';

const Footer = () => {
    return (
        <footer className="relative bg-[#F8FAFC] dark:bg-[#020617] pt-32 overflow-hidden border-t border-slate-200 dark:border-slate-800/40 text-center">
            <div className="max-w-3xl mx-auto px-6 relative z-10 pb-6">
                <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400">
                    A modern attendance platform connecting powerful analytics with seamless mobile verification.
                </p>
            </div>

            {/* HUGE ZONO BACKGROUND TEXT */}
            <div className="w-full flex justify-center items-end select-none pointer-events-none mt-12 overflow-hidden">
                <span
                    className="text-[24vw] font-black leading-[0.75] tracking-tighter text-slate-200 dark:text-slate-800/40"
                >
                    ZONO
                </span>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 border-t border-slate-200 dark:border-slate-800/60 text-sm text-slate-500 font-medium">
                    <p>© {new Date().getFullYear()} Zono. All rights reserved.</p>
                    <p className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer">Terms and Conditions | Privacy Policy</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
