import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Gem,
  Wrench,
  Megaphone,
  Clapperboard,
  Sparkles
} from "lucide-react";
import logo from "../../assets/logo.png";
import CountUpModule from "react-countup";
import { loginUser } from "../../features/bms/api/auth/authApi";
const CountUp = typeof CountUpModule === "function" ? CountUpModule : (CountUpModule.default || CountUpModule);

export default function ClientSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePopState = () => {
      navigate("/become-client", { replace: true });
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
      if (authData?.accountType === "CLIENT") {
        navigate("/client/dashboard");
      } else if (authData?.accountType === "PARTNER") {
        navigate("/partner/dashboard");
      } else if (authData?.accountType === "PROFESSIONAL") {
        navigate("/professional/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const rawMsg = err.message || "";
      if (rawMsg.toLowerCase().includes("internal server error") || !rawMsg) {
        setError("Invalid corporate email or password. Please verify your credentials.");
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
            <span>New Brand Client? <Link to="/become-client#client-registration-section" style={{ color: "#ec008c", fontWeight: "800" }}>Register Brand</Link></span>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <Link 
              to="/become-client" 
              style={{ 
                color: "#ec008c", 
                fontWeight: "700", 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "5px",
                textDecoration: "none",
                background: "#fdf2f8",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #fbcfe8",
                fontSize: "13px"
              }}
              title="Return to Become a Client Page"
            >
              Client Hub &rarr;
            </Link>
          </div>
        </div>
      </header>

      <div className="auth-split-wrapper" style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 68px)" }}>
        {/* LEFT PANEL - Commercial Brands Showcase */}
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
              <Sparkles size={12} /> Commercial Client Portal
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#ffffff", lineHeight: "1.2", margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
              Commercial Ads &<br />
              <span style={{ color: "#f472b6" }}>Artist Sourcing</span><br />
              Workspace.
            </h1>
            
            <div style={{ width: "42px", height: "3px", backgroundColor: "#f472b6", borderRadius: "2px", margin: "12px 0" }}></div>

            <p style={{ fontSize: "13px", color: "#fbcfe8", lineHeight: "1.5", margin: 0, maxWidth: "320px" }}>
              Hire top models & actors for jewelry, fashion, and hardware promos, commission 4K brand commercials, and track releases.
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
                <Gem size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Jewelry & Luxury Campaigns</h4>
                <p style={{ fontSize: "11.5px", color: "#fbcfe8", margin: "2px 0 0 0" }}>Book bridal & editorial models for catalog shoots.</p>
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
                <Wrench size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Hardware & Product Promos</h4>
                <p style={{ fontSize: "11.5px", color: "#fbcfe8", margin: "2px 0 0 0" }}>Cast presenters for tool & machinery demonstrations.</p>
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
                <Clapperboard size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>End-to-End Ad Filming</h4>
                <p style={{ fontSize: "11.5px", color: "#fbcfe8", margin: "2px 0 0 0" }}>4K camera gear, lighting, color grading & VFX.</p>
              </div>
            </div>

            {/* Trusted Brand Clients Footer */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "12px", marginTop: "4px" }}>
              <div style={{ fontSize: "11.5px", color: "#fbcfe8", fontWeight: "600", marginBottom: "8px" }}>
                Trusted by 5,000+ brands & advertisers
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {avatars.slice(0, 5).map((url, i) => (
                  <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #1e0538", marginLeft: i > 0 ? "-8px" : 0, overflow: "hidden" }}>
                    <img src={url} alt="client" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ec008c", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900", marginLeft: "-8px", border: "2px solid #1e0538" }}>
                  5K+
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
              onClick={() => navigate("/become-client")}
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
              <ArrowLeft size={16} /> Back to Become a Client
            </button>

            {/* Title & Subtitle */}
            <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0c0e2b", letterSpacing: "-0.5px", margin: "0 0 6px 0" }}>
              Client Brand Sign In
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              Log in to your <strong>Client Workspace</strong> to post commercial briefs, hire talent, and review auditions.
            </p>

            {/* Alerts */}
            {error && (error.toLowerCase().includes("pending") || error.toLowerCase().includes("verification")) ? (
              <div 
                style={{ 
                  padding: "14px", 
                  backgroundColor: "#fdf4ff", 
                  borderRadius: "12px", 
                  border: "1px solid #f5d0fe", 
                  color: "#701a75", 
                  marginBottom: "20px",
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "4px" 
                }}
              >
                <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                  <Clock size={16} style={{ color: "#ec008c" }} />
                  Super Admin Review In Progress
                </div>
                <div style={{ fontSize: "12px", color: "#86198f", lineHeight: "1.5" }}>
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
                  Brand Application Declined
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
              {/* Corporate Email Address */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                  Official Corporate Email
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Mail size={18} style={{ position: "absolute", left: "14px", color: "#94a3b8", pointerEvents: "none" }} />
                  <input
                    type="email"
                    placeholder="e.g. brand@yourcompany.com"
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
                  id="client-remember-chk"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#ec008c", cursor: "pointer", margin: 0 }}
                />
                <label htmlFor="client-remember-chk" style={{ fontSize: "13px", color: "#475569", cursor: "pointer", userSelect: "none" }}>
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
                  if (!loading) e.currentTarget.style.opacity = "0.95";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.opacity = "1";
                }}
              >
                {loading ? "Authenticating Brand..." : "Sign In to Client Workspace →"}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "13.5px", color: "#64748b" }}>
              Need to register your company first?{" "}
              <button
                type="button"
                onClick={() => {
                  navigate("/become-client");
                  setTimeout(() => {
                    const el = document.getElementById("client-registration-section");
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
                Register Brand on Become a Client
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
