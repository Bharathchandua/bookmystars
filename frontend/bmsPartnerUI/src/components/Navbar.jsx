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
    window.addEventListener("bms_partner_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("bms_partner_auth_changed", handleAuthChange);
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

  const isPartnerRole = (currentUser?.accountType || "").toUpperCase() === "PARTNER";

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    closeAll();
    window.dispatchEvent(new Event("auth_changed"));
    window.dispatchEvent(new Event("bms_partner_auth_changed"));
    navigate("/partner/signin");
  };

  const handleRegisterClick = (e) => {
    if (e) e.preventDefault();
    closeAll();
    if (location.pathname === "/" || location.pathname === "/become-partner" || location.pathname === "/partner") {
      const el = document.getElementById("partner-registration-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate("/partner/join");
  };

  const scrollToSection = (id) => {
    closeAll();
    if (location.pathname !== "/" && location.pathname !== "/become-partner" && location.pathname !== "/partner") {
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
        <a href={USER_PORTAL_URL || "/"} className="logo text-decoration-none" onClick={closeAll} title="Go to BookMyStars Homepage">
          <img src={logo} alt="Book My Stars" className="navbar-logo" />
        </a>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          <button
            onClick={() => scrollToSection("partner-categories-section")}
            className="nav-link-custom bg-transparent border-0"
            style={{ cursor: "pointer" }}
          >
            Academy Categories
          </button>
          <button
            onClick={() => scrollToSection("partner-provides-section")}
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
            Register Academy
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
          {isPartnerRole ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link to="/partner/dashboard">
                <Button variant="signin" icon={<i className="bi bi-grid-fill"></i>} iconPosition="left">
                  Partner Dashboard
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
              <Link to="/partner/signin">
                <Button variant="signin" icon={<i className="bi bi-person"></i>} iconPosition="left">
                  Partner Sign In
                </Button>
              </Link>
              <Button variant="join" onClick={handleRegisterClick}>
                Register Academy
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
            onClick={() => scrollToSection("partner-categories-section")}
            className="text-left w-100 bg-transparent border-0 py-2 text-dark font-weight-bold"
          >
            Academy Categories
          </button>
          <button
            onClick={() => scrollToSection("partner-provides-section")}
            className="text-left w-100 bg-transparent border-0 py-2 text-dark font-weight-bold"
          >
            What We Provide
          </button>
          <button
            onClick={handleRegisterClick}
            className="text-left w-100 bg-transparent border-0 py-2 text-dark font-weight-bold"
          >
            Register Academy
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
            {isPartnerRole ? (
              <>
                <Link to="/partner/dashboard" onClick={closeAll}>
                  <Button variant="signin" className="w-100" icon={<i className="bi bi-grid-fill"></i>} iconPosition="left">
                    Partner Dashboard
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
                <Link to="/partner/signin" onClick={closeAll}>
                  <Button variant="signin" className="w-100" icon={<i className="bi bi-person"></i>} iconPosition="left">
                    Partner Sign In
                  </Button>
                </Link>
                <Button variant="join" className="w-100" onClick={handleRegisterClick}>
                  Register Academy
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
