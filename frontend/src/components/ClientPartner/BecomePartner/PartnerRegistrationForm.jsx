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
  Film,
  Camera,
  Music,
  Tv,
  Briefcase,
  Eye,
  EyeOff
} from "lucide-react";
import { registerPartner } from "../../../features/bms/api/partners/partnerApi";
import { showSuccess, showError } from "../../../shared/utils/alert";

const CATEGORIES = [
  { 
    id: "DANCE_ACADEMY", 
    label: "Dance Academy", 
    sub: "Studios & Institutes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 3-3 3 3"/>
        <path d="m12 15V9"/>
        <circle cx="12" cy="5" r="2"/>
      </svg>
    )
  },
  { 
    id: "ACTING_ACADEMY", 
    label: "Acting School", 
    sub: "Theatre & Screenplay",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10s3-3 10-3 10 3 10 3-1 9-10 11C3 19 2 10 2 10z"/>
      </svg>
    )
  },
  { 
    id: "MUSIC_STUDIO", 
    label: "Music Studio", 
    sub: "Vocals & Audio",
    icon: <Music size={20} strokeWidth={2.2} />
  },
  { 
    id: "MODELING_AGENCY", 
    label: "Modeling Agency", 
    sub: "Ramp & Commercial",
    icon: <Camera size={20} strokeWidth={2.2} />
  },
  { 
    id: "PRODUCTION_HOUSE", 
    label: "Production House", 
    sub: "Films & OTT Series",
    icon: <Film size={20} strokeWidth={2.2} />
  },
  { 
    id: "OTHER", 
    label: "Creative Agency", 
    sub: "Casting, PR & Talent",
    icon: <Briefcase size={20} strokeWidth={2.2} />
  }
];

