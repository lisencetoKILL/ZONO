import React, { useState, useEffect } from "react";
import Header from "./Header";

import {
  Users,
  CheckCircle2,
  Clock,
  UserPlus,
  Search
} from "lucide-react";

const Home = () => {

  const [counter, setCounter] = useState(0);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {

    const fetchStudents = async () => {
      try {

        const response = await fetch("http://localhost:3001/api/students");
        const data = await response.json();

        setStudents(data);

        const today = new Date().toISOString().split("T")[0];

        const todaysEntries = data.filter(
          (s) =>
            new Date(s.createdAt).toISOString().split("T")[0] === today
        );

        setCounter(todaysEntries.length);

      } catch (error) {

        console.error("Error fetching students:", error);

      } finally {

        setIsLoading(false);

      }
    };

    fetchStudents();

  }, []);


  const formatDate = (date) => {

    if (!date) return "N/A";

    const d = new Date(date);

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  };


  const filteredStudents = students.filter((student) => {

    const query = searchTerm.trim().toLowerCase();

    if (!query) return true;

    return (
      student?.name?.toLowerCase().includes(query) ||
      student?.email?.toLowerCase().includes(query) ||
      student?.branch?.toLowerCase().includes(query)
    );

  });


  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });


  const stats = [

    {
      label: "Today's Attendance",
      value: counter,
      icon: <CheckCircle2 size={20} />,
      color: "bg-emerald-500",
    },

    {
      label: "Total Students",
      value: students.length,
      icon: <Users size={20} />,
      color: "bg-blue-600",
    },

    {
      label: "Recent Entries",
      value: Math.min(counter, 5),
      icon: <UserPlus size={20} />,
      color: "bg-violet-500",
    },

    {
      label: "Avg In-Time",
      value: "08:45 AM",
      icon: <Clock size={20} />,
      color: "bg-amber-500",
    },

  ];


  return (

    <Header>

      <div className="space-y-8">

        {/* Dashboard Header */}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                Dashboard
              </p>

              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                Attendance Overview
              </h1>

              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Track student check-ins and monitor attendance activity.
              </p>

            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">
              {todayLabel}
            </div>

          </div>

        </div>


        {/* Stat Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {stats.map((stat, i) => (

            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition"
            >

              <div className="flex items-center justify-between mb-4">

                <div
                  className={`${stat.color} text-white w-11 h-11 rounded-xl flex items-center justify-center`}
                >
                  {stat.icon}
                </div>

              </div>

              <p className="text-xs uppercase font-bold tracking-wider text-slate-500">
                {stat.label}
              </p>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stat.value}
              </h3>

            </div>

          ))}

        </div>


        {/* Attendance Table */}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">

          {/* Header */}

          <div className="p-6 flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recent Attendance
              </h2>

              <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
                {filteredStudents.length} Visible
              </span>

            </div>


            {/* Search */}

            <div className="relative">

              <Search
                size={16}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />

            </div>

          </div>


          {/* Table */}

          <table className="w-full text-sm">

            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase">

              <tr>

                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Academic Context</th>
                <th className="px-6 py-4 text-left">Entry Time</th>
                <th className="px-6 py-4 text-left">Status</th>

              </tr>

            </thead>


            <tbody className="divide-y dark:divide-slate-800">

              {isLoading ? (

                <tr>

                  <td colSpan="4" className="text-center py-14">

                    <div className="flex items-center justify-center gap-3 text-slate-500 font-semibold">

                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                      Syncing attendance logs...

                    </div>

                  </td>

                </tr>

              ) : filteredStudents.length > 0 ? (

                filteredStudents.map((student) => (

                  <tr
                    key={student._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-4">

                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">

                          {student?.name?.charAt(0) || "S"}

                        </div>

                        <div>

                          <p className="font-semibold text-slate-900 dark:text-white">
                            {student?.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {student?.email}
                          </p>

                        </div>

                      </div>

                    </td>


                    <td className="px-6 py-4 text-xs">

                      {student?.branch} • Year {student?.year}

                    </td>


                    <td className="px-6 py-4 text-xs">

                      {formatDate(student?.createdAt)}

                    </td>


                    <td className="px-6 py-4">

                      <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                        Present
                      </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="4" className="text-center py-14 text-slate-500">
                    No attendance logs found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </Header>

  );
};

export default Home;