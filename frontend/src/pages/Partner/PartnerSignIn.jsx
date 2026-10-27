import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Film,
  Music,
  Camera,
  Clock,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import logo from "../../assets/logo.png";
import CountUpModule from "react-countup";
import { loginUser } from "../../features/bms/api/auth/authApi";
const CountUp = typeof CountUpModule === "function" ? CountUpModule : (CountUpModule.default || CountUpModule);

export default function PartnerSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePopState = () => {
      navigate("/become-partner", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
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
      const rawMsg = err.message || "";
      if (rawMsg.toLowerCase().includes("internal server error") || !rawMsg) {
        setError("Invalid academy email or password. Please verify your credentials.");
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
            <span>New Academy Partner? <Link to="/become-partner#partner-registration-section" style={{ color: "#ec008c", fontWeight: "800" }}>Register Partner</Link></span>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <Link 
              to="/become-partner" 
              style={{ 
                color: "#7c3aed", 
                fontWeight: "700", 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "5px",
                textDecoration: "none",
                background: "#fdf4ff",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #f5d0fe",
                fontSize: "13px"
              }}
              title="Return to Become a Partner Page"
            >
              Partner Hub &rarr;
            </Link>
          </div>
        </div>
      </header>

      <div className="auth-split-wrapper" style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 68px)" }}>
        {/* LEFT PANEL - Academy & Studio Partner Showcase */}
        <div 
          className="auth-split-left" 
          style={{ 
            flex: "0 0 34%",
            maxWidth: "34%",
            background: "linear-gradient(160deg, #1e0538 0%, #3b0764 40%, #701a75 75%, #4a044e 100%)",
            color: "#ffffff",
            padding: "36px 32px 24px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box"
          }}
        >
          {/* Top Headline Content */}
          <div className="left-top-content">
            <div 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "6px", 
                backgroundColor: "rgba(255, 255, 255, 0.12)", 
                border: "1px solid rgba(255, 255, 255, 0.2)", 
                padding: "4px 12px", 
                borderRadius: "50px", 
                fontSize: "11px", 
                fontWeight: "800", 
                textTransform: "uppercase", 
                letterSpacing: "0.8px", 
                marginBottom: "14px",
                color: "#fce7f3"
              }}
            >
              <Sparkles size={12} /> Partner Academy Portal
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#ffffff", lineHeight: "1.2", margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
              Academy Growth &<br />
              <span style={{ color: "#f472b6" }}>Talent Collaboration</span><br />
              Workspace.
            </h1>
            
            <div style={{ width: "42px", height: "3px", backgroundColor: "#f472b6", borderRadius: "2px", margin: "12px 0" }}></div>

            <p style={{ fontSize: "13px", color: "#fbcfe8", lineHeight: "1.5", margin: 0, maxWidth: "320px" }}>
              Log in to post casting calls, promote training batches via targeted ad campaigns, and track audition submissions.
            </p>
          </div>

          {/* Flexible Middle Spacer */}
          <div style={{ flexGrow: 1, minHeight: "20px" }}></div>

          {/* Bottom Features List */}
          <div className="left-bottom-content" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)"
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(244, 114, 182, 0.2)", color: "#f472b6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Official Academy Listing</h4>
                <p style={{ fontSize: "11.5px", color: "#fbcfe8", margin: "2px 0 0 0" }}>Verified partner badge and priority studio listing.</p>
              </div>
            </div>

            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)"
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(244, 114, 182, 0.2)", color: "#f472b6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Film size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Batch Ad Campaigns</h4>
                <p style={{ fontSize: "11.5px", color: "#fbcfe8", margin: "2px 0 0 0" }}>Run digital ads to recruit for student batches.</p>
              </div>
            </div>

            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)"
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(244, 114, 182, 0.2)", color: "#f472b6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Music size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Direct Talent Matching</h4>
                <p style={{ fontSize: "11.5px", color: "#fbcfe8", margin: "2px 0 0 0" }}>Connect with dancers, actors, and creators.</p>
              </div>
            </div>

            {/* Trusted Partner Academies Footer */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "12px", marginTop: "4px" }}>
              <div style={{ fontSize: "11.5px", color: "#fbcfe8", fontWeight: "600", marginBottom: "8px" }}>
                Trusted by 2,000+ academies & creative institutes
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {avatars.slice(0, 5).map((url, i) => (
                  <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #1e0538", marginLeft: i > 0 ? "-8px" : 0, overflow: "hidden" }}>
                    <img src={url} alt="academy partner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ec008c", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900", marginLeft: "-8px", border: "2px solid #1e0538" }}>
                  2K+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Clean High-Trust Login Form */}
        <div 
          className="auth-split-right" 
          style={{ 
            flex: "0 0 66%",
            maxWidth: "66%",
            backgroundColor: "#ffffff",
            padding: "40px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box"
          }}
        >
          <div style={{ maxWidth: "460px", width: "100%" }}>
            
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/become-partner")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "20px",
                padding: 0
              }}
            >
              <ArrowLeft size={16} /> Back to Become a Partner
            </button>

            {/* Title & Subtitle */}
            <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0c0e2b", letterSpacing: "-0.5px", margin: "0 0 6px 0" }}>
              Partner Portal Sign In
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              Log in to your <strong>Partner Dashboard</strong> to post requirements, track batch ads, and review auditions.
            </p>

            {/* Alerts */}
            {error && (error.toLowerCase().includes("pending") || error.toLowerCase().includes("verification")) ? (
              <div 
                style={{ 
                  padding: "14px", 
                  backgroundColor: "#fffbeb", 
                  borderRadius: "12px", 
                  border: "1px solid #fde68a", 
                  color: "#92400e", 
                  marginBottom: "20px",
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "4px" 
                }}
              >
                <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                  <Clock size={16} style={{ color: "#d97706" }} />
                  Super Admin Review In Progress
                </div>
                <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.5" }}>
                  {error}
                </div>
              </div>
            ) : error && error.toLowerCase().includes("rejected") ? (
              <div 
                style={{ 
                  padding: "14px", 
                  backgroundColor: "#fef2f2", 
                  borderRadius: "12px", 
                  border: "1px solid #fecaca", 
                  color: "#991b1b", 
                  marginBottom: "20px",
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "4px" 
                }}
              >
                <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                  <AlertTriangle size={16} style={{ color: "#dc2626" }} />
                  Partner Application Declined
                </div>
                <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "1.5" }}>
                  {error}
                </div>
              </div>
            ) : error ? (
              <div style={{ padding: "12px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#b91c1c", fontSize: "13px", marginBottom: "20px" }}>
                {error}
              </div>
            ) : null}

            {/* FORM */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Academy Email Address */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                  Official Partner Email
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Mail size={18} style={{ position: "absolute", left: "14px", color: "#94a3b8", pointerEvents: "none" }} />
                  <input
                    type="email"
                    placeholder="e.g. director@danceacademy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      fontSize: "14px",
                      backgroundColor: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      color: "#0f172a",
                      fontWeight: "500",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s ease, background-color 0.2s ease"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ec008c";
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.backgroundColor = "#f8fafc";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: "12.5px", color: "#ec008c", fontWeight: "700", textDecoration: "none" }}>
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={18} style={{ position: "absolute", left: "14px", color: "#94a3b8", pointerEvents: "none" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 42px 12px 42px",
                      fontSize: "14px",
                      backgroundColor: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      color: "#0f172a",
                      fontWeight: "500",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s ease, background-color 0.2s ease"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ec008c";
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.backgroundColor = "#f8fafc";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px"
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "2px 0 6px 0" }}>
                <input
                  type="checkbox"
                  id="partner-remember-chk"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#ec008c", cursor: "pointer", margin: 0 }}
                />
                <label htmlFor="partner-remember-chk" style={{ fontSize: "13px", color: "#475569", cursor: "pointer", userSelect: "none" }}>
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ec008c 0%, #7c3aed 100%)",
                  color: "#ffffff",
                  fontSize: "14.5px",
                  fontWeight: "800",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(236, 0, 140, 0.3)",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.opacity = "1";
                }}
              >
                {loading ? "Authenticating Partner..." : "Sign In to Partner Dashboard →"}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "13.5px", color: "#64748b" }}>
              Need to register your academy or studio first?{" "}
              <button
                type="button"
                onClick={() => {
                  navigate("/become-partner");
                  setTimeout(() => {
                    const el = document.getElementById("partner-registration-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ec008c",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline"
                }}
              >
                Register Academy on Become a Partner
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
