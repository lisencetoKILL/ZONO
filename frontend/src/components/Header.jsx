import React, { useEffect, useState } from 'react';
import { FaTachometerAlt, FaChartBar } from 'react-icons/fa'; // Icons
import { IoIosNotifications } from 'react-icons/io';
import { Link, useLocation } from 'react-router-dom';
import logo from '../components/logo.png';

const Header = ({ children }) => {
    const location = useLocation(); // Get the current route
    const [active, setActive] = useState('Dashboard'); // Handle active menu items

    // Dynamically set active state based on the current route
    useEffect(() => {
        const routeToStateMap = {
            '/home': 'Dashboard',
            // '/': 'Dashboard',
            '/logReport': 'Analytics',
            '/attendence': 'Attendance',
        };

        setActive(routeToStateMap[location.pathname] || ''); // Default to empty if no match
    }, [location]);

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="drawer lg:drawer-open">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-side flex-shrink-0 w-80 lg:w-80">
                    <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                    <ul className="menu p-4 space-y-4 bg-base-200 h-full" style={{ width: "230px" }}>
                        {/* Logo */}
                        <li className="mb-6 flex items-center justify-center flex-col">
                            <img
                                src={logo}
                                alt="Logo"
                                className="w-20 h-20 mb-2"
                            />
                        </li>

                        {/* Dashboard Link */}
                        <li>
                            <Link
                                to="/home"
                                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-[#22c55e] hover:text-white transition-all ${active === 'Dashboard' ? 'text-white bg-[#22c55e]' : ''
                                    }`}
                            >
                                <FaTachometerAlt />
                                Dashboard
                            </Link>
                        </li>

                        {/* Report Log Link */}
                        <li>
                            <Link
                                to="/logReport"
                                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-[#22c55e] hover:text-white transition-all ${active === 'Analytics' ? 'text-white bg-[#22c55e]' : ''
                                    }`}
                            >
                                <FaChartBar />
                                Report Log
                            </Link>
                        </li>

                        {/* Take Attendance Link */}
                        <li>
                            <Link
                                to="/attendence"
                                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-[#22c55e] hover:text-white transition-all ${active === 'Attendance' ? 'text-white bg-[#22c55e]' : ''
                                    }`}
                            >
                                <FaChartBar />
                                Take Attendance
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="drawer-content flex flex-col flex-grow">
                    {/* Hero Section */}
                    <div className="w-full">
                        <div className="hero bg-[#1E40AF] text-white rounded-b-xl">
                            <div className="hero-content w-full flex justify-between items-center">
                                <div className="max-w-md">
                                    <h1 className="text-2xl">Welcome Faculty</h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <IoIosNotifications size={24} />
                                    <a className="link link-primary">Logout</a>
                                    <div className="avatar">
                                        <div className="w-16 rounded-full">
                                            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="Avatar" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="w-full p-6">
                        {children} {/* Render the content passed to Header */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
