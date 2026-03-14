import React from "react";
import logo from "../components/logo.png";
import heroIllustration from "../components/landing.jpg";
import Navbar from "./Navbar";

// ─── HERO SECTION — drop-in replacement ───────────────────────────────────────
// Replaces the entire <section> that currently contains your hero.
// Everything else in your Landing.jsx stays the same.


// ─── SVG ICONS ────────────────────────────────────────────────────────────────

const QrIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path strokeLinecap="round" d="M14 14h.01M14 17h3M17 14v3M20 17v3M20 14h.01" />
    </svg>
);

const ReportIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6m3 6v-4m3 4v-2M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
    </svg>
);

const LogIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
        <path strokeLinecap="round" d="M9 12h6M9 16h4" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const TrendUpIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17l5-5 4 4 5-6" />
    </svg>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const features = [
    {
        icon: <QrIcon />,
        label: "QR Session Tracking",
        description:
            "Launch attendance sessions tied to specific classes and time windows. Every scan is validated, timestamped, and stored instantly.",
        accent: "blue",
    },
    {
        icon: <ReportIcon />,
        label: "Attendance Reports",
        description:
            "Generate per-session, per-subject, or per-student reports. Export summaries and drill into daily, weekly, or monthly trends.",
        accent: "cyan",
    },
    {
        icon: <LogIcon />,
        label: "Check-In / Check-Out Logs",
        description:
            "Capture precise entry and exit events. Detect late arrivals, early departures, and flag anomalies automatically.",
        accent: "violet",
    },
    {
        icon: <ChartIcon />,
        label: "Analytics Dashboard",
        description:
            "Visualize attendance patterns, session completion rates, and student behavior trends in a unified demo dashboard.",
        accent: "emerald",
    },
];

const steps = [
    {
        num: "01",
        title: "Teacher Creates Session",
        desc: "Select a subject, define a time window, and activate a session. A unique session QR is generated and ready instantly.",
        color: "blue",
    },
    {
        num: "02",
        title: "Students Scan QR Code",
        desc: "Students present at the session scan the displayed QR. Geo-fencing verifies physical presence before recording.",
        color: "cyan",
    },
    {
        num: "03",
        title: "Attendance Auto-Recorded",
        desc: "Each scan is validated server-side in real time. Check-in timestamps, session IDs, and student profiles are logged.",
        color: "violet",
    },
    {
        num: "04",
        title: "Teacher Views Analytics",
        desc: "Once the session closes, a full report is available — present, absent, late, and session trends over time.",
        color: "emerald",
    },
];

const statCards = [
    { label: "Total Sessions", value: "1,284", delta: "+18 this week", up: true, color: "blue" },
    { label: "Attendance Rate", value: "91.4%", delta: "+2.3% vs last week", up: true, color: "emerald" },
    { label: "Students Present", value: "348", delta: "Across 12 sessions", up: null, color: "cyan" },
    { label: "Scans Processed", value: "24,610", delta: "All time", up: null, color: "violet" },
];

const chartBars = [
    { day: "Mon", val: 78 }, { day: "Tue", val: 92 }, { day: "Wed", val: 85 },
    { day: "Thu", val: 96 }, { day: "Fri", val: 88 }, { day: "Sat", val: 45 }, { day: "Sun", val: 30 },
];

