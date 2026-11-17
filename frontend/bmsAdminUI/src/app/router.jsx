import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminDashboard from "../pages/Admin/AdminDashboard.jsx";
import AdminLogin from "../pages/Admin/AdminLogin.jsx";
import PublicProfile from "../pages/Profile/PublicProfile.jsx";
import { useAdminAuthContext } from "./providers/AdminAuthProvider.jsx";

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminPageWrapper() {
  const { adminUser, setAdminUser } = useAdminAuthContext();

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={(user) => setAdminUser(user)} />;
  }

  return <AdminDashboard />;
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AdminPageWrapper />} />
        <Route path="/admin" element={<AdminPageWrapper />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Navigate to="/" replace />} />
        {/* Public profile routes accessible directly without requiring admin login */}
        <Route path="/public-profile/:userId" element={<PublicProfile />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
