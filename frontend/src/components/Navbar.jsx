import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import Button from "./common/Button";
import { getStoredUser } from "../features/bms/api/auth/authApi";

export default function Navbar({ isClientPartnerPage = false }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const location = useLocation();
  const servicesDropdownRef = useRef(null);   // desktop services wrapper
  const mobileServicesRef = useRef(null);     // mobile services wrapper
  const navRef = useRef(null);               // entire nav element

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener("auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const links = isClientPartnerPage
    ? []
    : ["Home", "Services", "Media", "Become a Client", "Become a Partner"];

  const servicesList = [
    "Podcast",
    "Opportunities",
    "Media & Entertainment",
    "MakeOver",
    "Post Production",
    "Promotion",
    "Digital Marketing",
  ];

  // Click-outside: only mousedown — no touchstart or scroll listeners
  // (touchstart fires before click on mobile and breaks link navigation)
  useEffect(() => {
    function handleClickOutside(event) {
      const target = event.target;

      // Close desktop services dropdown when clicking outside BOTH
      // the desktop wrapper AND the mobile wrapper (so mobile tap doesn't
      // close it via the desktop ref check, then re-open it on click)
      const outsideDesktop =
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(target);
      const outsideMobile =
        !mobileServicesRef.current ||
        !mobileServicesRef.current.contains(target);

      if (outsideDesktop && outsideMobile) {
        setServicesDropdownOpen(false);
      }

      // Close mobile menu when tapping outside the entire nav
      if (navRef.current && !navRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close everything on route change (handles navigation via Link clicks)
  useEffect(() => {
    setMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  const closeAll = () => {
    setMenuOpen(false);
    setServicesDropdownOpen(false);
  };

  const isClientPage = location.pathname === "/become-client";
  const isPartnerPage = location.pathname === "/become-partner";

  const getSignInPath = () => {
    if (isClientPage) return "/client/signin";
    if (isPartnerPage) return "/partner/signin";
    return "/signin";
  };

  const handleJoinClick = (e) => {
    if (isClientPage) {
      if (e) e.preventDefault();
      closeAll();
      const el = document.getElementById("client-registration-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (isPartnerPage) {
      if (e) e.preventDefault();
      closeAll();
      const el = document.getElementById("partner-registration-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      closeAll();
    }
  };

  const getServiceId = (item) => {
    if (item === "Podcast") return "podcast";
    if (item === "Opportunities") return "opportunities";
    if (item === "Media & Entertainment") return "media-entertainment";
    if (item === "MakeOver") return "makeover";
    if (item === "Post Production") return "post-production";
    if (item === "Promotion") return "promotion";
    if (item === "Digital Marketing") return "digital-marketing";
    return "";
  };

  const handleServiceClick = (e, item) => {
    e.preventDefault();
    closeAll();

    const id = getServiceId(item);
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
    } else {
      const element = document.getElementById(id);
      if (element) {
        const navbarHeight = 95;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        window.history.pushState(null, null, `#${id}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    }
  };

  const handleHomeClick = (e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, null, "/");
    }
  };

  const handleMediaClick = (e) => {
    closeAll();
  };

  return (
    <nav className="navbar-wrap" ref={navRef}>
      <div className="container-fluid px-4 px-lg-5 nav-inner">
        <Link to="/" className="logo text-decoration-none">
          <img src={logo} alt="Book My Stars" className="navbar-logo" />
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="nav-links">
          {links.map((l) => {
            if (l === "Services") {
              return (
                <div
                  key={l}
                  className="nav-dropdown-wrapper"
                  ref={servicesDropdownRef}
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  <button
                    onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                    className="nav-dropdown-trigger"
                  >
                    <span className="nav-link-custom">{l}</span>
                    <ChevronDown
                      size={14}
                      className={`nav-dropdown-chevron ${servicesDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {servicesDropdownOpen && (
                    <div className="nav-dropdown-menu animate-fadeIn">
                      {servicesList.map((item) =>
                        item === "Podcast" || item === "Opportunities" || item === "Media & Entertainment" || item === "MakeOver" || item === "Post Production" || item === "Promotion" || item === "Digital Marketing" ? (
                          <Link
                            key={item}
                            to={
                              item === "Podcast" ? "/podcast"
                              : item === "Opportunities" ? "/services/opportunities"
                              : item === "Media & Entertainment" ? "/services/media-entertainment"
                              : item === "MakeOver" ? "/services/makeover"
                              : item === "Post Production" ? "/services/post-production"
                              : item === "Promotion" ? "/services/promotion"
                              : "/services/digital-marketing"
                            }
                            onClick={closeAll}
                            className="nav-dropdown-item"
                          >
                            {item}
                          </Link>
                        ) : (
                          <a
                            key={item}
                            href={`#${getServiceId(item)}`}
                            onClick={(e) => handleServiceClick(e, item)}
                            className="nav-dropdown-item"
                          >
                            {item}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            }
            if (l === "Media") {
              return (
                <Link
                  key={l}
                  to="/media"
                  onClick={handleMediaClick}
                  className="nav-link-custom"
                >
                  {l}
                </Link>
              );
            }
            if (l === "Become a Client") {
              return (
                <Link key={l} to="/become-client" className="nav-btn-custom">
                  {l}
                </Link>
              );
            }
            if (l === "Become a Partner") {
              return (
                <Link key={l} to="/become-partner" className="nav-btn-custom">
                  {l}
                </Link>
              );
            }
            return (
              <Link
                key={l}
                to={l === "Home" ? "/" : "#"}
                onClick={l === "Home" ? handleHomeClick : undefined}
                className="nav-link-custom"
              >
                {l}
              </Link>
            );
          })}
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link to="/dashboard">
                <Button variant="signin" icon={<i className="bi bi-grid-fill"></i>} iconPosition="left">
                  Dashboard
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="join" icon={<i className="bi bi-person-circle"></i>} iconPosition="left">
                  {currentUser.fullName ? currentUser.fullName.split(" ")[0] : "Profile"}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link to={getSignInPath()}>
                <Button variant="signin" icon={<i className="bi bi-person"></i>} iconPosition="left">
                  Sign In
                </Button>
              </Link>

              {isClientPage || isPartnerPage ? (
                <Button variant="join" onClick={handleJoinClick}>
                  Join Free
                </Button>
              ) : (
                <Link to="/join">
                  <Button variant="join">Join Free</Button>
                </Link>
              )}
            </>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map((l) => {
            if (l === "Services") {
              return (
                <div key={l} className="mobile-dropdown-wrapper" ref={mobileServicesRef}>
                  <button
                    onClick={() => setServicesDropdownOpen((prev) => !prev)}
                    className="mobile-dropdown-trigger"
                  >
                    {l}{" "}
                    <ChevronDown
                      size={16}
                      className={`mobile-dropdown-chevron ${servicesDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {servicesDropdownOpen && (
                    <div className="mobile-dropdown-menu">
                      {servicesList.map((item) =>
                        item === "Podcast" || item === "Opportunities" || item === "Media & Entertainment" || item === "MakeOver" || item === "Post Production" || item === "Promotion" || item === "Digital Marketing" ? (
                          <Link
                            key={item}
                            to={
                              item === "Podcast" ? "/podcast"
                              : item === "Opportunities" ? "/services/opportunities"
                              : item === "Media & Entertainment" ? "/services/media-entertainment"
                              : item === "MakeOver" ? "/services/makeover"
                              : item === "Post Production" ? "/services/post-production"
                              : item === "Promotion" ? "/services/promotion"
                              : "/services/digital-marketing"
                            }
                            onClick={closeAll}
                            className="mobile-dropdown-item"
                          >
                            {item}
                          </Link>
                        ) : (
                          <a
                            key={item}
                            href={`#${getServiceId(item)}`}
                            onClick={(e) => handleServiceClick(e, item)}
                            className="mobile-dropdown-item"
                          >
                            {item}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            }
            if (l === "Media") {
              return (
                <Link
                  key={l}
                  to="/media"
                  onClick={handleMediaClick}
                >
                  {l}
                </Link>
              );
            }
            if (l === "Become a Client") {
              return (
                <Link
                  key={l}
                  to="/become-client"
                  className="nav-btn-custom mobile-btn-custom"
                  onClick={closeAll}
                >
                  {l}
                </Link>
              );
            }
            if (l === "Become a Partner") {
              return (
                <Link
                  key={l}
                  to="/become-partner"
                  className="nav-btn-custom mobile-btn-custom"
                  onClick={closeAll}
                >
                  {l}
                </Link>
              );
            }
            return (
              <Link
                key={l}
                to={l === "Home" ? "/" : "#"}
                onClick={l === "Home" ? handleHomeClick : () => setMenuOpen(false)}
              >
                {l}
              </Link>
            );
          })}

          {currentUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", marginTop: "12px" }}>
              <Link to="/dashboard" onClick={closeAll}>
                <Button variant="signin" className="mobile-btn" icon={<i className="bi bi-grid-fill"></i>} iconPosition="left">
                  My Dashboard
                </Button>
              </Link>
              <Link to="/profile" onClick={closeAll}>
                <Button variant="join" className="mobile-btn" icon={<i className="bi bi-person-circle"></i>} iconPosition="left">
                  My Profile & Portfolio
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link to={getSignInPath()} onClick={closeAll}>
                <Button
                  variant="signin"
                  className="mobile-btn"
                  icon={<i className="bi bi-person"></i>}
                  iconPosition="left"
                >
                  Sign In
                </Button>
              </Link>

              {isClientPage || isPartnerPage ? (
                <Button variant="join" className="mobile-btn" onClick={handleJoinClick}>
                  Join Free
                </Button>
              ) : (
                <Link to="/join" onClick={closeAll}>
                  <Button variant="join" className="mobile-btn">
                    Join Free
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}