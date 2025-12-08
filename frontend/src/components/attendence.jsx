import React, { useState, useEffect } from "react";
import Header from "./Header";

const Attendence = () => {
    const [selectedYear, setSelectedYear] = useState("Select Year");
    const [selectedDepartment, setSelectedDepartment] = useState("Select Department");
    const [selectedClass, setSelectedClass] = useState("Select Class");
    const [attendanceData, setAttendanceData] = useState([]);

    const [dropdownOpen, setDropdownOpen] = useState({
        year: false,
        department: false,
        class: false
    });

    const isButtonDisabled =
        selectedYear === "Select Year" ||
        selectedDepartment === "Select Department" ||
        selectedClass === "Select Class";

    const classroomMap = {
        FF124: "67e2539055b986f5a20cd0fb",
        FF125: "67d585c2e48f33d185ec1b53",
        Home: "67eaa4c41728c4405b3bb85c"
    };

    const handleSelect = (type, value) => {
        if (type === "year") setSelectedYear(value);
        if (type === "department") setSelectedDepartment(value);
        if (type === "class") setSelectedClass(value);
        setDropdownOpen({ ...dropdownOpen, [type]: false });
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
            } else {
                alert("" + data.error || "Failed to start attendance");
            }
        } catch (err) {
            console.error("Error starting attendance:", err);
            alert("Server error starting attendance");
        }
    };

    return (
        <div>
            <Header>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex gap-4 justify-between">
                        {/* Year Dropdown */}
                        <div
                            className="dropdown dropdown-hover w-1/3"
                            onMouseEnter={() => setDropdownOpen({ ...dropdownOpen, year: true })}
                            onMouseLeave={() => setDropdownOpen({ ...dropdownOpen, year: false })}
                        >
                            <div tabIndex={0} role="button" className="btn w-full">
                                {selectedYear}
                            </div>
                            {dropdownOpen.year && (
                                <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
                                    <li>
                                        <a onClick={() => handleSelect("year", "First Year")}>First Year</a>
                                    </li>
                                    <li>
                                        <a onClick={() => handleSelect("year", "Second Year")}>Second Year</a>
                                    </li>
                                    <li>
                                        <a onClick={() => handleSelect("year", "Third Year")}>Third Year</a>
                                    </li>
                                    <li>
                                        <a onClick={() => handleSelect("year", "Fourth Year")}>Fourth Year</a>
                                    </li>
                                </ul>
                            )}
                        </div>

                        {/* Department Dropdown */}
                        <div
                            className="dropdown dropdown-hover w-1/3"
                            onMouseEnter={() => setDropdownOpen({ ...dropdownOpen, department: true })}
                            onMouseLeave={() => setDropdownOpen({ ...dropdownOpen, department: false })}
                        >
                            <div tabIndex={0} role="button" className="btn w-full">
                                {selectedDepartment}
                            </div>
                            {dropdownOpen.department && (
                                <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
                                    <li>
                                        <a onClick={() => handleSelect("department", "Comps")}>Comps</a>
                                    </li>
                                    <li>
                                        <a onClick={() => handleSelect("department", "CSD")}>CSD</a>
                                    </li>
                                    <li>
                                        <a onClick={() => handleSelect("department", "AIDS")}>AIDS</a>
                                    </li>
                                </ul>
                            )}
                        </div>

                        {/* Class Dropdown */}
                        <div
                            className="dropdown dropdown-hover w-1/3"
                            onMouseEnter={() => setDropdownOpen({ ...dropdownOpen, class: true })}
                            onMouseLeave={() => setDropdownOpen({ ...dropdownOpen, class: false })}
                        >
                            <div tabIndex={0} role="button" className="btn w-full">
                                {selectedClass}
                            </div>
                            {dropdownOpen.class && (
                                <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
                                    <li>
                                        <a onClick={() => handleSelect("class", "FF124")}>FF124</a>
                                    </li>
                                    <li>
                                        <a onClick={() => handleSelect("class", "FF125")}>FF125</a>
                                    </li>
                                    <li>
                                        <a onClick={() => handleSelect("class", "Home")}>Home</a>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-between">
                        <button
                            className="btn w-full h-12"
                            onClick={() => document.getElementById("my_modal_4").showModal()}
                            disabled={isButtonDisabled}
                        >
                            Open Modal
                        </button>
                    </div>

                    {/* Modal */}
                    <dialog id="my_modal_4" className="modal">
                        <div className="modal-box w-11/12 max-w-5xl">
                            <h3 className="font-bold text-lg">Attendance List</h3>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Roll Number</th>
                                            <th>Year</th>
                                            <th>Department</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.length > 0 ? (
                                            attendanceData.map((student, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.roll}</td>
                                                    <td>{student.year}</td>
                                                    <td>{student.department}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    No records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal Action */}
                            <div className="modal-action">
                                <button
                                    className="btn btn-outline btn-success"
                                    onClick={handleStartAttendance}
                                    type="button"
                                >
                                    Take Attendance
                                </button>
                            </div>
                        </div>
                    </dialog>
                </div>
            </Header>
        </div>
    );
};

export default Attendence;
