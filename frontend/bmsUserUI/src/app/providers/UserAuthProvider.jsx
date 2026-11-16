import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredUser, logoutUser } from "../../features/bms/api/auth/authApi";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("bms_auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("bms_auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.dispatchEvent(new Event("bms_auth_changed"));
  };

  const isTalent = user && (user.accountType === "TALENT" || user.accountType === "PROFESSIONAL");

  return (
    <UserAuthContext.Provider
      value={{
        user,
        setUser,
        isTalent,
        loading,
        logout: handleLogout,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
}

export default UserAuthProvider;
