// src/components/Admin/AdminRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import CreditRequests from './CreditRequests';
import Dashboard from './Dashboard';
import AdminGuard from './AdminGuard';
import Feedback from './Feedback';
import Referrals from './Referrals';
import Listing from './Listing';
import DealTags from './DealTags';
import ListingScore from './ListingScore';
import GeneratedListing from './GeneratedListing';

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
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="credit-requests" element={<CreditRequests />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="listing" element={<Listing />} />
        <Route path="listing/deal-tags" element={<DealTags />} />
        <Route path="listing/listing-score" element={<ListingScore />} />
        <Route path="listing/generated-listing" element={<GeneratedListing />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;