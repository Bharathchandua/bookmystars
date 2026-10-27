import React, { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Film, 
  Users, 
  ArrowRight, 
  Lock, 
  CreditCard, 
  BarChart3, 
  UserPlus, 
  Heart, 
  Rocket, 
  ShoppingBag,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  Video,
  User,
  Mail,
  Phone,
  FileText,
  Tag,
  Plus,
  Search,
  List,
  LayoutGrid,
  Edit3,
  Save,
  ExternalLink,
  Globe
} from "lucide-react";
import { showSuccess, showWarning, showError, confirmDelete } from "../../../shared/utils/alert";
import { emitLiveSync, onLiveSync } from "../../../shared/utils/liveSync";
import { 
  getStoredAdmin, 
  getAdminCastings, 
  approveCastingNotice, 
  rejectCastingNotice, 
  deleteCastingNotice,
  getAdminTalentsKyc, 
  awardVerifiedBadge, 
  revokeVerifiedBadge,
  updateAdminTalent
} from "../../../features/bms/api/admin/adminApi";
import { 
  getAdminSkills, 
  createAdminSkill, 
  deleteAdminSkill 
} from "../../../features/bms/api/skills/skillsApi";
import { getPublicLanguages } from "../../../features/bms/api/languages/languagesApi";
import PostOpportunityModal from "../../Opportunities/PostOpportunityModal";

