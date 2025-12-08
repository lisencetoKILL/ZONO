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

const App = () => {

  // ✅ Force DaisyUI theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "bumblebee");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/logReport" element={<LogReport />} />
        <Route path="/report/:studentId" element={<Report />} />
        <Route path="/attendence" element={<Attendence />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
