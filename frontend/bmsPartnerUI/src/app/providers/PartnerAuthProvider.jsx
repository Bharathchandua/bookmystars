import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredUser, logoutUser } from "../../features/bms/api/auth/authApi";

const PartnerAuthContext = createContext(null);

export function PartnerAuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("bms_partner_auth_changed", handleAuthChange);
    window.addEventListener("auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("bms_partner_auth_changed", handleAuthChange);
      window.removeEventListener("auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.dispatchEvent(new Event("bms_partner_auth_changed"));
  };

  const isPartner = user && user.accountType === "PARTNER";

  return (
    <PartnerAuthContext.Provider
      value={{
        user,
        setUser,
        isPartner,
        loading,
        logout: handleLogout,
      }}
    >
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error("usePartnerAuth must be used within a PartnerAuthProvider");
  }
  return context;
}

export default PartnerAuthProvider;
