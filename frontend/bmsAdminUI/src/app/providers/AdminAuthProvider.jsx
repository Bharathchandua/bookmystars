import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredAdmin, logoutAdminUser } from "../../features/auth/services/adminAuthService";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
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

  const value = {
    adminUser,
    isAuthenticated: Boolean(adminUser),
    setAdminUser,
    logout: logoutAdminUser,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuthContext() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuthContext must be used within an AdminAuthProvider");
  }
  return context;
}
