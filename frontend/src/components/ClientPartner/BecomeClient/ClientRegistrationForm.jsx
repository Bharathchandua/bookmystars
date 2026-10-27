import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Gem,
  Wrench,
  Shirt,
  Cpu,
  ShoppingBag,
  Home,
  Car,
  Briefcase,
  Eye,
  EyeOff,
  Clapperboard,
  Users
} from "lucide-react";
import { registerClient } from "../../../features/bms/api/clients/clientApi";
import { showSuccess, showError } from "../../../shared/utils/alert";

const CLIENT_INDUSTRIES = [
  { 
    id: "JEWELRY_LUXURY", 
    label: "Jewelry & Luxury", 
    sub: "Gold, Diamonds & Watches",
    icon: <Gem size={20} strokeWidth={2.2} />
  },
  { 
    id: "HARDWARE_MANUFACTURING", 
    label: "Hardware & Tools", 
    sub: "Power Tools & Machinery",
    icon: <Wrench size={20} strokeWidth={2.2} />
  },
  { 
    id: "FASHION_APPAREL", 
    label: "Fashion & Apparel", 
    sub: "Clothing, Runway & Retail",
    icon: <Shirt size={20} strokeWidth={2.2} />
  },
  { 
    id: "TECH_ELECTRONICS", 
    label: "Tech & Electronics", 
    sub: "Gadgets, Devices & Software",
    icon: <Cpu size={20} strokeWidth={2.2} />
  },
  { 
    id: "FMCG_CONSUMER_GOODS", 
    label: "FMCG & Consumer Goods", 
    sub: "Foods, Beverages & Beauty",
    icon: <ShoppingBag size={20} strokeWidth={2.2} />
  },
  { 
    id: "REAL_ESTATE", 
    label: "Real Estate & Spaces", 
    sub: "Architecture & Luxury Villas",
    icon: <Home size={20} strokeWidth={2.2} />
  },
  { 
    id: "AUTOMOBILE", 
    label: "Automobile & EV", 
    sub: "Vehicles & Mobility Brands",
    icon: <Car size={20} strokeWidth={2.2} />
  },
  { 
    id: "OTHER", 
    label: "Corporate Brand", 
    sub: "Commercial Enterprise",
    icon: <Briefcase size={20} strokeWidth={2.2} />
  }
];

