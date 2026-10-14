import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect } from "react";
import AppLayout from "../Layout/AppLayout.jsx";
import About from "./About.jsx";
import OverviewTab from "./OverviewTab.jsx";
import AvailabilityTab from "./AvailabilityTab.jsx";
import { PortfolioTab, WorkExperienceTab, MeasurementsTab, VideosTab, ReviewsTab, RatesTab } from "./ProfileTabs.jsx";
import CropPhotoModal from "./CropPhotoModal.jsx";
import "./profile.css";
import "./profile-mobile.css";

import {
  Share2, Heart, MoreHorizontal,
  MapPin, Calendar, Globe, Briefcase,
  Star, Play, CheckCircle2,
  FolderOpen, Users, BarChart2, Bookmark,
  Camera, Edit3, X, Plus, Crop, ExternalLink,
  Lock, Trash2, Paperclip, Clock, FolderPlus
} from "lucide-react";
import SkillManagementModal from "../../components/common/SkillManagementModal.jsx";
import {
  getStoredUser,
  getCurrentUserProfile,
  updateUserProfile,
  updateProfilePrivacy,
  uploadPortfolioPhoto,
  getMyPortfolio,
  getFullImageUrl,
  getMyMeasurements,
  getMyWorkExperiences,
  getMyVideos,
  uploadProfilePhoto,
  getShareProfileData,
  getUserSkills,
  syncUserSkillsFromProfile,
  addUserSkill,
  removeUserSkill,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  uploadWorkExperienceFile
} from "../../services/api";
import {
  showSuccess,
  showError,
  confirmDelete,
  showWarning
} from "../../shared/utils/alert";

const TABS = ["Overview", "Portfolio", "Work Experience", "Measurements", "Videos", "Reviews", "Availability", "Rates"];

/* ── Reusable StarRating ── */
function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0",
            fill:  i <= Math.round(rating) ? "#f59e0b" : "none"
          }}
        />
      ))}
    </div>
  );
}

const PROFILE_TYPE_OPTIONS = [
  { label: "🎭 Actor", value: "ACTOR" },
  { label: "💃 Model", value: "MODEL" },
  { label: "🎤 Singer", value: "SINGER" },
  { label: "🕺 Dancer", value: "DANCER" },
  { label: "🎬 Director", value: "DIRECTOR" },
  { label: "📽️ Producer", value: "PRODUCER" },
  { label: "✨ Other", value: "OTHER" },
];

