import { useState, useEffect } from "react";
import { getStoredAdmin, logoutAdminUser } from "../services/adminAuthService";

export default function useAdminAuth() {
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

  return {
    adminUser,
    isAuthenticated: Boolean(adminUser),
    logout: logoutAdminUser,
  };
}
