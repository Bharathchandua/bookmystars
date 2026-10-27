/* ── AgencyProfileTab.jsx ────────────────────────────────────
   Profile management tab for professional entities (Production Houses,
   Casting Agencies, Modeling Agencies, Brands).
   ────────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { Building2, Globe, Mail, Phone, MapPin, Save, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { getProfessionalProfile, updateProfessionalProfile } from "../../features/bms/api/professional/professionalApi";

const AGENCY_TYPES = [
  "Casting Agency",
  "Production House",
  "Modeling Agency",
  "Talent Management",
  "Advertising / Media Agency",
  "Film Studio",
  "Independent Casting Director",
  "Other",
];

export default function AgencyProfileTab() {
  const [formData, setFormData] = useState({
    companyName: "",
    agencyType: "Casting Agency",
    website: "",
    logoUrl: "",
    address: "",
    businessEmail: "",
    phone: "",
    bio: "",
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const data = await getProfessionalProfile();
        if (data) {
          setFormData({
            companyName: data.companyName || "",
            agencyType: data.agencyType || "Casting Agency",
            website: data.website || "",
            logoUrl: data.logoUrl || "",
            address: data.address || "",
            businessEmail: data.businessEmail || "",
            phone: data.phone || "",
            bio: data.bio || "",
          });
          setIsVerified(!!data.verified);
        }
      } catch (err) {
        console.error("Failed to load professional profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      await updateProfessionalProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <Loader2 size={36} className="animate-spin" style={{ color: "#4f46e5", marginBottom: 12 }} />
        <p>Loading agency profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
              Agency & Production Profile
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              This information is displayed to talents when viewing your casting calls.
            </p>
          </div>
          {isVerified && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ecfdf5", color: "#047857", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              <ShieldCheck size={16} /> Verified Agency
            </div>
          )}
        </div>

        {saveSuccess && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ecfdf5", color: "#047857", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
            <CheckCircle2 size={18} /> Company profile updated successfully!
          </div>
        )}

        {errorMessage && (
          <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Logo preview and URL */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Logo"
                style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover", border: "2px solid #e2e8f0" }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 14, background: "linear-gradient(135deg, #4f46e5, #06b6d4)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
                <Building2 size={32} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                Agency / Company Logo URL
              </label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                Company / Agency Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="e.g. Starburst Casting Studios"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                Agency Type
              </label>
              <select
                name="agencyType"
                value={formData.agencyType}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14, background: "#fff" }}
              >
                {AGENCY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 18 }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                <Globe size={13} /> Official Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.starburststudios.com"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                <Mail size={13} /> Business Email
              </label>
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                placeholder="casting@starburst.com"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 18 }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                <Phone size={13} /> Contact Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
                <MapPin size={13} /> Studio / Office Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Andheri West, Mumbai, Maharashtra"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>
              About the Agency / Production House
            </label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell talents about your background, notable projects, and the kind of talent you represent or cast..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", fontSize: 14, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 24px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
              }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
