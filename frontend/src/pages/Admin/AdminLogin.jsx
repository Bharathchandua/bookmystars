import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Film,
  DollarSign
} from "lucide-react";
import logo from "../../assets/logo.png";
import CountUpModule from "react-countup";
import Button from "../../components/common/Button";
import { loginAdminUser } from "../../features/bms/api/admin/adminApi";
import { showSuccess, showError } from "../../shared/utils/alert";

const CountUp = typeof CountUpModule === "function" ? CountUpModule : (CountUpModule.default || CountUpModule);

export default function AdminLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // When clicking browser Back on the login page, navigate to User Sign In ("/signin")
    const handlePopState = () => {
      navigate("/signin", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAdminUser(email, password);
      showSuccess("Welcome Back!", `${result.user?.name || "Administrator"} (${result.user?.roleName || "Super Admin"}) authenticated.`);
      window.dispatchEvent(new Event("bms_admin_auth_changed"));
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      } else {
        navigate("/admin");
      }
    } catch (err) {
      const rawMsg = err.message || "";
      setError(rawMsg || "Invalid credentials. Please verify your email and password.");
      showError("Authentication Failed", rawMsg || "Please check your admin credentials.");
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
            <span>Back to user view? <Link to="/signin">User Sign In</Link></span>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <span 
              style={{ 
                color: "#ee008f", 
                fontWeight: "700", 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "5px",
                background: "#fff1f8",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #fbcfe8",
                fontSize: "13px"
              }}
            >
              <ShieldCheck size={14} /> Administration Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Layout Container */}
      <div className="auth-split-wrapper">
        
        {/* LEFT PANEL */}
        <div className="auth-split-left signin-bg">
          
          {/* Top Content */}
          <div className="left-top-content">
            <h1 className="headline">
              Executive <span className="pink">Command</span><br />
              & Governance<br />
              starts here.
            </h1>
            
            <div className="mini-line"></div>

            <p className="sub-desc">
              Centralized oversight for casting approvals,<br />
              talent KYC verifications, escrow security,<br />
              and platform-wide RBAC controls.
            </p>
          </div>

          {/* Flexible middle spacer */}
          <div className="left-spacer" style={{ flexGrow: 1, minHeight: "580px" }}></div>

          {/* Bottom Content */}
          <div className="left-bottom-content">
            
            <div className="feature-list">
              
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Film size={14} />
                </div>
                <div className="feature-text">
                  <h4>Casting Moderation</h4>
                  <p>Screen and approve notices from<br />leading studios and production houses.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={14} />
                </div>
                <div className="feature-text">
                  <h4>Talent KYC & Identity</h4>
                  <p>Verify government identification<br />and award verified rosette badges.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <DollarSign size={14} />
                </div>
                <div className="feature-text">
                  <h4>Escrow Protection</h4>
                  <p>Oversee milestone payments and<br />safeguard transparent disbursements.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Lock size={14} />
                </div>
                <div className="feature-text">
                  <h4>RBAC Governance</h4>
                  <p>Control granular permissions across<br />all platform subsystems.</p>
                </div>
              </div>

            </div>

            {/* Trusted Admin Cluster section */}
            <div className="trusted-talents-section">
              <div className="trusted-text">Platform Guardian &bull; 99.98% System Uptime</div>
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
          <div className="right-form-container">
            
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/signin")}
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
              <ArrowLeft size={16} /> Back to User Sign In
            </button>

            {/* Admin Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#fff1f8",
              border: "1px solid #fbcfe8",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "800",
              color: "#ee008f",
              marginBottom: "8px"
            }}>
              <ShieldCheck size={14} /> ADMINISTRATIVE COMMAND PORTAL
            </div>

            <h2>Admin Sign In</h2>
            <p className="right-subtitle">Sign in with your corporate administrative credentials</p>

            {/* Error Message */}
            {error && (
              <div 
                className="alert alert-danger py-2 px-3 mb-3 w-100" 
                role="alert" 
                style={{ 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  color: "#d93025", 
                  backgroundColor: "#fde8e8", 
                  borderRadius: "8px", 
                  border: "1px solid #f8b4b4" 
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              
              {/* Email Address */}
              <div className="auth-field">
                <label htmlFor="admin-email">Corporate Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="admin-email"
                    className="auth-input"
                    placeholder="e.g. yourname@bookmystars.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field" style={{ marginBottom: "18px" }}>
                <label htmlFor="admin-password">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="admin-password"
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
              <div className="auth-options" style={{ marginBottom: "24px" }}>
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                  Role-Based Authorization
                </span>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="auth-btn" 
                disabled={loading} 
                style={{ padding: "15px", width: "100%", fontWeight: "800" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating Administrator...
                  </>
                ) : (
                  "Sign In to Console"
                )}
              </Button>
            </form>

            {/* Security Safe Banner */}
            <div className="privacy-banner" style={{ marginTop: "24px" }}>
              <ShieldCheck size={22} className="privacy-icon" />
              <div className="privacy-text">
                <h5>Authorized Personnel Only</h5>
                <p>All administrative sessions are encrypted and logged to the immutable audit trail.</p>
              </div>
            </div>

          </div>

          {/* Bottom Back Link */}
          <Link to="/" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b", fontWeight: "600", marginTop: "16px" }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

      </div>

    </div>
  );
}
