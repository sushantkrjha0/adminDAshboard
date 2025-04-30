// src/components/Admin/AdminRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import CreditDashboard from './CreditDashboard/CreditDashboard';
import AdminHome from './AdminHome';
import AdminGuard from './AdminGuard';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="credit-requests" element={<CreditDashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;