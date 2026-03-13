import React, { useState, useEffect } from "react";
import logo from "../components/logo.png";

const SunIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const MoonIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const Navbar = () => {
    const [dark, setDark] = useState(() => localStorage.getItem("sisi-dark") === "true");
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("sisi-dark", "true");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("sisi-dark", "false");
        }
    }, [dark]);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 16);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    const navLinks = [
        { name: "Features", href: "/#features" },
        { name: "How It Works", href: "/#how-it-works" },
        { name: "Analytics", href: "/#analytics" },
    ];

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
                    : "bg-transparent"
                }`}
        >
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <a href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 bg-[#2563EB] dark:bg-[#3B82F6] rounded-lg flex items-center justify-center shadow-md shadow-blue-500/25">
                        <img src={logo} alt="logo" className="h-5 w-5 object-contain" />
                    </div>
                    <span className="font-bold text-[15px] tracking-tight text-slate-900 dark:text-white">
                        Scan In <span className="text-[#2563EB] dark:text-[#3B82F6]">Step In</span>
                    </span>
                </a>

                <div className="hidden md:flex items-center gap-7">
                    {navLinks.map((l) => (
                        <a
                            key={l.name}
                            href={l.href}
                            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                        >
                            {l.name}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDark(!dark)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {dark ? <SunIcon /> : <MoonIcon />}
                    </button>

                    <a
                        href="/login"
                        className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Login <ArrowRightIcon />
                    </a>

                    <a
                        href="/roles"
                        className="hidden md:inline-flex bg-[#2563EB] dark:bg-[#3B82F6] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20 active:scale-95"
                    >
                        Get Started
                    </a>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        {menuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div className="md:hidden px-6 pb-5 pt-2 bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                    {navLinks.map((l) => (
                        <a
                            key={l.name}
                            href={l.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                            {l.name}
                        </a>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <a href="/login" className="flex-1 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-center py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:border-slate-300 transition">
                            Login
                        </a>
                        <a href="/roles" className="flex-1 bg-[#2563EB] dark:bg-[#3B82F6] text-white text-sm font-semibold text-center py-2.5 rounded-lg hover:bg-blue-700 transition">
                            Get Started
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