export default function AdminExactReferenceGrid({ 
  onOpenRbac, 
  onTabChange,
  singleCardView = null,
  defaultCastingTab = null,
  defaultKycTab = null
}) {
  const [castingSubTab, setCastingSubTab] = useState(defaultCastingTab || "pending");
  const [kycSubTab, setKycSubTab] = useState(defaultKycTab || "queue");
  const [isLoadingCastings, setIsLoadingCastings] = useState(false);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);

  const adminUser = getStoredAdmin();
  const isSuperAdmin = adminUser?.roleId === "ROLE_SUPER_ADMIN" || adminUser?.role === "SUPER_ADMIN";
  const canViewCastings = isSuperAdmin || adminUser?.permissions?.castings?.view === true;
  const canViewKyc = isSuperAdmin || adminUser?.permissions?.kyc?.view === true;
  const canApproveCastings = isSuperAdmin || adminUser?.permissions?.castings?.approve === true;
  const canDeleteCastings = isSuperAdmin || adminUser?.permissions?.castings?.delete === true;
  const canVerifyKyc = isSuperAdmin || adminUser?.permissions?.kyc?.approve === true || adminUser?.permissions?.talents?.approve === true;

  // Determine which cards are authorized for this admin
  // If Casting Director (canViewCastings=true, canViewKyc=false), automatically hide KYC and maximize Castings!
  const showCastingsCard = singleCardView ? singleCardView === "castings" : canViewCastings;
  const showKycCard = singleCardView ? singleCardView === "kyc" : canViewKyc;
  const isOnlyCastings = showCastingsCard && !showKycCard;

  // Pagination states (4 items per page for split view, 8 items for dedicated full view)
  const [castingsPage, setCastingsPage] = useState(1);
  const [kycPage, setKycPage] = useState(1);
  const [castingViewMode, setCastingViewMode] = useState("list"); // "list" | "grid"
  const [kycViewMode, setKycViewMode] = useState("list"); // "list" | "grid"
  const ITEMS_PER_PAGE = singleCardView || isOnlyCastings ? 8 : 4;

  const [castings, setCastings] = useState([]);
  const [kycItems, setKycItems] = useState([]);
  const [reviewCasting, setReviewCasting] = useState(null);
  const [showPostOpportunityModal, setShowPostOpportunityModal] = useState(false);

  // Talent Details & Dossier Modal State
  const [selectedTalentForDetails, setSelectedTalentForDetails] = useState(null);
  const [isEditingTalent, setIsEditingTalent] = useState(false);
  const [editTalentForm, setEditTalentForm] = useState({
    fullName: "",
    stageName: "",
    primaryProfession: "",
    location: "",
    phone: "",
    bio: "",
    idVerified: false,
    phoneVerified: false,
    emailVerified: false,
    languages: "",
    actingLanguages: "",
    talentCategory: "ACTING",
    workType: ""
  });
  const [isSavingTalent, setIsSavingTalent] = useState(false);

  // Discipline & Language Filters for Casting Calls
  const [castingDisciplineFilter, setCastingDisciplineFilter] = useState("ALL"); // "ALL" | "ACTING" | "SINGING" | "DANCING" | "MODELING" | "CREW"
  const [castingLangFilter, setCastingLangFilter] = useState("ALL");
  const [masterLanguagesList, setMasterLanguagesList] = useState([]);

  // Master Skills Catalog State
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [adminSkillsList, setAdminSkillsList] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Acting & Performance");
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  const refreshAdminSkills = useCallback(async () => {
    setIsLoadingSkills(true);
    try {
      const data = await getAdminSkills();
      if (Array.isArray(data)) {
        setAdminSkillsList(data);
      }
    } catch (err) {
      console.warn("Could not fetch admin skills:", err);
    } finally {
      setIsLoadingSkills(false);
    }
  }, []);

  const handleCreateSkill = async (e) => {
    if (e) e.preventDefault();
    const trimmed = (newSkillName || "").trim();
    if (!trimmed) return;

    try {
      setIsSubmittingSkill(true);
      await createAdminSkill({ name: trimmed, category: newSkillCategory });
      showSuccess(
        "Skill Added to Database! ✨",
        `"${trimmed}" is now active in PostgreSQL and available to all talents.`
      );
      setNewSkillName("");
      emitLiveSync("skills_updated", { name: trimmed });
      await refreshAdminSkills();
    } catch (err) {
      showError("Failed to Add Skill", err.message || "Skill could not be added.");
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleDeleteMasterSkill = async (id, name) => {
    const ok = await confirmDelete(name, `Are you sure you want to delete skill "${name}" from the master catalog?`);
    if (!ok) return;
    try {
      await deleteAdminSkill(id);
      showSuccess("Skill Deleted", `"${name}" removed from platform master catalog.`);
      emitLiveSync("skills_updated", { id, name });
      await refreshAdminSkills();
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete skill.");
    }
  };

  // Fetch live castings from PostgreSQL database
  const refreshCastings = useCallback(async () => {
    setIsLoadingCastings(true);
    try {
      const data = await getAdminCastings("ALL");
      if (Array.isArray(data)) {
        setCastings(data);
      }
    } catch (err) {
      console.warn("Could not fetch database castings:", err);
    } finally {
      setIsLoadingCastings(false);
    }
  }, []);

  // Fetch live talent KYC records from PostgreSQL database
  const refreshKyc = useCallback(async () => {
    setIsLoadingKyc(true);
    try {
      const data = await getAdminTalentsKyc();
      if (Array.isArray(data)) {
        setKycItems(data);
      }
    } catch (err) {
      console.warn("Could not fetch database KYC:", err);
    } finally {
      setIsLoadingKyc(false);
    }
  }, []);

  // Fetch live languages catalog
  const refreshLanguages = useCallback(async () => {
    try {
      const data = await getPublicLanguages();
      if (Array.isArray(data)) {
        setMasterLanguagesList(data);
      }
    } catch (err) {
      console.warn("Could not fetch languages:", err);
    }
  }, []);

  useEffect(() => {
    refreshCastings();
    refreshKyc();
    refreshAdminSkills();
    refreshLanguages();

    const unsubscribe = onLiveSync(
      ["opportunity_created", "opportunity_updated", "opportunity_deleted", "skills_updated", "languages_updated", "talents_updated", "auth_changed"],
      () => {
        refreshCastings();
        refreshKyc();
        refreshAdminSkills();
        refreshLanguages();
      },
      { pollIntervalMs: 8000, triggerOnFocus: true }
    );

    return () => {
      unsubscribe();
    };
  }, [refreshCastings, refreshKyc, refreshAdminSkills, refreshLanguages]);

  const handleApproveCasting = async (id, project) => {
    try {
      await approveCastingNotice(id);
      showSuccess(
        "Casting Approved & Published!",
        `"${project}" status updated to OPEN in PostgreSQL. Normal users can now browse and apply immediately.`
      );
      emitLiveSync("opportunity_updated", { id, status: "OPEN", project });
      await refreshCastings();
    } catch (err) {
      showError("Approval Failed", err.message || "Failed to approve casting.");
    }
  };

  const handleRejectCasting = async (id, project) => {
    try {
      await rejectCastingNotice(id, "Editorial guidelines not met");
      showWarning(
        "Casting Rejected",
        `"${project}" has been moved to CLOSED status in the database.`
      );
      emitLiveSync("opportunity_updated", { id, status: "CLOSED", project });
      await refreshCastings();
    } catch (err) {
      showError("Action Failed", err.message || "Failed to reject casting.");
    }
  };

  const handleDeleteCasting = async (id, project) => {
    const ok = await confirmDelete(project, `Are you sure you want to PERMANENTLY DELETE casting notice "${project}" from the database? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteCastingNotice(id);
      showSuccess("Casting Deleted", `"${project}" has been permanently removed from PostgreSQL.`);
      emitLiveSync("opportunity_deleted", { id, project });
      await refreshCastings();
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete casting.");
    }
  };

  const handleVerifyKyc = async (userId, talent) => {
    try {
      await awardVerifiedBadge(userId);
      showSuccess(
        "Star Badge Awarded!",
        `Official Verified Badge assigned to ${talent} in PostgreSQL database. Reflected on live profile.`
      );
      await refreshKyc();
    } catch (err) {
      showError("Verification Failed", err.message || "Failed to verify talent.");
    }
  };

  const handleRevokeKyc = async (userId, talent) => {
    try {
      await revokeVerifiedBadge(userId);
      showWarning(
        "Badge Revoked",
        `Verification badge for ${talent} has been reverted to pending.`
      );
      await refreshKyc();
      if (selectedTalentForDetails && (selectedTalentForDetails.userId === userId || selectedTalentForDetails.id === userId)) {
        setSelectedTalentForDetails(prev => ({ ...prev, idVerified: false, status: "PENDING" }));
      }
    } catch (err) {
      showError("Action Failed", err.message || "Failed to revoke badge.");
    }
  };

  const handleOpenTalentDetails = (talent) => {
    setSelectedTalentForDetails(talent);
    setIsEditingTalent(false);
    setEditTalentForm({
      fullName: talent.talent || "",
      stageName: talent.stageName || "",
      primaryProfession: talent.primaryProfession || talent.craft || "",
      location: talent.location || "",
      phone: talent.phone || "",
      bio: talent.bio || "",
      idVerified: Boolean(talent.idVerified),
      phoneVerified: Boolean(talent.phoneVerified),
      emailVerified: Boolean(talent.emailVerified),
      languages: talent.languages || "",
      actingLanguages: talent.actingLanguages || "",
      talentCategory: talent.talentCategory || "ACTING",
      workType: talent.workType || ""
    });
  };

  const getTalentDisciplineBadge = (item) => {
    const cat = (item.talentCategory || "").toUpperCase();
    const profTypes = (item.profileTypes || []).map(p => p.toUpperCase());
    const craftStr = (item.craft || "").toUpperCase();
    const primProf = (item.primaryProfession || "").toUpperCase();

    if (cat === "SINGING" || profTypes.includes("SINGER") || craftStr.includes("SING") || craftStr.includes("MUSIC") || craftStr.includes("VOCAL") || primProf.includes("SING")) {
      return { label: "🎤 SINGING", bg: "#fdf2f8", text: "#db2777", border: "#fbcfe8" };
    }
    if (cat === "DANCING" || profTypes.includes("DANCER") || craftStr.includes("DANC") || craftStr.includes("CHOREO") || primProf.includes("DANC")) {
      return { label: "💃 DANCING", bg: "#faf5ff", text: "#9333ea", border: "#f3e8ff" };
    }
    if (cat === "MODELING" || profTypes.includes("MODEL") || craftStr.includes("MODEL") || primProf.includes("MODEL")) {
      return { label: "✨ MODELING", bg: "#fff7ed", text: "#ea580c", border: "#ffedd5" };
    }
    if (cat === "CREW" || profTypes.includes("DIRECTOR") || profTypes.includes("PRODUCER") || craftStr.includes("DIRECT") || craftStr.includes("CAMERA") || primProf.includes("DIRECT")) {
      return { label: "🎬 CREW", bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
    }
    return { label: "🎭 ACTING", bg: "#ecfeff", text: "#0891b2", border: "#cffafe" };
  };

  const handleSaveTalentDetails = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTalentForDetails) return;
    try {
      setIsSavingTalent(true);
      const uid = selectedTalentForDetails.userId || selectedTalentForDetails.id;
      const updated = await updateAdminTalent(uid, editTalentForm);
      showSuccess("Talent Updated", `Details for "${editTalentForm.fullName}" saved to PostgreSQL successfully.`);
      setIsEditingTalent(false);
      setSelectedTalentForDetails(updated || { ...selectedTalentForDetails, ...editTalentForm, talent: editTalentForm.fullName });
      await refreshKyc();
      emitLiveSync("talents_updated");
    } catch (err) {
      showError("Update Failed", err.message || "Failed to update talent details.");
    } finally {
      setIsSavingTalent(false);
    }
  };

  // Filtered views
  const pendingCastingsList = castings.filter(c => c.status === "IN_REVIEW");
  const approvedCastingsList = castings.filter(c => c.status === "OPEN");
  const rejectedCastingsList = castings.filter(c => c.status === "CLOSED" || c.status === "DRAFT");

  const rawDisplayedCastings = castingSubTab === "pending"
    ? pendingCastingsList
    : castingSubTab === "approved"
    ? approvedCastingsList
    : castingSubTab === "rejected"
    ? rejectedCastingsList
    : castings;

  const isCustomDiscipline = (disc) => {
    if (!disc) return false;
    const d = disc.toUpperCase().trim();
    return !["ACTING", "SINGING", "DANCING", "MODELING", "CREW"].includes(d);
  };

  // Helper to reliably resolve a casting notice's single discipline
  const getCastingDiscipline = (c) => {
    if (!c) return "ACTING";
    const pType = (c.postType || "").toUpperCase().trim();
    const rType = (c.roleType || "").toUpperCase().trim();
    const craft = (c.customCraft || c.craft || "").toUpperCase().trim();
    const cat = (c.category || "").toUpperCase().trim();

    // 1. Exact Standard RoleType / PostType checks (Strict precedence)
    if (pType === "SINGING" || pType === "SINGER" || rType === "SINGER" || rType === "SINGING") return "SINGING";
    if (pType === "DANCING" || pType === "DANCER" || rType === "DANCER" || rType === "DANCING") return "DANCING";
    if (pType === "MODELING" || pType === "MODEL" || rType === "MODEL" || rType === "MODELING") return "MODELING";
    if (pType === "CREW" || pType === "DIRECTOR" || rType === "DIRECTOR" || rType === "CREW" || rType === "PRODUCER") return "CREW";
    if (pType === "ACTING" || pType === "ACTOR" || rType === "ACTOR" || rType === "ACTING") return "ACTING";

    // 2. Custom discipline if entered during creation
    if (c.postType && !["OTHER", "CUSTOM", ""].includes(pType)) {
      return c.postType.trim();
    }
    if (c.customCraft && !["OTHER", "CUSTOM", ""].includes(craft)) {
      return c.customCraft.trim();
    }

    // 3. Craft / Keywords for standard disciplines
    if (craft.includes("SING") || craft.includes("VOCAL") || craft.includes("MUSICIAN") || craft.includes("SINGER")) return "SINGING";
    if (craft.includes("DANC") || craft.includes("CHOREO")) return "DANCING";
    if (craft.includes("MODEL") || craft.includes("RAMP") || craft.includes("FASHION")) return "MODELING";
    if (craft.includes("DIRECT") || craft.includes("CAMERA") || craft.includes("CINEMAT") || craft.includes("EDITOR") || craft.includes("PRODUC") || craft.includes("CREW") || craft.includes("LIGHT") || craft.includes("SOUND") || craft.includes("WRIT")) return "CREW";
    if (craft.includes("ACT") || craft.includes("LEAD") || craft.includes("CHARACTER") || craft.includes("THEATRE") || craft.includes("DRAMA")) return "ACTING";

    // 4. Category Fallback
    if (cat.includes("MUSIC") || cat.includes("SONG") || cat.includes("SING")) return "SINGING";
    if (cat.includes("DANCE") || cat.includes("CHOREO")) return "DANCING";
    if (cat.includes("FASHION") || cat.includes("MODEL") || cat.includes("PRINT")) return "MODELING";
    if (cat.includes("CREW") || cat.includes("DIRECT") || cat.includes("PRODUCTION")) return "CREW";

    if (pType === "CUSTOM" || rType === "OTHER") {
      return c.customCraft || "Custom";
    }

    return "ACTING";
  };

  const getDisciplineBadge = (discipline) => {
    switch (discipline) {
      case "SINGING":
        return { label: "🎤 Singing", bg: "#fdf2f8", text: "#db2777", border: "#fbcfe8" };
      case "DANCING":
        return { label: "💃 Dancing", bg: "#faf5ff", text: "#9333ea", border: "#f3e8ff" };
      case "MODELING":
        return { label: "✨ Modeling", bg: "#fff7ed", text: "#ea580c", border: "#ffedd5" };
      case "CREW":
        return { label: "🎬 Direction & Crew", bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
      case "ACTING":
        return { label: "🎭 Acting", bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
      default:
        return {
          label: `🌟 ${discipline === "CUSTOM" || discipline === "OTHER" ? "Custom" : discipline}`,
          bg: "#fffbeb",
          text: "#b45309",
          border: "#fde68a"
        };
    }
  };

  const disciplineCounts = {
    ALL: rawDisplayedCastings.length,
    ACTING: rawDisplayedCastings.filter(c => getCastingDiscipline(c) === "ACTING").length,
    SINGING: rawDisplayedCastings.filter(c => getCastingDiscipline(c) === "SINGING").length,
    DANCING: rawDisplayedCastings.filter(c => getCastingDiscipline(c) === "DANCING").length,
    MODELING: rawDisplayedCastings.filter(c => getCastingDiscipline(c) === "MODELING").length,
    CREW: rawDisplayedCastings.filter(c => getCastingDiscipline(c) === "CREW").length,
    CUSTOM: rawDisplayedCastings.filter(c => isCustomDiscipline(getCastingDiscipline(c))).length
  };

  const displayedCastings = rawDisplayedCastings.filter(c => {
    // 1. Discipline / Casting Post Type filter (Exact category isolation)
    if (castingDisciplineFilter !== "ALL") {
      const discipline = getCastingDiscipline(c);
      if (castingDisciplineFilter === "CUSTOM") {
        if (!isCustomDiscipline(discipline)) return false;
      } else if (discipline !== castingDisciplineFilter) {
        return false;
      }
    }

    // 2. Language filter
    if (castingLangFilter !== "ALL") {
      const langQ = castingLangFilter.toLowerCase().trim();
      const reqLangs = (c.requiredLanguages || "").toLowerCase();
      if (!reqLangs.includes(langQ)) {
        return false;
      }
    }

    return true;
  });

  const totalCastingPages = Math.max(1, Math.ceil(displayedCastings.length / ITEMS_PER_PAGE));
  const paginatedCastings = displayedCastings.slice(
    (castingsPage - 1) * ITEMS_PER_PAGE,
    castingsPage * ITEMS_PER_PAGE
  );

  const pendingKycList = kycItems.filter(k => !k.idVerified);
  const verifiedKycList = kycItems.filter(k => k.idVerified);
  const talentUsersList = kycItems.filter(k => (k.accountType || "TALENT") === "TALENT");
  const proUsersList = kycItems.filter(k => k.accountType === "PROFESSIONAL");

  const rawDisplayedKyc = kycSubTab === "all"
    ? kycItems
    : kycSubTab === "talent"
    ? talentUsersList
    : kycSubTab === "pro"
    ? proUsersList
    : kycSubTab === "verified"
    ? verifiedKycList
    : kycSubTab === "queue"
    ? pendingKycList
    : kycItems;

  const displayedKyc = rawDisplayedKyc;

  const totalKycPages = Math.max(1, Math.ceil(displayedKyc.length / ITEMS_PER_PAGE));
  const paginatedKyc = displayedKyc.slice(
    (kycPage - 1) * ITEMS_PER_PAGE,
    kycPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", boxSizing: "border-box" }}>
      
      {/* ============================================================== */}
      {/* ROW 1: TABLES (FULL-WIDTH IF CASTING DIRECTOR OR SINGLE CARD) */}
      {/* ============================================================== */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: singleCardView || isOnlyCastings ? "1fr" : "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "24px",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        
        {/* LEFT CARD: CASTING APPROVALS */}
        {showCastingsCard && (
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "12px", backgroundColor: "#fff1f8", color: "#ee008f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Film size={18} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                    Casting Directory & Approvals
                  </h3>
                  <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500", margin: "2px 0 0 0" }}>
                    Screen audition requests, open public notices, and wrap closed calls
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11.5px", fontWeight: "800", backgroundColor: "#fff1f8", color: "#ee008f", border: "1px solid #fce7f3" }}>
                  {pendingCastingsList.length} Pending
                </span>

                {/* POST IN-HOUSE CASTING CALL */}
                <button
                  type="button"
                  onClick={() => setShowPostOpportunityModal(true)}
                  style={{
                    background: "linear-gradient(135deg, #ee008f 0%, #db2777 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(238, 0, 143, 0.25)"
                  }}
                  title="Create and Publish In-House Casting Call"
                >
                  <Plus size={13} />
                  <span>Post In-House Casting</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                    setCastingSubTab("all");
                    setCastingsPage(1);
                    if (onTabChange) onTabChange("castings");
                  }}
                  style={{ 
                    background: "#0f172a", 
                    border: "none", 
                    color: "#ffffff", 
                    fontSize: "12px", 
                    fontWeight: "800", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    padding: "6px 14px", 
                    borderRadius: "10px",
                    boxShadow: "0 2px 6px rgba(15,23,42,0.15)"
                  }}
                  title="Open Dedicated Full Page Casting Desk"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Sub-tabs Row */}
            <div style={{ padding: "10px 24px", backgroundColor: "#fafaf9", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => { setCastingSubTab("pending"); setCastingsPage(1); }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: castingSubTab === "pending" ? "#fff1f8" : "transparent",
                    color: castingSubTab === "pending" ? "#ee008f" : "#64748b"
                  }}
                >
                  Pending Review ({pendingCastingsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setCastingSubTab("approved"); setCastingsPage(1); }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: castingSubTab === "approved" ? "#ecfdf5" : "transparent",
                    color: castingSubTab === "approved" ? "#059669" : "#64748b"
                  }}
                >
                  Live / Open ({approvedCastingsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setCastingSubTab("rejected"); setCastingsPage(1); }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: castingSubTab === "rejected" ? "#fff1f2" : "transparent",
                    color: castingSubTab === "rejected" ? "#e11d48" : "#64748b"
                  }}
                >
                  Closed ({rejectedCastingsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setCastingSubTab("all"); setCastingsPage(1); }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: castingSubTab === "all" ? "#f1f5f9" : "transparent",
                    color: castingSubTab === "all" ? "#0f172a" : "#64748b"
                  }}
                >
                  All Notices ({castings.length})
                </button>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                {isLoadingCastings && (
                  <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                    <RefreshCw size={11} className="animate-spin" /> Syncing DB...
                  </span>
                )}
                {/* Segmented View Mode Switcher */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#f1f5f9",
                  padding: "3px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}>
                  <button
                    type="button"
                    onClick={() => setCastingViewMode("list")}
                    title="List view"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "5px 9px",
                      borderRadius: "7px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: castingViewMode === "list" ? "#ffffff" : "transparent",
                      color: castingViewMode === "list" ? "#0f172a" : "#64748b",
                      boxShadow: castingViewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <List size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCastingViewMode("grid")}
                    title="Grid view"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "5px 9px",
                      borderRadius: "7px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: castingViewMode === "grid" ? "#ffffff" : "transparent",
                      color: castingViewMode === "grid" ? "#0f172a" : "#64748b",
                      boxShadow: castingViewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <LayoutGrid size={15} />
                  </button>
                </div>
              </div>
          </div>

          {/* Secondary Filter Row: Casting Discipline / Post Type & Audition Language */}
          <div style={{
            padding: "8px 24px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px"
          }}>
            {/* Discipline Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", marginRight: "4px" }}>
                DISCIPLINE:
              </span>
              {[
                { id: "ALL", label: "All Types" },
                { id: "ACTING", label: "🎭 Acting" },
                { id: "SINGING", label: "🎤 Singing" },
                { id: "DANCING", label: "💃 Dancing" },
                { id: "MODELING", label: "✨ Modeling" },
                { id: "CREW", label: "🎬 Direction & Crew" },
                { id: "CUSTOM", label: "🌟 Custom / Other" }
              ].map(t => {
                const isSel = castingDisciplineFilter === t.id;
                const count = disciplineCounts[t.id] ?? 0;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setCastingDisciplineFilter(t.id); setCastingsPage(1); }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11.5px",
                      fontWeight: isSel ? "800" : "600",
                      cursor: "pointer",
                      border: isSel ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                      backgroundColor: isSel ? "#0f172a" : "#f8fafc",
                      color: isSel ? "#ffffff" : "#475569",
                      transition: "all 0.15s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <span>{t.label}</span>
                    <span style={{
                      fontSize: "10.5px",
                      padding: "1px 5px",
                      borderRadius: "9999px",
                      backgroundColor: isSel ? "rgba(255,255,255,0.22)" : "#e2e8f0",
                      color: isSel ? "#ffffff" : "#64748b",
                      fontWeight: "700"
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Language Filter Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={13} color="#64748b" />
              <select
                value={castingLangFilter}
                onChange={(e) => { setCastingLangFilter(e.target.value); setCastingsPage(1); }}
                style={{
                  padding: "4px 8px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  color: castingLangFilter !== "ALL" ? "#7c3aed" : "#475569",
                  backgroundColor: castingLangFilter !== "ALL" ? "#f5f3ff" : "#ffffff",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="ALL">🌐 All Languages</option>
                {masterLanguagesList.map(l => (
                  <option key={l.id || l.name} value={l.name}>
                    {l.name} {l.nativeName ? `(${l.nativeName})` : ""}
                  </option>
                ))}
              </select>
              {(castingDisciplineFilter !== "ALL" || castingLangFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => { setCastingDisciplineFilter("ALL"); setCastingLangFilter("ALL"); setCastingsPage(1); }}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                  title="Clear filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Castings Content - List or Grid View */}
          {castingViewMode === "list" ? (
            <div style={{ overflowX: "hidden", width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>
                    <th style={{ padding: "12px 14px", width: "50%" }}>Project / Audition</th>
                    <th style={{ padding: "12px 10px", width: "25%" }}>Status & Date</th>
                    <th style={{ padding: "12px 14px", width: "25%", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCastings.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>
                        No casting notices in this category.
                      </td>
                    </tr>
                  ) : (
                    paginatedCastings.map((row) => (
                      <tr key={row.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <img 
                              src={getMediaUrl(row.thumb)} 
                              alt={row.project} 
                              onClick={() => setReviewCasting(row)}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100&auto=format&fit=crop&q=80";
                              }}
                              style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, marginTop: "2px", cursor: "pointer" }} 
                              title="Click to view details"
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div 
                                onClick={() => setReviewCasting(row)}
                                style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }} 
                                title="Click to view and screen full casting requirements"
                                onMouseEnter={(e) => e.currentTarget.style.color = "#ee008f"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#0f172a"}
                              >
                                {row.project}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                <span style={{ fontWeight: "600", color: "#7c3aed" }}>{row.category}</span> &bull; {row.formattedBudget || (row.budget ? `₹${row.budget}` : 'Discussable')}
                              </div>
                              <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                By: {row.talent || "Studio Producer"} {row.craft ? `(${row.craft})` : ""}
                              </div>
                              {(() => {
                                const discipline = getCastingDiscipline(row);
                                const badge = getDisciplineBadge(discipline);
                                return (
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                                    <span style={{
                                      fontSize: "10px",
                                      fontWeight: "800",
                                      padding: "1.5px 7px",
                                      borderRadius: "6px",
                                      backgroundColor: badge.bg,
                                      color: badge.text,
                                      border: `1px solid ${badge.border}`
                                    }}>
                                      {badge.label}
                                    </span>
                                    {row.requiredLanguages && (
                                      <span style={{ fontSize: "10.5px", fontWeight: "600", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                        🌐 {row.requiredLanguages}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                            <span style={{ 
                              padding: "2px 7px", 
                              borderRadius: "9999px", 
                              fontSize: "10px", 
                              fontWeight: "800", 
                              letterSpacing: "0.2px",
                              backgroundColor: row.priorityBg || "#f1f5f9", 
                              color: row.priorityColor || "#475569", 
                              border: `1px solid ${row.priorityBorder || "#cbd5e1"}` 
                            }}>
                              {row.priority || row.status}
                            </span>
                            <span style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "500" }}>
                              {row.submittedOn || "Recent"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "middle" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", flexWrap: "wrap" }}>
                            {/* Dedicated View / Review Button */}
                            <button
                              type="button"
                              onClick={() => setReviewCasting(row)}
                              style={{
                                padding: "5px 10px",
                                borderRadius: "8px",
                                backgroundColor: "#f8fafc",
                                color: "#0f172a",
                                border: "1px solid #cbd5e1",
                                fontSize: "11px",
                                fontWeight: "800",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              title="View full requirements, storyline & producer details"
                            >
                              <Eye size={12} color="#ee008f" /> View
                            </button>
                            {row.status === "IN_REVIEW" || row.status === "PENDING" ? (
                              canApproveCastings ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveCasting(row.id, row.project)}
                                    style={{ padding: "5px 12px", borderRadius: "8px", backgroundColor: "#059669", color: "#ffffff", border: "none", fontSize: "11px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                    title="Open casting call: make notice live so talents can apply"
                                  >
                                    <CheckCircle size={12} /> Open Casting
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectCasting(row.id, row.project)}
                                    style={{ padding: "5px 8px", borderRadius: "8px", backgroundColor: "#ffffff", color: "#dc2626", border: "1px solid #fecaca", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                                    title="Reject or close notice"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>
                                  Read Only
                                </span>
                              )
                            ) : row.status === "OPEN" ? (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "3px", padding: "4px 8px", backgroundColor: "#ecfdf5", borderRadius: "6px" }}>
                                  <CheckCircle size={12} /> Live
                                </span>
                                {canApproveCastings && (
                                  <button
                                    type="button"
                                    onClick={() => handleRejectCasting(row.id, row.project)}
                                    style={{ padding: "5px 10px", borderRadius: "8px", backgroundColor: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                                    title="Close Casting Call: wraps auditions and stops new applications"
                                  >
                                    Close Casting
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", padding: "4px 8px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
                                  Closed
                                </span>
                                {canApproveCastings && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveCasting(row.id, row.project)}
                                    style={{ padding: "5px 10px", borderRadius: "8px", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                                    title="Re-Open Casting Call: publish back to OPEN status"
                                  >
                                    Re-Open
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {/* Permanent Delete Button (Enabled if Super Admin or permission granted) */}
                            {canDeleteCastings && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCasting(row.id, row.project)}
                                style={{
                                  padding: "5px",
                                  borderRadius: "6px",
                                  backgroundColor: "#fff1f2",
                                  color: "#e11d48",
                                  border: "1px solid #ffe4e6",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                                title="Permanently Delete Casting from Database"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", padding: "16px 20px", backgroundColor: "#fbfcfe" }}>
              {displayedCastings.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", padding: "40px 16px", textAlign: "center", color: "#94a3b8", fontWeight: "600", backgroundColor: "#ffffff", borderRadius: "14px", border: "1.5px dashed #cbd5e1" }}>
                  No casting notices in this category.
                </div>
              ) : (
                paginatedCastings.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    }}
                  >
                    {/* Top Media Thumbnail */}
                    <div style={{ position: "relative", width: "100%", height: "140px", backgroundColor: "#0f172a", overflow: "hidden" }}>
                      <img
                        src={getMediaUrl(row.thumb)}
                        alt={row.project}
                        onClick={() => setReviewCasting(row)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80";
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                        title="Click to view details"
                      />
                      {/* Floating Status Pill */}
                      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "9999px",
                          fontSize: "10px",
                          fontWeight: "800",
                          letterSpacing: "0.2px",
                          backgroundColor: row.priorityBg || "#f1f5f9",
                          color: row.priorityColor || "#475569",
                          border: `1px solid ${row.priorityBorder || "#cbd5e1"}`,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.12)"
                        }}>
                          {row.priority || row.status}
                        </span>
                      </div>
                      {/* Floating Category Tag */}
                      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "10px",
                          fontWeight: "800",
                          backgroundColor: "rgba(15, 23, 42, 0.75)",
                          backdropFilter: "blur(4px)",
                          color: "#ffffff"
                        }}>
                          {row.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <div
                          onClick={() => setReviewCasting(row)}
                          style={{
                            fontWeight: "800",
                            color: "#0f172a",
                            fontSize: "14px",
                            cursor: "pointer",
                            lineHeight: 1.3,
                            marginBottom: "4px"
                          }}
                          title={row.project}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#ee008f"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#0f172a"}
                        >
                          {row.project}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          By: <span style={{ fontWeight: "700", color: "#334155" }}>{row.talent || "Studio Producer"}</span> {row.craft ? `(${row.craft})` : ""}
                        </div>
                        {(() => {
                          const discipline = getCastingDiscipline(row);
                          const badge = getDisciplineBadge(discipline);
                          return (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                              <span style={{
                                fontSize: "10px",
                                fontWeight: "800",
                                padding: "1.5px 7px",
                                borderRadius: "6px",
                                backgroundColor: badge.bg,
                                color: badge.text,
                                border: `1px solid ${badge.border}`
                              }}>
                                {badge.label}
                              </span>
                              {row.requiredLanguages && (
                                <span style={{ fontSize: "10.5px", fontWeight: "600", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                  🌐 {row.requiredLanguages}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f8fafc" }}>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669" }}>
                          {row.formattedBudget || (row.budget ? `₹${row.budget}` : 'Discussable')}
                        </span>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                          {row.submittedOn || "Recent"}
                        </span>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div style={{
                      padding: "10px 14px",
                      backgroundColor: "#f8fafc",
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px"
                    }}>
                      <button
                        type="button"
                        onClick={() => setReviewCasting(row)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "7px",
                          backgroundColor: "#ffffff",
                          color: "#0f172a",
                          border: "1px solid #cbd5e1",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                        title="View full requirements"
                      >
                        <Eye size={12} color="#ee008f" /> View
                      </button>

                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {row.status === "IN_REVIEW" || row.status === "PENDING" ? (
                          canApproveCastings ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveCasting(row.id, row.project)}
                                style={{ padding: "5px 10px", borderRadius: "7px", backgroundColor: "#059669", color: "#ffffff", border: "none", fontSize: "11px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                title="Open casting call"
                              >
                                <CheckCircle size={12} /> Open
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectCasting(row.id, row.project)}
                                style={{ padding: "5px 8px", borderRadius: "7px", backgroundColor: "#ffffff", color: "#dc2626", border: "1px solid #fecaca", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>Read Only</span>
                          )
                        ) : row.status === "OPEN" ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "3px", padding: "3px 6px", backgroundColor: "#ecfdf5", borderRadius: "6px" }}>
                              <CheckCircle size={12} /> Live
                            </span>
                            {canApproveCastings && (
                              <button
                                type="button"
                                onClick={() => handleRejectCasting(row.id, row.project)}
                                style={{ padding: "4px 8px", borderRadius: "7px", backgroundColor: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", fontSize: "10.5px", fontWeight: "800", cursor: "pointer" }}
                              >
                                Close
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", padding: "3px 6px", backgroundColor: "#ffffff", borderRadius: "6px" }}>Closed</span>
                            {canApproveCastings && (
                              <button
                                type="button"
                                onClick={() => handleApproveCasting(row.id, row.project)}
                                style={{ padding: "4px 8px", borderRadius: "7px", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", fontSize: "10.5px", fontWeight: "800", cursor: "pointer" }}
                              >
                                Re-Open
                              </button>
                            )}
                          </div>
                        )}

                        {canDeleteCastings && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCasting(row.id, row.project)}
                            style={{
                              padding: "5px",
                              borderRadius: "6px",
                              backgroundColor: "#fff1f2",
                              color: "#e11d48",
                              border: "1px solid #ffe4e6",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                            title="Delete casting"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination Toolbar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#fbfcfe",
            fontSize: "12px",
            color: "#64748b"
          }}>
            <div>
              Showing <span style={{ fontWeight: "700", color: "#0f172a" }}>
                {displayedCastings.length === 0 ? 0 : (castingsPage - 1) * ITEMS_PER_PAGE + 1}
              </span> to <span style={{ fontWeight: "700", color: "#0f172a" }}>
                {Math.min(castingsPage * ITEMS_PER_PAGE, displayedCastings.length)}
              </span> of <span style={{ fontWeight: "700", color: "#0f172a" }}>{displayedCastings.length}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                disabled={castingsPage <= 1}
                onClick={() => setCastingsPage(p => Math.max(1, p - 1))}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: castingsPage <= 1 ? "#f8fafc" : "#ffffff",
                  color: castingsPage <= 1 ? "#cbd5e1" : "#475569",
                  cursor: castingsPage <= 1 ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  fontSize: "11px",
                  fontWeight: "700"
                }}
              >
                <ChevronLeft size={13} /> Prev
              </button>

              {Array.from({ length: totalCastingPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCastingsPage(pageNum)}
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    border: pageNum === castingsPage ? "1px solid #ee008f" : "1px solid #e2e8f0",
                    backgroundColor: pageNum === castingsPage ? "#ee008f" : "#ffffff",
                    color: pageNum === castingsPage ? "#ffffff" : "#475569",
                    fontWeight: "800",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={castingsPage >= totalCastingPages}
                onClick={() => setCastingsPage(p => Math.min(totalCastingPages, p + 1))}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: castingsPage >= totalCastingPages ? "#f8fafc" : "#ffffff",
                  color: castingsPage >= totalCastingPages ? "#cbd5e1" : "#475569",
                  cursor: castingsPage >= totalCastingPages ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  fontSize: "11px",
                  fontWeight: "700"
                }}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

        {/* RIGHT CARD: TALENT KYC & BADGES */}
        {showKycCard && (
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "12px", backgroundColor: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={18} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                    Talent & User Management
                  </h3>
                  <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500", margin: "2px 0 0 0" }}>
                    Manage all registered users (Talents & Professionals) and star verification badges
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11.5px", fontWeight: "800", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                  {kycItems.length} Registered Users
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setKycSubTab("all");
                    setKycPage(1);
                    if (onTabChange && !singleCardView) onTabChange("talents");
                  }}
                  style={{ background: "#0f172a", border: "none", color: "#ffffff", fontSize: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(15,23,42,0.15)" }}
                  title="View All Users Full Screen"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

          {/* Sub-tabs Row with User Types & Verification */}
          <div style={{ padding: "10px 24px", backgroundColor: "#fafaf9", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => { setKycSubTab("all"); setKycPage(1); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: kycSubTab === "all" ? "#0f172a" : "transparent",
                  color: kycSubTab === "all" ? "#ffffff" : "#64748b"
                }}
              >
                All Users ({kycItems.length})
              </button>
              <button
                type="button"
                onClick={() => { setKycSubTab("talent"); setKycPage(1); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: kycSubTab === "talent" ? "#fff1f8" : "transparent",
                  color: kycSubTab === "talent" ? "#ee008f" : "#64748b"
                }}
              >
                Talents ({talentUsersList.length})
              </button>
              <button
                type="button"
                onClick={() => { setKycSubTab("pro"); setKycPage(1); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: kycSubTab === "pro" ? "#eff6ff" : "transparent",
                  color: kycSubTab === "pro" ? "#1d4ed8" : "#64748b"
                }}
              >
                Professionals ({proUsersList.length})
              </button>
              <button
                type="button"
                onClick={() => { setKycSubTab("queue"); setKycPage(1); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: kycSubTab === "queue" ? "#fffbeb" : "transparent",
                  color: kycSubTab === "queue" ? "#b45309" : "#64748b"
                }}
              >
                Pending ({pendingKycList.length})
              </button>
              <button
                type="button"
                onClick={() => { setKycSubTab("verified"); setKycPage(1); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: kycSubTab === "verified" ? "#ecfdf5" : "transparent",
                  color: kycSubTab === "verified" ? "#059669" : "#64748b"
                }}
              >
                Verified ({verifiedKycList.length})
              </button>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              {isLoadingKyc && (
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                  <RefreshCw size={11} className="animate-spin" /> Syncing DB...
                </span>
              )}
              {/* Segmented View Mode Switcher */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "#f1f5f9",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}>
                <button
                  type="button"
                  onClick={() => setKycViewMode("list")}
                  title="List view"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px 9px",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: kycViewMode === "list" ? "#ffffff" : "transparent",
                    color: kycViewMode === "list" ? "#0f172a" : "#64748b",
                    boxShadow: kycViewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setKycViewMode("grid")}
                  title="Grid view"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px 9px",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: kycViewMode === "grid" ? "#ffffff" : "transparent",
                    color: kycViewMode === "grid" ? "#0f172a" : "#64748b",
                    boxShadow: kycViewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>
          </div>



          {/* KYC Content - List or Grid View */}
          {kycViewMode === "list" ? (
            <div style={{ overflowX: "hidden", width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>
                    <th style={{ padding: "12px 14px", width: "50%" }}>User Profile & Role</th>
                    <th style={{ padding: "12px 10px", width: "25%" }}>Status & Badge</th>
                    <th style={{ padding: "12px 14px", width: "25%", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedKyc.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>
                        No registered user records found in this category.
                      </td>
                    </tr>
                  ) : (
                    paginatedKyc.map((row) => (
                      <tr key={row.id || row.userId} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <img 
                              src={getMediaUrl(row.avatar)} 
                              alt={row.talent} 
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80";
                              }}
                              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, marginTop: "2px" }} 
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.talent}>
                                  {row.talent}
                                </div>
                                <span style={{
                                  fontSize: "9.5px",
                                  fontWeight: "800",
                                  padding: "1px 6px",
                                  borderRadius: "6px",
                                  backgroundColor: row.accountType === "PROFESSIONAL" ? "#eff6ff" : "#fdf2f8",
                                  color: row.accountType === "PROFESSIONAL" ? "#1d4ed8" : "#be185d",
                                  border: `1px solid ${row.accountType === "PROFESSIONAL" ? "#bfdbfe" : "#fbcfe8"}`
                                }}>
                                  {row.accountType || "TALENT"}
                                </span>
                                {(() => {
                                  const discBadge = getTalentDisciplineBadge(row);
                                  return (
                                    <span style={{
                                      fontSize: "9.5px",
                                      fontWeight: "800",
                                      padding: "1px 6px",
                                      borderRadius: "6px",
                                      backgroundColor: discBadge.bg,
                                      color: discBadge.text,
                                      border: `1px solid ${discBadge.border}`
                                    }}>
                                      {discBadge.label}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                <span style={{ fontWeight: "700", color: "#ee008f" }}>{row.primaryProfession || row.craft || "Artist"}</span> &bull; {row.email || "No email"}
                              </div>
                              {(row.actingLanguages || row.languages) && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px", flexWrap: "wrap" }}>
                                  <Globe size={10} color="#7c3aed" />
                                  {(row.actingLanguages || row.languages).split(",").slice(0, 3).map((lang, lIdx) => (
                                    <span key={lIdx} style={{ fontSize: "9.5px", fontWeight: "700", backgroundColor: "#f5f3ff", color: "#6d28d9", padding: "1px 5px", borderRadius: "4px", border: "1px solid #ddd6fe" }}>
                                      {lang.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>
                                {row.location || "India"} &bull; Joined: {row.submittedOn || "Recent"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                            <span style={{ 
                              padding: "2px 7px", 
                              borderRadius: "9999px", 
                              fontSize: "10px", 
                              fontWeight: "800", 
                              letterSpacing: "0.2px",
                              backgroundColor: row.statusBg || (row.idVerified ? "#ecfdf5" : "#fffbeb"), 
                              color: row.statusColor || (row.idVerified ? "#059669" : "#b45309"), 
                              border: `1px solid ${row.statusBorder || (row.idVerified ? "#a7f3d0" : "#fde68a")}` 
                            }}>
                              {row.idVerified ? "VERIFIED STAR" : "PENDING KYC"}
                            </span>
                            <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>
                              {row.docType || "Govt Photo ID"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "middle" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleOpenTalentDetails(row)}
                              style={{
                                padding: "5px 10px",
                                borderRadius: "8px",
                                backgroundColor: "#f8fafc",
                                color: "#0f172a",
                                border: "1px solid #cbd5e1",
                                fontSize: "11px",
                                fontWeight: "800",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              title={`View full dossier & manage details for ${row.talent}`}
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                            {!row.idVerified ? (
                              canVerifyKyc ? (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyKyc(row.userId || row.id, row.talent)}
                                  style={{ padding: "5px 12px", borderRadius: "8px", backgroundColor: "#7c3aed", color: "#ffffff", border: "none", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                                  title="Award Verified Star Badge to talent profile in PostgreSQL database"
                                >
                                  Verify & Badge
                                </button>
                              ) : (
                                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>
                                  Read Only
                                </span>
                              )
                            ) : (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                  <ShieldCheck size={13} /> Badged
                                </span>
                                {canVerifyKyc && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeKyc(row.userId || row.id, row.talent)}
                                    style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "#ffffff", color: "#dc2626", border: "1px solid #fecaca", fontSize: "10.5px", fontWeight: "700", cursor: "pointer" }}
                                    title="Revoke Verified badge"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", padding: "16px 20px", backgroundColor: "#fbfcfe" }}>
              {displayedKyc.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", padding: "40px 16px", textAlign: "center", color: "#94a3b8", fontWeight: "600", backgroundColor: "#ffffff", borderRadius: "14px", border: "1.5px dashed #cbd5e1" }}>
                  No registered user records found in this category.
                </div>
              ) : (
                paginatedKyc.map((row) => (
                  <div
                    key={row.id || row.userId}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    }}
                  >
                    {/* Top Profile Header */}
                    <div style={{ padding: "14px", backgroundColor: "#fafaf9", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={getMediaUrl(row.avatar)}
                        alt={row.talent}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80";
                        }}
                        style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #ffffff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "13.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.talent}>
                            {row.talent}
                          </div>
                          <span style={{
                            fontSize: "9px",
                            fontWeight: "800",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            backgroundColor: row.accountType === "PROFESSIONAL" ? "#eff6ff" : "#fdf2f8",
                            color: row.accountType === "PROFESSIONAL" ? "#1d4ed8" : "#be185d",
                            border: `1px solid ${row.accountType === "PROFESSIONAL" ? "#bfdbfe" : "#fbcfe8"}`
                          }}>
                            {row.accountType || "TALENT"}
                          </span>
                          {(() => {
                            const discBadge = getTalentDisciplineBadge(row);
                            return (
                              <span style={{
                                fontSize: "9px",
                                fontWeight: "800",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                backgroundColor: discBadge.bg,
                                color: discBadge.text,
                                border: `1px solid ${discBadge.border}`
                              }}>
                                {discBadge.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#ee008f", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {row.primaryProfession || row.craft || "Artist"}
                        </div>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: "#64748b" }}>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        ✉️ {row.email || "No email"}
                      </div>
                      <div style={{ fontSize: "10.5px" }}>
                        📍 {row.location || "India"} &bull; {row.submittedOn || "Recent"}
                      </div>
                      {(row.actingLanguages || row.languages) && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px", flexWrap: "wrap" }}>
                          <Globe size={11} color="#7c3aed" />
                          {(row.actingLanguages || row.languages).split(",").slice(0, 3).map((lang, lIdx) => (
                            <span key={lIdx} style={{ fontSize: "9.5px", fontWeight: "700", backgroundColor: "#f5f3ff", color: "#6d28d9", padding: "1px 5px", borderRadius: "4px", border: "1px solid #ddd6fe" }}>
                              {lang.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: "auto", paddingTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                          padding: "2px 7px",
                          borderRadius: "9999px",
                          fontSize: "9.5px",
                          fontWeight: "800",
                          backgroundColor: row.statusBg || (row.idVerified ? "#ecfdf5" : "#fffbeb"),
                          color: row.statusColor || (row.idVerified ? "#059669" : "#b45309"),
                          border: `1px solid ${row.statusBorder || (row.idVerified ? "#a7f3d0" : "#fde68a")}`
                        }}>
                          {row.idVerified ? "VERIFIED STAR" : "PENDING KYC"}
                        </span>
                        <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>
                          {row.docType || "Govt Photo ID"}
                        </span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div style={{
                      padding: "10px 14px",
                      backgroundColor: "#f8fafc",
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <button
                        type="button"
                        onClick={() => handleOpenTalentDetails(row)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          borderRadius: "8px",
                          backgroundColor: "#ffffff",
                          color: "#0f172a",
                          border: "1px solid #cbd5e1",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px"
                        }}
                        title={`View & manage ${row.talent}`}
                      >
                        <Eye size={12} />
                        <span>Details</span>
                      </button>

                      {!row.idVerified ? (
                        canVerifyKyc ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyKyc(row.userId || row.id, row.talent)}
                            style={{ flex: 1, padding: "6px 10px", borderRadius: "8px", backgroundColor: "#7c3aed", color: "#ffffff", border: "none", fontSize: "11px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                            title="Award Verified Star Badge"
                          >
                            <ShieldCheck size={12} /> Verify
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>Read Only</span>
                        )
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                            <ShieldCheck size={12} /> Badged
                          </span>
                          {canVerifyKyc && (
                            <button
                              type="button"
                              onClick={() => handleRevokeKyc(row.userId || row.id, row.talent)}
                              style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "#ffffff", color: "#dc2626", border: "1px solid #fecaca", fontSize: "10.5px", fontWeight: "700", cursor: "pointer" }}
                              title="Revoke Verified badge"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination Toolbar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#fbfcfe",
            fontSize: "12px",
            color: "#64748b"
          }}>
            <div>
              Showing <span style={{ fontWeight: "700", color: "#0f172a" }}>
                {displayedKyc.length === 0 ? 0 : (kycPage - 1) * ITEMS_PER_PAGE + 1}
              </span> to <span style={{ fontWeight: "700", color: "#0f172a" }}>
                {Math.min(kycPage * ITEMS_PER_PAGE, displayedKyc.length)}
              </span> of <span style={{ fontWeight: "700", color: "#0f172a" }}>{displayedKyc.length}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                disabled={kycPage <= 1}
                onClick={() => setKycPage(p => Math.max(1, p - 1))}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: kycPage <= 1 ? "#f8fafc" : "#ffffff",
                  color: kycPage <= 1 ? "#cbd5e1" : "#475569",
                  cursor: kycPage <= 1 ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  fontSize: "11px",
                  fontWeight: "700"
                }}
              >
                <ChevronLeft size={13} /> Prev
              </button>

              {Array.from({ length: totalKycPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setKycPage(pageNum)}
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    border: pageNum === kycPage ? "1px solid #7c3aed" : "1px solid #e2e8f0",
                    backgroundColor: pageNum === kycPage ? "#7c3aed" : "#ffffff",
                    color: pageNum === kycPage ? "#ffffff" : "#475569",
                    fontWeight: "800",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={kycPage >= totalKycPages}
                onClick={() => setKycPage(p => Math.min(totalKycPages, p + 1))}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: kycPage >= totalKycPages ? "#f8fafc" : "#ffffff",
                  color: kycPage >= totalKycPages ? "#cbd5e1" : "#475569",
                  cursor: kycPage >= totalKycPages ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  fontSize: "11px",
                  fontWeight: "700"
                }}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* ============================================================== */}
      {/* ROW 2: THREE SIDE-BY-SIDE CARDS (33.3% / 33.3% / 33.3%) */}
      {/* ============================================================== */}
      {!singleCardView && (
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          
          {/* CARD 1: RECENT ACTIVITY */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} style={{ color: "#ee008f" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                    Recent Activity
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => onTabChange && onTabChange("security")}
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px" }}
                  title="View Security & Activity Logs"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </div>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* 1 */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fff1f8", color: "#ee008f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <ShoppingBag size={14} />
                  </div>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#1e293b" }}>New casting request submitted</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Urban Lifestyle Shoot</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", whiteSpace: "nowrap" }}>10:12 AM</span>
              </div>

              {/* 2 */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <ShieldCheck size={14} />
                  </div>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#1e293b" }}>Talent KYC verified</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Neha Singh (Passport)</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", whiteSpace: "nowrap" }}>09:45 AM</span>
              </div>

              {/* 3 */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <CreditCard size={14} />
                  </div>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#1e293b" }}>Escrow payment released</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Project #CP-1023</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", whiteSpace: "nowrap" }}>09:20 AM</span>
              </div>

              {/* 4 */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <Users size={14} />
                  </div>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#1e293b" }}>New talent registered</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Rohit Kumar</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", whiteSpace: "nowrap" }}>08:55 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: SYSTEM HEALTH */}
        <div 
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Heart size={18} style={{ color: "#f43f5e" }} />
                <div style={{ textAlign: "left" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                    System Health
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: "500", margin: "2px 0 0 0" }}>
                    All systems operational
                  </p>
                </div>
              </div>
              <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11.5px", fontWeight: "800", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                99.98% Uptime
              </span>
            </div>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              {["Application Servers", "Database", "File Storage", "Payment Gateway", "KYC Service"].map((service) => (
                <div key={service} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#1e293b" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                    <span>{service}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>Operational</span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[...Array(6)].map((_, i) => (
                        <span key={i} style={{ width: "3.5px", height: "14px", borderRadius: "2px", backgroundColor: "#10b981" }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: QUICK ACTIONS */}
        <div 
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <Rocket size={18} style={{ color: "#7c3aed" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                Quick Actions
              </h3>
            </div>

            {/* 6 Actions in 2x3 Grid matching reference */}
            <div 
              style={{
                marginTop: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px"
              }}
            >
              {/* 1. Create Casting */}
              <button
                type="button"
                onClick={() => setShowPostOpportunityModal(true)}
                style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#fff1f8", border: "none", color: "#be185d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#fce7f3", color: "#ee008f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Film size={16} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Create Casting</span>
              </button>

              {/* 2. Full Casting Desk / Add Talent */}
              <button
                type="button"
                onClick={() => onTabChange && onTabChange("castings")}
                style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#fdf2f8", border: "none", color: "#be185d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#fbcfe8", color: "#ee008f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Film size={16} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Screen Notices</span>
              </button>

              {/* 3. Review KYC / Talent Submissions */}
              {canVerifyKyc ? (
                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange("kyc")}
                  style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#eef2ff", border: "none", color: "#4338ca", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldCheck size={16} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Review KYC</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setCastingSubTab("approved"); setCastingsPage(1); }}
                  style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#ecfdf5", border: "none", color: "#065f46", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle size={16} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Live Auditions</span>
                </button>
              )}

              {/* 4. Manage RBAC / Wrap Auditions */}
              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={onOpenRbac}
                  style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#fffbeb", border: "none", color: "#92400e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Lock size={16} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Manage RBAC</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setCastingSubTab("rejected"); setCastingsPage(1); }}
                  style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#fff1f2", border: "none", color: "#9f1239", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#ffe4e6", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertCircle size={16} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Closed Calls</span>
                </button>
              )}

              {/* 5. Release Escrow / Activity Audit */}
              {isSuperAdmin || adminUser?.permissions?.escrow?.approve ? (
                <button
                  type="button"
                  onClick={() => showSuccess("Escrow", "Opening escrow disbursement drawer...")}
                  style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#f0f9ff", border: "none", color: "#0369a1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCard size={16} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Release Escrow</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange("security")}
                  style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#f5f3ff", border: "none", color: "#5b21b6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={16} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Activity Audit</span>
                </button>
              )}

              {/* 6. View Reports */}
              <button
                type="button"
                onClick={() => { setCastingSubTab("all"); setCastingsPage(1); }}
                style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#ecfdf5", border: "none", color: "#065f46", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BarChart3 size={16} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>All Notices</span>
              </button>

              {/* 7. Skills & Crafts Catalog */}
              <button
                type="button"
                onClick={() => {
                  if (onTabChange) {
                    onTabChange("skills");
                  } else {
                    setShowSkillsModal(true);
                    refreshAdminSkills();
                  }
                }}
                style={{ padding: "12px 6px", borderRadius: "14px", backgroundColor: "#fdf2f8", border: "none", color: "#be185d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                title="Manage master creative skills available to talent profiles"
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#fce7f3", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={16} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: "800", textAlign: "center" }}>Skills & Crafts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ─── Casting Call Review & Screening Modal ─── */}
    {reviewCasting && (
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(5px)",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}
        onClick={() => setReviewCasting(null)}
      >
        <div 
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "740px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            position: "sticky",
            top: 0,
            backgroundColor: "#ffffff",
            zIndex: 10,
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                <span style={{ 
                  padding: "3px 8px", 
                  borderRadius: "6px", 
                  backgroundColor: "#f5f3ff", 
                  color: "#7c3aed", 
                  fontWeight: "800", 
                  fontSize: "11px" 
                }}>
                  {reviewCasting.category || "Feature Film"}
                </span>
                <span style={{ 
                  padding: "3px 8px", 
                  borderRadius: "9999px", 
                  fontSize: "11px", 
                  fontWeight: "800",
                  backgroundColor: reviewCasting.priorityBg || "#f8fafc",
                  color: reviewCasting.priorityColor || "#64748b",
                  border: `1px solid ${reviewCasting.priorityBorder || "#cbd5e1"}`
                }}>
                  {reviewCasting.priority || reviewCasting.status}
                </span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                {reviewCasting.project}
              </h3>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Submitted by <strong style={{ color: "#334155" }}>{reviewCasting.talent}</strong> on {reviewCasting.submittedOn}
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setReviewCasting(null)}
              style={{
                background: "#f1f5f9",
                border: "none",
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
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Media Preview (Poster & Video Monologue) */}
            {(reviewCasting.posterUrl || reviewCasting.thumb || reviewCasting.videoUrl) && (
              <div style={{ display: "grid", gridTemplateColumns: reviewCasting.videoUrl ? "1fr 1fr" : "1fr", gap: "16px" }}>
                {(reviewCasting.posterUrl || reviewCasting.thumb) && (
                  <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", backgroundColor: "#0f172a", maxHeight: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img 
                      src={getMediaUrl(reviewCasting.posterUrl || reviewCasting.thumb)} 
                      alt={reviewCasting.project} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80";
                      }}
                      style={{ width: "100%", height: "100%", maxHeight: "240px", objectFit: "contain" }} 
                    />
                  </div>
                )}
                {reviewCasting.videoUrl && (
                  <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", backgroundColor: "#0f172a", padding: "12px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f472b6", fontSize: "12px", fontWeight: "800", marginBottom: "8px" }}>
                      <Video size={14} /> Audition Video Brief Attached
                    </div>
                    <video 
                      controls 
                      src={getMediaUrl(reviewCasting.videoUrl)} 
                      style={{ width: "100%", maxHeight: "190px", borderRadius: "8px" }} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4 Key Metrics Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: "700" }}>
                  <IndianRupee size={13} color="#ee008f" /> Budget / Pay
                </div>
                <div style={{ fontSize: "15px", fontWeight: "900", color: "#16a34a", marginTop: "4px" }}>
                  {reviewCasting.formattedBudget || (reviewCasting.budget ? `₹${reviewCasting.budget}` : "Discussable")}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: "700" }}>
                  <MapPin size={13} color="#ee008f" /> Shoot Location
                </div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                  {reviewCasting.location || "Pan India"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: "700" }}>
                  <Calendar size={13} color="#ee008f" /> Audition Deadline
                </div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                  {reviewCasting.applicationDeadline || "Open"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: "700" }}>
                  <Clock size={13} color="#ee008f" /> Shoot Schedule
                </div>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                  {reviewCasting.shootStartDate ? `${reviewCasting.shootStartDate} to ${reviewCasting.shootEndDate || 'TBD'}` : "Flexible"}
                </div>
              </div>
            </div>

            {/* Role & Character Demographics */}
            <div style={{ padding: "16px", backgroundColor: "#fffafd", borderRadius: "12px", border: "1px solid #fce7f3" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "900", color: "#be185d", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Character & Talent Criteria
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "12px" }}>
                <div style={{ background: "#ffffff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #fbcfe8" }}>
                  <strong>Role/Craft:</strong> {reviewCasting.customCraft || reviewCasting.craft || reviewCasting.roleType || "Any Role"}
                </div>
                {(() => {
                  const discipline = getCastingDiscipline(reviewCasting);
                  const badge = getDisciplineBadge(discipline);
                  return (
                    <div style={{ background: badge.bg, padding: "6px 12px", borderRadius: "8px", border: `1px solid ${badge.border}`, color: badge.text }}>
                      <strong>Discipline:</strong> {badge.label}
                    </div>
                  );
                })()}
                {reviewCasting.requiredLanguages && (
                  <div style={{ background: "#f5f3ff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #ddd6fe", color: "#6b21a8" }}>
                    <strong>Languages:</strong> 🌐 {reviewCasting.requiredLanguages}
                  </div>
                )}
                <div style={{ background: "#ffffff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #fbcfe8" }}>
                  <strong>Gender:</strong> {reviewCasting.gender || "All Genders"}
                </div>
                <div style={{ background: "#ffffff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #fbcfe8" }}>
                  <strong>Age:</strong> {reviewCasting.age ? `${reviewCasting.age} years` : "All Ages"}
                </div>
                {(reviewCasting.height || reviewCasting.weight) && (
                  <div style={{ background: "#ffffff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #fbcfe8" }}>
                    <strong>Physical:</strong> {reviewCasting.height ? `Height: ${reviewCasting.height}` : ""} {reviewCasting.weight ? `• Weight: ${reviewCasting.weight}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Project Synopsis / Description */}
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={14} color="#ee008f" /> Storyline / Project Synopsis
              </h4>
              <div style={{ padding: "14px 16px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {reviewCasting.description || "No detailed synopsis provided."}
              </div>
            </div>

            {/* Audition Requirements & Script Instructions */}
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <Film size={14} color="#ee008f" /> Audition Instructions & Guidelines
              </h4>
              <div style={{ padding: "14px 16px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {reviewCasting.requirements || "No specific monologue instructions provided."}
              </div>
            </div>

            {/* Producer Verification Box */}
            <div style={{ padding: "12px 16px", backgroundColor: "#f1f5f9", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12px" }}>
              <div>
                <span style={{ color: "#64748b" }}>Production Contact: </span>
                <strong style={{ color: "#0f172a" }}>{reviewCasting.talent}</strong>
                {reviewCasting.postedByEmail && <span style={{ color: "#475569" }}> &bull; {reviewCasting.postedByEmail}</span>}
              </div>
              {reviewCasting.postedByPhone && (
                <div style={{ color: "#059669", fontWeight: "700" }}>
                  📞 {reviewCasting.postedByPhone}
                </div>
              )}
            </div>

          </div>

          {/* Modal Decision Footer */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {canDeleteCastings && (
                <button
                  type="button"
                  onClick={() => {
                    const c = reviewCasting;
                    setReviewCasting(null);
                    handleDeleteCasting(c.id, c.project);
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#fff1f2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Trash2 size={14} /> Delete Notice
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setReviewCasting(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                Close
              </button>

              {canApproveCastings && (
                <>
                  {(reviewCasting.status === "IN_REVIEW" || reviewCasting.status === "PENDING") && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const c = reviewCasting;
                          setReviewCasting(null);
                          handleRejectCasting(c.id, c.project);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          backgroundColor: "#ffffff",
                          border: "1.5px solid #fecaca",
                          color: "#dc2626",
                          fontSize: "12px",
                          fontWeight: "800",
                          cursor: "pointer"
                        }}
                      >
                        ✕ Reject Notice
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const c = reviewCasting;
                          setReviewCasting(null);
                          handleApproveCasting(c.id, c.project);
                        }}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "8px",
                          backgroundColor: "#059669",
                          border: "none",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)"
                        }}
                      >
                        <CheckCircle size={14} /> Approve & Publish Live
                      </button>
                    </>
                  )}

                  {reviewCasting.status === "OPEN" && (
                    <button
                      type="button"
                      onClick={() => {
                        const c = reviewCasting;
                        setReviewCasting(null);
                        handleRejectCasting(c.id, c.project);
                      }}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        backgroundColor: "#fff1f2",
                        border: "1.5px solid #fecaca",
                        color: "#e11d48",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer"
                      }}
                    >
                      Close Casting Call
                    </button>
                  )}

                  {reviewCasting.status === "CLOSED" && (
                    <button
                      type="button"
                      onClick={() => {
                        const c = reviewCasting;
                        setReviewCasting(null);
                        handleApproveCasting(c.id, c.project);
                      }}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        backgroundColor: "#ecfdf5",
                        border: "1.5px solid #a7f3d0",
                        color: "#059669",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <CheckCircle size={14} /> Re-Open Casting
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    )}

    {/* ─── Platform Master Skills Catalog Management Modal ─── */}
    {showSkillsModal && (
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(5px)",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}
        onClick={() => setShowSkillsModal(false)}
      >
        <div 
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "760px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            position: "sticky",
            top: 0,
            backgroundColor: "#ffffff",
            zIndex: 10,
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px"
          }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#fdf2f8", color: "#be185d", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                <Tag size={13} /> Platform Taxonomy
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                Master Skills & Crafts Catalog
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
                Add official skills to the database so talent users can pick and feature them on their profiles.
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowSkillsModal(false)}
              style={{
                background: "#f1f5f9",
                border: "none",
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
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* 1. Add New Master Skill Form */}
            <form onSubmit={handleCreateSkill} style={{ backgroundColor: "#faf5ff", border: "1.5px solid #e9d5ff", borderRadius: "14px", padding: "18px 20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#6b21a8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={15} /> Add New Skill to PostgreSQL Database
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Drone Cinematography, Method Acting..."
                    required
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "12.5px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                    Craft Category
                  </label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "12.5px",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="Acting & Performance">Acting & Performance</option>
                    <option value="Technical & Camera">Technical & Camera</option>
                    <option value="Music & Voice">Music & Voice</option>
                    <option value="Dance & Movement">Dance & Movement</option>
                    <option value="Writing & Direction">Writing & Direction</option>
                    <option value="Stunts & Action">Stunts & Action</option>
                    <option value="Styling & Makeup">Styling & Makeup</option>
                    <option value="Art & Production Design">Art & Production Design</option>
                    <option value="Post Production & VFX">Post Production & VFX</option>
                    <option value="General Creative">General Creative</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSkill || !newSkillName.trim()}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    backgroundColor: isSubmittingSkill || !newSkillName.trim() ? "#cbd5e1" : "#7c3aed",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: "800",
                    fontSize: "12.5px",
                    cursor: isSubmittingSkill || !newSkillName.trim() ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)"
                  }}
                >
                  <Plus size={15} /> {isSubmittingSkill ? "Adding..." : "+ Add to Catalog"}
                </button>
              </div>
            </form>

            {/* 2. Search & Overview bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>
                Active Platform Skills ({adminSkillsList.length})
              </div>
              <div style={{ position: "relative", minWidth: "240px" }}>
                <Search size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  placeholder="Search skills or craft..."
                  style={{
                    width: "100%",
                    padding: "7px 12px 7px 32px",
                    borderRadius: "8px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "12px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* 3. Live Master Skills Grid */}
            {isLoadingSkills ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: "0 auto 8px auto" }} />
                Loading live skills from PostgreSQL...
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {adminSkillsList
                  .filter(s => 
                    s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) || 
                    (s.category && s.category.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                  )
                  .map((skill) => (
                    <div 
                      key={skill.id}
                      style={{
                        padding: "12px 14px",
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={skill.name}>
                          {skill.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#7c3aed", backgroundColor: "#f5f3ff", padding: "1px 6px", borderRadius: "4px" }}>
                            {skill.category || "Creative"}
                          </span>
                          {skill.usageCount > 0 && (
                            <span style={{ fontSize: "10px", fontWeight: "700", color: "#059669" }}>
                              👥 {skill.usageCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMasterSkill(skill.id, skill.name)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "6px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center"
                        }}
                        title={`Delete ${skill.name}`}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fee2e2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px"
          }}>
            <div style={{ fontSize: "11.5px", color: "#64748b" }}>
              Total: <strong>{adminSkillsList.length} master skills</strong> in PostgreSQL database
            </div>
            <button
              type="button"
              onClick={() => setShowSkillsModal(false)}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                border: "none",
                fontWeight: "800",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Done
            </button>
          </div>

        </div>
      </div>
    )}

    {/* POST IN-HOUSE OPPORTUNITY MODAL */}
    {showPostOpportunityModal && (
      <PostOpportunityModal
        onClose={() => setShowPostOpportunityModal(false)}
        onCreated={(newOpp) => {
          setShowPostOpportunityModal(false);
          refreshCastings();
          showSuccess("Opportunity Published", `"${newOpp?.title || "Casting Call"}" has been published live to BookMyStars!`);
        }}
      />
    )}

    {/* ============================================================== */}
    {/* TALENT DETAILS & ADMINISTRATIVE MANAGEMENT DOSSIER MODAL */}
    {/* ============================================================== */}
    {selectedTalentForDetails && (
      <div 
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }}
        onClick={() => {
          setSelectedTalentForDetails(null);
          setIsEditingTalent(false);
        }}
      >
        <div 
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "760px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #e2e8f0",
            overflow: "hidden"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #faf5ff, #fdf2f8)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img 
                src={getMediaUrl(selectedTalentForDetails.avatar)} 
                alt={selectedTalentForDetails.talent} 
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80";
                }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
                    {selectedTalentForDetails.talent}
                  </h3>
                  {selectedTalentForDetails.idVerified && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "#059669", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "1px 7px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
                      <ShieldCheck size={12} /> Verified Star
                    </span>
                  )}
                  <span style={{ fontSize: "10px", fontWeight: "800", padding: "1px 6px", borderRadius: "6px", backgroundColor: "#f1f5f9", color: "#475569" }}>
                    ID #{selectedTalentForDetails.userId || selectedTalentForDetails.id}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#ee008f", fontWeight: "700", marginTop: "3px" }}>
                  {selectedTalentForDetails.primaryProfession || selectedTalentForDetails.craft || "Creative Talent"}
                  {selectedTalentForDetails.stageName && (
                    <span style={{ color: "#64748b", fontWeight: "600", marginLeft: "6px" }}>
                      • Screen Name: <em>"{selectedTalentForDetails.stageName}"</em>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setIsEditingTalent(!isEditingTalent)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "10px",
                  border: isEditingTalent ? "1px solid #cbd5e1" : "1px solid #e9d5ff",
                  backgroundColor: isEditingTalent ? "#f8fafc" : "#faf5ff",
                  color: isEditingTalent ? "#475569" : "#7c3aed",
                  fontWeight: "800",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <Edit3 size={13} />
                <span>{isEditingTalent ? "Cancel Edit" : "Edit Details"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTalentForDetails(null);
                  setIsEditingTalent(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "8px",
                  color: "#64748b"
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Action Banners & Quick Links */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                  Account Type: <strong>{selectedTalentForDetails.accountType || "TALENT"}</strong>
                </span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Joined: {selectedTalentForDetails.submittedOn || "Recent"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <a
                  href={`/profile/${selectedTalentForDetails.userId || selectedTalentForDetails.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "800",
                    color: "#0284c7",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none"
                  }}
                >
                  <ExternalLink size={12} /> View Public Portfolio
                </a>
              </div>
            </div>

            {/* If Edit Mode is Active: Show Form */}
            {isEditingTalent ? (
              <form onSubmit={handleSaveTalentDetails} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input 
                      type="text"
                      required
                      value={editTalentForm.fullName}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, fullName: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Stage / Screen Name
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Star Rohan"
                      value={editTalentForm.stageName}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, stageName: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Primary Profession *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Actor, Dancer, Model"
                      value={editTalentForm.primaryProfession}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, primaryProfession: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Location / City
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={editTalentForm.location}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, location: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Mobile Contact Number
                    </label>
                    <input 
                      type="text"
                      placeholder="+91..."
                      value={editTalentForm.phone}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Talent Discipline / Category
                    </label>
                    <select
                      value={editTalentForm.talentCategory || "ACTING"}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, talentCategory: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff", boxSizing: "border-box" }}
                    >
                      <option value="ACTING">🎭 Acting / Drama</option>
                      <option value="SINGING">🎤 Singing / Music</option>
                      <option value="DANCING">💃 Dancing / Choreography</option>
                      <option value="MODELING">✨ Modeling / Fashion</option>
                      <option value="CREW">🎬 Crew / Direction & Tech</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Languages Spoken (Conversational)
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Hindi, English, Tamil"
                      value={editTalentForm.languages}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, languages: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#7c3aed", marginBottom: "6px" }}>
                      Performance / Acting Languages
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Hindi, Telugu, Tamil, Malayalam"
                      value={editTalentForm.actingLanguages}
                      onChange={(e) => setEditTalentForm(prev => ({ ...prev, actingLanguages: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #c4b5fd", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                    Talent Bio / About
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Enter talent bio or administrative summary..."
                    value={editTalentForm.bio}
                    onChange={(e) => setEditTalentForm(prev => ({ ...prev, bio: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    disabled={isSavingTalent}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "10px",
                      backgroundColor: "#059669",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: isSavingTalent ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Save size={14} />
                    <span>{isSavingTalent ? "Saving..." : "Save to Database"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTalent(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Read-Only Dossier View */
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                
                {/* 1. Contact & Identity Grid */}
                <div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Identity & Contact Coordinates
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                    <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Corporate Email</div>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                        {selectedTalentForDetails.email || "No email"}
                      </div>
                    </div>
                    <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Mobile Number</div>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                        {selectedTalentForDetails.phone || "No phone registered"}
                      </div>
                    </div>
                    <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Location / Base City</div>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                        {selectedTalentForDetails.location || "India"}
                      </div>
                    </div>
                    <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Gender & DOB</div>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                        {selectedTalentForDetails.gender || "Not specified"} {selectedTalentForDetails.dateOfBirth && `(${selectedTalentForDetails.dateOfBirth})`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Professional & Craft Qualifications */}
                <div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Professional Craft & Credentials
                  </h4>
                  <div style={{ padding: "16px", backgroundColor: "#fafaf9", borderRadius: "14px", border: "1px solid #e7e5e4", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: "#57534e", fontWeight: "700" }}>Primary Discipline:</span>
                      <span style={{ padding: "3px 10px", borderRadius: "8px", backgroundColor: "#fff1f8", color: "#ee008f", fontWeight: "800", fontSize: "12px", border: "1px solid #fbcfe8" }}>
                        {selectedTalentForDetails.primaryProfession || selectedTalentForDetails.craft || "Artist"}
                      </span>
                      {(() => {
                        const disc = getTalentDisciplineBadge(selectedTalentForDetails);
                        return (
                          <span style={{ padding: "3px 10px", borderRadius: "8px", backgroundColor: disc.bg, color: disc.text, fontWeight: "800", fontSize: "12px", border: `1px solid ${disc.border}` }}>
                            {disc.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Languages Spoken & Performance Languages */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div style={{ padding: "10px 12px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "4px" }}>
                          Languages Spoken (Conversational):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {selectedTalentForDetails.languages ? (
                            selectedTalentForDetails.languages.split(",").map((l, i) => (
                              <span key={i} style={{ padding: "2px 7px", borderRadius: "6px", backgroundColor: "#f1f5f9", color: "#334155", fontSize: "11px", fontWeight: "700" }}>
                                {l.trim()}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>Not specified</span>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: "10px 12px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#7c3aed", marginBottom: "4px" }}>
                          Performance / Acting Languages:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {selectedTalentForDetails.actingLanguages ? (
                            selectedTalentForDetails.actingLanguages.split(",").map((l, i) => (
                              <span key={i} style={{ padding: "2px 7px", borderRadius: "6px", backgroundColor: "#faf5ff", color: "#7c3aed", fontSize: "11px", fontWeight: "700", border: "1px solid #ddd6fe" }}>
                                🎭 {l.trim()}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>Not specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedTalentForDetails.bio && (
                      <div style={{ fontSize: "12.5px", color: "#44403c", lineHeight: "1.5", backgroundColor: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #f5f5f4" }}>
                        <strong>Bio:</strong> {selectedTalentForDetails.bio}
                      </div>
                    )}

                    {selectedTalentForDetails.skills && selectedTalentForDetails.skills.length > 0 && (
                      <div>
                        <div style={{ fontSize: "11px", color: "#78716c", fontWeight: "700", marginBottom: "6px" }}>Specialized Creative Skills:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {Array.from(selectedTalentForDetails.skills).map((sk, idx) => (
                            <span key={idx} style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: "#f5f3ff", color: "#7c3aed", fontSize: "11px", fontWeight: "700", border: "1px solid #ddd6fe" }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. KYC Document & Trust Verification Desk */}
                <div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Government KYC & Verification Status
                  </h4>
                  <div style={{ padding: "16px", backgroundColor: selectedTalentForDetails.idVerified ? "#ecfdf5" : "#fffbeb", borderRadius: "14px", border: `1px solid ${selectedTalentForDetails.idVerified ? "#a7f3d0" : "#fde68a"}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "900", color: selectedTalentForDetails.idVerified ? "#059669" : "#b45309" }}>
                          {selectedTalentForDetails.idVerified ? "VERIFIED ROSETTE STAR BADGE ACTIVE" : "KYC VERIFICATION PENDING"}
                        </span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "4px" }}>
                        Document: <strong>{selectedTalentForDetails.docType || "Govt Photo ID"}</strong> • Reference: <strong>{selectedTalentForDetails.docNumber || `ID-${selectedTalentForDetails.userId || selectedTalentForDetails.id}`}</strong>
                      </div>
                    </div>

                    <div>
                      {selectedTalentForDetails.idVerified ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeKyc(selectedTalentForDetails.userId || selectedTalentForDetails.id, selectedTalentForDetails.talent)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            backgroundColor: "#ffffff",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            fontSize: "12px",
                            fontWeight: "800",
                            cursor: "pointer"
                          }}
                        >
                          Revoke Badge
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleVerifyKyc(selectedTalentForDetails.userId || selectedTalentForDetails.id, selectedTalentForDetails.talent)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: "10px",
                            backgroundColor: "#7c3aed",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <ShieldCheck size={14} /> Award Verified Star Badge
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ fontSize: "11.5px", color: "#64748b" }}>
              Administrator Session: Full profile governance and KYC audit rights active.
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTalentForDetails(null);
                setIsEditingTalent(false);
              }}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                border: "none",
                fontWeight: "800",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
);
}
