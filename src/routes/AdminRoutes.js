// src/routes/AdminRoutes.js
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminProtectedRoute from './AdminProtectedRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route 
        path="/dashboard" 
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