/* ── Reusable Modal for Profile Editing ── */
function EditProfileModal({ isOpen, onClose, profile, onSave }) {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const rawTypes = (profile?.profileTypes || []).map(t => String(t).toUpperCase());
    const initialTypes = rawTypes.length > 0 ? [rawTypes[0]] : [];
    const isOther = initialTypes.length > 0 && initialTypes[0] === "OTHER";
    const storedUser = getStoredUser();
    const savedCustom = isOther
      ? (profile?.customProfession || storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`) || "")
      : "";
    setForm({
      ...profile,
      profileTypes: initialTypes,
      customProfession: savedCustom,
      isPrivate: Boolean(profile?.isPrivate)
    });
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.profileTypes || form.profileTypes.length === 0) {
      showWarning("Profession Required", "Please select your primary profession.");
      return;
    }
    if (form.profileTypes.includes("OTHER") && (!form.customProfession || !form.customProfession.trim())) {
      showWarning("Craft Required", "Please specify your custom profession / craft.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "16px"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "520px",
        padding: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e2e8f0",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Edit Profile Information</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Full Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Stage Name</label>
              <input
                type="text"
                placeholder="Optional"
                value={form.stageName}
                onChange={(e) => setForm({ ...form, stageName: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Primary Profession Selector (Single selection) */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Primary Profession <span style={{ color: "#e91e8c" }}>*</span> <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "400" }}>(Select one craft)</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {PROFILE_TYPE_OPTIONS.map((opt) => {
                const currentTypes = Array.isArray(form.profileTypes) ? form.profileTypes : [];
                const isSelected = currentTypes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        profileTypes: [opt.value],
                        customProfession: opt.value === "OTHER" ? (form.customProfession || "") : ""
                      });
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: isSelected ? "1.5px solid #db2777" : "1.5px solid #cbd5e1",
                      background: isSelected ? "#fdf2f8" : "#ffffff",
                      color: isSelected ? "#db2777" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    {isSelected && <span>✓</span>}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Profession Input for OTHER */}
          {(Array.isArray(form.profileTypes) && form.profileTypes.includes("OTHER")) && (
            <div style={{ background: "#fdf2f8", border: "1.5px solid #fbcfe8", borderRadius: "10px", padding: "10px 14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#db2777", display: "block", marginBottom: "4px" }}>
                Specify Your Custom Craft / Profession <span style={{ color: "#e91e8c" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cinematographer, Lyricist, Editor, Stunt Director"
                value={form.customProfession || ""}
                onChange={(e) => setForm({ ...form, customProfession: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #f472b6", borderRadius: "8px", fontSize: "13px", background: "#ffffff" }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Location / City</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Languages</label>
              <input
                type="text"
                placeholder="e.g. English, Hindi, Telugu"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Work Type</label>
              <input
                type="text"
                placeholder="e.g. Freelance Talent, Agency"
                value={form.workType}
                onChange={(e) => setForm({ ...form, workType: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Day Rate</label>
              <input
                type="text"
                placeholder="e.g. ₹25,000 / Day"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>About / Bio</label>
            <textarea
              rows={4}
              placeholder="Describe your background, skills, and acting/modeling passions..."
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
            />
          </div>

          {/* Instagram-style Privacy Toggle in Edit Modal */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderRadius: "10px",
            backgroundColor: form.isPrivate ? "#f5f3ff" : "#f0fdf4",
            border: form.isPrivate ? "1px solid #ddd6fe" : "1px solid #bbf7d0"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", fontWeight: "700", color: form.isPrivate ? "#6d28d9" : "#15803d" }}>
                {form.isPrivate ? <Lock size={15} /> : <Globe size={15} />}
                <span>{form.isPrivate ? "Private Account" : "Public Account"}</span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#64748b" }}>
                {form.isPrivate
                  ? "Only approved viewers can view your photos, videos, and portfolio."
                  : "Anyone with your link can view your complete portfolio and media."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                backgroundColor: form.isPrivate ? "#7c3aed" : "#10b981",
                color: "#ffffff"
              }}
            >
              {form.isPrivate ? "Make Public" : "Make Private"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: "8px 20px", border: "none", background: "#e91e8c", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── SkillWorksModal (View, Edit, Delete works for a specific skill) ── */
function SkillWorksModal({ skill, isOpen, initialAdd = false, onClose, experiences, onWorkUpdated }) {
  const [editingWork, setEditingWork] = useState(null);
  const [addingWork, setAddingWork] = useState(initialAdd);

  // Form states (used for both Add and Edit)
  const [formCompany, setFormCompany] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFile, setFormFile] = useState(null);
  const [formExistingFileUrl, setFormExistingFileUrl] = useState("");
  const [formExistingFileName, setFormExistingFileName] = useState("");
  const [formTab, setFormTab] = useState("details"); // 'details' | 'files'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialAdd) {
      setAddingWork(true);
      setEditingWork(null);
      setFormCompany("");
      setFormTitle("");
      setFormDuration("");
      setFormDescription("");
      setFormFile(null);
      setFormExistingFileUrl("");
      setFormExistingFileName("");
      setFormTab("details");
    } else {
      setAddingWork(false);
      setEditingWork(null);
    }
  }, [initialAdd, skill]);

  if (!isOpen || !skill) return null;

  const works = (experiences || []).filter(
    w => (w.category || "").toLowerCase() === skill.toLowerCase()
  );

  const startEdit = (work) => {
    setAddingWork(false);
    setEditingWork(work);
    setFormCompany(work.company || "");
    setFormTitle(work.title || "");
    setFormDuration(work.startDate ? `${work.startDate}${work.endDate ? ` – ${work.endDate}` : ""}` : "");
    setFormDescription(work.description || "");
    setFormFile(null);
    setFormExistingFileUrl(work.fileUrl || "");
    setFormExistingFileName(work.fileName || "");
    setFormTab("details");
  };

  const startAdd = () => {
    setEditingWork(null);
    setAddingWork(true);
    setFormCompany("");
    setFormTitle("");
    setFormDuration("");
    setFormDescription("");
    setFormFile(null);
    setFormExistingFileUrl("");
    setFormExistingFileName("");
    setFormTab("details");
  };

  const cancelForm = () => {
    setEditingWork(null);
    setAddingWork(false);
    setFormFile(null);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this project'}"?`)) return;
    try {
      await deleteWorkExperience(id);
      await onWorkUpdated();
    } catch (err) {
      alert("Failed to delete work: " + (err.message || ""));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingWork) return;
    setSubmitting(true);
    try {
      let finalFileUrl = formExistingFileUrl;
      let finalFileName = formExistingFileName;

      if (formFile) {
        const uploadRes = await uploadWorkExperienceFile(formFile);
        finalFileUrl = uploadRes.fileUrl;
        finalFileName = uploadRes.fileName || formFile.name;
      }

      await updateWorkExperience(editingWork.id, {
        company: formCompany.trim(),
        title: formTitle.trim(),
        category: skill,
        description: formDescription.trim(),
        startDate: formDuration.trim() || undefined,
        fileUrl: finalFileUrl,
        fileName: finalFileName
      });

      await onWorkUpdated();
      cancelForm();
    } catch (err) {
      alert("Failed to update work: " + (err.message || ""));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalFileUrl = "";
      let finalFileName = "";

      if (formFile) {
        const uploadRes = await uploadWorkExperienceFile(formFile);
        finalFileUrl = uploadRes.fileUrl;
        finalFileName = uploadRes.fileName || formFile.name;
      }

      await addWorkExperience({
        company: formCompany.trim(),
        title: formTitle.trim(),
        category: skill,
        description: formDescription.trim(),
        startDate: formDuration.trim() || undefined,
        fileUrl: finalFileUrl,
        fileName: finalFileName
      });

      await onWorkUpdated();
      cancelForm();
    } catch (err) {
      alert("Failed to add work: " + (err.message || ""));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          border: "1px solid #e2e8f0",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✨ {skill}</span>
              <span style={{ fontSize: "12px", background: "#fdf2f8", color: "#db2777", border: "1px solid #fbcfe8", padding: "2px 8px", borderRadius: "12px" }}>
                {works.length} {works.length === 1 ? "project" : "projects"}
              </span>
            </h3>
            <p style={{ margin: "3px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
              View, edit, or delete work credits and proofs for {skill}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* If Adding or Editing */}
        {(addingWork || editingWork) ? (
          <form onSubmit={addingWork ? handleSaveAdd : handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                {addingWork ? `+ Add Project for ${skill}` : `✏️ Edit Project: ${editingWork.title}`}
              </h4>
              <button
                type="button"
                onClick={cancelForm}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
              >
                Cancel
              </button>
            </div>

            {/* Modal Tabs switcher */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
              <button
                type="button"
                onClick={() => setFormTab("details")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: formTab === "details" ? "#fdf2f8" : "transparent",
                  color: formTab === "details" ? "#db2777" : "#64748b",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                📝 Project Details
              </button>
              <button
                type="button"
                onClick={() => setFormTab("files")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: formTab === "files" ? "#fdf2f8" : "transparent",
                  color: formTab === "files" ? "#db2777" : "#64748b",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                📁 Attach Files / Proof {formFile ? "(1 file attached)" : formExistingFileName ? "(Current file)" : ""}
              </button>
            </div>

            {formTab === "details" ? (
              <>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Brand / Production Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix, Amazon Prime, Red Chillies"
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Project / Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. Lead ${skill} Performer, Main Character`}
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Year / Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024, 2023 - 2024"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Description & Role Contribution
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your role, scene, or performance..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {formExistingFileName && !formFile && (
                  <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "8px 12px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0369a1" }}>📄 {formExistingFileName}</span>
                    <button
                      type="button"
                      onClick={() => { setFormExistingFileUrl(""); setFormExistingFileName(""); }}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "700", fontSize: "11px" }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div style={{ background: "#ffffff", border: "1.5px dashed #cbd5e1", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <FolderPlus size={30} color="#db2777" style={{ margin: "0 auto 6px" }} />
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                    {formExistingFileName ? "Replace Certificate, Script, or Proof" : "Attach Certificate, Script, or Proof"}
                  </div>
                  <input
                    type="file"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setFormFile(file);
                    }}
                    style={{ fontSize: "12px", marginTop: "8px" }}
                  />
                </div>

                {formFile && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "8px 12px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#065f46" }}>📎 {formFile.name} ({Math.round(formFile.size / 1024)} KB)</span>
                    <button
                      type="button"
                      onClick={() => setFormFile(null)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "700", fontSize: "11px" }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={cancelForm}
                style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "600", fontSize: "12.5px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: "6px 16px", borderRadius: "6px", border: "none", background: "#ee008f", color: "#ffffff", fontWeight: "700", fontSize: "12.5px", cursor: "pointer" }}
              >
                {submitting ? "Saving..." : addingWork ? `Save Project` : `Update Project`}
              </button>
            </div>
          </form>
        ) : null}

        {/* Action button if not currently adding or editing */}
        {!addingWork && !editingWork && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>
              Documented projects: {works.length}
            </span>
            <button
              type="button"
              onClick={startAdd}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#ee008f",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(238, 0, 143, 0.2)"
              }}
            >
              <Plus size={14} /> Add Work for {skill}
            </button>
          </div>
        )}

        {/* Works List */}
        {works.length === 0 && !addingWork ? (
          <div style={{ textAlign: "center", padding: "36px 16px", background: "#f8fafc", borderRadius: "12px", border: "1.5px dashed #cbd5e1" }}>
            <Briefcase size={36} color="#94a3b8" style={{ marginBottom: "8px" }} />
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#334155" }}>
              No Works Documented Yet for {skill}
            </h4>
            <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b" }}>
              List previous shoots, stage performances, or productions you worked on under {skill}.
            </p>
            <button
              type="button"
              onClick={startAdd}
              style={{
                background: "#ee008f",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "7px 16px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              + Add First Work for {skill}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {works.map((w) => (
              <div
                key={w.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#e91e8c" }}>
                      {w.company || "Brand / Production"}
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginTop: "1px" }}>
                      {w.title}
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                      <Clock size={11} /> {w.startDate ? `${w.startDate}${w.endDate ? ` – ${w.endDate}` : ""}` : "Recent"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => startEdit(w)}
                      title="Edit this work"
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        color: "#475569",
                        display: "inline-flex",
                        alignItems: "center"
                      }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(w.id, w.title)}
                      title="Delete this work"
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fee2e2",
                        borderRadius: "6px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        color: "#ef4444",
                        display: "inline-flex",
                        alignItems: "center"
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {w.description && (
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                    {w.description}
                  </p>
                )}

                {w.fileUrl && (
                  <div style={{ marginTop: "10px" }}>
                    <a
                      href={getFullImageUrl(w.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11.5px",
                        fontWeight: "700",
                        color: "#0284c7",
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        textDecoration: "none"
                      }}
                    >
                      <Paperclip size={12} />
                      <span>Attached File: {w.fileName || "View Document / Proof"} ↗</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const storedUser = getStoredUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [liked, setLiked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyToggling, setPrivacyToggling] = useState(false);
  const fileInputRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Profile data state
  const [profile, setProfile] = useState({
    fullName: storedUser?.fullName || "Your Name",
    stageName: "",
    role: "Talent",
    location: "Location not set",
    dob: "",
    languages: "English, Hindi",
    workType: "Freelance Talent",
    rate: "Flexible / Negotiable",
    rateNote: "Price range varies by project",
    about: "Click 'Edit Profile' to add your bio and tell the industry about yourself.",
    profilePhoto: localStorage.getItem("bms_profile_photo") ? getFullImageUrl(localStorage.getItem("bms_profile_photo")) : null,
    profileTypes: [],
    memberSince: new Date().getFullYear().toString(),
    stats: [
      { value: "0", label: "Projects Completed" },
      { value: "0", label: "Brands Worked" },
      { value: "0", label: "Years Experience" },
      { value: "0", label: "Features" }
    ]
  });

  const [skills, setSkills] = useState([]);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [yearsExperience, setYearsExperience] = useState(0);
  const [workExpCount, setWorkExpCount] = useState(0);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [isAutoPromoted, setIsAutoPromoted] = useState(false);
  const [promotionBannerDismissed, setPromotionBannerDismissed] = useState(false);
  const [targetSkillForWork, setTargetSkillForWork] = useState(null);
  const [targetSkillFilter, setTargetSkillFilter] = useState("All");

  const handleDismissPromotionBanner = () => {
    setPromotionBannerDismissed(true);
    const userKey = (storedUser?.email || storedUser?.userId || "user").toLowerCase();
    localStorage.setItem(`bms_promoted_dismissed_${userKey}`, "true");
  };

  const handleOpenAddWorkForSkill = (skill) => {
    setTargetSkillFilter(skill);
    setActiveTab("work-experience");
    setTimeout(() => {
      const el = document.querySelector(".wexp-container") || document.querySelector(".prof-tabs-nav");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleViewSkillWorks = (skill) => {
    setTargetSkillFilter(skill);
    setActiveTab("work-experience");
    setTimeout(() => {
      const el = document.querySelector(".wexp-container") || document.querySelector(".prof-tabs-nav");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleAddSkill = (newSkill) => {
    const updated = addUserSkill(storedUser?.userId, newSkill);
    setSkills(updated);
    showSuccess("Skill Added!", `"${newSkill}" has been added to your profile.`);
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const confirmed = await confirmDelete(
      `Skill "${skillToRemove}"`,
      `Are you sure you want to remove the skill "${skillToRemove}"?`
    );
    if (!confirmed) return;
    const updated = removeUserSkill(storedUser?.userId, skillToRemove);
    setSkills(updated);
    showSuccess("Skill Removed", `"${skillToRemove}" has been removed from your skills.`);
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSaveCustomProfession = async (newCraft) => {
    if (!newCraft || !newCraft.trim()) return;
    const craft = newCraft.trim();
    const email = (storedUser?.email || "").toLowerCase();
    if (email) {
      localStorage.setItem(`bms_custom_profession_${email}`, craft);
    }
    if (storedUser) {
      localStorage.setItem("bms_user", JSON.stringify({ ...storedUser, customProfession: craft }));
    }
    setProfile(prev => ({ ...prev, customProfession: craft }));
    try {
      await updateUserProfile({ customProfession: craft });
    } catch (_) {}
    window.dispatchEvent(new Event("profile_updated"));
  };

  // Load real user profile from backend on mount
  useEffect(() => {
    const loadedSkills = getUserSkills(storedUser?.userId);
    setSkills(loadedSkills);

    const handleSkillsUpdated = () => {
      setSkills(getUserSkills(storedUser?.userId));
    };
    window.addEventListener("skills_updated", handleSkillsUpdated);

    async function fetchProfile() {
      try {
        const data = await getCurrentUserProfile();
        if (data) {
          const photoUrl = data.profilePhoto ? getFullImageUrl(data.profilePhoto) : "";
          if (photoUrl) {
            localStorage.setItem("bms_profile_photo", photoUrl);
            window.dispatchEvent(new Event("profile_photo_updated"));
          }
          const rawTypes = data.profileTypes ? Array.from(data.profileTypes) : [];
          const singleRawType = rawTypes.length > 0 ? [rawTypes[0]] : [];
          const isOther = singleRawType.length > 0 && String(singleRawType[0]).toUpperCase() === "OTHER";
          const types = singleRawType.map(t => t.charAt(0) + t.slice(1).toLowerCase());
          const fetchedCustom = isOther ? (data.customProfession || storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`) || "") : "";
          if (storedUser?.email) {
            if (fetchedCustom) {
              localStorage.setItem(`bms_custom_profession_${storedUser.email.toLowerCase()}`, fetchedCustom);
            } else {
              localStorage.removeItem(`bms_custom_profession_${storedUser.email.toLowerCase()}`);
            }
          }
          const mainRole = isOther ? (fetchedCustom || "Other") : (types.length > 0 ? types[0] : "Talent");
          setProfile(prev => ({
            ...prev,
            fullName: data.fullName || prev.fullName,
            stageName: data.stageName || "",
            role: mainRole,
            customProfession: fetchedCustom,
            location: data.location || prev.location,
            dob: data.dateOfBirth || "",
            languages: data.languages || prev.languages,
            workType: data.workType || prev.workType,
            rate: data.dayRate || prev.rate,
            about: data.about || prev.about,
            profilePhoto: photoUrl || prev.profilePhoto || localStorage.getItem("bms_profile_photo"),
            profileTypes: types,
            memberSince: data.memberSince ? new Date(data.memberSince).getFullYear().toString() : prev.memberSince,
            stats: [
              { value: (data.projectsCompleted || 0).toString(), label: "Projects Completed" },
              { value: (data.brandsWorked || 0).toString(), label: "Brands Worked" },
              { value: (data.yearsExperience || 0).toString(), label: "Years Experience" },
              { value: (data.magazineFeatures || 0).toString(), label: "Features" }
            ]
          }));
          if (typeof data.isPrivate !== "undefined") {
            setIsPrivate(Boolean(data.isPrivate));
          }

          // Sync skills from database so clearing local storage doesn't delete them
          if (data.skills && Array.isArray(data.skills)) {
            const dbSkills = Array.from(data.skills);
            syncUserSkillsFromProfile(dbSkills, storedUser?.userId);
            setSkills(dbSkills);
          }

          // Check experience verification & auto-reversion rules
          const experiences = await getMyWorkExperiences().catch(() => []);
          const totalWorks = Array.isArray(experiences) ? experiences.length : 0;
          setWorkExpCount(totalWorks);

          const expYears = (typeof data.yearsExperience === "number") ? data.yearsExperience : (totalWorks > 0 ? totalWorks : 0);
          setYearsExperience(expYears);

          const rawAccountType = (data.accountType || storedUser?.accountType || "TALENT").toUpperCase();
          const userKey = (storedUser?.email || storedUser?.userId || "user").toLowerCase();
          const alreadyDismissed = localStorage.getItem(`bms_promoted_dismissed_${userKey}`) === "true";
          if (alreadyDismissed) {
            setPromotionBannerDismissed(true);
          }

          if (rawAccountType === "PROFESSIONAL" && expYears < 1 && totalWorks === 0) {
            setIsPendingVerification(true);
            setIsAutoPromoted(false);
          } else if (rawAccountType === "TALENT" && (expYears >= 1 || totalWorks >= 1)) {
            setIsAutoPromoted(true);
            setIsPendingVerification(false);
          } else if (rawAccountType === "PROFESSIONAL" && (expYears >= 1 || totalWorks >= 1)) {
            setIsPendingVerification(false);
            setIsAutoPromoted(false);
          }
        }
      } catch (err) {
        // Fallback to stored user info
      }
    }
    fetchProfile();

    return () => {
      window.removeEventListener("skills_updated", handleSkillsUpdated);
    };
  }, []);

  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [measurements, setMeasurements] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [videos, setVideos] = useState([]);
  const [viewingSkillWorks, setViewingSkillWorks] = useState(null);
  const [skillModalInitialAdd, setSkillModalInitialAdd] = useState(false);

  const reloadExperiences = async () => {
    try {
      const data = await getMyWorkExperiences();
      if (Array.isArray(data)) {
        setExperiences(data);
        setWorkExpCount(data.length);
        const expYears = data.length > 0 ? data.length : 0;
        setYearsExperience(prev => Math.max(prev, expYears));

        setProfile(prev => {
          const currentProjects = parseInt(prev.projectsCompleted ?? prev.stats?.[0]?.value ?? 0, 10);
          const currentBrands = parseInt(prev.brandsWorked ?? prev.stats?.[1]?.value ?? 0, 10);
          const currentYears = parseInt(prev.yearsExperience ?? prev.stats?.[2]?.value ?? 0, 10);
          const currentFeat = parseInt(prev.magazineFeatures ?? prev.stats?.[3]?.value ?? 0, 10);

          const uniqueBrands = new Set(data.map(e => (e.company || "").trim()).filter(Boolean)).size;
          const projectsVal = currentProjects > 0 ? currentProjects : data.length;
          const brandsVal = currentBrands > 0 ? currentBrands : uniqueBrands;
          const yearsVal = currentYears > 0 ? currentYears : (data.length > 0 ? Math.max(1, data.length) : 0);

          return {
            ...prev,
            projectsCompleted: projectsVal,
            brandsWorked: brandsVal,
            yearsExperience: yearsVal,
            stats: [
              { value: String(projectsVal), label: "Projects Completed" },
              { value: String(brandsVal), label: "Brands Worked" },
              { value: String(yearsVal), label: "Years Experience" },
              { value: String(currentFeat), label: "Features" }
            ]
          };
        });
      }
    } catch (_) {}
  };

  useEffect(() => {
    reloadExperiences();
    window.addEventListener("work_experience_updated", reloadExperiences);
    return () => window.removeEventListener("work_experience_updated", reloadExperiences);
  }, []);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const items = await getMyPortfolio();
        if (Array.isArray(items)) {
          const urls = items.map(it => getFullImageUrl(it.imageUrl || it.photoUrl || it.url)).filter(Boolean);
          setPortfolioPhotos(urls);
        }
      } catch (e) {
        // Fallback
      }
    }
    fetchHighlights();

    // Fetch measurements, work experience, and videos for Overview cards
    getMyMeasurements().then(d => d && setMeasurements(d)).catch(() => {});
    getMyWorkExperiences().then(d => Array.isArray(d) && setExperiences(d)).catch(() => {});
    getMyVideos().then(d => Array.isArray(d) && setVideos(d)).catch(() => {});
    getShareProfileData().then(setShareData).catch(() => {});
  }, [activeTab]);

  const handlePhotoFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedDataUrl) => {
    // 1. Immediate optimistic UI feedback
    setProfile(prev => ({ ...prev, profilePhoto: croppedDataUrl }));
    localStorage.setItem("bms_profile_photo", croppedDataUrl);
    window.dispatchEvent(new Event("profile_photo_updated"));

    try {
      // 2. Convert base64 data URL to Blob for fast multipart upload to backend
      const res = await fetch(croppedDataUrl);
      const blob = await res.blob();
      const updated = await uploadProfilePhoto(blob);
      if (updated && updated.profilePhoto) {
        const fullPhotoUrl = getFullImageUrl(updated.profilePhoto);
        setProfile(prev => ({ ...prev, profilePhoto: fullPhotoUrl }));
        localStorage.setItem("bms_profile_photo", fullPhotoUrl);
        window.dispatchEvent(new Event("profile_photo_updated"));
      }
    } catch (err) {
      console.error("Failed to upload profile photo to server", err);
      // Fallback: try saving via profile PUT
      try {
        await updateUserProfile({ profilePhoto: croppedDataUrl });
      } catch (e) {
        console.error("Failed fallback profile save", e);
      }
    }
  };

  const handleTogglePrivacy = async () => {
    const newStatus = !isPrivate;
    setIsPrivate(newStatus);
    setPrivacyToggling(true);
    try {
      await updateProfilePrivacy(newStatus);
      if (storedUser) {
        localStorage.setItem("bms_user", JSON.stringify({
          ...storedUser,
          isPrivate: newStatus
        }));
      }
      showSuccess("Privacy Updated", `Your account is now set to ${newStatus ? "Private" : "Public"}.`);
    } catch (err) {
      setIsPrivate(!newStatus);
      showError("Privacy Update Failed", err.message || "Failed to update profile privacy.");
    } finally {
      setPrivacyToggling(false);
    }
  };

  const handleSaveProfile = async (updatedData) => {
    if (typeof updatedData.isPrivate !== "undefined" && updatedData.isPrivate !== isPrivate) {
      try {
        await updateProfilePrivacy(updatedData.isPrivate);
        setIsPrivate(updatedData.isPrivate);
      } catch (err) {
        console.error("Failed to update privacy:", err);
      }
    }

    const rawTypes = updatedData.profileTypes ? updatedData.profileTypes.map(t => String(t).toUpperCase()) : [];
    const singleRawType = rawTypes.length > 0 ? [rawTypes[0]] : [];
    const isOther = singleRawType.length > 0 && singleRawType[0] === "OTHER";
    const customProfession = isOther ? (updatedData.customProfession || "").trim() : "";
    const displayTypes = singleRawType.map(t => t.charAt(0) + t.slice(1).toLowerCase());
    const mainRole = isOther ? (customProfession || "Other") : (displayTypes.length > 0 ? displayTypes[0] : "Talent");

    setProfile(prev => ({
      ...prev,
      ...updatedData,
      role: mainRole,
      customProfession: customProfession,
      profileTypes: displayTypes
    }));

    if (storedUser) {
      const email = (storedUser.email || "").toLowerCase();
      localStorage.setItem("bms_user", JSON.stringify({
        ...storedUser,
        fullName: updatedData.fullName,
        profileTypes: singleRawType,
        customProfession: customProfession,
        isPrivate: typeof updatedData.isPrivate !== "undefined" ? updatedData.isPrivate : isPrivate
      }));
      if (email) {
        if (customProfession) {
          localStorage.setItem(`bms_custom_profession_${email}`, customProfession);
        } else {
          localStorage.removeItem(`bms_custom_profession_${email}`);
        }
      }
    }

    try {
      const saved = await updateUserProfile({
        fullName: updatedData.fullName,
        stageName: updatedData.stageName,
        location: updatedData.location,
        about: updatedData.about,
        languages: updatedData.languages,
        workType: updatedData.workType,
        dayRate: updatedData.rate,
        profileTypes: singleRawType,
        customProfession: customProfession,
      });

      if (saved) {
        const returnedTypes = saved.profileTypes ? Array.from(saved.profileTypes) : singleRawType;
        const formattedDisplayTypes = returnedTypes.slice(0, 1).map(t => t.charAt(0) + t.slice(1).toLowerCase());
        const finalRole = isOther ? (customProfession || "Other") : (formattedDisplayTypes.length > 0 ? formattedDisplayTypes[0] : "Talent");
        setProfile(prev => ({
          ...prev,
          ...saved,
          about: updatedData.about != null ? updatedData.about : (saved.about || prev.about),
          role: finalRole,
          customProfession: customProfession,
          profileTypes: formattedDisplayTypes,
          rate: saved.dayRate || updatedData.rate || prev.rate,
          stats: prev.stats
        }));
      }
      showSuccess("Profile Updated!", "Your profile information has been saved successfully.");
    } catch (e) {
      showError("Profile Update Failed", e.message || "Failed to save profile changes.");
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const age = calculateAge(profile.dob);

  const handleOpenMailto = (e) => {
    e.preventDefault();
    const subject = shareData?.emailSubject || `Official Talent Portfolio - ${profile.fullName} (${shareData?.shareCode || `BMS-${storedUser?.userId || profile.id || 7}`})`;
    const body = shareData?.emailBody || `Dear Casting Director / Production Team,\r\n\r\nI am pleased to share my official talent profile on Book My Stars:\r\n${shareData?.shareUrl || `${window.location.origin}/public-profile/${storedUser?.userId || profile.id || 7}`}\r\n\r\nWarm regards,\r\n${profile.fullName}`;
    const mailto = shareData?.emailUrl || `mailto:?subject=${encodeURIComponent(subject).replace(/\+/g, "%20")}&body=${encodeURIComponent(body).replace(/\+/g, "%20")}`;

    try {
      navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch (_) {}

    const tempLink = document.createElement("a");
    tempLink.href = mailto;
    tempLink.target = "_blank";
    tempLink.rel = "noopener noreferrer";
    document.body.appendChild(tempLink);
    tempLink.click();
    setTimeout(() => {
      try {
        document.body.removeChild(tempLink);
      } catch (_) {}
    }, 500);
  };

  return (
    <AppLayout pageTitle="Profile" profileName={profile.fullName} profilePhoto={profile.profilePhoto}>
      <div className="prof-page-wrapper">
        <div className="prof-layout">

          {/* ═══ LEFT MAIN CONTENT ═══ */}
          <div className="prof-main">

            {/* Experience Verification Banner for Unverified Professionals */}
            {isPendingVerification && (
              <div style={{
                background: "#fffbeb",
                border: "1.5px solid #fde68a",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                boxShadow: "0 2px 6px rgba(245, 158, 11, 0.08)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "24px" }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#92400e" }}>
                      Professional Experience Verification Required
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#b45309", marginTop: "2px" }}>
                      You registered as a Professional. Minimum 1+ year of verified work is required to activate full Professional status. Currently operating under <strong>Talent</strong> mode.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const workTab = document.querySelector('[data-tab="Work Experience"]');
                    if (workTab) workTab.click();
                  }}
                  style={{
                    background: "#d97706",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  + Add Experience Below
                </button>
              </div>
            )}

            {/* Auto-Promotion Banner for Talents with >= 1 Yr Experience (Shown once, dismissible) */}
            {(isAutoPromoted && !promotionBannerDismissed) && (
              <div style={{
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                borderRadius: "12px",
                padding: "14px 20px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>🎉</span>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#166534" }}>
                      Promoted to Professional!
                    </div>
                    <div style={{ fontSize: "12px", color: "#15803d" }}>
                      Congratulations! You have verified industry experience with completed work and have been automatically upgraded to <strong>Professional</strong> status!
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDismissPromotionBanner}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#166534",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px"
                  }}
                  title="Dismiss notification"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* ── Profile Header Card ── */}
            <div className="prof-header-card" style={{ position: "relative" }}>

              {/* Private / Public Toggle Switch placed at the right end of this section */}
              <button
                type="button"
                onClick={handleTogglePrivacy}
                disabled={privacyToggling}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  zIndex: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isPrivate ? "1.5px solid #ef4444" : "1.5px solid #10b981",
                  backgroundColor: isPrivate ? "#fef2f2" : "#ecfdf5",
                  color: isPrivate ? "#dc2626" : "#059669",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  whiteSpace: "nowrap"
                }}
                title={isPrivate ? "Profile is Private. Click to switch to Public" : "Profile is Public. Click to switch to Private"}
              >
                {isPrivate ? <Lock size={13} /> : <Globe size={13} />}
                <span>{isPrivate ? "Private" : "Public"}</span>
                {/* Interactive iOS / Instagram Toggle Pill Track */}
                <div style={{
                  width: "32px",
                  height: "18px",
                  borderRadius: "10px",
                  backgroundColor: isPrivate ? "#ef4444" : "#10b981",
                  position: "relative",
                  transition: "background-color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px"
                }}>
                  <div style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    transform: isPrivate ? "translateX(14px)" : "translateX(0px)",
                    transition: "transform 0.2s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                  }} />
                </div>
              </button>

              {/* Main row: photo | info+bio */}
              <div className="prof-card-main">

                {/* Photo container */}
                <div
                  className="prof-photo-col"
                  style={{
                    position: "relative",
                    width: "215px",
                    minWidth: "215px",
                    minHeight: "240px",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e2e8f0",
                    flexShrink: 0,
                    alignSelf: "stretch"
                  }}
                >
                  {profile.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={profile.fullName}
                      className="prof-main-photo"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "50%",
                          background: "#fce7f3",
                          border: "2px dashed #e91e8c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 12px",
                          color: "#e91e8c",
                          fontSize: "24px",
                          fontWeight: "800"
                        }}
                      >
                        {profile.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: "600", margin: 0 }}>No Photo</p>
                    </div>
                  )}

                  {/* Add / Change / Crop Photo Buttons */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      zIndex: 3,
                      maxWidth: "92%"
                    }}
                  >
                    <label
                      style={{
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(4px)",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Camera size={13} />
                      <span>{profile.profilePhoto ? "Change" : "+ Add Photo"}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileSelected}
                        style={{ display: "none" }}
                      />
                    </label>

                    {profile.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setCropImageSrc(profile.profilePhoto);
                          setCropModalOpen(true);
                        }}
                        style={{
                          background: "rgba(233, 30, 140, 0.9)",
                          backdropFilter: "blur(4px)",
                          color: "#fff",
                          padding: "6px 11px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                          whiteSpace: "nowrap"
                        }}
                        title="Crop or adjust current photo"
                      >
                        <Crop size={12} />
                        <span>Crop</span>
                      </button>
                    )}
                  </div>

                  <span className="prof-avail-badge" style={{ top: "10px", left: "10px", bottom: "auto", position: "absolute", zIndex: 4 }}>
                    <span className="prof-avail-dot" />
                    Available
                  </span>
                </div>

                {/* Right side: info + bio */}
                <div className="prof-card-right" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "8px", paddingRight: "135px" }}>

                  {/* 1. Header Line: Name + Profession Badge + Professional Tier + [+ Add Skill] */}
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <h2 className="prof-name" style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e293b", lineHeight: 1.2 }}>
                        {profile.fullName}
                      </h2>
                      <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
                        <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z" fill="#e91e8c"/>
                        <path d="M10 14.17L7.41 11.59 6 13l4 4 9-9-1.41-1.41z" fill="#fff"/>
                      </svg>
                    </div>

                    {/* Primary Profession */}
                    {(() => {
                      const primaryType = Array.isArray(profile.profileTypes) && profile.profileTypes.length > 0
                        ? profile.profileTypes[0]
                        : (profile.role ? profile.role.split(" · ")[0] : "Talent");
                      const isOther = primaryType.toUpperCase() === "OTHER";
                      const customProf = isOther
                        ? (profile.customProfession || storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`))
                        : "";
                      const isOtherWithoutCustom = isOther && !customProf;
                      const displayProfName = isOther ? (customProf || "Other") : primaryType;
                      return (
                        <span style={{
                          background: isOtherWithoutCustom ? "#fef2f2" : "#f1f5f9",
                          color: isOtherWithoutCustom ? "#b91c1c" : "#0f172a",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "800",
                          border: isOtherWithoutCustom ? "1.5px dashed #f87171" : "1px solid #cbd5e1",
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px"
                        }}>
                          <span>🎭 {displayProfName}</span>
                          <button
                            type="button"
                            onClick={() => setShowEditModal(true)}
                            style={{
                              background: isOtherWithoutCustom ? "#dc2626" : "transparent",
                              color: isOtherWithoutCustom ? "#ffffff" : "#64748b",
                              border: isOtherWithoutCustom ? "none" : "1px solid #cbd5e1",
                              borderRadius: "4px",
                              padding: "1px 4px",
                              fontSize: "9.5px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                            title="Click to edit your profession"
                          >
                            {isOtherWithoutCustom ? "+ Set" : "✏️"}
                          </button>
                        </span>
                      );
                    })()}

                    {/* Tier badge */}
                    <span style={{
                      background: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "#eff6ff" : "#ecfdf5",
                      color: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "#1d4ed8" : "#047857",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      border: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "1px solid #bfdbfe" : "1px solid #a7f3d0"
                    }}>
                      {(isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "🎬 Professional (1+ Yrs)" : "🌟 Talent (< 1 Yr)"}
                    </span>

                    {/* + Add Skill */}
                    <button
                      type="button"
                      onClick={() => setShowSkillModal(true)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        background: "#ee008f",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "14px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 1px 4px rgba(238, 0, 143, 0.25)"
                      }}
                    >
                      <Plus size={11} /> Add Skill
                    </button>
                  </div>

                  {/* 2. Added Specialized Skills Row */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>

                    {skills && skills.map((skill) => {
                      const worksForSkill = experiences.filter(
                        w => (w.category || "").toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 9px",
                            background: "#fdf2f8",
                            border: "1px solid #fbcfe8",
                            borderRadius: "14px",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#be185d"
                          }}
                        >
                          <span
                            onClick={() => handleViewSkillWorks(skill)}
                            style={{ cursor: "pointer" }}
                            title={`Click to view, add, or manage works for ${skill} (${worksForSkill.length} works)`}
                          >
                            ✨ {skill} ({worksForSkill.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#db2777",
                              cursor: "pointer",
                              padding: "0 2px",
                              fontSize: "11px",
                              fontWeight: "700",
                              lineHeight: 1,
                              display: "inline-flex",
                              alignItems: "center"
                            }}
                            title={`Remove ${skill}`}
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {/* 3. Two-Column Middle Section: Details on Left, Bio & Actions on Right */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "10px", alignItems: "stretch", flex: 1 }}>
                    
                    {/* Left Box: Compact Meta Information */}
                    <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 8px", fontSize: "11.5px", color: "#475569" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                          <MapPin size={11} className="prof-meta-icon" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.location || "Add Location"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Calendar size={11} className="prof-meta-icon" style={{ flexShrink: 0 }} />
                          <span>{age ? `${age} Yrs` : "Age N/A"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                          <Globe size={11} className="prof-meta-icon" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.languages || "Languages"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                          <Briefcase size={11} className="prof-meta-icon" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.workType || "Freelance"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#e91e8c", fontWeight: "700" }}>
                          <span style={{ fontSize: "12px" }}>₹</span>
                          <span>{profile.rate || "Flexible"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontWeight: "600", fontSize: "11px" }}>
                          <span>⭐ New Talent</span>
                        </div>
                      </div>
                      {profile.rateNote && (
                        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>
                          {profile.rateNote}
                        </div>
                      )}
                    </div>

                    {/* Right Box: Bio & Actions */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "6px" }}>
                      <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "10px", border: "1px solid #e2e8f0", flex: 1, minHeight: "50px", overflow: "hidden" }}>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "2px" }}>About</div>
                        <p style={{ fontSize: "11.5px", color: "#475569", margin: 0, lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "pre-line" }}>
                          {profile.about || "Welcome to my official profile."}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => setShowEditModal(true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "#e91e8c",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "7px",
                            padding: "6px 14px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(233, 30, 140, 0.2)"
                          }}
                        >
                          <Edit3 size={12} /> Edit Profile
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowShareModal(true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "#ffffff",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            borderRadius: "7px",
                            padding: "6px 12px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          <Share2 size={12} color="#e91e8c" /> Share Profile
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="prof-tab-bar">
              {TABS.map(tab => {
                const key = tab.toLowerCase().replace(/ /g, "-");
                return (
                  <PagesButton
                    key={key}
                    id={`prof-tab-${key}`}
                    className={`prof-tab-btn ${activeTab === key ? "prof-tab-btn--active" : ""}`}
                    onClick={() => {
                      setTargetSkillForWork(null);
                      setActiveTab(key);
                    }}
                  >
                    {tab}
                  </PagesButton>
                );
              })}
            </div>

            {/* ══ OVERVIEW TAB ══ */}
            {activeTab === "overview" && (
              <OverviewTab
                profile={profile}
                portfolioPhotos={portfolioPhotos}
                measurements={measurements}
                experiences={experiences}
                videos={videos}
                reviews={[]}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* Availability Tab */}
            {activeTab === "availability" && <AvailabilityTab />}

            {/* Portfolio Tab */}
            {activeTab === "portfolio" && <PortfolioTab />}

            {/* Work Experience Tab */}
            {activeTab === "work-experience" && (
              <WorkExperienceTab
                autoOpenSkill={targetSkillForWork}
                initialFilter={targetSkillFilter}
                onAddSkillClick={() => setShowSkillModal(true)}
              />
            )}

            {/* Measurements Tab */}
            {activeTab === "measurements" && <MeasurementsTab />}

            {/* Videos Tab */}
            {activeTab === "videos" && <VideosTab />}

            {/* Reviews Tab */}
            {activeTab === "reviews" && <ReviewsTab />}

            {/* Rates Tab */}
            {activeTab === "rates" && <RatesTab />}
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <div className="prof-right-sidebar">

            {/* Profile Details / Verification Card */}
            <div className="prof-sidebar-card">
              <h3 className="prof-sidebar-card-title">Profile Details</h3>
              <div className="prof-detail-row">
                <span className="prof-detail-label">Member Since</span>
                <span className="prof-detail-value">{profile.memberSince || "—"}</span>
              </div>
              <div className="prof-detail-row">
                <span className="prof-detail-label">Profile Type</span>
                <span className="prof-detail-value prof-verified-badge">
                  ✓ Verified {(() => {
                    const primaryType = Array.isArray(profile.profileTypes) && profile.profileTypes.length > 0
                      ? profile.profileTypes[0]
                      : (profile.role ? profile.role.split(" · ")[0] : "Talent");
                    const isOther = primaryType.toUpperCase() === "OTHER";
                    const customProf = isOther ? (profile.customProfession || storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`)) : "";
                    return isOther ? (customProf || "Other") : primaryType;
                  })()}
                </span>
              </div>
              <div className="prof-verify-items">
                {["ID Verified", "Phone Verified", "Email Verified"].map((item, i) => (
                  <div key={i} className="prof-verify-item">
                    <CheckCircle2 size={15} className="prof-check-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="prof-sidebar-card">
              <h3 className="prof-sidebar-card-title">Categories</h3>
              <ul className="prof-cat-list">
                {(() => {
                  const primaryCat = Array.isArray(profile.profileTypes) && profile.profileTypes.length > 0
                    ? profile.profileTypes[0]
                    : (profile.role ? profile.role.split(" · ")[0] : "Talent");
                  const isOther = primaryCat.toUpperCase() === "OTHER";
                  const customProf = isOther ? (profile.customProfession || storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`)) : "";
                  const displayCat = isOther ? (customProf || "Other") : primaryCat;
                  return (
                    <li className="prof-cat-item">
                      <span className="prof-cat-dot" />
                      {displayCat}
                    </li>
                  );
                })()}
              </ul>
            </div>

            {/* Availability */}
            <div className="prof-sidebar-card">
              <h3 className="prof-sidebar-card-title">Availability</h3>
              <div className="prof-avail-row">
                <span className="prof-green-dot" />
                <span className="prof-avail-text">Available</span>
                <span className="prof-diamond">◆</span>
                <span>Open for new projects</span>
              </div>
              <div className="prof-next-avail">
                <span className="prof-next-label">Next Available</span>
                <span className="prof-next-date">{profile.nextAvailable || "Available Now"}</span>
              </div>
              <PagesButton
                id="prof-view-cal-btn"
                className="prof-cal-btn"
                onClick={() => setActiveTab("availability")}
              >
                View Calendar
              </PagesButton>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={{ ...profile, isPrivate }}
        onSave={handleSaveProfile}
      />

      {/* Crop Photo Modal */}
      <CropPhotoModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={4 / 5}
      />

      {/* Share Profile Modal */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Share Talent Profile</h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Share2 size={28} color="#e91e8c" />
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "#0f172a" }}>Public Portfolio Link</h4>
              {shareData?.shareCode && (
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#e91e8c", background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "4px 10px", borderRadius: "20px", display: "inline-block" }}>
                    Talent ID: {shareData.shareCode}
                  </span>
                </div>
              )}
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                Anyone with this link can view your portfolio, showreels, bio, and measurements. Inquiries and bookings will route back to Book My Stars.
              </p>

              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input
                  type="text"
                  readOnly
                  value={shareData?.shareUrl || `${window.location.origin}/public-profile/${storedUser?.userId || profile.id || 7}`}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#334155"
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const link = shareData?.shareUrl || `${window.location.origin}/public-profile/${storedUser?.userId || profile.id || 7}`;
                    navigator.clipboard.writeText(link);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2500);
                  }}
                  style={{
                    backgroundColor: "#e91e8c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {shareCopied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                <a
                  href={shareData?.whatsappUrl || `https://api.whatsapp.com/send?text=${encodeURIComponent(`Official Talent & Casting Profile: ${profile.fullName}\n\nDear Casting Director / Production Team,\n\nPlease review my verified talent portfolio, showreels, and physical attributes on Book My Stars:\n${shareData?.shareUrl || `${window.location.origin}/public-profile/${storedUser?.userId || profile.id || 7}`}\n\nTalent ID: ${shareData?.shareCode || `BMS-${storedUser?.userId || profile.id || 7}`}\nAvailable for casting calls, commercials, fashion shoots, and feature productions.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#22c55e",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "10px 8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  title="Share directly via WhatsApp"
                >
                  WhatsApp
                </a>
                <a
                  href={shareData?.gmailUrl || `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(`Official Talent Portfolio - ${profile.fullName} (${shareData?.shareCode || `BMS-${storedUser?.userId || profile.id || 7}`})`).replace(/\+/g, "%20")}&body=${encodeURIComponent(`Dear Casting Director / Production Team,\r\n\r\nI am pleased to share my official talent profile and portfolio on Book My Stars:\r\n\r\nProfile & Showreels: ${shareData?.shareUrl || `${window.location.origin}/public-profile/${storedUser?.userId || profile.id || 7}`}\r\nTalent ID: ${shareData?.shareCode || `BMS-${storedUser?.userId || profile.id || 7}`}\r\n\r\nAvailable for casting calls, commercial campaigns, fashion shoots, and feature productions.\r\n\r\nWarm regards,\r\n${profile.fullName}`).replace(/\+/g, "%20")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#ea4335",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "10px 8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  title="Open directly in Gmail web composer"
                >
                  Gmail
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <a
                  href={shareData?.outlookUrl || `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(`Official Talent Portfolio - ${profile.fullName} (${shareData?.shareCode || `BMS-${storedUser?.userId || profile.id || 7}`})`).replace(/\+/g, "%20")}&body=${encodeURIComponent(`Dear Casting Director / Production Team,\r\n\r\nI am pleased to share my official talent profile and portfolio on Book My Stars:\r\n\r\nProfile & Showreels: ${shareData?.shareUrl || `${window.location.origin}/public-profile/${storedUser?.userId || profile.id || 7}`}\r\nTalent ID: ${shareData?.shareCode || `BMS-${storedUser?.userId || profile.id || 7}`}\r\n\r\nAvailable for casting calls, commercial campaigns, fashion shoots, and feature productions.\r\n\r\nWarm regards,\r\n${profile.fullName}`).replace(/\+/g, "%20")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#0078d4",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "10px 8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  title="Open directly in Outlook web composer"
                >
                  Outlook Web
                </a>
                <button
                  type="button"
                  onClick={handleOpenMailto}
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer"
                  }}
                  title="Open default email application and copy invitation text"
                >
                  Email App
                </button>
              </div>

              <a
                href={shareData?.shareUrl || `${window.location.origin}/public-profile/${storedUser?.userId || profile.id || 7}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#e91e8c",
                  textDecoration: "none",
                  marginTop: "8px"
                }}
              >
                <span>Preview Public View</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Skill Management Modal */}
      <SkillManagementModal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        skills={skills}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
      />

      {/* Skill Works Management Modal */}
      {viewingSkillWorks && (
        <SkillWorksModal
          skill={viewingSkillWorks}
          isOpen={Boolean(viewingSkillWorks)}
          initialAdd={skillModalInitialAdd}
          onClose={() => {
            setViewingSkillWorks(null);
            setSkillModalInitialAdd(false);
          }}
          experiences={experiences}
          onWorkUpdated={reloadExperiences}
        />
      )}
    </AppLayout>
  );
}
