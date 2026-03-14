import React, { useRef, useState, useEffect } from "react";
import Header from "./Header";

const Attendence = () => {
    const [selectedYear, setSelectedYear] = useState("Select Year");
    const [selectedDepartment, setSelectedDepartment] = useState("Select Department");
    const [selectedClass, setSelectedClass] = useState("Select Class");
    const [attendanceData, setAttendanceData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const modalRef = useRef(null);

    const isButtonDisabled =
        selectedYear === "Select Year" ||
        selectedDepartment === "Select Department" ||
        selectedClass === "Select Class";

    const classroomMap = {
        FF124: "67e2539055b986f5a20cd0fb",
        FF125: "67d585c2e48f33d185ec1b53",
        Home: "67eaa4c41728c4405b3bb85c"
    };

    useEffect(() => {
        if (selectedYear !== "Select Year" && selectedDepartment !== "Select Department") {
            fetchAttendanceData();
        }
    }, [selectedYear, selectedDepartment]);

    const fetchAttendanceData = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/attendStudent?year=${selectedYear}&department=${selectedDepartment}`
            );
            const data = await response.json();
            setAttendanceData(data);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

    const handleStartAttendance = async () => {
        const classroomId = classroomMap[selectedClass];
        if (!classroomId) {
            alert("Invalid classroom selected");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("http://localhost:3001/api/start-attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    department: selectedDepartment,
                    year: selectedYear,
                    classNumber: selectedClass,
                    classroomId
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert("" + data.message);
                modalRef.current?.close();
            } else {
                alert("" + data.error || "Failed to start attendance");
            }
        } catch (err) {
            console.error("Error starting attendance:", err);
            alert("Server error starting attendance");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectClassName =
        "w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all";

    return (
        <Header>
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Attendance</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Start Attendance Session</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">Choose year, department, and classroom to review the list and begin attendance.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className={selectClassName}
                            >
                                <option>Select Year</option>
                                <option>First Year</option>
                                <option>Second Year</option>
                                <option>Third Year</option>
                                <option>Fourth Year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">Department</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className={selectClassName}
                            >
                                <option>Select Department</option>
                                <option>Comps</option>
                                <option>CSD</option>
                                <option>AIDS</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">Classroom</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className={selectClassName}
                            >
                                <option>Select Class</option>
                                <option>FF124</option>
                                <option>FF125</option>
                                <option>Home</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{selectedYear}</span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{selectedDepartment}</span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{selectedClass}</span>
                        </div>

                        <button
                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => modalRef.current?.showModal()}
                            disabled={isButtonDisabled}
                            type="button"
                        >
                            Preview Attendance List
                        </button>
                    </div>
                </div>

                <dialog ref={modalRef} className="backdrop:bg-slate-900/60 rounded-3xl w-full max-w-5xl p-0 bg-transparent">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
                        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Attendance List</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{attendanceData.length} students found for selected criteria.</p>
                            </div>
                            <button
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                onClick={() => modalRef.current?.close()}
                                type="button"
                            >
                                Close
                            </button>
                        </div>

                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full text-sm min-w-[700px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">#</th>
                                        <th className="px-6 py-4 text-left">Name</th>
                                        <th className="px-6 py-4 text-left">Roll Number</th>
                                        <th className="px-6 py-4 text-left">Year</th>
                                        <th className="px-6 py-4 text-left">Department</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {attendanceData.length > 0 ? (
                                        attendanceData.map((student, index) => (
                                            <tr key={`${student._id || student.roll}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{index + 1}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{student.name}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.roll}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.year}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.department}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                                                No records found for the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <button
                                className="px-5 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                onClick={() => modalRef.current?.close()}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={handleStartAttendance}
                                type="button"
                                disabled={isSubmitting || attendanceData.length === 0}
                            >
                                {isSubmitting ? "Starting..." : "Take Attendence"}
                            </button>
                        </div>
                    </div>
                </dialog>
            </div>
        </Header>
    );
};

export default Attendence;