export default function ClientRegistrationForm({ onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "JEWELRY_LUXURY",
    contactPersonName: "",
    email: "",
    mobileNumber: "",
    location: "Mumbai, Maharashtra",
    address: "",
    websiteUrl: "",
    requirements: "",
    password: "",
    confirmPassword: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Listen if other components dispatch an industry selection
  useEffect(() => {
    const handleIndustrySelect = (e) => {
      if (e.detail) {
        setFormData((prev) => ({ ...prev, industry: e.detail }));
      }
    };
    window.addEventListener("bms_select_client_industry", handleIndustrySelect);
    return () => window.removeEventListener("bms_select_client_industry", handleIndustrySelect);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectIndustry = (indId) => {
    setFormData((prev) => ({ ...prev, industry: indId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.companyName.trim()) {
      setErrorMsg("Please enter your Company or Brand Name.");
      return;
    }
    if (!formData.contactPersonName.trim()) {
      setErrorMsg("Please enter the authorized contact person's name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid official corporate email.");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      setErrorMsg("Please enter your contact phone / WhatsApp number.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        contactPersonName: formData.contactPersonName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        websiteUrl: formData.websiteUrl.trim(),
        requirements: formData.requirements.trim() || "Brand registered seeking artist casting and commercial ad production services.",
        password: formData.password
      };

      await registerClient(payload);

      // Trigger sync event so Super Admin bell badge counter updates immediately
      window.dispatchEvent(new CustomEvent("bms_client_registered", { detail: payload }));
      setSuccessModal(true);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(payload);
      }
    } catch (err) {
      const msg = err.message || "Failed to submit client brand application. Please try again.";
      setErrorMsg(msg);
      showError("Registration Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentIndustryObj = CLIENT_INDUSTRIES.find(c => c.id === formData.industry) || CLIENT_INDUSTRIES[0];

  return (
    <div className="py-12 bg-white" id="client-registration-section" style={{ width: "100%" }}>
      {/* Container: Max Width 1420px with zero side gaps */}
      <div style={{ maxWidth: "1420px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>

        {/* Section Heading matching page style */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 40px auto" }}>
          <div className="agency-badge">Brand Onboarding Desk</div>
          <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0c0e2b", margin: "0 0 10px 0", letterSpacing: "-1px" }}>
            Register Your <span style={{ color: "#ec008c" }}>Brand or Business</span>
          </h2>
          <p style={{ fontSize: "15px", color: "#626480", margin: 0, lineHeight: 1.6 }}>
            Whether you are a <strong>jewelry company</strong> promoting bridal collections or a <strong>hardware firm</strong> showcasing machinery, register your brand below. Once approved by Super Admin, log in to your <strong>Client Workspace</strong> to hire top artists, commission ad shoots, and launch multi-channel campaigns.
          </p>
        </div>

        {/* 2-COLUMN BALANCED SPLIT CARDS (Zero side gaps, 1fr 1fr full width) */}
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", 
            gap: "36px", 
            width: "100%", 
            boxSizing: "border-box" 
          }}
        >

          {/* LEFT COLUMN CARD: Classification & Industry Selection */}
          <div 
            style={{
              backgroundColor: "var(--agency-light-grey, #f9f8fc)",
              border: "1px solid var(--agency-line, #ece7f3)",
              borderRadius: "20px",
              padding: "36px",
              boxShadow: "0 2px 8px rgba(91, 0, 215, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "#7c3aed", letterSpacing: "1px" }}>
                    Business Domain
                  </span>
                  <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0c0e2b", margin: "4px 0 0 0", letterSpacing: "-0.5px" }}>
                    Select Brand Industry
                  </h3>
                </div>
                <span 
                  style={{ 
                    fontSize: "12px", 
                    fontWeight: "800", 
                    color: "#ec008c", 
                    backgroundColor: "#ffffff", 
                    padding: "4px 12px", 
                    borderRadius: "50px", 
                    border: "1px solid #fbcfe8" 
                  }}
                >
                  {currentIndustryObj.label}
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                Choose the industry sector of your business to customize your commercial casting & ad options:
              </p>

              {/* Industry Grid (2 columns) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                {CLIENT_INDUSTRIES.map((ind) => {
                  const isSelected = formData.industry === ind.id;
                  return (
                    <div
                      key={ind.id}
                      onClick={() => handleSelectIndustry(ind.id)}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        backgroundColor: isSelected ? "#fff1fb" : "#ffffff",
                        color: "#0f172a",
                        border: isSelected ? "1.5px solid #ec008c" : "1.5px solid #ece7f3",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        boxShadow: isSelected ? "0 4px 14px rgba(236, 0, 140, 0.15)" : "none"
                      }}
                    >
                      <div 
                        style={{ 
                          width: "42px", 
                          height: "42px", 
                          minWidth: "42px",
                          borderRadius: "10px", 
                          backgroundColor: isSelected ? "#ec008c" : "#fff1fb", 
                          color: isSelected ? "#ffffff" : "#5b00d7",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.2s ease"
                        }}
                      >
                        {ind.icon}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ind.label}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                          {ind.sub}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left Footer: Value Proposition Checklist */}
            <div 
              style={{ 
                backgroundColor: "#ffffff", 
                border: "1px solid #ece7f3", 
                borderRadius: "14px", 
                padding: "20px", 
                marginTop: "16px" 
              }}
            >
              <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clapperboard size={16} color="#ec008c" /> How BookMyStars Powers Commercial Brands:
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#475569" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#fce7f3", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "11px", flexShrink: 0 }}>✓</span>
                  <span><strong>Talent & Artist Sourcing:</strong> Book verified models, actors, voiceover artists, and dancers for your campaigns.</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "11px", flexShrink: 0 }}>✓</span>
                  <span><strong>Commercial Ad Production:</strong> End-to-end scripting, shooting, VFX, and post-production for high-gloss brand commercials.</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "11px", flexShrink: 0 }}>✓</span>
                  <span><strong>Ad Publishing & Promotion:</strong> Distribute your advertisements across OTT networks, digital channels, and national billboards.</span>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Already a verified brand client?</span>
              <Link to="/client/signin" style={{ color: "#ec008c", fontWeight: "800", textDecoration: "none" }}>
                Log in to Client Portal &rarr;
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN CARD: Registration Form */}
          <div 
            style={{
              backgroundColor: "var(--agency-light-grey, #f9f8fc)",
              border: "1px solid var(--agency-line, #ece7f3)",
              borderRadius: "20px",
              padding: "36px",
              boxShadow: "0 2px 8px rgba(91, 0, 215, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "#ec008c", letterSpacing: "1px" }}>
                    Official Sign-Up
                  </span>
                  <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0c0e2b", margin: "4px 0 0 0", letterSpacing: "-0.5px" }}>
                    Brand Details & Requirement
                  </h3>
                </div>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "#fff1fb", color: "#ec008c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "12px" }}>
                  B2B
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: "12px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#b91c1c", fontSize: "13px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Brand Name */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Company / Brand Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Tanishq Fine Jewelry / Apex Tools Corp"
                    required
                    style={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "11px 14px",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Contact Person & Mobile Number */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                      Authorized Representative *
                    </label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleChange}
                      placeholder="Your Full Legal Name"
                      required
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "11px 14px",
                        fontSize: "13.5px",
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "11px 14px",
                        fontSize: "13.5px",
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* Email & Location */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                      Official Corporate Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@yourcompany.com"
                      required
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "11px 14px",
                        fontSize: "13.5px",
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                      Head Office / Operating City
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai, Maharashtra"
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "11px 14px",
                        fontSize: "13.5px",
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* Website / Portfolio Link */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Company Website / Catalog URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://yourbrand.com"
                    style={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "11px 14px",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Primary Ad & Talent Requirement */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Initial Requirement (What artists or ads do you need?)
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Looking for 4 models for festive jewelry shoot and a video commercial to be published on digital channels..."
                    style={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "11px 14px",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical"
                    }}
                  />
                </div>

                {/* Password & Confirm Password with Visibility Toggle */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                      Account Password *
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        required
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "11px 42px 11px 14px",
                          fontSize: "13.5px",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#64748b",
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

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                      Confirm Password *
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        required
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "11px 42px 11px 14px",
                          fontSize: "13.5px",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px"
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Super Admin Notice */}
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "12px 14px", backgroundColor: "#fff1fb", border: "1px solid #fbcfe8", borderRadius: "10px", fontSize: "12px", color: "#86198f", lineHeight: "1.5", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <ShieldCheck size={18} style={{ color: "#ec008c", flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <strong>Super Admin Verification Notice:</strong> Your brand application is routed directly to the Super Admin switch portal. Once approved, you can log in to search artists, commission commercials, and track your ad releases.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "15px 28px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #ec008c 0%, #5b00d7 100%)",
                      color: "#ffffff",
                      fontSize: "15px",
                      fontWeight: "800",
                      border: "none",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      boxShadow: "0 4px 16px rgba(236, 0, 140, 0.28)",
                      transition: "opacity 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.currentTarget.style.opacity = "0.92";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Brand Registration <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {successModal && (
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <div 
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                padding: "36px",
                maxWidth: "520px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
            >
              <div 
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#fdf2f8",
                  color: "#ec008c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px auto"
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#0c0e2b", marginBottom: "10px" }}>
                Brand Application Submitted!
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>
                Thank you for registering <strong>{formData.companyName}</strong>. Your requirement has been routed to the Super Admin verification desk. Once verified, log in with your email to discover artists and manage your commercial ad campaigns.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <Link
                  to="/client/signin"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #ec008c 0%, #5b00d7 100%)",
                    color: "#ffffff",
                    fontWeight: "800",
                    fontSize: "13.5px",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(236, 0, 140, 0.25)"
                  }}
                >
                  Go to Client Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setSuccessModal(false)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    backgroundColor: "#f1f5f9",
                    color: "#0f172a",
                    fontWeight: "700",
                    fontSize: "13.5px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
