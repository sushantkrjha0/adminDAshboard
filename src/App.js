import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import { setupAxiosInterceptors } from './utils/auth';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
