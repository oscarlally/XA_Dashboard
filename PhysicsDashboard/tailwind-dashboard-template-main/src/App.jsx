import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './css/style.css';
import './charts/ChartjsConfig';

// Import pages
import Login from './pages/Login';
import Timings from './pages/Timings';
import Overview from './pages/Overview';
import Utilisation from './pages/Utilisation';
import ProtectedRoute from './pages/ProtectedRoute';
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/Overview" element={<ProtectedRoute element={<Overview />} />} />
        <Route path="/Timings" element={<ProtectedRoute element={<Timings />} />} />
        <Route path="/Utilisation" element={<ProtectedRoute element={<Utilisation />} />} />
        <Route path="*" element={<Navigate to="/dashboard" />} /> {/* Default redirect */}
      </Routes>
    </>
  );
}

export default App;



