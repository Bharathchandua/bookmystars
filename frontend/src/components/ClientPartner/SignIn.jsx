import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Star,
  User,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Clock,
  AlertTriangle
} from "lucide-react";
import logo from "../../assets/logo.png";
import signinLeftBg from "../../assets/signin_left_bg.png";
import CountUpModule from "react-countup";
import Button from "../common/Button";
import { loginUser, getStoredUser } from "../../features/bms/api/auth/authApi";
import { loginAdminUser } from "../../features/bms/api/admin/adminApi";
const CountUp = typeof CountUpModule === "function" ? CountUpModule : (CountUpModule.default || CountUpModule);

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // When clicking browser Back on the login page, navigate to Home ("/")
    const handlePopState = () => {
      navigate("/", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. First attempt login as a standard platform user (Talent, Model, Producer, Partner)
      const authData = await loginUser(email, password);
      if (authData?.accountType === "PARTNER") {
        navigate("/partner/dashboard");
      } else if (authData?.accountType === "CLIENT") {
        navigate("/client/dashboard");
      } else if (authData?.accountType === "PROFESSIONAL") {
        navigate("/professional/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // 2. If standard login fails, automatically check if this is an Admin / Staff Officer
      try {
        const adminResult = await loginAdminUser(email, password);
        if (adminResult && adminResult.user) {
          navigate("/admin");
          return;
        }
      } catch (adminErr) {
        // Not an admin or password incorrect
      }

      const rawMsg = err.message || "";
      if (email.toLowerCase().includes("@bookmystars.com") || email.toLowerCase().includes("admin") || email.toLowerCase().includes("staff")) {
        setError("admin_hint");
      } else if (rawMsg.toLowerCase().includes("internal server error") || !rawMsg) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError(rawMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const avatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80"
  ];

  return (
    <div className="auth-page-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Global Top White Header Bar */}
      <header className="auth-header">
        <div className="container-fluid px-4 px-lg-5 nav-inner" style={{ width: "100%" }}>
          <Link to="/" className="logo text-decoration-none">
            <img src={logo} alt="Book My Stars" className="navbar-logo" />
          </Link>
          <div className="header-link" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span>Don't have an account? <Link to="/join">Sign Up</Link></span>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <Link 
              to="/admin/login" 
              style={{ 
                color: "#ee008f", 
                fontWeight: "700", 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "5px",
                textDecoration: "none",
                background: "#fff1f8",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #fbcfe8",
                fontSize: "13px"
              }}
              title="Access Super Admin & Operations Portal"
            >
              <ShieldCheck size={14} /> Admin Portal
            </Link>
          </div>
        </div>
      </header>

      <div className="auth-split-wrapper">
        {/* LEFT PANEL */}
        <div className="auth-split-left signin-bg">
          {/* Top Content */}
          <div className="left-top-content">
            <h1 className="headline">
              Your journey<br />
              in <span className="pink">entertainment</span><br />
              starts here.
            </h1>
            
            <div className="mini-line"></div>

            <p className="sub-desc">
              Connect with opportunities,<br />
              showcase your talent and<br />
              book your next big break.
            </p>
          </div>

          {/* Flexible middle spacer to expose the background stage/chair image */}
          <div className="left-spacer" style={{ flexGrow: 1, minHeight: "580px" }}></div>

          {/* Bottom Content (Features + Trust Section) */}
          <div className="left-bottom-content">
            {/* Core Feature List */}
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Star size={14} />
                </div>
                <div className="feature-text">
                  <h4>Find Opportunities</h4>
                  <p>Discover auditions, castings,<br />and exciting projects.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <User size={14} />
                </div>
                <div className="feature-text">
                  <h4>Build Your Profile</h4>
                  <p>Create your profile and highlight<br />your talent and experience.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Calendar size={14} />
                </div>
                <div className="feature-text">
                  <h4>Manage Bookings</h4>
                  <p>Keep track of your bookings,<br />schedules and updates.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <MessageSquare size={14} />
                </div>
                <div className="feature-text">
                  <h4>Stay Connected</h4>
                  <p>Connect with industry professionals<br />and grow your network.</p>
                </div>
              </div>
            </div>

            {/* Trusted talents row */}
            <div className="trusted-talents-section">
              <div className="trusted-text">Trusted by thousands of talents</div>
              <div className="avatar-group">
                {avatars.map((url, i) => (
                  <div className="avatar-circle" key={i}>
                    <img src={url} alt={`User face ${i + 1}`} />
                  </div>
                ))}
                <div className="avatar-circle avatar-more">
                  <CountUp start={0} end={10} duration={0.8} suffix="K+" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-split-right">
          {/* Main form container */}
          <div className="right-form-container">
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "16px",
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <h2>Welcome Back!</h2>
          <p className="right-subtitle">Login to continue to Book My Stars</p>

          {error === "admin_hint" ? (
            <div 
              className="alert py-2 px-3 mb-3 w-100" 
              role="alert" 
              style={{ 
                fontSize: "13px", 
                backgroundColor: "#fff1f8", 
                borderRadius: "8px", 
                border: "1px solid #fbcfe8",
                color: "#9d174d",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={15} style={{ color: "#ee008f" }} />
                Administrative Account Detected
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                This is the public talent portal. Please sign in to the{" "}
                <Link to="/admin/login" style={{ color: "#ee008f", fontWeight: "800", textDecoration: "underline" }}>
                  Admin Portal &rarr;
                </Link>
              </div>
            </div>
          ) : error && (error.toLowerCase().includes("pending") || error.toLowerCase().includes("verification")) ? (
            <div 
              className="alert py-3 px-3 mb-3 w-100" 
              role="alert" 
              style={{ 
                fontSize: "13px", 
                backgroundColor: "#fffbeb", 
                borderRadius: "10px", 
                border: "1px solid #fde68a",
                color: "#92400e",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={16} style={{ color: "#d97706" }} />
                Partner Verification Pending
              </div>
              <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.5" }}>
                {error}
              </div>
            </div>
          ) : error && error.toLowerCase().includes("rejected") ? (
            <div 
              className="alert py-3 px-3 mb-3 w-100" 
              role="alert" 
              style={{ 
                fontSize: "13px", 
                backgroundColor: "#fef2f2", 
                borderRadius: "10px", 
                border: "1px solid #fecaca",
                color: "#991b1b",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={16} style={{ color: "#dc2626" }} />
                Partner Application Status
              </div>
              <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "1.5" }}>
                {error}
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger py-2 px-3 mb-3 w-100" role="alert" style={{ fontSize: "13px", fontWeight: "600", color: "#d93025", backgroundColor: "#fde8e8", borderRadius: "8px", border: "1px solid #f8b4b4" }}>
              {error}
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field" style={{ marginBottom: "18px" }}>
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="auth-options" style={{ marginBottom: "32px" }}>
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#forgot" className="auth-forgot" style={{ fontSize: "14px", fontWeight: "700" }}>
                Forgot Password?
              </a>
            </div>

            {/* Login button */}
            <Button type="submit" variant="auth-btn" disabled={loading} style={{ padding: "15px" }}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="right-divider">OR</div>

          {/* Social Logins */}
          <div className="social-btn-container">
            <Button type="button" variant="social-login-btn" onClick={() => navigate("/")}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.482 6.564l3.784 3.201z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.275c0-.825-.075-1.62-.213-2.385H12v4.51h6.46a5.523 5.523 0 0 1-2.4 3.627l3.722 2.883c2.176-2.007 3.708-4.957 3.708-8.635z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.266 14.235A7.05 7.05 0 0 1 4.909 12c0-.785.137-1.54.357-2.235L1.482 6.564A11.934 11.934 0 0 0 0 12c0 1.92.455 3.73 1.258 5.345l4.008-3.11z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.955-1.075 7.94-2.915l-3.722-2.883c-1.03.69-2.35 1.107-4.218 1.107-3.255 0-6.014-2.196-7.002-5.155l-4.008 3.11A11.933 11.933 0 0 0 12 24z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button type="button" variant="social-login-btn" onClick={() => navigate("/")}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </Button>
          </div>

          {/* Privacy Safe Banner */}
          <div className="privacy-banner">
            <ShieldCheck size={22} className="privacy-icon" />
            <div className="privacy-text">
              <h5>Your data is safe with us</h5>
              <p>We never post without your permission. Your privacy is our priority.</p>
            </div>
          </div>

          {/* Dedicated Administrator Portal Access Card */}
          <div style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "#f8fafc",
            border: "1.5px dashed #cbd5e1",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            transition: "all 0.2s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "left" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#fdf2f8",
                color: "#ee008f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                  System Administrator?
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  Enter credentials in the Super Admin Portal
                </div>
              </div>
            </div>
            <Link
              to="/admin/login"
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#ffffff",
                background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(238, 0, 143, 0.25)",
                whiteSpace: "nowrap"
              }}
            >
              Admin Login &rarr;
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <Link to="/" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
    </div>
  );
}