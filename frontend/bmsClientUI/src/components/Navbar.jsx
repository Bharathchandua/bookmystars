import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Button from "./common/Button";
import { getStoredUser, logoutUser } from "../features/bms/api/auth/authApi";
import { USER_PORTAL_URL } from "../services/apiConfig";

export default function Navbar({ isClientPartnerPage = false }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener("auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("bms_client_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("bms_client_auth_changed", handleAuthChange);
    };
  }, []);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeAll = () => {
    setMenuOpen(false);
  };

  const isClientRole = (currentUser?.accountType || "").toUpperCase() === "CLIENT";

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    closeAll();
    window.dispatchEvent(new Event("auth_changed"));
    window.dispatchEvent(new Event("bms_client_auth_changed"));
    navigate("/client/signin");
  };

  const handleRegisterClick = (e) => {
    if (e) e.preventDefault();
    closeAll();
    if (location.pathname === "/" || location.pathname === "/become-client" || location.pathname === "/client") {
      const el = document.getElementById("client-registration-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate("/client/join");
  };

  const scrollToSection = (id) => {
    closeAll();
    if (location.pathname !== "/" && location.pathname !== "/become-client" && location.pathname !== "/client") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar-wrap" ref={navRef}>
      <div className="container-fluid px-4 px-lg-5 nav-inner">
        <Link to="/" className="logo text-decoration-none" onClick={closeAll}>
          <img src={logo} alt="Book My Stars Client Portal" className="navbar-logo" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          <button
            onClick={() => scrollToSection("client-services-section")}
            className="nav-link-custom bg-transparent border-0"
            style={{ cursor: "pointer" }}
          >
            Solutions
          </button>
          <button
            onClick={() => scrollToSection("client-provides-section")}
            className="nav-link-custom bg-transparent border-0"
            style={{ cursor: "pointer" }}
          >
            What We Provide
          </button>
          <button
            onClick={handleRegisterClick}
            className="nav-link-custom bg-transparent border-0"
            style={{ cursor: "pointer" }}
          >
            Post Requirements
          </button>
          {USER_PORTAL_URL && (
            <a
              href={USER_PORTAL_URL}
              className="nav-link-custom text-decoration-none"
              title="Switch to Main Talent Platform"
            >
              Talent Platform &rarr;
            </a>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="nav-actions">
          {isClientRole ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link to="/client/dashboard">
                <Button variant="signin" icon={<i className="bi bi-grid-fill"></i>} iconPosition="left">
                  Client Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                icon={<LogOut size={16} />}
                iconPosition="left"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/client/signin">
                <Button variant="signin" icon={<i className="bi bi-person"></i>} iconPosition="left">
                  Client Sign In
                </Button>
              </Link>
              <Button variant="join" onClick={handleRegisterClick}>
                Register Brand
              </Button>
            </>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <button
            onClick={() => scrollToSection("client-services-section")}
            className="text-left w-100 bg-transparent border-0 py-2 text-dark font-weight-bold"
          >
            Solutions
          </button>
          <button
            onClick={() => scrollToSection("client-provides-section")}
            className="text-left w-100 bg-transparent border-0 py-2 text-dark font-weight-bold"
          >
            What We Provide
          </button>
          <button
            onClick={handleRegisterClick}
            className="text-left w-100 bg-transparent border-0 py-2 text-dark font-weight-bold"
          >
            Post Requirements
          </button>
          {USER_PORTAL_URL && (
            <a
              href={USER_PORTAL_URL}
              className="d-block py-2 text-dark font-weight-bold"
            >
              Talent Platform &rarr;
            </a>
          )}

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {isClientRole ? (
              <>
                <Link to="/client/dashboard" onClick={closeAll}>
                  <Button variant="signin" className="w-100" icon={<i className="bi bi-grid-fill"></i>} iconPosition="left">
                    Client Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-100"
                  onClick={handleSignOut}
                  icon={<LogOut size={16} />}
                  iconPosition="left"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/client/signin" onClick={closeAll}>
                  <Button variant="signin" className="w-100" icon={<i className="bi bi-person"></i>} iconPosition="left">
                    Client Sign In
                  </Button>
                </Link>
                <Button variant="join" className="w-100" onClick={handleRegisterClick}>
                  Register Brand
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
