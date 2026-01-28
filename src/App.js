import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import CreditRequests from './components/Admin/CreditRequests';
import UserManagement from './components/Admin/UserManagement';
import UserActivity from './components/Admin/UserActivity';
import UserSignups from './components/Admin/UserSignups';
import Feedback from './components/Admin/Feedback';
import Referrals from './components/Admin/Referrals';
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
        <Route path="users/activity" element={<UserActivity />} />
        <Route path="users/signups" element={<UserSignups />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Default route */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
