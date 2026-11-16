import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { USER_PORTAL_URL } from "../../services/apiConfig";
import { getStoredUser, logoutUser } from "../../features/bms/api/auth/authApi";
import Button from "../ui/Button";

export default function ClientNavbar() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener("bms_client_auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("bms_client_auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate("/signin");
  };

  const isClientLoggedIn = currentUser && currentUser.accountType === "CLIENT";

  return (
    <header className="navbar-custom" style={{
      position: "sticky",
      top: 0,
      zIndex: 1000,
      background: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #334155",
      padding: "14px 24px"
    }}>
      <div style={{
        maxWidth: "1340px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src={logo} alt="BookMyStars Client" style={{ height: "46px" }} />
          </Link>
          <span style={{
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "linear-gradient(135deg, #ec008c, #7c3aed)",
            color: "#fff",
            padding: "3px 8px",
            borderRadius: "6px"
          }}>
            Client Portal
          </span>
        </div>

        {/* Center Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }} className="d-none d-md-flex">
          <Link to="/" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Home
          </Link>
          <a href="#why-choose-us" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Why Choose Us
          </a>
          <a href="#client-registration-section" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Register Brand
          </a>
          <a
            href={USER_PORTAL_URL}
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            ← Main Portal
          </a>
        </nav>

        {/* Auth CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isClientLoggedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  <i className="bi bi-grid-fill"></i> Client Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </Button>
            </>
          ) : (
            <>
              {location.pathname !== "/signin" && (
                <Link to="/signin">
                  <Button variant="outline" size="sm">
                    Client Sign In
                  </Button>
                </Link>
              )}
              <a href="#client-registration-section">
                <Button variant="primary" size="sm">
                  Register Brand
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
