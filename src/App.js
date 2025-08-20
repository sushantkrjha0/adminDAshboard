import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import CreditRequests from './components/Admin/CreditRequests';
import UserManagement from './components/Admin/UserManagement';
import { setupAxiosInterceptors } from './utils/auth';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="credit-requests" element={<CreditRequests />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Default route */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
