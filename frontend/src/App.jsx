import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from './components/landingPage';
import Home from './components/homePage';
import Login from './components/loginPage';
import Register from './components/registerPage';
import Roles from "./components/roles";
import LogReport from './components/logReportPage';
import Report from './components/report';
import Attendence from './components/attendence';
import AdminLoginPage from './components/adminLoginPage';
import AdminRegisterPage from './components/adminRegisterPage';
import AdminDashboard from './components/adminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ParentTestPage from './components/parentTestPage';
import ZonoAdminLoginPage from './components/zonoAdminLoginPage';
import ZonoAdminDashboard from './components/zonoAdminDashboard';
import { ZONO_ADMIN_DASHBOARD_PATH, ZONO_ADMIN_LOGIN_PATH } from './constants/zonoAdminPaths';

const App = () => {

  // ✅ Force DaisyUI theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "bumblebee");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<ProtectedRoute allowedRoles={['staff']}><Home /></ProtectedRoute>} />
        <Route path="/parentTest" element={<ProtectedRoute allowedRoles={['parent']}><ParentTestPage /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/adminLogin" element={<AdminLoginPage />} />
        <Route path="/adminRegister" element={<AdminRegisterPage />} />
        <Route path="/adminDashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/adminDashboard/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/adminDashboard/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path={ZONO_ADMIN_LOGIN_PATH} element={<ZonoAdminLoginPage />} />
        <Route path={ZONO_ADMIN_DASHBOARD_PATH} element={<ProtectedRoute allowedRoles={['zono_admin']}><ZonoAdminDashboard /></ProtectedRoute>} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/logReport" element={<ProtectedRoute allowedRoles={['staff']}><LogReport /></ProtectedRoute>} />
        <Route path="/report/:studentId" element={<ProtectedRoute allowedRoles={['staff']}><Report /></ProtectedRoute>} />
        <Route path="/attendence" element={<ProtectedRoute allowedRoles={['staff']}><Attendence /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