export default function PartnerRegistrationForm({ onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    businessName: "",
    category: "DANCE_ACADEMY",
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

  // Allow other components (like WhyChooseUs tags) to set the category
  useEffect(() => {
    const handleCategorySelect = (e) => {
      if (e.detail) {
        setFormData((prev) => ({ ...prev, category: e.detail }));
      }
    };
    window.addEventListener("bms_select_partner_category", handleCategorySelect);
    return () => window.removeEventListener("bms_select_partner_category", handleCategorySelect);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCategory = (catId) => {
    setFormData((prev) => ({ ...prev, category: catId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.businessName.trim()) {
      setErrorMsg("Please enter your Academy or Business Name.");
      return;
    }
    if (!formData.contactPersonName.trim()) {
      setErrorMsg("Please enter the contact person's name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid official email address.");
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
        businessName: formData.businessName.trim(),
        category: formData.category,
        contactPersonName: formData.contactPersonName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        websiteUrl: formData.websiteUrl.trim(),
        requirements: formData.requirements.trim() || "Partner registered seeking academy collaboration & talent matching.",
        password: formData.password
      };

      await registerPartner(payload);

      // Trigger sync event so Super Admin bell badge counter updates immediately
      window.dispatchEvent(new CustomEvent("bms_partner_registered", { detail: payload }));
      setSuccessModal(true);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(payload);
      }
    } catch (err) {
      const msg = err.message || "Failed to submit partner application. Please try again.";
      setErrorMsg(msg);
      showError("Registration Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === formData.category) || CATEGORIES[0];

  return (
    <div className="py-12 bg-white" id="partner-registration-section" style={{ width: "100%" }}>
      {/* Container: Max Width 1420px with zero side gaps */}
      <div style={{ maxWidth: "1420px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>

        {/* Section Heading matching page style */}
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 40px auto" }}>
          <div className="agency-badge">Partner Sign-Up Desk</div>
          <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0c0e2b", margin: "0 0 10px 0", letterSpacing: "-1px" }}>
            Register Your <span style={{ color: "#ec008c" }}>Academy or Agency</span>
          </h2>
          <p style={{ fontSize: "15px", color: "#626480", margin: 0, lineHeight: 1.6 }}>
            Complete your official partner registration below. Once approved by Super Admin, log in to your <strong>Partner Dashboard</strong> to post requirements, manage auditions, and run targeted ad campaigns.
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

          {/* LEFT COLUMN CARD: Classification & Category Selection */}
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
                    Classification
                  </span>
                  <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0c0e2b", margin: "4px 0 0 0", letterSpacing: "-0.5px" }}>
                    Select Academy Category
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
                  {currentCategoryObj.label}
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                Choose the primary category that reflects your organization's talent needs:
              </p>

              {/* Category Grid (2 columns) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      style={{
                        backgroundColor: isSelected ? "#fff1fb" : "#ffffff",
                        border: isSelected ? "1.5px solid #ec008c" : "1.5px solid #ece7f3",
                        borderRadius: "14px",
                        padding: "16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s ease",
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
                          transition: "all 0.2s ease"
                        }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "13px", color: "#0f172a" }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                          {cat.sub}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3 Partnership Highlights */}
              <div style={{ paddingTop: "20px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#fce7f3", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "12px", flexShrink: 0 }}>✓</span>
                  <span><strong>Dedicated Partner Portal</strong> to post audition calls & requirements after login.</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "12px", flexShrink: 0 }}>✓</span>
                  <span><strong>Targeted Casting Ads</strong> run by BookMyStars to fulfill academy batch intake.</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "12px", flexShrink: 0 }}>✓</span>
                  <span><strong>Super Admin Verification</strong> badge protecting verified academy partners.</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Already a verified partner?</span>
              <Link to="/partner/signin" style={{ color: "#ec008c", fontWeight: "800", textDecoration: "none" }}>
                Log in to Partner Portal &rarr;
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN CARD: Registration Credentials & Submission */}
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
                    Sign Up Form
                  </span>
                  <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0c0e2b", margin: "4px 0 0 0", letterSpacing: "-0.5px" }}>
                    Organization & Representative Details
                  </h3>
                </div>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "#fff1fb", color: "#ec008c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "12px" }}>
                  B2B
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: "12px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#991b1b", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Academy Name */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Registered Business / Academy Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Terrence Lewis Performing Arts Academy"
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
                      Authorized Contact Person *
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
                      placeholder="admin@yourbusiness.com"
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
                      Operating City / Location
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

                {/* Brief Headline Goal */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Primary Talent Goal / Headline (Optional note for Super Admin review)
                  </label>
                  <input
                    type="text"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="e.g. Hiring 20 contemporary dancers for our Mumbai studio batch"
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

                {/* Password & Confirm Password */}
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

                {/* Super Admin Notice & CTA */}
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "12px 14px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", fontSize: "12px", color: "#92400e", lineHeight: "1.5", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <ShieldCheck size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <strong>Super Admin Verification Notice:</strong> Upon registration, your profile is routed to the Super Admin desk (triggering the Bell icon notification). Once verified, you can log in to your dedicated <strong>Partner Requirements Dashboard</strong>.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: "linear-gradient(135deg, #ec008c 0%, #5b00d7 100%)",
                      color: "#ffffff",
                      fontWeight: "800",
                      fontSize: "15px",
                      borderRadius: "12px",
                      padding: "15px 28px",
                      border: "none",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 16px rgba(236, 0, 140, 0.28)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      transition: "all 0.25s ease"
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Register Academy & Request Verification</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      {successModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", maxWidth: "460px", width: "100%", padding: "32px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0 0 8px 0" }}>
              Application Submitted!
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              Thank you for registering <strong>{formData.businessName}</strong>. Your account has been queued for Super Admin review.
            </p>

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0", textAlign: "left", fontSize: "12px", color: "#475569", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Status:</span>
                <strong style={{ color: "#d97706" }}>Pending Super Admin Approval</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Login Email:</span>
                <strong style={{ color: "#0f172a" }}>{formData.email}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Next Step:</span>
                <span style={{ color: "#0f172a" }}>Admin verifies via Bell Icon &rarr; Login Unlocked</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSuccessModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "800",
                fontSize: "13px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
