import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import { getStoredAdmin } from "./features/bms/api/admin/adminApi";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminPageWrapper() {
  const [adminUser, setAdminUser] = useState(() => getStoredAdmin());

  useEffect(() => {
    const handleAuthChange = () => {
      setAdminUser(getStoredAdmin());
    };
    window.addEventListener("bms_admin_auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("bms_admin_auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={(user) => setAdminUser(user)} />;
  }

  return <AdminDashboard />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AdminPageWrapper />} />
        <Route path="/admin" element={<AdminPageWrapper />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
