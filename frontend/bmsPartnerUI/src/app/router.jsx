import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { usePartnerAuth } from "./providers/PartnerAuthProvider";
import { getStoredUser } from "../features/bms/api/auth/authApi";

// Partner Components
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
  // Displays the Original Become Partner Landing & Onboarding Page
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
      {/* Root path displays the Original Become Partner Page */}
      <Route path="/" element={<PartnerRoot />} />
      <Route path="/become-partner" element={<PartnerRoot />} />
      <Route path="/partner" element={<PartnerRoot />} />

      {/* Standalone Registration Form */}
      <Route path="/join" element={<PartnerRegisterPage />} />
      <Route path="/signup" element={<PartnerRegisterPage />} />
      <Route path="/register" element={<PartnerRegisterPage />} />
      <Route path="/partner/signup" element={<PartnerRegisterPage />} />
      <Route path="/partner/register" element={<PartnerRegisterPage />} />
      <Route path="/partner/join" element={<PartnerRegisterPage />} />
      <Route path="/client-partner/join" element={<PartnerRegisterPage />} />

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
