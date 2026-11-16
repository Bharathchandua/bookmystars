import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredUser, logoutUser } from "../../features/bms/api/auth/authApi";

const ClientAuthContext = createContext(null);

export function ClientAuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("bms_client_auth_changed", handleAuthChange);
    window.addEventListener("auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("bms_client_auth_changed", handleAuthChange);
      window.removeEventListener("auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.dispatchEvent(new Event("bms_client_auth_changed"));
  };

  const isClient = user && user.accountType === "CLIENT";

  return (
    <ClientAuthContext.Provider
      value={{
        user,
        setUser,
        isClient,
        loading,
        logout: handleLogout,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }
  return context;
}

export default ClientAuthProvider;
