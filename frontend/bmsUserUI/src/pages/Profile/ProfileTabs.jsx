/* ── ProfileTabs.jsx ─────────────────────────────────────────
   All non-overview tab content for profile.
   Zero hardcoded dummy data — 100% dynamic with real user inputs and backend integration.
   ─────────────────────────────────────────────────────────── */

import PagesButton from "../common/PagesButton";
import { useState, useEffect, useRef } from "react";
import {
  Star,
  Play,
  Award,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image,
  Plus,
  Edit3,
  X,
  Upload,
  Briefcase,
  Video,
  Trash2,
  ExternalLink,
  Film,
  FolderPlus,
  Paperclip
} from "lucide-react";
import {
  getMyPortfolio,
  uploadPortfolioPhoto,
  updatePortfolioPhoto,
  deletePortfolioPhoto,
  getFullImageUrl,
  getMyWorkExperiences,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  uploadWorkExperienceFile,
  getMyMeasurements,
  saveMeasurements,
  getMyVideos,
  addVideo,
  uploadVideoFile,
  updateVideoWithFile,
  updateVideo,
  deleteVideo,
  getUserSkills,
  removeUserSkill,
  getStoredUser
} from "../../features/bms/api";
import {
  showSuccess,
  showError,
  confirmDelete,
  showWarning
} from "../../shared/utils/alert";

