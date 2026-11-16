import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { usePartnerAuth } from "./providers/PartnerAuthProvider";
import { getStoredUser } from "../features/bms/api/auth/authApi";

// Original Partner Components from bmsUserUI
import BecomePartner from "../components/ClientPartner/BecomePartner/BecomePartner.jsx";
import PartnerSignIn from "../pages/Partner/PartnerSignIn.jsx";
import PartnerDashboard from "../pages/Partner/PartnerDashboard.jsx";
import PartnerRegisterPage from "../pages/Auth/PartnerRegisterPage.jsx";

function PartnerRoot() {
  const { user } = usePartnerAuth();
  const currentUser = user || getStoredUser();
  if (currentUser && (currentUser.accountType || "").toUpperCase() === "PARTNER") {
    return <Navigate to="/dashboard" replace />;
  }
  return <BecomePartner />;
}

function ProtectedPartnerRoute({ children }) {
  const { user } = usePartnerAuth();
  const currentUser = user || getStoredUser();
  if (!currentUser) {
    return <Navigate to="/partner/signin" replace />;
  }
  if ((currentUser.accountType || "").toUpperCase() !== "PARTNER") {
    return <Navigate to="/partner/signin" replace />;
  }
  return children;
}

export default function PartnerRouter() {
  return (
    <Routes>
      {/* Root path displays dedicated Become Partner onboarding */}
      <Route path="/" element={<PartnerRoot />} />

      {/* Partner Academy Registration Structure (Select Academy Category + Org Details Form) */}
      <Route path="/join" element={<PartnerRegisterPage />} />
      <Route path="/signup" element={<PartnerRegisterPage />} />
      <Route path="/register" element={<PartnerRegisterPage />} />
      <Route path="/partner/signup" element={<PartnerRegisterPage />} />
      <Route path="/partner/register" element={<PartnerRegisterPage />} />
      <Route path="/partner/join" element={<PartnerRegisterPage />} />
      <Route path="/client-partner/join" element={<PartnerRegisterPage />} />

      {/* Become Partner Landing Page (includes the Academy Registration Form) */}
      <Route path="/become-partner" element={<BecomePartner />} />
      <Route path="/partner" element={<BecomePartner />} />

      {/* Partner Sign In */}
      <Route path="/signin" element={<PartnerSignIn />} />
      <Route path="/login" element={<PartnerSignIn />} />
      <Route path="/partner/signin" element={<PartnerSignIn />} />
      <Route path="/partner/login" element={<PartnerSignIn />} />
      <Route path="/client-partner/signin" element={<PartnerSignIn />} />

      {/* Partner Dashboard with all 6 tabs */}
      <Route
        path="/dashboard"
        element={
          <ProtectedPartnerRoute>
            <PartnerDashboard />
          </ProtectedPartnerRoute>
        }
      />
      <Route
        path="/partner/dashboard"
        element={
          <ProtectedPartnerRoute>
            <PartnerDashboard />
          </ProtectedPartnerRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