const accentMap = {
    blue: { icon: "bg-blue-500/10 text-blue-500", num: "bg-blue-500 text-white", bar: "bg-blue-500" },
    cyan: { icon: "bg-cyan-500/10 text-cyan-500", num: "bg-cyan-500 text-white", bar: "bg-cyan-400" },
    violet: { icon: "bg-violet-500/10 text-violet-500", num: "bg-violet-500 text-white", bar: "bg-violet-500" },
    emerald: { icon: "bg-emerald-500/10 text-emerald-500", num: "bg-emerald-500 text-white", bar: "bg-emerald-500" },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const Landing = () => {
    return (
        <div className="bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] transition-colors duration-300 min-h-screen font-sans antialiased">
            <Navbar />

            {/* ════════════════════════════════════════
    HERO SECTION
════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#020617] min-h-screen flex flex-col justify-center pt-20 pb-0">

                {/* ── Dark grid background ── */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* ── Radial glow behind content (blue/cyan) ── */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-[900px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
                </div>
                <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-cyan-500/8 blur-[100px]" />
                <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[80px]" />

                {/* ── Main hero grid ── */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center py-10 lg:py-16">

                        {/* ───────────── LEFT: text content ───────────── */}
                        <div className="flex flex-col justify-center">

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 w-fit bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                QR Attendance Analytics Platform
                            </div>

                            {/* Headline */}
                            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                                Attendance{" "}
                                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300 bg-clip-text text-transparent">
                                    Analytics,
                                </span>
                                <br />
                                <span className="text-slate-900 dark:text-white">Reimagined.</span>
                            </h1>

                            {/* Subheading */}
                            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                                Track attendance using QR scans and geo-verified sessions.
                                Manage classes through a powerful web dashboard while
                                students confirm attendance instantly through the mobile app.
                            </p>

                            {/* CTA Buttons */}
                            <div className="mt-10 flex flex-wrap gap-4">
                                <a
                                    href="/roles"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-colors shadow-xl shadow-blue-600/25 active:scale-[0.97]"
                                >
                                    Start Using Platform
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                                <a
                                    href="#analytics"
                                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all backdrop-blur-sm active:scale-[0.97]"
                                >
                                    View Dashboard
                                </a>
                            </div>

                            {/* Stats row */}
                            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-8">
                                {[
                                    { val: "24K+", label: "Scans Processed" },
                                    { val: "98%", label: "Uptime" },
                                    { val: "500+", label: "Sessions Tracked" },
                                ].map(({ val, label }) => (
                                    <div key={label}>
                                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{val}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-500 mt-1 font-medium">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ───────────── RIGHT: illustration ───────────── */}
                        <div className="relative flex items-center justify-center lg:justify-end">

                            {/* Soft glow blob behind the illustration */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[480px] h-[480px] rounded-full bg-gradient-to-br from-blue-600/20 via-cyan-500/15 to-violet-600/10 blur-3xl" />
                            </div>

                            {/* Illustration wrapper — floating animation */}
                            <div
                                className="relative z-10 w-full max-w-[520px]"
                                style={{ animation: "heroFloat 5s ease-in-out infinite" }}
                            >
                                <img
                                    src={heroIllustration}
                                    alt="QR Attendance Verification Illustration"
                                    className="w-full h-auto object-cover rounded-3xl transition-all duration-700 hover:scale-[1.02]"
                                    style={{
                                        filter: "drop-shadow(0 32px 48px rgba(37,99,235,0.25)) drop-shadow(0 8px 24px rgba(14,165,233,0.15))",
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
      PLATFORM (WEB + MOBILE)
════════════════════════════════════════ */}
            <section className="px-6 py-24 bg-white dark:bg-[#0A0F1E]">
                <div className="max-w-7xl mx-auto">

                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] mb-3">
                            Platform
                        </p>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            One system. Two powerful interfaces.
                        </h2>
                        <p className="mt-4 text-[#64748B] dark:text-[#94A3B8] text-lg">
                            Zono combines a demo analytics dashboard with a mobile
                            attendance interface for seamless session management.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Web Platform */}
                        <div className="group relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">

                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                                <ChartIcon />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Web Analytics Platform
                            </h3>

                            <p className="mt-3 text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                                Teachers manage attendance sessions and explore demo
                                analytics through a powerful MERN dashboard. View reports,
                                attendance trends, and student activity instantly.
                            </p>

                            <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li>• Create attendance sessions</li>
                                <li>• View attendance analytics</li>
                                <li>• Generate reports</li>
                                <li>• Monitor session activity</li>
                            </ul>
                        </div>

                        {/* Mobile Platform */}
                        <div className="group relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">

                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-6">
                                <QrIcon />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Mobile Attendance App
                            </h3>

                            <p className="mt-3 text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                                Students receive attendance notifications and verify presence
                                directly through the React Native mobile app. QR scanning and
                                geo-verification ensure accurate attendance capture.
                            </p>

                            <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li>• Receive attendance alerts</li>
                                <li>• Scan QR codes</li>
                                <li>• Geo-verified attendance</li>
                                <li>• Instant attendance confirmation</li>
                            </ul>
                        </div>

                    </div>

                </div>
            </section>



            {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
            <section id="features" className="min-h-screen px-6 flex flex-col justify-center pt-20 pb-20">
                <div className="max-w-7xl w-full mx-auto">

                    <div className="max-w-xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] mb-3">Platform Features</p>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Built for serious attendance management.
                        </h2>
                        <p className="mt-4 text-[#64748B] dark:text-[#94A3B8] text-lg leading-relaxed">
                            Every tool a teacher or administrator needs — packaged into one clean, fast platform.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
                        {features.map((f) => {
                            const a = accentMap[f.accent];
                            return (
                                <div
                                    key={f.label}
                                    className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/60 hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden"
                                >
                                    {/* Subtle corner glow */}
                                    <div className={`absolute -top-10 -right-10 w-24 h-24 ${a.icon} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${a.icon}`}>
                                        {f.icon}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight">{f.label}</h3>
                                    <p className="mt-2.5 text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">{f.description}</p>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
            <section id="how-it-works" className="min-h-screen px-6 flex flex-col justify-center pt-20 pb-20 bg-white dark:bg-[#0A0F1E]">
                <div className="max-w-7xl w-full mx-auto">

                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#0EA5E9] dark:text-[#22D3EE] mb-3">Process</p>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            From session start to full report.
                        </h2>
                        <p className="mt-4 text-[#64748B] dark:text-[#94A3B8] text-lg">
                            Four steps. Zero manual work.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
                        {/* Connector */}
                        <div className="hidden lg:block absolute top-[2.6rem] left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 dark:from-slate-800 dark:via-blue-800 dark:to-slate-800" />

                        {steps.map((s) => {
                            const a = accentMap[s.color];
                            return (
                                <div
                                    key={s.num}
                                    className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-5 z-10 relative ${a.num}`}>
                                        {s.num}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight">{s.title}</h3>
                                    <p className="mt-2.5 text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">{s.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ════════════════════════════════════════
          ANALYTICS PREVIEW
      ════════════════════════════════════════ */}
            <section id="analytics" className="min-h-screen px-6 flex flex-col justify-center pt-20 pb-20">
                <div className="max-w-7xl w-full mx-auto">

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
                        <div className="max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] mb-3">Analytics</p>
                            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Demo analytics, every session.
                            </h2>
                            <p className="mt-4 text-[#64748B] dark:text-[#94A3B8] text-lg">
                                Monitor attendance health across all subjects and students from one unified view.
                            </p>
                        </div>
                        <a
                            href="/roles"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline shrink-0"
                        >
                            Open full dashboard <ArrowRightIcon />
                        </a>
                    </div>

                    {/* Stat cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                        {statCards.map((c) => {
                            const a = accentMap[c.color];
                            return (
                                <div
                                    key={c.label}
                                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">{c.label}</p>
                                    <p className={`mt-2 text-4xl font-extrabold text-${c.color}-600 dark:text-${c.color}-400`}>{c.value}</p>
                                    {c.up !== null && (
                                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${c.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                            <TrendUpIcon /> {c.delta}
                                        </div>
                                    )}
                                    {c.up === null && (
                                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-600">{c.delta}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Chart area */}
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Weekly Attendance Overview</p>
                                <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">Mon – Sun, current week · All sessions</p>
                            </div>
                            <div className="flex gap-4 text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Present
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Absent
                                </span>
                            </div>
                        </div>

                        {/* Chart bars */}
                        <div className="flex items-end gap-3 h-40">
                            {chartBars.map(({ day, val }) => (
                                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-600">{val}%</span>
                                    <div className="w-full rounded-t-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex flex-col-reverse" style={{ height: "110px" }}>
                                        <div
                                            className="w-full rounded-t-lg bg-gradient-to-t from-[#2563EB] to-[#0EA5E9] dark:from-[#3B82F6] dark:to-[#22D3EE]"
                                            style={{ height: `${val}%`, transition: "height 0.8s cubic-bezier(.4,0,.2,1)" }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent sessions table */}
                    {/* <div className="mt-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <p className="font-bold text-[15px] text-slate-900 dark:text-white">Recent Sessions</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        {["Subject", "Date", "Present", "Absent", "Rate"].map((h) => (
                                            <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { subject: "Computer Networks", date: "Mar 13", present: 42, absent: 6, rate: "87%" },
                                        { subject: "Data Structures", date: "Mar 13", present: 38, absent: 4, rate: "90%" },
                                        { subject: "Operating Systems", date: "Mar 12", present: 45, absent: 3, rate: "93%" },
                                        { subject: "Mathematics III", date: "Mar 12", present: 30, absent: 12, rate: "71%" },
                                    ].map((r, i) => (
                                        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{r.subject}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-500">{r.date}</td>
                                            <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">{r.present}</td>
                                            <td className="px-6 py-4 text-rose-500 font-semibold">{r.absent}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${parseInt(r.rate) >= 90
                                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                    : parseInt(r.rate) >= 80
                                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                                        : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                                    }`}>{r.rate}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div> */}

                </div>
            </section>

            {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
            <section className="min-h-screen px-6 flex flex-col justify-center pt-20 pb-20 bg-white dark:bg-[#0A0F1E]">
                <div className="max-w-3xl w-full mx-auto">
                    <div className="relative rounded-3xl overflow-hidden p-12 text-center bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0EA5E9] dark:from-[#1e3a8a] dark:via-[#1e40af] dark:to-[#0c4a6e] shadow-2xl shadow-blue-500/20">

                        {/* Background noise texture */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        />

                        <div className="relative z-10">
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">Get Started Today</p>
                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                                Upgrade your attendance system.
                            </h2>
                            <p className="mt-5 text-blue-100/80 text-lg max-w-xl mx-auto leading-relaxed">
                                Replace manual registers and proxy-prone methods with a verified, data-driven attendance platform.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="/roles"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#2563EB] font-bold text-sm px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg active:scale-[0.98]"
                                >
                                    Start Free <ArrowRightIcon />
                                </a>
                                <a
                                    href="#analytics"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/25 text-white font-semibold text-sm px-8 py-4 rounded-xl hover:bg-white/10 transition-colors active:scale-[0.98]"
                                >
                                    Explore Dashboard
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
            <footer className="bg-slate-950 text-slate-400 py-16 px-6">
                <div className="max-w-7xl mx-auto">

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">

                        {/* Brand */}
                        <div className="lg:col-span-2">
                            <a href="/" className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                                    <img src={logo} alt="logo" className="h-5 w-5 object-contain" />
                                </div>
                                <span className="font-bold text-sm text-white">
                                    Scan In <span className="text-[#3B82F6]">Step In</span>
                                </span>
                            </a>
                            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
                                Zono is a smart attendance platform combining a MERN analytics
                                dashboard with a React Native mobile app for secure QR-based
                                attendance verification.</p>
                        </div>

                        {/* Product */}
                        <div>
                            <p className="text-white font-semibold text-sm mb-5 tracking-tight">Product</p>
                            <ul className="flex flex-col gap-3 text-sm">
                                {["Features", "Analytics", "Documentation"].map((l) => (
                                    <li key={l}>
                                        <a href="#" className="hover:text-white transition-colors duration-200">{l}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <p className="text-white font-semibold text-sm mb-5 tracking-tight">Support</p>
                            <ul className="flex flex-col gap-3 text-sm">
                                {["Contact", "Privacy Policy"].map((l) => (
                                    <li key={l}>
                                        <a href="#" className="hover:text-white transition-colors duration-200">{l}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                        <p>© {new Date().getFullYear()} Zono. All rights reserved.</p>
                        <p>Built with MERN Stack · MongoDB · Express · React · Node.js</p>
                    </div>

                </div>
            </footer>

            {/* ─── Gradient animation keyframe (injected inline for portability) ─── */}
            <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>

        </div>
    );
};

export default Landing;
