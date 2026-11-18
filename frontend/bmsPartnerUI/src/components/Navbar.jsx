import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
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

  const handleJoinClick = (e) => {
    if (e) e.preventDefault();
    closeAll();
    const el = document.getElementById("partner-registration-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/partner/join");
    }
  };

  return (
    <nav className="navbar-wrap" ref={navRef}>
      <div className="container-fluid px-4 px-lg-5 nav-inner">
        {/* Top-Left BookMyStars Logo strictly returns to BMS User Homepage */}
        <a href={USER_PORTAL_URL || "/"} className="logo text-decoration-none" onClick={closeAll} title="Go to BookMyStars Homepage">
          <img src={logo} alt="Book My Stars" className="navbar-logo" />
        </a>

        {/* Desktop Actions: Sign In + Join Free matching exact page design */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link to="/partner/signin">
                <Button variant="signin" icon={<i className="bi bi-person"></i>} iconPosition="left">
                  Sign In
                </Button>
              </Link>
              <Button variant="join" onClick={handleJoinClick}>
                Join Free
              </Button>
            </div>
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
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
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
                    Sign In
                  </Button>
                </Link>
                <Button variant="join" className="w-100" onClick={handleJoinClick}>
                  Join Free
                </Button>
              </>
            )}
            {USER_PORTAL_URL && (
              <a
                href={USER_PORTAL_URL}
                className="d-block py-2 text-dark font-weight-bold text-decoration-none text-center"
              >
                &larr; Return to Talent Platform
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
