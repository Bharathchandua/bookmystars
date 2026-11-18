import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useClientAuth } from "./providers/ClientAuthProvider";
import { getStoredUser } from "../features/bms/api/auth/authApi";

// Client Components
import BecomeClient from "../components/ClientPartner/BecomeClient/BecomeClient.jsx";
import ClientSignIn from "../pages/Client/ClientSignIn.jsx";
import ClientDashboard from "../pages/Client/ClientDashboard.jsx";
import ClientRegisterPage from "../pages/Auth/ClientRegisterPage.jsx";

function ClientRoot() {
  const { user } = useClientAuth();
  const currentUser = user || getStoredUser();
  if (currentUser && (currentUser.accountType || "").toUpperCase() === "CLIENT") {
    return <Navigate to="/dashboard" replace />;
  }
  // Directly render the Branding / Requirements Become Client Page (Photo 2)
  return <BecomeClient />;
}

function ProtectedClientRoute({ children }) {
  const { user } = useClientAuth();
  const currentUser = user || getStoredUser();
  if (!currentUser) {
    return <Navigate to="/client/signin" replace />;
  }
  if ((currentUser.accountType || "").toUpperCase() !== "CLIENT") {
    return <Navigate to="/client/signin" replace />;
  }
  return children;
}

export default function ClientRouter() {
  return (
    <Routes>
      {/* Root path displays the Brand Registration Page directly (no landing home page) */}
      <Route path="/" element={<ClientRoot />} />
      <Route path="/become-client" element={<ClientRoot />} />
      <Route path="/client" element={<ClientRoot />} />

      {/* Brand Registration */}
      <Route path="/join" element={<ClientRegisterPage />} />
      <Route path="/signup" element={<ClientRegisterPage />} />
      <Route path="/register" element={<ClientRegisterPage />} />
      <Route path="/client/signup" element={<ClientRegisterPage />} />
      <Route path="/client/register" element={<ClientRegisterPage />} />
      <Route path="/client/join" element={<ClientRegisterPage />} />
      <Route path="/client-partner/join" element={<ClientRegisterPage />} />

      {/* Client Sign In */}
      <Route path="/signin" element={<ClientSignIn />} />
      <Route path="/login" element={<ClientSignIn />} />
      <Route path="/client/signin" element={<ClientSignIn />} />
      <Route path="/client/login" element={<ClientSignIn />} />
      <Route path="/client-partner/signin" element={<ClientSignIn />} />

      {/* Client Dashboard with all 6 tabs */}
      <Route
        path="/dashboard"
        element={
          <ProtectedClientRoute>
            <ClientDashboard />
          </ProtectedClientRoute>
        }
      />
      <Route
        path="/client/dashboard"
        element={
          <ProtectedClientRoute>
            <ClientDashboard />
          </ProtectedClientRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