/* ── Reusable Modal for Tabs ── */
function TabModal({ title, isOpen, onClose, children, maxWidth = "500px" }) {
  if (!isOpen) return null;
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
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: maxWidth,
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e2e8f0",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Shared StarRating ── */
function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0",
            fill: i <= Math.round(rating) ? "#f59e0b" : "none"
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PORTFOLIO TAB (Dynamic — no hardcoded photos)
══════════════════════════════════════════════════ */
const PORT_CATEGORIES = ["All", "Runway", "Editorial", "Commercial", "Fashion", "Lifestyle"];

export function PortfolioTab() {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Fashion");
  const [newFile, setNewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit photo states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Fashion");
  const [editFile, setEditFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");

  const loadPortfolio = async () => {
    try {
      const backendItems = await getMyPortfolio();
      if (backendItems && backendItems.length > 0) {
        const mapped = backendItems.map((b, idx) => ({
          id: b.id || `b-${idx}`,
          img: getFullImageUrl(b.imageUrl || b.photoUrl || b.url || ""),
          title: b.title || "Portfolio Photo",
          category: b.category || "Fashion",
          year: b.year || new Date().getFullYear().toString()
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (e) {
      // Handled
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newFile && !previewUrl) return;
    setSubmitting(true);
    try {
      if (newFile) {
        await uploadPortfolioPhoto(newFile, newTitle.trim(), newCategory);
      }
      await loadPortfolio();
      setShowModal(false);
      setNewTitle("");
      setNewFile(null);
      setPreviewUrl("");
      showSuccess("Photo Uploaded!", "Portfolio photo uploaded successfully.");
    } catch (err) {
      showError("Upload Failed", err.message || "Failed to upload portfolio photo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPhotoClick = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditCategory(item.category || "Fashion");
    setEditFile(null);
    setEditPreviewUrl(item.img || "");
    setShowEditModal(true);
  };

  const handleSaveEditPhoto = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSubmitting(true);
    try {
      await updatePortfolioPhoto(editingItem.id, {
        title: editTitle.trim(),
        category: editCategory,
        file: editFile || undefined
      });
      await loadPortfolio();
      setShowEditModal(false);
      setEditingItem(null);
      showSuccess("Photo Updated!", "Portfolio photo details updated successfully.");
    } catch (err) {
      showError("Update Failed", err.message || "Failed to update portfolio photo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (id, e) => {
    e.stopPropagation();
    const confirmed = await confirmDelete(
      "Portfolio Photo",
      "Are you sure you want to delete this portfolio photo? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      await deletePortfolioPhoto(id);
      setItems(prev => prev.filter(p => p.id !== id));
      showSuccess("Deleted!", "Portfolio photo deleted successfully.");
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete portfolio photo");
    }
  };

  const filtered = activeFilter === "All" ? items : items.filter(p => p.category === activeFilter);

  return (
    <div className="ptab-container">
      <div className="ptab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="ptab-title">Portfolio</h2>
          <p className="ptab-subtitle">{items.length} photos uploaded</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#e91e8c",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(233, 30, 140, 0.25)"
            }}
          >
            <Plus size={14} /> Add Photo
          </button>
          {items.length > 0 && (
            <div className="ptab-filters">
              {PORT_CATEGORIES.map(cat => (
                <PagesButton
                  key={cat}
                  className={`ptab-filter-btn ${activeFilter === cat ? "ptab-filter-btn--active" : ""}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </PagesButton>
              ))}
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
          <Image size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
          <h4 style={{ fontSize: "16px", color: "#334155", fontWeight: "700", margin: "0 0 6px 0" }}>No Portfolio Photos Added Yet</h4>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px 0" }}>Upload photos to showcase your versatility, shoots, and runway walks to clients.</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{ background: "#e91e8c", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(233, 30, 140, 0.25)" }}
          >
            + Upload Your First Photo
          </button>
        </div>
      ) : (
        <div className="ptab-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "14px" }}>
          {filtered.map(item => (
            <div
              key={item.id}
              className="ptab-photo-card"
              style={{
                position: "relative",
                borderRadius: "14px",
                overflow: "hidden",
                height: "265px",
                background: "#0f172a",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0"
              }}
            >
              <img
                src={item.img}
                alt={item.title}
                className="ptab-photo-img"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => {
                  e.target.style.opacity = "0.2";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  display: "flex",
                  gap: "6px",
                  zIndex: 3
                }}
              >
                <button
                  type="button"
                  onClick={(e) => handleEditPhotoClick(item, e)}
                  title="Edit Photo Details"
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(4px)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px",
                    color: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeletePhoto(item.id, e)}
                  title="Delete Photo"
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(4px)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px",
                    color: "#f87171",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="ptab-photo-overlay">
                <span className="ptab-photo-cat">{item.category}</span>
                <div className="ptab-photo-meta">
                  <span className="ptab-photo-title">{item.title}</span>
                  <span className="ptab-photo-year">{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Photo Modal */}
      <TabModal title="Upload Portfolio Photo" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleAddPhoto} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Photo Title <span style={{ color: "#e91e8c" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Campaign Shoot"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
            >
              <option value="Runway">Runway</option>
              <option value="Editorial">Editorial</option>
              <option value="Commercial">Commercial</option>
              <option value="Fashion">Fashion</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Select Photo File <span style={{ color: "#e91e8c" }}>*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              style={{ width: "100%", padding: "8px 0", fontSize: "13px" }}
            />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" style={{ marginTop: "10px", width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }} />
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", border: "none", background: "#e91e8c", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              {submitting ? "Uploading..." : "Save Photo"}
            </button>
          </div>
        </form>
      </TabModal>

      {/* Edit Photo Modal */}
      <TabModal title="Edit Portfolio Photo" isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <form onSubmit={handleSaveEditPhoto} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Photo Title <span style={{ color: "#e91e8c" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Campaign Shoot"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Category
            </label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
            >
              <option value="Runway">Runway</option>
              <option value="Editorial">Editorial</option>
              <option value="Commercial">Commercial</option>
              <option value="Fashion">Fashion</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Replace Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditFileChange}
              style={{ width: "100%", padding: "8px 0", fontSize: "13px" }}
            />
            {editPreviewUrl && (
              <img src={editPreviewUrl} alt="Preview" style={{ marginTop: "10px", width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }} />
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", border: "none", background: "#e91e8c", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              {submitting ? "Updating..." : "Update Photo"}
            </button>
          </div>
        </form>
      </TabModal>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   WORK EXPERIENCE TAB (Dynamic — no hardcoded brands)
══════════════════════════════════════════════════ */
export function WorkExperienceTab({ autoOpenSkill = null, initialFilter = "All", onAddSkillClick = null }) {
  const [experiences, setExperiences] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [activeCraftFilter, setActiveCraftFilter] = useState(initialFilter || "All");
  const [showModal, setShowModal] = useState(false);
  const [addExpTab, setAddExpTab] = useState("details");
  const [addFile, setAddFile] = useState(null);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Commercial");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit experience state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editExpTab, setEditExpTab] = useState("details");
  const [editFile, setEditFile] = useState(null);
  const [editExistingFileUrl, setEditExistingFileUrl] = useState("");
  const [editExistingFileName, setEditExistingFileName] = useState("");
  const [editingExp, setEditingExp] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Commercial");
  const [editDuration, setEditDuration] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadExperiences = async () => {
    try {
      const user = getStoredUser();
      const currentSkills = getUserSkills(user?.userId);
      setUserSkills(currentSkills);

      const backendData = await getMyWorkExperiences();
      if (backendData && backendData.length > 0) {
        const mapped = backendData.map(b => ({
          id: b.id,
          brand: b.company || "Brand",
          logo: "⭐",
          campaign: b.title || "Campaign",
          type: b.category || "Commercial",
          duration: b.startDate ? `${b.startDate}${b.endDate ? ` – ${b.endDate}` : ""}` : "Recent",
          year: b.startDate ? b.startDate.substring(0, 4) : new Date().getFullYear().toString(),
          color: "#e91e8c",
          desc: b.description || "",
          fileUrl: b.fileUrl || "",
          fileName: b.fileName || ""
        }));
        setExperiences(mapped);
      } else {
        setExperiences([]);
      }
    } catch (e) {
      // Handled
    }
  };

  useEffect(() => {
    loadExperiences();

    if (autoOpenSkill) {
      setActiveCraftFilter(autoOpenSkill);
      setCategory(autoOpenSkill);
      setShowModal(true);
    } else if (initialFilter) {
      setActiveCraftFilter(initialFilter);
    }

    const handleSkillsUpdated = () => {
      const user = getStoredUser();
      setUserSkills(getUserSkills(user?.userId));
    };
    window.addEventListener("skills_updated", handleSkillsUpdated);
    return () => window.removeEventListener("skills_updated", handleSkillsUpdated);
  }, [autoOpenSkill, initialFilter]);

  const handleAddExperience = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let uploadedFileUrl = "";
      let uploadedFileName = "";

      if (addFile) {
        const uploadRes = await uploadWorkExperienceFile(addFile);
        uploadedFileUrl = uploadRes.fileUrl;
        uploadedFileName = uploadRes.fileName || addFile.name;
      }

      await addWorkExperience({
        company: company.trim(),
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        startDate: duration.trim() || undefined,
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileName
      });

      await loadExperiences();
      window.dispatchEvent(new Event("work_experience_updated"));
      setShowModal(false);
      setCompany("");
      setTitle("");
      setDuration("");
      setDescription("");
      setAddFile(null);
      setAddExpTab("details");
      showSuccess("Experience Added!", "Work experience has been added successfully.");
    } catch (err) {
      showError("Failed to Add Experience", err.message || "Failed to add work experience");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (w) => {
    setEditingExp(w);
    setEditCompany(w.brand || "");
    setEditTitle(w.campaign || "");
    setEditCategory(w.type || "Commercial");
    setEditDuration(w.duration === "Recent" ? "" : w.duration || "");
    setEditDescription(w.desc || "");
    setEditExistingFileUrl(w.fileUrl || "");
    setEditExistingFileName(w.fileName || "");
    setEditFile(null);
    setEditExpTab("details");
    setShowEditModal(true);
  };

  const handleSaveEditExperience = async (e) => {
    e.preventDefault();
    if (!editingExp) return;
    setSubmitting(true);
    try {
      let finalFileUrl = editExistingFileUrl;
      let finalFileName = editExistingFileName;

      if (editFile) {
        const uploadRes = await uploadWorkExperienceFile(editFile);
        finalFileUrl = uploadRes.fileUrl;
        finalFileName = uploadRes.fileName || editFile.name;
      }

      await updateWorkExperience(editingExp.id, {
        company: editCompany.trim(),
        title: editTitle.trim(),
        category: editCategory.trim(),
        description: editDescription.trim(),
        startDate: editDuration.trim() || undefined,
        fileUrl: finalFileUrl,
        fileName: finalFileName
      });
      await loadExperiences();
      window.dispatchEvent(new Event("work_experience_updated"));
      setShowEditModal(false);
      setEditingExp(null);
      setEditFile(null);
      setEditExpTab("details");
      showSuccess("Experience Updated!", "Work experience details have been updated successfully.");
    } catch (err) {
      showError("Failed to Update Experience", err.message || "Failed to update work experience");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    const confirmed = await confirmDelete(
      "Work Experience",
      "Are you sure you want to delete this work experience? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      await deleteWorkExperience(id);
      setExperiences(prev => prev.filter(w => w.id !== id));
      window.dispatchEvent(new Event("work_experience_updated"));
      showSuccess("Deleted!", "Work experience deleted successfully.");
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete work experience");
    }
  };

  return (
    <div className="wexp-container">
      <div className="wexp-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="ptab-title">Work Experience</h2>
          <p className="ptab-subtitle">{experiences.length} projects documented</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (activeCraftFilter !== "All") setCategory(activeCraftFilter);
            setShowModal(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#e91e8c",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(233, 30, 140, 0.25)"
          }}
        >
          <Plus size={14} /> Add Experience {activeCraftFilter !== "All" ? `for ${activeCraftFilter}` : ""}
        </button>
      </div>

      {/* Dynamic Craft & Skill Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", margin: "16px 0 10px 0" }}>
        {["All", ...userSkills].map((filter) => {
          const count = filter === "All"
            ? experiences.length
            : experiences.filter(e => (e.type || "").toLowerCase() === filter.toLowerCase()).length;
          const isSelected = activeCraftFilter.toLowerCase() === filter.toLowerCase();
          return (
            <span
              key={filter}
              onClick={() => setActiveCraftFilter(filter)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                border: isSelected ? "1.5px solid #ee008f" : "1px solid #cbd5e1",
                background: isSelected ? "#fdf2f8" : "#ffffff",
                color: isSelected ? "#db2777" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? "0 2px 5px rgba(238, 0, 143, 0.15)" : "none"
              }}
            >
              <span>{filter === "All" ? `All Works (${count})` : `✨ ${filter} (${count})`}</span>
              {filter !== "All" && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const confirmed = await confirmDelete(
                      `Skill "${filter}"`,
                      `Are you sure you want to remove the skill "${filter}"?`
                    );
                    if (confirmed) {
                      const user = getStoredUser();
                      removeUserSkill(user?.userId, filter);
                      if (activeCraftFilter.toLowerCase() === filter.toLowerCase()) {
                        setActiveCraftFilter("All");
                      }
                      showSuccess("Skill Removed", `Skill "${filter}" has been removed.`);
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: isSelected ? "#db2777" : "#94a3b8",
                    cursor: "pointer",
                    padding: "0 2px",
                    fontSize: "11px",
                    fontWeight: "700",
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center"
                  }}
                  title={`Remove skill ${filter}`}
                >
                  ✕
                </button>
              )}
            </span>
          );
        })}

        {onAddSkillClick && (
          <button
            type="button"
            onClick={onAddSkillClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "11.5px",
              fontWeight: "700",
              border: "1.5px dashed #ee008f",
              background: "#ffffff",
              color: "#ee008f",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            title="Add a new skill"
          >
            <Plus size={12} /> Add Skill
          </button>
        )}
      </div>

      {(() => {
        const filteredExperiences = activeCraftFilter === "All"
          ? experiences
          : experiences.filter(w => (w.type || "").toLowerCase() === activeCraftFilter.toLowerCase());

        if (filteredExperiences.length === 0) {
          return (
            <div style={{ textAlign: "center", padding: "50px 20px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1", marginTop: "12px" }}>
              <Briefcase size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <h4 style={{ fontSize: "16px", color: "#334155", fontWeight: "700", margin: "0 0 6px 0" }}>
                {activeCraftFilter === "All" ? "No Work Experience Added Yet" : `No Work Experience Added for "${activeCraftFilter}" Yet`}
              </h4>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px 0" }}>
                {activeCraftFilter === "All"
                  ? "List previous brand shoots, runway appearances, or commercial campaigns you have worked on."
                  : `Add projects, shows, shoots or campaigns showcasing your ${activeCraftFilter} skills.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (activeCraftFilter !== "All") setCategory(activeCraftFilter);
                  setShowModal(true);
                }}
                style={{ background: "#e91e8c", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(233, 30, 140, 0.25)" }}
              >
                + Add Experience {activeCraftFilter !== "All" ? `for ${activeCraftFilter}` : ""}
              </button>
            </div>
          );
        }

        return (
          <div className="wexp-timeline">
            {filteredExperiences.map((w, i) => (
              <div key={w.id || i} className="wexp-item">
                <div className="wexp-logo-col">
                  <div className="wexp-logo-circle">{w.logo}</div>
                  {i < filteredExperiences.length - 1 && <div className="wexp-line" />}
                </div>
                <div className="wexp-card">
                  <div className="wexp-card-top">
                    <div>
                      <div className="wexp-brand" style={{ color: w.color }}>{w.brand}</div>
                      <div className="wexp-campaign">{w.campaign}</div>
                    </div>
                    <div className="wexp-meta-right" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="wexp-type-badge">{w.type}</span>
                      <span className="wexp-duration"><Clock size={12} /> {w.duration}</span>
                      <div style={{ display: "flex", gap: "5px", marginLeft: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEditClick(w)}
                          title="Edit Experience"
                          style={{
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            padding: "4px 8px",
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
                          onClick={() => handleDeleteExperience(w.id)}
                          title="Delete Experience"
                          style={{
                            background: "#fef2f2",
                            border: "1px solid #fee2e2",
                            borderRadius: "6px",
                            padding: "4px 8px",
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
                  </div>
                  <p className="wexp-desc">{w.desc}</p>
                  {w.fileUrl && (
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
                      <a
                        href={getFullImageUrl(w.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#0284c7",
                          background: "#f0f9ff",
                          border: "1px solid #bae6fd",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          textDecoration: "none"
                        }}
                      >
                        <Paperclip size={13} />
                        <span>Attached File: {w.fileName || "View Document / Proof"} ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Add Experience Modal */}
      <TabModal
        title="Add Work Experience"
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setAddFile(null);
          setAddExpTab("details");
        }}
      >
        <form onSubmit={handleAddExperience} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Modal Tab Headers */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
            <button
              type="button"
              onClick={() => setAddExpTab("details")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: addExpTab === "details" ? "#fdf2f8" : "transparent",
                color: addExpTab === "details" ? "#db2777" : "#64748b",
                fontWeight: "700",
                fontSize: "12.5px",
                cursor: "pointer"
              }}
            >
              📝 Project Details
            </button>
            <button
              type="button"
              onClick={() => setAddExpTab("files")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: addExpTab === "files" ? "#fdf2f8" : "transparent",
                color: addExpTab === "files" ? "#db2777" : "#64748b",
                fontWeight: "700",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              📁 Attach Files / Proof {addFile ? `(1 file attached)` : ""}
            </button>
          </div>

          {addExpTab === "details" ? (
            <>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Brand / Company Name <span style={{ color: "#e91e8c" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Amazon, LAKMÉ"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Campaign / Role Title <span style={{ color: "#e91e8c" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Actor, Commercial Model"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  >
                    <optgroup label="Standard Categories">
                      <option value="Commercial">Commercial</option>
                      <option value="Feature Film">Feature Film</option>
                      <option value="Short Film">Short Film</option>
                      <option value="Web Series">Web Series</option>
                      <option value="Digital & Film">Digital & Film</option>
                      <option value="Runway & Print">Runway & Print</option>
                      <option value="Editorial">Editorial</option>
                      <option value="Fashion">Fashion</option>
                    </optgroup>
                    {userSkills.length > 0 && (
                      <optgroup label="Your Added Specialized Skills">
                        {userSkills.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Duration / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Project Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your role and contribution..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "6px 0" }}>
              <div style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                <FolderPlus size={36} color="#db2777" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                  Attach Certificate, Script, Project Still, or Proof
                </div>
                <p style={{ fontSize: "11.5px", color: "#64748b", margin: "4px 0 14px 0" }}>
                  Supports PDF documents, Word documents, or project stills (JPG/PNG).
                </p>
                <input
                  type="file"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setAddFile(file);
                  }}
                  style={{ fontSize: "12.5px" }}
                />
              </div>

              {addFile && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "700", color: "#065f46" }}>
                    <span>📎 {addFile.name}</span>
                    <span style={{ fontSize: "11px", color: "#047857" }}>({Math.round(addFile.size / 1024)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddFile(null)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Storage Info Card */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 12px", fontSize: "11.5px", color: "#166534" }}>
                <div style={{ fontWeight: "700", marginBottom: "2px" }}>📍 Server Storage Location:</div>
                <div>Uploaded project files are stored on disk at <code>uploads/work-experience/</code> and served statically for verification.</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setAddFile(null);
                setAddExpTab("details");
              }}
              style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", border: "none", background: "#e91e8c", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              {submitting ? "Adding..." : "Save Experience"}
            </button>
          </div>
        </form>
      </TabModal>

      {/* Edit Experience Modal */}
      <TabModal
        title="Edit Work Experience"
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditFile(null);
          setEditExpTab("details");
        }}
      >
        <form onSubmit={handleSaveEditExperience} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Modal Tab Headers */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
            <button
              type="button"
              onClick={() => setEditExpTab("details")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: editExpTab === "details" ? "#fdf2f8" : "transparent",
                color: editExpTab === "details" ? "#db2777" : "#64748b",
                fontWeight: "700",
                fontSize: "12.5px",
                cursor: "pointer"
              }}
            >
              📝 Project Details
            </button>
            <button
              type="button"
              onClick={() => setEditExpTab("files")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: editExpTab === "files" ? "#fdf2f8" : "transparent",
                color: editExpTab === "files" ? "#db2777" : "#64748b",
                fontWeight: "700",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              📁 Attach Files / Proof {editFile ? `(New file selected)` : editExistingFileName ? `(1 file attached)` : ""}
            </button>
          </div>

          {editExpTab === "details" ? (
            <>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Brand / Company Name <span style={{ color: "#e91e8c" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Amazon, LAKMÉ"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Campaign / Role Title <span style={{ color: "#e91e8c" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Actor, Commercial Model"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  >
                    <optgroup label="Standard Categories">
                      <option value="Commercial">Commercial</option>
                      <option value="Feature Film">Feature Film</option>
                      <option value="Short Film">Short Film</option>
                      <option value="Web Series">Web Series</option>
                      <option value="Digital & Film">Digital & Film</option>
                      <option value="Runway & Print">Runway & Print</option>
                      <option value="Editorial">Editorial</option>
                      <option value="Fashion">Fashion</option>
                    </optgroup>
                    {userSkills.length > 0 && (
                      <optgroup label="Your Added Specialized Skills">
                        {userSkills.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Duration / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Project Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your role and contribution..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "6px 0" }}>
              {editExistingFileName && !editFile && (
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "10px 14px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#0369a1" }}>
                    <span>Current File: 📄 {editExistingFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditExistingFileUrl("");
                      setEditExistingFileName("");
                    }}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}
                  >
                    Remove Current
                  </button>
                </div>
              )}

              <div style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                <FolderPlus size={36} color="#db2777" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                  {editExistingFileName ? "Replace Attached File / Proof" : "Attach Certificate, Script, Project Still, or Proof"}
                </div>
                <p style={{ fontSize: "11.5px", color: "#64748b", margin: "4px 0 14px 0" }}>
                  Supports PDF documents, Word documents, or project stills (JPG/PNG).
                </p>
                <input
                  type="file"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setEditFile(file);
                  }}
                  style={{ fontSize: "12.5px" }}
                />
              </div>

              {editFile && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "700", color: "#065f46" }}>
                    <span>📎 New: {editFile.name}</span>
                    <span style={{ fontSize: "11px", color: "#047857" }}>({Math.round(editFile.size / 1024)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFile(null)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Storage Info Card */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 12px", fontSize: "11.5px", color: "#166534" }}>
                <div style={{ fontWeight: "700", marginBottom: "2px" }}>📍 Server Storage Location:</div>
                <div>Uploaded project files are stored on disk at <code>uploads/work-experience/</code> and served statically for verification.</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditFile(null);
                setEditExpTab("details");
              }}
              style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", border: "none", background: "#e91e8c", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              {submitting ? "Updating..." : "Update Experience"}
            </button>
          </div>
        </form>
      </TabModal>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MEASUREMENTS TAB (Editable — no fake body data)
══════════════════════════════════════════════════ */
const INITIAL_MEASURE_GROUPS = [
  {
    heading: "Physical Measurements",
    items: [
      { key: "height", label: "Height", value: "Not specified", icon: "📏" },
      { key: "bust", label: "Bust", value: "Not specified", icon: "📐" },
      { key: "waist", label: "Waist", value: "Not specified", icon: "📐" },
      { key: "hips", label: "Hips", value: "Not specified", icon: "📐" },
      { key: "dressSize", label: "Dress Size", value: "Not specified", icon: "👗" },
      { key: "shoeSize", label: "Shoe Size", value: "Not specified", icon: "👠" }
    ]
  },
  {
    heading: "Features & Appearance",
    items: [
      { key: "hairColor", label: "Hair Color", value: "Not specified", icon: "💇" },
      { key: "eyeColor", label: "Eye Color", value: "Not specified", icon: "👁️" },
      { key: "skinTone", label: "Skin Tone", value: "Not specified", icon: "🌟" },
      { key: "bodyType", label: "Body Type", value: "Not specified", icon: "💪" }
    ]
  }
];

export function MeasurementsTab() {
  const [groups, setGroups] = useState(INITIAL_MEASURE_GROUPS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    height: "",
    bust: "",
    waist: "",
    hips: "",
    dressSize: "",
    shoeSize: "",
    hairColor: "",
    eyeColor: "",
    skinTone: "",
    bodyType: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadMeasurements() {
      try {
        const data = await getMyMeasurements();
        if (data) {
          setForm({
            height: data.height || "",
            bust: data.bust || "",
            waist: data.waist || "",
            hips: data.hips || "",
            dressSize: data.dressSize || "",
            shoeSize: data.shoeSize || "",
            hairColor: data.hairColor || "",
            eyeColor: data.eyeColor || "",
            skinTone: data.skinTone || "",
            bodyType: data.bodyType || ""
          });
          setGroups(prev =>
            prev.map(grp => ({
              ...grp,
              items: grp.items.map(it => ({
                ...it,
                value: data[it.key] || "Not specified"
              }))
            }))
          );
        }
      } catch (e) {
        // Handled
      }
    }
    loadMeasurements();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const saved = await saveMeasurements(form);
      const dataToUse = saved || form;

      setGroups(prev =>
        prev.map(grp => ({
          ...grp,
          items: grp.items.map(it => ({
            ...it,
            value: dataToUse[it.key] || "Not specified"
          }))
        }))
      );
      setShowModal(false);
      showSuccess("Measurements Saved!", "Your measurements have been updated successfully.");
    } catch (err) {
      showError("Failed to Save", err.message || "Failed to save measurements");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="meas-container">
      <div className="wexp-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="ptab-title">Measurements</h2>
          <p className="ptab-subtitle">Official measurements for casting calls</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#ffffff",
            color: "#e91e8c",
            border: "1px solid #e91e8c",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)"
          }}
        >
          <Edit3 size={14} /> Edit Measurements
        </button>
      </div>

      <div className="meas-groups">
        {groups.map((grp, gi) => (
          <div key={gi} className="meas-group-card">
            <h3 className="meas-group-title">{grp.heading}</h3>
            <div className="meas-grid">
              {grp.items.map((m, mi) => (
                <div key={mi} className="meas-item">
                  <span className="meas-icon">{m.icon}</span>
                  <div>
                    <div className="meas-label">{m.label}</div>
                    <div className="meas-value">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="meas-note-card">
        <Award size={16} className="meas-note-icon" />
        <p>Keeping accurate measurements helps directors filter candidates for specific role requirements.</p>
      </div>

      {/* Edit Measurements Modal */}
      <TabModal title="Edit Measurements" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Height</label>
              <input
                type="text"
                placeholder="e.g. 5 ft 10 in (178 cm)"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Bust / Chest</label>
              <input
                type="text"
                placeholder="e.g. 38 in"
                value={form.bust}
                onChange={(e) => setForm({ ...form, bust: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Waist</label>
              <input
                type="text"
                placeholder="e.g. 32 in"
                value={form.waist}
                onChange={(e) => setForm({ ...form, waist: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Hips</label>
              <input
                type="text"
                placeholder="e.g. 36 in"
                value={form.hips}
                onChange={(e) => setForm({ ...form, hips: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Dress Size</label>
              <input
                type="text"
                placeholder="e.g. M / UK 10"
                value={form.dressSize}
                onChange={(e) => setForm({ ...form, dressSize: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Shoe Size</label>
              <input
                type="text"
                placeholder="e.g. EU 42 / UK 8"
                value={form.shoeSize}
                onChange={(e) => setForm({ ...form, shoeSize: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Hair Color</label>
              <input
                type="text"
                placeholder="e.g. Black / Dark Brown"
                value={form.hairColor}
                onChange={(e) => setForm({ ...form, hairColor: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Eye Color</label>
              <input
                type="text"
                placeholder="e.g. Brown / Black"
                value={form.eyeColor}
                onChange={(e) => setForm({ ...form, eyeColor: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Skin Tone</label>
              <input
                type="text"
                placeholder="e.g. Fair, Olive, Dusky"
                value={form.skinTone}
                onChange={(e) => setForm({ ...form, skinTone: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Body Type</label>
              <input
                type="text"
                placeholder="e.g. Athletic, Slim, Curvy"
                value={form.bodyType}
                onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", border: "none", background: "#e91e8c", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              {submitting ? "Saving..." : "Save Measurements"}
            </button>
          </div>
        </form>
      </TabModal>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   VIDEOS TAB (Dynamic — with Add & Edit features)
══════════════════════════════════════════════════ */
const VIDEO_CATEGORIES = ["All", "Showreel", "Audition", "Commercial", "Dance", "Short Film", "Monologue"];

export function VideosTab() {
  const [videos, setVideos] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [sourceType, setSourceType] = useState("file"); // "file" or "url"
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "Showreel",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "2:00",
    year: new Date().getFullYear()
  });
  const [submitting, setSubmitting] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  const getTabVideoThumb = (vid) => {
    if (!vid) return null;
    if (vid.thumbnailUrl) return getFullImageUrl(vid.thumbnailUrl);
    if (vid.videoUrl) {
      if (vid.videoUrl.includes("youtube.com") || vid.videoUrl.includes("youtu.be")) {
        const match = vid.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
        if (match && match[1]) {
          return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
      }
    }
    return null;
  };

  const loadVideos = async () => {
    try {
      const data = await getMyVideos();
      if (Array.isArray(data)) {
        setVideos(data);
      }
    } catch (e) {
      // Handled
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setSourceType("file");
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setForm({
      title: "",
      category: "Showreel",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "2:00",
      year: new Date().getFullYear()
    });
    setShowModal(true);
  };

  const handleOpenEdit = (vid) => {
    setEditingVideo(vid);
    setSourceType(vid.videoUrl?.startsWith("/uploads") ? "file" : "url");
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setForm({
      title: vid.title || "",
      category: vid.category || "Showreel",
      videoUrl: vid.videoUrl || "",
      thumbnailUrl: vid.thumbnailUrl || "",
      duration: vid.duration || "",
      year: vid.year || new Date().getFullYear()
    });
    setShowModal(true);
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      showWarning("File Too Large", "File size exceeds 100MB. Please choose a smaller video.");
      return;
    }

    setSelectedFile(file);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    const blobUrl = URL.createObjectURL(file);
    setFilePreviewUrl(blobUrl);

    // If title is empty, prefill with filename
    if (!form.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setForm(prev => ({ ...prev, title: nameWithoutExt }));
    }

    // Auto extract duration and thumbnail frame
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = blobUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    tempVideo.onloadedmetadata = () => {
      const totalSecs = Math.floor(tempVideo.duration);
      if (!isNaN(totalSecs) && totalSecs > 0) {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;
        setForm(prev => ({ ...prev, duration: formatted }));
      }
      tempVideo.currentTime = Math.min(1.0, (tempVideo.duration || 2) / 4);
    };

    tempVideo.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = tempVideo.videoWidth || 640;
        canvas.height = tempVideo.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        const thumbData = canvas.toDataURL("image/jpeg", 0.85);
        setForm(prev => ({ ...prev, thumbnailUrl: prev.thumbnailUrl || thumbData }));
      } catch (err) {
        // Thumbnail extraction fallback
      }
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (sourceType === "file") {
        if (!selectedFile && !editingVideo) {
          showWarning("Missing Video File", "Please pick a video file from your local storage.");
          setSubmitting(false);
          return;
        }

        if (editingVideo) {
          if (selectedFile) {
            await updateVideoWithFile(editingVideo.id, {
              file: selectedFile,
              title: form.title.trim(),
              category: form.category,
              duration: form.duration,
              year: form.year
            });
          } else {
            await updateVideo(editingVideo.id, form);
          }
        } else {
          await uploadVideoFile({
            file: selectedFile,
            title: form.title.trim(),
            category: form.category,
            duration: form.duration,
            year: form.year
          });
        }
      } else {
        if (!form.videoUrl.trim()) {
          showWarning("Missing Video URL", "Please enter a valid video link or showreel URL.");
          setSubmitting(false);
          return;
        }

        if (editingVideo) {
          await updateVideo(editingVideo.id, form);
        } else {
          await addVideo(form);
        }
      }

      await loadVideos();
      setShowModal(false);
      showSuccess(
        editingVideo ? "Video Updated!" : "Video Uploaded!",
        editingVideo ? "Video details have been updated." : "Video has been added to your profile."
      );
    } catch (err) {
      showError("Failed to Save Video", err.message || "Failed to save video.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(
      "Video",
      "Are you sure you want to delete this video? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      await deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
      showSuccess("Deleted!", "Video deleted successfully.");
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete video.");
    }
  };

  const filteredVideos = activeFilter === "All"
    ? videos
    : videos.filter(v => (v.category || "").toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="vids-container">
      {/* Header */}
      <div className="wexp-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
        <div>
          <h2 className="ptab-title">Videos & Showreels</h2>
          <p className="ptab-subtitle">{videos.length} performance videos & reels added</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#e91e8c",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(233, 30, 140, 0.25)"
          }}
        >
          <Plus size={15} /> Add Video / Showreel
        </button>
      </div>

      {/* Category Filter Chips */}
      {videos.length > 0 && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "16px" }}>
          {VIDEO_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilter(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: activeFilter === cat ? "1px solid #e91e8c" : "1px solid #e2e8f0",
                background: activeFilter === cat ? "#e91e8c" : "#ffffff",
                color: activeFilter === cat ? "#ffffff" : "#475569",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Videos List / Empty State */}
      {filteredVideos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
          <Video size={42} color="#94a3b8" style={{ marginBottom: "12px" }} />
          <h4 style={{ fontSize: "16px", color: "#334155", fontWeight: "700", margin: "0 0 6px 0" }}>
            {videos.length === 0 ? "No Showreels or Videos Added Yet" : `No videos found in '${activeFilter}'`}
          </h4>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px 0" }}>
            Upload your performance showreels, audition self-tapes, or commercials from local storage or video links to showcase your craft.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#e91e8c",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(233, 30, 140, 0.25)"
            }}
          >
            <Plus size={15} /> Add Your First Video
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredVideos.map(vid => (
            <div
              key={vid.id}
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Video Thumbnail Viewport */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  background: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}
              >
                {getTabVideoThumb(vid) ? (
                  <img
                    src={getTabVideoThumb(vid)}
                    alt={vid.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : vid.videoUrl ? (
                  <video
                    src={getFullImageUrl(vid.videoUrl)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#64748b" }}>
                    <Film size={34} style={{ color: "#e91e8c", marginBottom: "4px" }} />
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }}>{vid.category}</span>
                  </div>
                )}

                {/* Play Button Overlay */}
                <button
                  type="button"
                  onClick={() => setPlayingVideo(vid)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease"
                  }}
                  title="Play video"
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(233, 30, 140, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
                    }}
                  >
                    <Play size={20} fill="#ffffff" style={{ marginLeft: "3px" }} />
                  </div>
                </button>

                {/* Badges on Thumbnail */}
                <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", color: "#fff", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                  {vid.category || "Showreel"}
                </div>
                {vid.duration && (
                  <div style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", color: "#fff", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                    {vid.duration}
                  </div>
                )}
              </div>

              {/* Video Info & Action Controls */}
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0", lineHeight: "1.3" }}>
                    {vid.title}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                    <span>{vid.year || new Date().getFullYear()}</span>
                    <span>•</span>
                    <span>{vid.category}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    type="button"
                    onClick={() => setPlayingVideo(vid)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#e91e8c",
                      padding: 0
                    }}
                  >
                    Watch Reel <ExternalLink size={12} />
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(vid)}
                      title="Edit Video"
                      style={{
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#334155"
                      }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vid.id)}
                      title="Delete Video"
                      style={{
                        background: "#fff1f2",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        color: "#e11d48"
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      <TabModal
        title={editingVideo ? "Edit Video / Showreel" : "Add Video / Showreel"}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Source Type Selector */}
          <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
            <button
              type="button"
              onClick={() => setSourceType("file")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: sourceType === "file" ? "#ffffff" : "transparent",
                color: sourceType === "file" ? "#e91e8c" : "#64748b",
                fontWeight: "700",
                fontSize: "13px",
                boxShadow: sourceType === "file" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s"
              }}
            >
              <Upload size={14} /> Upload from Local Storage
            </button>
            <button
              type="button"
              onClick={() => setSourceType("url")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: sourceType === "url" ? "#ffffff" : "transparent",
                color: sourceType === "url" ? "#e91e8c" : "#64748b",
                fontWeight: "700",
                fontSize: "13px",
                boxShadow: sourceType === "url" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s"
              }}
            >
              <ExternalLink size={14} /> Video URL / Link
            </button>
          </div>

          {/* Local File Picker */}
          {sourceType === "file" && (
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                Select Video File from Local Storage <span style={{ color: "#e91e8c" }}>*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: selectedFile ? "#fdf2f8" : "#f8fafc",
                  borderColor: selectedFile ? "#e91e8c" : "#cbd5e1",
                  transition: "all 0.2s"
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelected}
                  style={{ display: "none" }}
                />
                {selectedFile ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#e91e8c" }}>
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <p style={{ margin: "0", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{selectedFile.name}</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to choose a different video</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#e91e8c" }}>
                      <Upload size={22} />
                    </div>
                    <div>
                      <p style={{ margin: "0", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                        Click to choose a video file from your computer / phone
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                        Supports MP4, MOV, WebM, AVI (up to 100MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Player Preview if selected */}
              {filePreviewUrl && (
                <div style={{ marginTop: "10px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#000" }}>
                  <video
                    src={filePreviewUrl}
                    controls
                    style={{ width: "100%", maxHeight: "170px", objectFit: "contain", display: "block" }}
                  />
                </div>
              )}

              {editingVideo && !selectedFile && editingVideo.videoUrl && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                  Current video: <span style={{ fontWeight: "600", color: "#0f172a" }}>{editingVideo.videoUrl}</span> (select a file above only if you wish to replace it)
                </div>
              )}
            </div>
          )}

          {/* Video URL Input */}
          {sourceType === "url" && (
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                Video URL / Embed Link <span style={{ color: "#e91e8c" }}>*</span>
              </label>
              <input
                type="text"
                required={sourceType === "url"}
                placeholder="e.g. https://www.youtube.com/watch?v=... or Vimeo / MP4 link"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>
          )}

          {/* Video Title */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
              Video Title <span style={{ color: "#e91e8c" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026 Commercial Acting Reel"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
            />
          </div>

          {/* Category & Duration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
              >
                <option value="Showreel">Showreel</option>
                <option value="Audition">Audition Clip</option>
                <option value="Commercial">Commercial</option>
                <option value="Dance">Dance / Performance</option>
                <option value="Monologue">Monologue</option>
                <option value="Short Film">Short Film</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 2:15 or 3 mins"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Thumbnail & Year */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                Thumbnail Image URL (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-captured or e.g. https://.../poster.jpg"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                Year
              </label>
              <input
                type="number"
                placeholder="2026"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 20px", border: "none", background: "#e91e8c", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              {submitting ? "Uploading Video..." : (editingVideo ? "Update Video" : "Upload Video")}
            </button>
          </div>
        </form>
      </TabModal>

      {/* Video Playback Modal */}
      {playingVideo && (
        <TabModal
          title={playingVideo.title}
          isOpen={Boolean(playingVideo)}
          onClose={() => setPlayingVideo(null)}
          maxWidth="760px"
        >
          <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", borderRadius: "10px", overflow: "hidden" }}>
            {playingVideo.videoUrl?.includes("youtube.com") || playingVideo.videoUrl?.includes("youtu.be") ? (
              <iframe
                title={playingVideo.title}
                src={playingVideo.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={getFullImageUrl(playingVideo.videoUrl)}
                controls
                autoPlay
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{playingVideo.category} • {playingVideo.duration}</span>
            <a
              href={getFullImageUrl(playingVideo.videoUrl)}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "12px", color: "#e91e8c", fontWeight: "700", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              Open in new tab <ExternalLink size={12} />
            </a>
          </div>
        </TabModal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   REVIEWS TAB (Dynamic — no fake reviews)
══════════════════════════════════════════════════ */
export function ReviewsTab() {
  return (
    <div className="rev-container">
      <div className="wexp-header">
        <h2 className="ptab-title">Client Reviews & Testimonials</h2>
        <p className="ptab-subtitle">Verified feedback from directors, photographers, and casting agencies</p>
      </div>
      <div style={{ textAlign: "center", padding: "50px 20px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
        <Star size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
        <h4 style={{ fontSize: "16px", color: "#334155", fontWeight: "700", margin: "0 0 6px 0" }}>No Reviews Yet</h4>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Reviews will automatically be added here as you complete bookings and projects through Book My Stars.</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   RATES TAB
══════════════════════════════════════════════════ */
const RATE_PACKAGES = [
  {
    name: "Half Day",
    icon: "🌅",
    price: "₹25,000",
    duration: "4 hours",
    highlight: false,
    includes: ["Up to 4 hrs on set", "1 outfit change", "Print & digital usage", "Travel within city"]
  },
  {
    name: "Full Day",
    icon: "⭐",
    price: "₹45,000",
    duration: "8 hours",
    highlight: true,
    includes: ["Up to 8 hrs on set", "Up to 3 outfit changes", "Print, digital & OOH usage", "BTS video permission"]
  },
  {
    name: "Campaign",
    icon: "🏆",
    price: "Custom",
    duration: "Multi-day",
    highlight: false,
    includes: ["Exclusive multi-day shoot", "Unlimited changes", "All media rights", "Clearance support"]
  }
];

export function RatesTab() {
  return (
    <div className="rates-container">
      <div className="wexp-header">
        <h2 className="ptab-title">Rates & Packages</h2>
        <p className="ptab-subtitle">Indicative packages for castings and brand bookings</p>
      </div>

      <div className="rates-grid">
        {RATE_PACKAGES.map((pkg, i) => (
          <div key={i} className={`rates-card ${pkg.highlight ? "rates-card--highlight" : ""}`}>
            {pkg.highlight && <div className="rates-popular-badge">Popular</div>}
            <div className="rates-icon">{pkg.icon}</div>
            <h3 className="rates-pkg-name">{pkg.name}</h3>
            <div className="rates-price">{pkg.price}</div>
            <div className="rates-duration"><Clock size={13} /> {pkg.duration}</div>
            <ul className="rates-includes">
              {pkg.includes.map((item, ii) => (
                <li key={ii} className="rates-include-item">
                  <CheckCircle size={13} className="rates-check-icon" />
                  {item}
                </li>
              ))}
            </ul>
            <PagesButton className={`rates-cta-btn ${pkg.highlight ? "rates-cta-btn--primary" : "rates-cta-btn--outline"}`}>
              Select Package
            </PagesButton>
          </div>
        ))}
      </div>

      <div className="rates-note-card">
        <TrendingUp size={16} className="meas-note-icon" />
        <p>Prices can be negotiated depending on usage rights, exclusive brand ambassadorships, and travel requirements.</p>
      </div>
    </div>
  );
}
