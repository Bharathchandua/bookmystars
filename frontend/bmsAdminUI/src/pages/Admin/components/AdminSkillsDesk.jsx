import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Search, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Film, 
  ShieldCheck, 
  AlertCircle,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Filter,
  Palette,
  FolderPlus,
  Briefcase,
  UserCheck,
  Zap,
  Library,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  Globe
} from "lucide-react";
import { 
  getAdminSkills, 
  createAdminSkill, 
  deleteAdminSkill,
  toggleAdminSkill,
  getAdminCrafts,
  createAdminCraft,
  deleteAdminCraft,
  toggleAdminCraft,
  bulkImportSkills,
  bulkImportCrafts
} from "../../../features/bms/api/skills/skillsApi";
import {
  getAdminProfessions,
  createAdminProfession,
  deleteAdminProfession,
  toggleAdminProfession,
  bulkImportProfessions
} from "../../../features/bms/api/professions/professionsApi";
import {
  getAdminLanguages,
  createAdminLanguage,
  deleteAdminLanguage,
  toggleAdminLanguage,
  bulkImportLanguages
} from "../../../features/bms/api/languages/languagesApi";
import {
  STANDARD_INDUSTRY_PROFESSIONS,
  STANDARD_24_CRAFTS,
  STANDARD_INDUSTRY_SKILLS,
  STANDARD_LANGUAGES
} from "./masterTaxonomyData";
import { showSuccess, showError, showWarning, confirmDelete, confirmAction } from "../../../shared/utils/alert";
import { emitLiveSync, onLiveSync } from "../../../shared/utils/liveSync";

const FALLBACK_CATEGORIES = [
  "Acting & Performance",
  "Dance & Movement",
  "Music & Voice",
  "Writing & Direction",
  "Stunts & Action",
  "Technical & Camera",
  "Post-Production & VFX",
  "Hair, Makeup & Costume",
  "Art & Production Design",
  "Specialized Craft"
];

const CATEGORY_COLORS = {
  "Acting & Performance": { bg: "#fdf2f8", text: "#db2777", border: "#fbcfe8" },
  "Dance & Movement": { bg: "#faf5ff", text: "#9333ea", border: "#f3e8ff" },
  "Music & Voice": { bg: "#eef2ff", text: "#4f46e5", border: "#e0e7ff" },
  "Writing & Direction": { bg: "#fff7ed", text: "#ea580c", border: "#ffedd5" },
  "Stunts & Action": { bg: "#fef2f2", text: "#dc2626", border: "#fee2e2" },
  "Technical & Camera": { bg: "#ecfeff", text: "#0891b2", border: "#cffafe" },
  "Post-Production & VFX": { bg: "#f0fdf4", text: "#16a34a", border: "#dcfce7" },
  "Hair, Makeup & Costume": { bg: "#fff1f2", text: "#e11d48", border: "#ffe4e6" },
  "Art & Production Design": { bg: "#fefce8", text: "#ca8a04", border: "#fef08a" },
  "Specialized Craft": { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" }
};

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function AdminSkillsDesk() {
  const [activeSubTab, setActiveSubTab] = useState("skills"); // "skills" | "crafts" | "professions"
  
  // Master lists
  const [skills, setSkills] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add new skill state
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);
  const [showInlineNewCraft, setShowInlineNewCraft] = useState(false);
  const [inlineCraftName, setInlineCraftName] = useState("");

  // Add new craft state
  const [newCraftName, setNewCraftName] = useState("");
  const [newCraftDesc, setNewCraftDesc] = useState("");
  const [isSubmittingCraft, setIsSubmittingCraft] = useState(false);

  // Add new profession state
  const [newProfName, setNewProfName] = useState("");
  const [newProfCraft, setNewProfCraft] = useState("Acting & Performance");
  const [isSubmittingProf, setIsSubmittingProf] = useState(false);

  // Library vs Custom Modes
  const [profMode, setProfMode] = useState("pick"); // "pick" | "custom"
  const [selectedLibProf, setSelectedLibProf] = useState("");
  const [isBulkImportingProf, setIsBulkImportingProf] = useState(false);
  const [libProfCraftFilter, setLibProfCraftFilter] = useState("ALL");
  const [selectedProfCraftFilter, setSelectedProfCraftFilter] = useState("ALL");
  const [profPage, setProfPage] = useState(1);
  const PROF_PER_PAGE = 12;

  const [skillPage, setSkillPage] = useState(1);
  const SKILL_PER_PAGE = 12;

  const [craftPage, setCraftPage] = useState(1);
  const CRAFT_PER_PAGE = 12;

  const [skillMode, setSkillMode] = useState("pick"); // "pick" | "custom"
  const [selectedLibSkill, setSelectedLibSkill] = useState("");
  const [isBulkImportingSkill, setIsBulkImportingSkill] = useState(false);

  const [craftMode, setCraftMode] = useState("pick"); // "pick" | "custom"
  const [selectedLibCraft, setSelectedLibCraft] = useState("");
  const [isBulkImportingCraft, setIsBulkImportingCraft] = useState(false);

  // Quick Add inline states (interactive one-click creation)
  const [quickProfName, setQuickProfName] = useState("");
  const [quickProfCraft, setQuickProfCraft] = useState("Acting & Performance");
  const [quickSkillName, setQuickSkillName] = useState("");
  const [quickSkillCategory, setQuickSkillCategory] = useState("Acting & Performance");
  const [quickCraftName, setQuickCraftName] = useState("");
  const [quickCraftDesc, setQuickCraftDesc] = useState("");

  // Multi-selection states for library items with (+) mark
  const [selectedProfNames, setSelectedProfNames] = useState([]);
  const [selectedCraftNames, setSelectedCraftNames] = useState([]);
  const [selectedSkillNames, setSelectedSkillNames] = useState([]);

  // Status Filter tabs ("ALL" | "LIVE" | "UNADDED")
  const [profStatusFilter, setProfStatusFilter] = useState("ALL");
  const [craftStatusFilter, setCraftStatusFilter] = useState("ALL");
  const [skillStatusFilter, setSkillStatusFilter] = useState("ALL");

  const toggleSelectProf = (name) => {
    setSelectedProfNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const toggleSelectCraft = (name) => {
    setSelectedCraftNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const toggleSelectSkill = (name) => {
    setSelectedSkillNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Languages state
  const [languages, setLanguages] = useState([]);
  const [langPage, setLangPage] = useState(1);
  const LANG_PER_PAGE = 12;
  const [langStatusFilter, setLangStatusFilter] = useState("ALL");
  const [selectedLangNames, setSelectedLangNames] = useState([]);
  const [quickLangName, setQuickLangName] = useState("");
  const [quickLangNative, setQuickLangNative] = useState("");
  const [quickLangCode, setQuickLangCode] = useState("");
  const [isSubmittingLang, setIsSubmittingLang] = useState(false);
  const [isBulkImportingLang, setIsBulkImportingLang] = useState(false);

  const toggleSelectLang = (name) => {
    setSelectedLangNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const langScrollRef = useRef(null);
  const scrollLangShelf = (offset) => {
    if (langScrollRef.current) {
      langScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Live Sign-Up Preview Modal State
  const [showSignupPreviewModal, setShowSignupPreviewModal] = useState(false);
  const [previewCraft, setPreviewCraft] = useState("Acting & Performance");
  const [previewSelectedProf, setPreviewSelectedProf] = useState("");

  // Grouped library presets
  const groupedLibProfessions = useMemo(() => {
    const groups = {};
    STANDARD_INDUSTRY_PROFESSIONS.forEach(p => {
      const dep = p.department || p.craftCategory || "General";
      if (!groups[dep]) groups[dep] = [];
      groups[dep].push(p);
    });
    return groups;
  }, []);

  const groupedLibSkills = useMemo(() => {
    const groups = {};
    STANDARD_INDUSTRY_SKILLS.forEach(s => {
      const dep = s.department || s.category || "General";
      if (!groups[dep]) groups[dep] = [];
      groups[dep].push(s);
    });
    return groups;
  }, []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [sortBy, setSortBy] = useState("name"); // "name" | "usage" | "newest"

  // Bulk import handlers
  const handleBulkImportProfessions = async () => {
    const ok = await confirmAction({
      title: "Bulk Import Master Professions?",
      text: "Import all canonical standard industry cinema professions into PostgreSQL? Already existing professions will be safely preserved.",
      confirmButtonText: "Yes, Import All",
      cancelButtonText: "Cancel",
      icon: "question"
    });
    if (!ok) return;
    try {
      setIsBulkImportingProf(true);
      const res = await bulkImportProfessions();
      showSuccess("Bulk Import Complete", `${res.importedCount || 0} new professions imported (${res.totalInCatalog || 0} total in catalog)!`);
      await loadData();
      emitLiveSync("professions_updated");
    } catch (err) {
      showError("Bulk Import Failed", err.message || "Failed to bulk import professions.");
    } finally {
      setIsBulkImportingProf(false);
    }
  };

  const handleBulkImportCrafts = async () => {
    const ok = await confirmAction({
      title: "Bulk Import 24 Cinema Crafts?",
      text: "Import all 24 canonical cinema crafts into PostgreSQL? Already existing crafts will be safely preserved.",
      confirmButtonText: "Yes, Import All",
      cancelButtonText: "Cancel",
      icon: "question"
    });
    if (!ok) return;
    try {
      setIsBulkImportingCraft(true);
      const res = await bulkImportCrafts();
      showSuccess("Bulk Import Complete", `${res.importedCount || 0} new crafts imported (${res.totalInCatalog || 0} total in catalog)!`);
      await loadData();
      emitLiveSync("crafts_updated");
      emitLiveSync("skills_updated");
    } catch (err) {
      showError("Bulk Import Failed", err.message || "Failed to bulk import crafts.");
    } finally {
      setIsBulkImportingCraft(false);
    }
  };

  const handleBulkImportSkills = async () => {
    const ok = await confirmAction({
      title: "Bulk Import Standard Cinema Skills?",
      text: "Import all standard cinema skills into PostgreSQL? Already existing skills will be safely preserved.",
      confirmButtonText: "Yes, Import All",
      cancelButtonText: "Cancel",
      icon: "question"
    });
    if (!ok) return;
    try {
      setIsBulkImportingSkill(true);
      const res = await bulkImportSkills();
      showSuccess("Bulk Import Complete", `${res.importedCount || 0} new skills imported (${res.totalInCatalog || 0} total in catalog)!`);
      await loadData();
      emitLiveSync("skills_updated");
    } catch (err) {
      showError("Bulk Import Failed", err.message || "Failed to bulk import skills.");
    } finally {
      setIsBulkImportingSkill(false);
    }
  };

  const handleAddProfessionFromLibrary = async (e) => {
    e?.preventDefault();
    if (!selectedLibProf) {
      showWarning("Select a Profession", "Please select a profession from the industry master library dropdown.");
      return;
    }
    const found = STANDARD_INDUSTRY_PROFESSIONS.find(p => p.name === selectedLibProf);
    if (!found) return;

    if (professions.some(p => p.name?.toLowerCase() === found.name.toLowerCase())) {
      showWarning("Already Exists", `"${found.name}" is already active in your platform catalog.`);
      return;
    }

    try {
      setIsSubmittingProf(true);
      const created = await createAdminProfession({
        name: found.name,
        craftCategory: found.craftCategory
      });
      showSuccess("Profession Added", `"${created.name}" is now live in PostgreSQL and available on the Sign-Up screen.`);
      setSelectedLibProf("");
      await loadData();
      emitLiveSync("professions_updated", { addedProfession: created.name });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add profession.");
    } finally {
      setIsSubmittingProf(false);
    }
  };

  const handleAddSkillFromLibrary = async (e) => {
    e?.preventDefault();
    if (!selectedLibSkill) {
      showWarning("Select a Skill", "Please select a skill from the industry master library dropdown.");
      return;
    }
    const found = STANDARD_INDUSTRY_SKILLS.find(s => s.name === selectedLibSkill);
    if (!found) return;

    if (skills.some(s => s.name?.toLowerCase() === found.name.toLowerCase())) {
      showWarning("Already Exists", `The skill "${found.name}" already exists in the master catalog.`);
      return;
    }

    try {
      setIsSubmittingSkill(true);
      const created = await createAdminSkill({
        name: found.name,
        category: found.category
      });
      showSuccess("Skill Added", `"${created.name}" is now stored in PostgreSQL.`);
      setSelectedLibSkill("");
      await loadData();
      emitLiveSync("skills_updated", { added: created.name });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add skill.");
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleAddCraftFromLibrary = async (e) => {
    e?.preventDefault();
    if (!selectedLibCraft) {
      showWarning("Select a Craft", "Please select a craft from the 24 cinema crafts dropdown.");
      return;
    }
    const found = STANDARD_24_CRAFTS.find(c => c.name === selectedLibCraft);
    if (!found) return;

    if (crafts.some(c => c.name?.toLowerCase() === found.name.toLowerCase())) {
      showWarning("Already Exists", `The craft "${found.name}" already exists in the catalog.`);
      return;
    }

    try {
      setIsSubmittingCraft(true);
      const created = await createAdminCraft({
        name: found.name,
        description: found.description
      });
      showSuccess("Craft Added", `"${created.name}" is now active in PostgreSQL.`);
      setSelectedLibCraft("");
      await loadData();
      emitLiveSync("skills_updated", { addedCraft: created.name });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add craft.");
    } finally {
      setIsSubmittingCraft(false);
    }
  };

  // Quick Add Profession (Instant 1-click addition to live catalog)
  const handleQuickAddProfession = async () => {
    const trimmed = quickProfName.trim();
    if (!trimmed) {
      showWarning("Enter Title", "Please type a profession title to add.");
      return;
    }
    if (professions.some(p => p.name?.toLowerCase() === trimmed.toLowerCase())) {
      showWarning("Already Active", `"${trimmed}" is already active in your Sign-Up catalog.`);
      return;
    }
    try {
      setIsSubmittingProf(true);
      const created = await createAdminProfession({
        name: trimmed,
        craftCategory: quickProfCraft || "Acting & Performance"
      });
      showSuccess("Profession Added", `"${created.name}" is now live in PostgreSQL and on the Sign-Up screen.`);
      setQuickProfName("");
      await loadData();
      emitLiveSync("professions_updated", { addedProfession: created.name });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to persist profession.");
    } finally {
      setIsSubmittingProf(false);
    }
  };

  // Quick Add Skill
  const handleQuickAddSkill = async () => {
    const trimmed = quickSkillName.trim();
    if (!trimmed) {
      showWarning("Enter Skill", "Please type a skill name to add.");
      return;
    }
    if (skills.some(s => s.name?.toLowerCase() === trimmed.toLowerCase())) {
      showWarning("Already Exists", `"${trimmed}" is already in your skills catalog.`);
      return;
    }
    try {
      setIsSubmittingSkill(true);
      const created = await createAdminSkill({
        name: trimmed,
        category: quickSkillCategory || "Acting & Performance"
      });
      showSuccess("Skill Added", `"${created.name}" is now stored in PostgreSQL.`);
      setQuickSkillName("");
      await loadData();
      emitLiveSync("skills_updated", { added: created.name });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add skill.");
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  // Quick Add Craft
  const handleQuickAddCraft = async () => {
    const trimmed = quickCraftName.trim();
    if (!trimmed) {
      showWarning("Enter Craft", "Please type a craft name to add.");
      return;
    }
    if (crafts.some(c => c.name?.toLowerCase() === trimmed.toLowerCase())) {
      showWarning("Already Active", `"${trimmed}" is already active in your crafts catalog.`);
      return;
    }
    try {
      setIsSubmittingCraft(true);
      const created = await createAdminCraft({
        name: trimmed,
        description: quickCraftDesc.trim() || undefined
      });
      showSuccess("Craft Added", `"${created.name}" is now active in PostgreSQL and live on the Sign-Up screen.`);
      setQuickCraftName("");
      setQuickCraftDesc("");
      await loadData();
      emitLiveSync("crafts_updated", { addedCraft: created.name });
      emitLiveSync("skills_updated", { addedCraft: created.name });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add craft.");
    } finally {
      setIsSubmittingCraft(false);
    }
  };

  // Add a single profession to Sign-Up (1-click on the + symbol)
  const handleAddSingleProfession = async (profItem) => {
    try {
      setIsSubmittingProf(true);
      let professionName = profItem.name;
      if (profItem.id) {
        const toggled = await toggleAdminProfession(profItem.id);
        professionName = toggled.name;
      } else {
        const created = await createAdminProfession({
          name: profItem.name,
          craftCategory: profItem.craftCategory || "Acting & Performance"
        });
        professionName = created.name;
      }
      showSuccess("Added to Sign-Up Page", `"${professionName}" is now live on the user registration screen.`);
      setSelectedProfNames(prev => prev.filter(n => n !== profItem.name));
      await loadData();
      emitLiveSync("professions_updated", { addedProfession: professionName });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add profession.");
    } finally {
      setIsSubmittingProf(false);
    }
  };

  // Add multiple selected professions to Sign-Up
  const handleAddSelectedProfessions = async () => {
    if (selectedProfNames.length === 0) return;
    try {
      setIsSubmittingProf(true);
      let count = 0;
      for (const name of selectedProfNames) {
        const item = allKnownProfessions.find(p => p.name === name);
        if (item) {
          if (item.id) {
            await toggleAdminProfession(item.id);
            count++;
          } else if (!professions.some(ep => ep.name?.toLowerCase() === item.name.toLowerCase())) {
            await createAdminProfession({
              name: item.name,
              craftCategory: item.craftCategory || "Acting & Performance"
            });
            count++;
          }
        }
      }
      showSuccess("Added to Sign-Up Page", `${count} profession(s) added! They are now live on the registration screen.`);
      setSelectedProfNames([]);
      await loadData();
      emitLiveSync("professions_updated");
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add selected professions.");
    } finally {
      setIsSubmittingProf(false);
    }
  };

  // Add a single craft to Sign-Up (1-click on the + symbol)
  const handleAddSingleCraft = async (craftItem) => {
    try {
      setIsSubmittingCraft(true);
      let craftName = craftItem.name;
      if (craftItem.id) {
        const toggled = await toggleAdminCraft(craftItem.id);
        craftName = toggled.name;
      } else {
        const created = await createAdminCraft({
          name: craftItem.name,
          description: craftItem.description || undefined
        });
        craftName = created.name;
      }
      showSuccess("Craft Added to Sign-Up", `"${craftName}" is now active in PostgreSQL and displayed on the user registration screen.`);
      setSelectedCraftNames(prev => prev.filter(n => n !== craftItem.name));
      await loadData();
      emitLiveSync("crafts_updated", { addedCraft: craftName });
      emitLiveSync("skills_updated", { addedCraft: craftName });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add craft.");
    } finally {
      setIsSubmittingCraft(false);
    }
  };

  // Add multiple selected crafts to Sign-Up
  const handleAddSelectedCrafts = async () => {
    if (selectedCraftNames.length === 0) return;
    try {
      setIsSubmittingCraft(true);
      let count = 0;
      for (const name of selectedCraftNames) {
        const item = allKnownCrafts.find(c => c.name === name);
        if (item) {
          if (item.id) {
            await toggleAdminCraft(item.id);
            count++;
          } else if (!crafts.some(ec => ec.name?.toLowerCase() === item.name.toLowerCase())) {
            await createAdminCraft({
              name: item.name,
              description: item.description || undefined
            });
            count++;
          }
        }
      }
      showSuccess("Crafts Added to Sign-Up", `${count} craft(s) added! They are now available as department categories on the registration screen.`);
      setSelectedCraftNames([]);
      await loadData();
      emitLiveSync("crafts_updated");
      emitLiveSync("skills_updated");
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add selected crafts.");
    } finally {
      setIsSubmittingCraft(false);
    }
  };

  // Add a single skill (1-click on the + symbol)
  const handleAddSingleSkill = async (skillItem) => {
    try {
      setIsSubmittingSkill(true);
      let skillName = skillItem.name;
      if (skillItem.id) {
        const toggled = await toggleAdminSkill(skillItem.id);
        skillName = toggled.name;
      } else {
        const created = await createAdminSkill({
          name: skillItem.name,
          category: skillItem.category || "Specialized Craft"
        });
        skillName = created.name;
      }
      showSuccess("Skill Added", `"${skillName}" is now active in PostgreSQL.`);
      setSelectedSkillNames(prev => prev.filter(n => n !== skillItem.name));
      await loadData();
      emitLiveSync("skills_updated", { added: skillName });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add skill.");
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  // Add multiple selected skills
  const handleAddSelectedSkills = async () => {
    if (selectedSkillNames.length === 0) return;
    try {
      setIsSubmittingSkill(true);
      let count = 0;
      for (const name of selectedSkillNames) {
        const item = allKnownSkills.find(s => s.name === name);
        if (item) {
          if (item.id) {
            await toggleAdminSkill(item.id);
            count++;
          } else if (!skills.some(es => es.name?.toLowerCase() === item.name.toLowerCase())) {
            await createAdminSkill({
              name: item.name,
              category: item.category || "Specialized Craft"
            });
            count++;
          }
        }
      }
      showSuccess("Skills Added", `${count} skill(s) added into PostgreSQL master catalog.`);
      setSelectedSkillNames([]);
      await loadData();
      emitLiveSync("skills_updated");
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add selected skills.");
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  // Language Handlers
  const handleQuickAddLanguage = async () => {
    const trimmed = quickLangName.trim();
    if (!trimmed) {
      showWarning("Validation Error", "Please enter a language name.");
      return;
    }
    try {
      setIsSubmittingLang(true);
      await createAdminLanguage({
        name: trimmed,
        nativeName: quickLangNative.trim() || null,
        code: quickLangCode.trim().toLowerCase() || null
      });
      showSuccess("Language Added", `"${trimmed}" is now active and live on User Sign-Up!`);
      setQuickLangName("");
      setQuickLangNative("");
      setQuickLangCode("");
      await loadData();
      emitLiveSync("languages_updated");
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add language.");
    } finally {
      setIsSubmittingLang(false);
    }
  };

  const handleToggleLanguage = async (item) => {
    try {
      if (item.id) {
        const res = await toggleAdminLanguage(item.id);
        const isLive = res.isActive !== false;
        if (isLive) {
          showSuccess("Activated on Sign-Up", `"${item.name}" is now visible to users on the Sign-Up and profile pages.`);
        } else {
          showWarning("Deselected from Sign-Up", `"${item.name}" is now hidden from the public Sign-Up page, but remains in the Admin Catalog.`);
        }
      } else {
        await createAdminLanguage({
          name: item.name,
          nativeName: item.nativeName || null,
          code: item.code || null
        });
        showSuccess("Added & Activated", `"${item.name}" has been added to PostgreSQL and is now live on Sign-Up!`);
      }
      await loadData();
      emitLiveSync("languages_updated");
    } catch (err) {
      showError("Action Failed", err.message || "Failed to update language.");
    }
  };

  const handleDeleteLanguage = async (id, name) => {
    const ok = await confirmDelete(name, `Delete language "${name}" from PostgreSQL catalog?`);
    if (!ok) return;
    try {
      await deleteAdminLanguage(id);
      showSuccess("Language Deleted", `"${name}" removed from database.`);
      await loadData();
      emitLiveSync("languages_updated");
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete language.");
    }
  };

  const handleAddSelectedLanguages = async () => {
    if (selectedLangNames.length === 0) return;
    try {
      setIsSubmittingLang(true);
      let count = 0;
      for (const name of selectedLangNames) {
        const item = allKnownLanguages.find(l => l.name === name);
        if (item) {
          if (item.id) {
            await toggleAdminLanguage(item.id);
            count++;
          } else if (!languages.some(el => el.name?.toLowerCase() === item.name.toLowerCase())) {
            await createAdminLanguage({
              name: item.name,
              nativeName: item.nativeName || null,
              code: item.code || null
            });
            count++;
          }
        }
      }
      showSuccess("Added to Sign-Up Page", `${count} language(s) added! They are now live on the registration screen.`);
      setSelectedLangNames([]);
      await loadData();
      emitLiveSync("languages_updated");
    } catch (err) {
      showError("Add Failed", err.message || "Failed to add selected languages.");
    } finally {
      setIsSubmittingLang(false);
    }
  };

  const handleBulkImportLanguages = async () => {
    const ok = await confirmAction({
      title: "Bulk Import 24 Cinema Languages?",
      text: "Import all 24 canonical cinema languages (Telugu, Hindi, Tamil, Kannada, Malayalam, English, etc.) into PostgreSQL? Existing entries will be preserved.",
      confirmButtonText: "Yes, Import All",
      cancelButtonText: "Cancel",
      icon: "question"
    });
    if (!ok) return;
    try {
      setIsBulkImportingLang(true);
      const res = await bulkImportLanguages();
      showSuccess("Bulk Import Complete", `${res.importedCount || 0} new languages imported (${res.totalInCatalog || 0} total in catalog)!`);
      await loadData();
      emitLiveSync("languages_updated");
    } catch (err) {
      showError("Bulk Import Failed", err.message || "Failed to bulk import languages.");
    } finally {
      setIsBulkImportingLang(false);
    }
  };

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [skillsData, craftsData, professionsData, languagesData] = await Promise.all([
        getAdminSkills(),
        getAdminCrafts(),
        getAdminProfessions(),
        getAdminLanguages()
      ]);

      if (Array.isArray(skillsData)) setSkills(skillsData);
      if (Array.isArray(craftsData)) {
        setCrafts(craftsData);
        if (!newSkillCategory && craftsData.length > 0) {
          setNewSkillCategory(craftsData[0].name);
        }
      }
      if (Array.isArray(professionsData)) setProfessions(professionsData);
      if (Array.isArray(languagesData)) setLanguages(languagesData);
    } catch (err) {
      console.error("Error loading master catalog:", err);
      showError("Sync Failed", "Could not load master catalog from database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Cross-tab live sync listener
    const unsubscribe = onLiveSync(["skills_updated", "professions_updated", "crafts_updated", "languages_updated"], () => {
      loadData();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // 1. ADD SKILL HANDLER
  const handleAddSkill = async (e) => {
    e?.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) {
      showWarning("Validation Error", "Please enter a valid skill or talent name.");
      return;
    }

    if (skills.some(s => s.name?.toLowerCase() === trimmed.toLowerCase())) {
      showWarning("Duplicate Skill", `The skill "${trimmed}" already exists in the master catalog.`);
      return;
    }

    const catToUse = showInlineNewCraft && inlineCraftName.trim()
      ? inlineCraftName.trim()
      : (newSkillCategory || "Specialized Craft");

    try {
      setIsSubmittingSkill(true);

      if (showInlineNewCraft && inlineCraftName.trim()) {
        const craftExists = crafts.some(c => c.name?.toLowerCase() === inlineCraftName.trim().toLowerCase());
        if (!craftExists) {
          await createAdminCraft({ name: inlineCraftName.trim(), description: "Custom craft category" });
        }
      }

      const created = await createAdminSkill({
        name: trimmed,
        category: catToUse
      });

      showSuccess("Skill Added", `"${created.name}" is now stored in PostgreSQL.`);
      setNewSkillName("");
      setInlineCraftName("");
      setShowInlineNewCraft(false);
      await loadData();
      emitLiveSync("skills_updated", { added: created.name });
    } catch (err) {
      showError("Add Failed", err.message || "Failed to persist skill to database.");
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  // 2. ADD CRAFT HANDLER
  const handleAddCraft = async (e) => {
    e?.preventDefault();
    const trimmed = newCraftName.trim();
    if (!trimmed) {
      showWarning("Validation Error", "Please enter a valid craft or discipline name.");
      return;
    }

    if (crafts.some(c => c.name?.toLowerCase() === trimmed.toLowerCase())) {
      showWarning("Duplicate Craft", `The craft "${trimmed}" already exists in the database.`);
      return;
    }

    try {
      setIsSubmittingCraft(true);
      const created = await createAdminCraft({
        name: trimmed,
        description: newCraftDesc.trim() || undefined
      });

      showSuccess("Craft Added", `"${created.name}" is now active in PostgreSQL.`);
      setNewCraftName("");
      setNewCraftDesc("");
      await loadData();
      setNewSkillCategory(created.name);
      emitLiveSync("skills_updated", { addedCraft: created.name });
    } catch (err) {
      showError("Add Craft Failed", err.message || "Failed to persist craft to database.");
    } finally {
      setIsSubmittingCraft(false);
    }
  };

  // 3. ADD PROFESSION HANDLER
  const handleAddProfession = async (e) => {
    e?.preventDefault();
    const trimmed = newProfName.trim();
    if (!trimmed) {
      showWarning("Validation Error", "Please enter a valid profession name.");
      return;
    }

    if (professions.some(p => p.name?.toLowerCase() === trimmed.toLowerCase())) {
      showWarning("Duplicate Profession", `The profession "${trimmed}" already exists in the catalog.`);
      return;
    }

    try {
      setIsSubmittingProf(true);
      const created = await createAdminProfession({
        name: trimmed,
        craftCategory: newProfCraft
      });

      showSuccess("Profession Added", `"${created.name}" is now live in PostgreSQL and available on the Sign-Up screen.`);
      setNewProfName("");
      await loadData();
      emitLiveSync("professions_updated", { addedProfession: created.name });
    } catch (err) {
      showError("Add Profession Failed", err.message || "Failed to persist profession to database.");
    } finally {
      setIsSubmittingProf(false);
    }
  };

  // 4. DELETE SKILL HANDLER
  const handleDeleteSkill = async (skill) => {
    const customText = skill.usageCount > 0
      ? `"${skill.name}" is used by ${skill.usageCount} talent profile(s). Are you sure you want to permanently delete it from the master catalog?`
      : `Are you sure you want to delete "${skill.name}" from the master skills catalog?`;

    const ok = await confirmDelete(skill.name, customText);
    if (!ok) return;

    try {
      await deleteAdminSkill(skill.id);
      showSuccess("Skill Removed", `"${skill.name}" was removed from database.`);
      await loadData();
      emitLiveSync("skills_updated", { deletedSkill: skill.id });
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete skill.");
    }
  };

  // 5. DELETE CRAFT HANDLER
  const handleDeleteCraft = async (craft) => {
    if (craft.skillCount > 0) {
      showWarning("Craft in Use", `Cannot delete "${craft.name}" because ${craft.skillCount} skill(s) belong to it. Reassign or delete those skills first.`);
      return;
    }

    const ok = await confirmDelete(craft.name, `Are you sure you want to permanently remove craft "${craft.name}" from PostgreSQL?`);
    if (!ok) return;

    try {
      await deleteAdminCraft(craft.id);
      showSuccess("Craft Removed", `"${craft.name}" was removed from database.`);
      await loadData();
      emitLiveSync("crafts_updated", { deletedCraft: craft.id });
      emitLiveSync("skills_updated", { deletedCraft: craft.id });
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete craft.");
    }
  };

  // 6. DELETE PROFESSION HANDLER
  const handleDeleteProfession = async (prof) => {
    if (prof.userCount > 0) {
      showWarning("Profession in Use", `Cannot delete "${prof.name}" because ${prof.userCount} registered user(s) currently hold this profession.`);
      return;
    }

    const ok = await confirmDelete(prof.name, `Are you sure you want to delete "${prof.name}" from the Sign-Up professions catalog?`);
    if (!ok) return;

    try {
      await deleteAdminProfession(prof.id);
      showSuccess("Profession Removed", `"${prof.name}" was removed from PostgreSQL.`);
      await loadData();
      emitLiveSync("professions_updated", { deletedProfession: prof.id });
    } catch (err) {
      showError("Delete Failed", err.message || "Failed to delete profession.");
    }
  };

  // 7. DESELECT PROFESSION HANDLER (Hide from Sign-Up page, keep safely preserved in Admin Desk with + mark)
  const handleDeselectProfession = async (prof) => {
    if (!prof.id) {
      showWarning("Cannot Deselect", `"${prof.name}" is not yet saved in the database.`);
      return;
    }
    const ok = await confirmAction({
      title: `Deselect "${prof.name}" from UI?`,
      text: `"${prof.name}" will be hidden from the Sign-Up registration screen, but will remain safely preserved in the Admin Desk with a (+) mark to re-add whenever you want.`,
      confirmButtonText: "Yes, Deselect from UI",
      cancelButtonText: "Keep Active",
      confirmButtonColor: "#f59e0b",
      icon: "warning"
    });
    if (!ok) return;

    try {
      await toggleAdminProfession(prof.id);
      showSuccess("Deselected from Sign-Up", `"${prof.name}" is now hidden from the public Sign-Up page and marked with (+) in Admin.`);
      await loadData();
      emitLiveSync("professions_updated");
    } catch (err) {
      showError("Deselect Failed", err.message || "Failed to update profession visibility.");
    }
  };

  // 8. DESELECT CRAFT HANDLER (Hide from Sign-Up categories, keep in Admin Desk with + mark)
  const handleDeselectCraft = async (craft) => {
    if (!craft.id) {
      showWarning("Cannot Deselect", `"${craft.name}" is not yet saved in the database.`);
      return;
    }
    const ok = await confirmAction({
      title: `Deselect "${craft.name}" from UI?`,
      text: `"${craft.name}" will be hidden from the Sign-Up craft categories dropdown, but will remain safely preserved in the Admin Desk with a (+) mark to re-add whenever you want.`,
      confirmButtonText: "Yes, Deselect from UI",
      cancelButtonText: "Keep Active",
      confirmButtonColor: "#f59e0b",
      icon: "warning"
    });
    if (!ok) return;

    try {
      await toggleAdminCraft(craft.id);
      showSuccess("Deselected from Sign-Up", `"${craft.name}" is now hidden from the public Sign-Up page and marked with (+) in Admin.`);
      await loadData();
      emitLiveSync("crafts_updated");
      emitLiveSync("skills_updated");
    } catch (err) {
      showError("Deselect Failed", err.message || "Failed to update craft visibility.");
    }
  };

  // 9. DESELECT SKILL HANDLER (Hide from public UI, keep in Admin Desk with + mark)
  const handleDeselectSkill = async (skill) => {
    if (!skill.id) {
      showWarning("Cannot Deselect", `"${skill.name}" is not yet saved in the database.`);
      return;
    }
    const ok = await confirmAction({
      title: `Deselect "${skill.name}" from UI?`,
      text: `"${skill.name}" will be hidden from public skill selections, but will remain safely preserved in the Admin Desk with a (+) mark to re-add whenever you want.`,
      confirmButtonText: "Yes, Deselect from UI",
      cancelButtonText: "Keep Active",
      confirmButtonColor: "#f59e0b",
      icon: "warning"
    });
    if (!ok) return;

    try {
      await toggleAdminSkill(skill.id);
      showSuccess("Deselected from UI", `"${skill.name}" is now hidden from public UI and marked with (+) in Admin.`);
      await loadData();
      emitLiveSync("skills_updated");
    } catch (err) {
      showError("Deselect Failed", err.message || "Failed to update skill visibility.");
    }
  };

  // Available categories list
  const allCategories = useMemo(() => {
    if (crafts.length > 0) {
      return crafts.map(c => c.name);
    }
    return FALLBACK_CATEGORIES;
  }, [crafts]);

  // Total talent usage count
  const totalTalentUsage = useMemo(() => {
    return skills.reduce((sum, s) => sum + (s.usageCount || 0), 0);
  }, [skills]);

  // Total registered users across all professions
  const totalUsersAcrossProfessions = useMemo(() => {
    return professions.reduce((sum, p) => sum + (p.userCount || 0), 0);
  }, [professions]);

  // ==============================================================
  // UNIFIED MASTER CATALOGS (Combining DB + Full Cinema Library)
  // Present items in Sign-Up have isLiveOnSignup = true (NO plus mark)
  // Unadded library items have isLiveOnSignup = false (HAS plus mark)
  // ==============================================================

  // 1. ALL KNOWN PROFESSIONS
  const allKnownProfessions = useMemo(() => {
    const map = new Map();

    // First load standard cinema library professions
    STANDARD_INDUSTRY_PROFESSIONS.forEach(p => {
      const key = (p.name || "").trim().toLowerCase();
      map.set(key, {
        name: p.name,
        craftCategory: p.craftCategory || "General Craft",
        department: p.department || p.craftCategory,
        isLiveOnSignup: false,
        userCount: 0,
        id: null,
        isLibraryPreset: true
      });
    });

    // Overlay database professions (currently live on user sign-up page)
    professions.forEach(p => {
      const key = (p.name || "").trim().toLowerCase();
      const existing = map.get(key);
      const isLive = p.isActive !== false;
      map.set(key, {
        name: p.name,
        craftCategory: p.craftCategory || existing?.craftCategory || "General Craft",
        department: existing?.department || p.craftCategory,
        isLiveOnSignup: isLive,
        isActive: isLive,
        userCount: p.userCount || 0,
        id: p.id,
        createdAt: p.createdAt,
        isLibraryPreset: !!existing
      });
    });

    // Sort: Live on sign-up first, then alphabetical by name
    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.isLiveOnSignup !== b.isLiveOnSignup) {
        return a.isLiveOnSignup ? -1 : 1;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
    return list;
  }, [professions]);

  // 2. ALL KNOWN CRAFTS (Standard 24 Cinema Crafts + Core Sign-Up Crafts)
  const allKnownCrafts = useMemo(() => {
    const map = new Map();

    // First load standard 24 canonical cinema crafts
    STANDARD_24_CRAFTS.forEach(c => {
      const key = (c.name || "").trim().toLowerCase();
      map.set(key, {
        name: c.name,
        description: c.description || "Cinema Craft Discipline",
        isLiveOnSignup: false,
        skillCount: 0,
        id: null,
        isLibraryPreset: true
      });
    });

    // Also register fallback sign-up categories
    FALLBACK_CATEGORIES.forEach(catName => {
      const key = catName.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: catName,
          description: "Core Cinema Department",
          isLiveOnSignup: false,
          skillCount: 0,
          id: null,
          isLibraryPreset: true
        });
      }
    });

    // Overlay database crafts (currently live on user sign-up page)
    crafts.forEach(c => {
      const key = (c.name || "").trim().toLowerCase();
      const existing = map.get(key);
      const isLive = c.isActive !== false;
      map.set(key, {
        name: c.name,
        description: c.description || existing?.description || "Active Sign-Up Craft",
        isLiveOnSignup: isLive,
        isActive: isLive,
        skillCount: c.skillCount || 0,
        id: c.id,
        createdAt: c.createdAt,
        isLibraryPreset: !!existing
      });
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.isLiveOnSignup !== b.isLiveOnSignup) {
        return a.isLiveOnSignup ? -1 : 1;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
    return list;
  }, [crafts]);

  // 3. ALL KNOWN SKILLS (Standard Cinema Skills + DB Skills)
  const allKnownSkills = useMemo(() => {
    const map = new Map();

    STANDARD_INDUSTRY_SKILLS.forEach(s => {
      const key = (s.name || "").trim().toLowerCase();
      map.set(key, {
        name: s.name,
        category: s.category || "Specialized Craft",
        department: s.department || s.category,
        isLiveInDb: false,
        usageCount: 0,
        id: null,
        isLibraryPreset: true
      });
    });

    skills.forEach(s => {
      const key = (s.name || "").trim().toLowerCase();
      const existing = map.get(key);
      const isLive = s.isActive !== false;
      map.set(key, {
        name: s.name,
        category: s.category || existing?.category || "Specialized Craft",
        department: existing?.department || s.category,
        isLiveInDb: isLive,
        isActive: isLive,
        usageCount: s.usageCount || 0,
        id: s.id,
        createdAt: s.createdAt,
        isLibraryPreset: !!existing
      });
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.isLiveInDb !== b.isLiveInDb) {
        return a.isLiveInDb ? -1 : 1;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
    return list;
  }, [skills]);

  // Live vs Available Counts
  const liveProfCount = useMemo(() => professions.filter(p => p.isActive !== false).length, [professions]);
  const unaddedProfCount = useMemo(() => allKnownProfessions.filter(p => !p.isLiveOnSignup).length, [allKnownProfessions]);

  const liveCraftCount = useMemo(() => crafts.filter(c => c.isActive !== false).length, [crafts]);
  const unaddedCraftCount = useMemo(() => allKnownCrafts.filter(c => !c.isLiveOnSignup).length, [allKnownCrafts]);

  const liveSkillCount = useMemo(() => skills.filter(s => s.isActive !== false).length, [skills]);
  const unaddedSkillCount = useMemo(() => allKnownSkills.filter(s => !s.isLiveInDb).length, [allKnownSkills]);

  // Filtered professions in the master catalog
  const filteredProfessions = useMemo(() => {
    return allKnownProfessions.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.craftCategory && p.craftCategory.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCraft = selectedProfCraftFilter === "ALL" || p.craftCategory === selectedProfCraftFilter;

      const matchesStatus = profStatusFilter === "ALL" ||
        (profStatusFilter === "LIVE" && p.isLiveOnSignup) ||
        (profStatusFilter === "UNADDED" && !p.isLiveOnSignup);

      return matchesSearch && matchesCraft && matchesStatus;
    });
  }, [allKnownProfessions, searchQuery, selectedProfCraftFilter, profStatusFilter]);

  const totalProfPages = Math.max(1, Math.ceil(filteredProfessions.length / PROF_PER_PAGE));

  // Reset to page 1 whenever search query or craft filter changes
  useEffect(() => {
    setProfPage(1);
  }, [searchQuery, selectedProfCraftFilter, profStatusFilter]);

  // Keep page within bounds if total pages change (e.g. after deletion)
  useEffect(() => {
    if (profPage > totalProfPages) {
      setProfPage(totalProfPages);
    }
  }, [totalProfPages, profPage]);

  const paginatedProfessions = useMemo(() => {
    const start = (profPage - 1) * PROF_PER_PAGE;
    return filteredProfessions.slice(start, start + PROF_PER_PAGE);
  }, [filteredProfessions, profPage]);

  // Filtered skills across full known library
  const filteredSkills = useMemo(() => {
    let result = allKnownSkills.filter(s => {
      const matchesSearch = !searchQuery || 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = selectedCategory === "ALL" || s.category === selectedCategory;

      const matchesStatus = skillStatusFilter === "ALL" ||
        (skillStatusFilter === "LIVE" && s.isLiveInDb) ||
        (skillStatusFilter === "UNADDED" && !s.isLiveInDb);

      return matchesSearch && matchesCat && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "usage") return (b.usageCount || 0) - (a.usageCount || 0);
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return (a.name || "").localeCompare(b.name || "");
    });

    return result;
  }, [allKnownSkills, searchQuery, selectedCategory, skillStatusFilter, sortBy]);

  const totalSkillPages = Math.max(1, Math.ceil(filteredSkills.length / SKILL_PER_PAGE));

  useEffect(() => {
    setSkillPage(1);
  }, [searchQuery, selectedCategory, skillStatusFilter, sortBy]);

  useEffect(() => {
    if (skillPage > totalSkillPages) {
      setSkillPage(totalSkillPages);
    }
  }, [totalSkillPages, skillPage]);

  const paginatedSkills = useMemo(() => {
    const start = (skillPage - 1) * SKILL_PER_PAGE;
    return filteredSkills.slice(start, start + SKILL_PER_PAGE);
  }, [filteredSkills, skillPage]);

  // Filtered crafts across full known 24 crafts
  const filteredCrafts = useMemo(() => {
    return allKnownCrafts.filter(c => {
      const matchesSearch = !searchQuery || 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = craftStatusFilter === "ALL" ||
        (craftStatusFilter === "LIVE" && c.isLiveOnSignup) ||
        (craftStatusFilter === "UNADDED" && !c.isLiveOnSignup);

      return matchesSearch && matchesStatus;
    });
  }, [allKnownCrafts, searchQuery, craftStatusFilter]);

  const totalCraftPages = Math.max(1, Math.ceil(filteredCrafts.length / CRAFT_PER_PAGE));

  useEffect(() => {
    setCraftPage(1);
  }, [searchQuery, craftStatusFilter]);

  useEffect(() => {
    if (craftPage > totalCraftPages) {
      setCraftPage(totalCraftPages);
    }
  }, [totalCraftPages, craftPage]);

  const paginatedCrafts = useMemo(() => {
    const start = (craftPage - 1) * CRAFT_PER_PAGE;
    return filteredCrafts.slice(start, start + CRAFT_PER_PAGE);
  }, [filteredCrafts, craftPage]);

  // Unique craft categories from all categories
  const uniqueProfCraftCategories = useMemo(() => {
    return allCategories;
  }, [allCategories]);

  // Count of active professions grouped by craft category
  const profCountByCraft = useMemo(() => {
    const counts = {};
    professions.forEach(p => {
      const cat = p.craftCategory || "General Craft";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [professions]);

  // 4. ALL KNOWN LANGUAGES (Standard Cinema Languages + DB Languages)
  const allKnownLanguages = useMemo(() => {
    const map = new Map();

    STANDARD_LANGUAGES.forEach(l => {
      const key = (l.name || "").trim().toLowerCase();
      map.set(key, {
        name: l.name,
        nativeName: l.nativeName || "",
        code: l.code || "",
        isLiveOnSignup: false,
        isInCatalog: false,
        talentCount: 0,
        id: null,
        isLibraryPreset: true
      });
    });

    languages.forEach(l => {
      const key = (l.name || "").trim().toLowerCase();
      const existing = map.get(key);
      const isLive = l.isActive !== false;
      map.set(key, {
        name: l.name,
        nativeName: l.nativeName || existing?.nativeName || "",
        code: l.code || existing?.code || "",
        isLiveOnSignup: isLive,
        isInCatalog: true,
        talentCount: l.talentCount || 0,
        id: l.id,
        createdAt: l.createdAt,
        isLibraryPreset: !!existing
      });
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.isLiveOnSignup !== b.isLiveOnSignup) {
        return a.isLiveOnSignup ? -1 : 1;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
    return list;
  }, [languages]);

  const liveLangCount = useMemo(() => languages.filter(l => l.isActive !== false).length, [languages]);
  const unaddedLangCount = useMemo(() => allKnownLanguages.filter(l => !l.isLiveOnSignup).length, [allKnownLanguages]);

  const filteredLanguages = useMemo(() => {
    return allKnownLanguages.filter(l => {
      const matchesSearch = !searchQuery || 
        l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.nativeName && l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.code && l.code.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = langStatusFilter === "ALL" ||
        (langStatusFilter === "LIVE" && l.isLiveOnSignup) ||
        (langStatusFilter === "UNADDED" && !l.isLiveOnSignup);

      return matchesSearch && matchesStatus;
    });
  }, [allKnownLanguages, searchQuery, langStatusFilter]);

  const totalLangPages = Math.max(1, Math.ceil(filteredLanguages.length / LANG_PER_PAGE));

  useEffect(() => {
    setLangPage(1);
  }, [searchQuery, langStatusFilter]);

  useEffect(() => {
    if (langPage > totalLangPages) {
      setLangPage(totalLangPages);
    }
  }, [totalLangPages, langPage]);

  const paginatedLanguages = useMemo(() => {
    const start = (langPage - 1) * LANG_PER_PAGE;
    return filteredLanguages.slice(start, start + LANG_PER_PAGE);
  }, [filteredLanguages, langPage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ============================================================== */}
      {/* 1. DESK HEADER & LIVE OVERVIEW */}
      {/* ============================================================== */}
      <div 
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          padding: "24px 28px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div 
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                backgroundColor: "#fdf2f8",
                color: "#ee008f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(238, 0, 143, 0.15)"
              }}
            >
              <Tag size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                  Master Skills, Crafts & Professions Desk
                </h2>
                <span 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    fontSize: "11px",
                    fontWeight: "800",
                    border: "1px solid #a7f3d0"
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                  PostgreSQL Active
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                Central database directory of primary sign-up professions, core craft disciplines, and portfolio skills.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* 3-View Tab Switcher */}
            <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "14px", flexWrap: "wrap", gap: "2px" }}>
              
              {/* Tab 1: Skills */}
              <button
                type="button"
                onClick={() => setActiveSubTab("skills")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: activeSubTab === "skills" ? "#ffffff" : "transparent",
                  color: activeSubTab === "skills" ? "#ee008f" : "#475569",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  boxShadow: activeSubTab === "skills" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Tag size={14} />
                <span>Skills ({skills.length})</span>
              </button>

              {/* Tab 2: Crafts */}
              <button
                type="button"
                onClick={() => setActiveSubTab("crafts")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: activeSubTab === "crafts" ? "#ffffff" : "transparent",
                  color: activeSubTab === "crafts" ? "#ee008f" : "#475569",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  boxShadow: activeSubTab === "crafts" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Layers size={14} />
                <span>Crafts ({crafts.length})</span>
              </button>

              {/* Tab 3: Professions (The New Requested Feature) */}
              <button
                type="button"
                onClick={() => setActiveSubTab("professions")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: activeSubTab === "professions" ? "#ffffff" : "transparent",
                  color: activeSubTab === "professions" ? "#ee008f" : "#475569",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  boxShadow: activeSubTab === "professions" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Briefcase size={14} />
                <span>Primary Professions ({professions.length})</span>
              </button>

              {/* Tab 4: Languages */}
              <button
                type="button"
                onClick={() => setActiveSubTab("languages")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: activeSubTab === "languages" ? "#ffffff" : "transparent",
                  color: activeSubTab === "languages" ? "#ee008f" : "#475569",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  boxShadow: activeSubTab === "languages" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Globe size={14} />
                <span>Languages ({allKnownLanguages.length})</span>
              </button>

            </div>

            <button
              type="button"
              onClick={() => setShowSignupPreviewModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 16px",
                borderRadius: "12px",
                backgroundColor: "#fff1f8",
                border: "1px solid #fbcfe8",
                color: "#ee008f",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(238, 0, 143, 0.08)"
              }}
              title="See exactly how crafts and professions appear to users on the Sign-Up screen"
            >
              <Eye size={14} />
              <span>Preview Sign-Up Dropdowns</span>
            </button>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 16px",
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#334155",
                fontSize: "12px",
                fontWeight: "700",
                cursor: refreshing ? "not-allowed" : "pointer"
              }}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Syncing..." : "Sync DB"}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          
          <div style={{ padding: "16px 20px", borderRadius: "18px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
              Total Master Skills
            </span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginTop: "4px" }}>
              {skills.length}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", marginTop: "2px" }}>
              ● Used on Talent Profiles (Not Sign-Up)
            </div>
          </div>

          <div style={{ padding: "16px 20px", borderRadius: "18px", backgroundColor: "#fdf2f8", border: "1px solid #fce7f3" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#be185d", textTransform: "uppercase" }}>
              Sign-Up Crafts (Departments)
            </span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#be185d", marginTop: "4px" }}>
              {crafts.length}
            </div>
            <div style={{ fontSize: "11px", color: "#9d174d", fontWeight: "700", marginTop: "2px" }}>
              ● Step 1 on /join screen
            </div>
          </div>

          <div style={{ padding: "16px 20px", borderRadius: "18px", backgroundColor: "#faf5ff", border: "1px solid #f3e8ff" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#9333ea", textTransform: "uppercase" }}>
              Primary Professions
            </span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#7e22ce", marginTop: "4px" }}>
              {professions.length}
            </div>
            <div style={{ fontSize: "11px", color: "#6b21a8", fontWeight: "700", marginTop: "2px" }}>
              ● Step 2 on /join screen (Live)
            </div>
          </div>

          <div style={{ padding: "16px 20px", borderRadius: "18px", backgroundColor: "#f0fdf4", border: "1px solid #dcfce7" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#15803d", textTransform: "uppercase" }}>
              Talent Profile Usages
            </span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#15803d", marginTop: "4px" }}>
              {totalTalentUsage}
            </div>
            <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", marginTop: "2px" }}>
              ● Bound in profile_skills
            </div>
          </div>

        </div>

        {/* Dynamic Contextual Helper Banner explaining where current tab is used */}
        {activeSubTab === "professions" && (
          <div style={{ padding: "12px 18px", borderRadius: "14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#166534" }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <span>
                <strong>100% Live Synced with Sign-Up Page (/join):</strong> All <strong>{professions.length}</strong> professions below are dynamically fetched by the user registration form and categorized under their respective craft.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSignupPreviewModal(true)}
              style={{ fontSize: "11.5px", fontWeight: "800", color: "#166534", backgroundColor: "#dcfce7", padding: "4px 10px", borderRadius: "8px", border: "1px solid #86efac", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <Eye size={12} /> Test Live Dropdown
            </button>
          </div>
        )}

        {activeSubTab === "crafts" && (
          <div style={{ padding: "12px 18px", borderRadius: "14px", backgroundColor: "#fff1f8", border: "1px solid #fbcfe8", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#9d174d" }}>
              <Layers size={18} color="#ee008f" />
              <span>
                <strong>Sign-Up Department Categories:</strong> Users first pick one of these <strong>{crafts.length}</strong> crafts on the Sign-Up screen. Selecting a craft instantly filters Dropdown 2 down to that department's specific professions.
              </span>
            </div>
            <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#be185d", backgroundColor: "#fce7f3", padding: "3px 8px", borderRadius: "6px" }}>
              Dropdown 1 on /join
            </span>
          </div>
        )}

        {activeSubTab === "skills" && (
          <div style={{ padding: "12px 18px", borderRadius: "14px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1e40af" }}>
              <Sparkles size={18} color="#2563eb" />
              <span>
                <strong>Used in Talent Profiles (Not Sign-Up):</strong> These are specialized portfolio skills (e.g. Method Acting, Horse Riding, SFX). Talents add them inside their <strong>Profile Page</strong> <em>after</em> signing up, and casting directors search them.
              </span>
            </div>
            <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#1d4ed8", backgroundColor: "#dbeafe", padding: "3px 8px", borderRadius: "6px" }}>
              Profile & Audition Filter
            </span>
          </div>
        )}

        {activeSubTab === "languages" && (
          <div style={{ padding: "12px 18px", borderRadius: "14px", backgroundColor: "#fdf4ff", border: "1px solid #f0abfc", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#86198f" }}>
              <Globe size={18} color="#c026d3" />
              <span>
                <strong>100% Live Synced with Sign-Up, Profile & Casting Calls:</strong> All <strong>{liveLangCount}</strong> active languages below are dynamically available on user registration, talent profiles (Languages Known & Acting Languages), and casting calls.
              </span>
            </div>
            <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#86198f", backgroundColor: "#fae8ff", padding: "3px 8px", borderRadius: "6px" }}>
              Live on /join & /profile
            </span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. SUBTAB: SKILLS CATALOG VIEW */}
      {/* ============================================================== */}
      {activeSubTab === "skills" && (
        <>
          {/* Top Overview & Custom Quick Add Bar */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fdf2f8", color: "#ee008f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    Master Cinema Skills Catalog
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Showing all <strong>{allKnownSkills.length}</strong> standard cinema skills. Items in active catalog have <strong>no plus mark</strong>. Items not yet in catalog have a <strong>(+) symbol</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669", backgroundColor: "#ecfdf5", padding: "5px 12px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                  ● {liveSkillCount} In Portfolio Catalog
                </span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#ee008f", backgroundColor: "#fdf2f8", padding: "5px 12px", borderRadius: "10px", border: "1px solid #fbcfe8" }}>
                  + {unaddedSkillCount} with (+) to Add
                </span>
              </div>
            </div>

            {/* Quick Add Custom Skill */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 18px",
              backgroundColor: "#fdf2f8",
              borderRadius: "16px",
              border: "1.5px solid #fbcfe8",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ee008f", fontWeight: "800", fontSize: "12.5px" }}>
                <Sparkles size={16} />
                <span>Add Custom Skill:</span>
              </div>
              <input
                type="text"
                placeholder="Type any custom skill name (e.g. Method Acting, Beatboxing, Salsa)..."
                value={quickSkillName}
                onChange={(e) => setQuickSkillName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddSkill(); }}
                style={{
                  flex: "1 1 240px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #f9a8d4",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  outline: "none",
                  backgroundColor: "#ffffff"
                }}
              />
              <select
                value={quickSkillCategory}
                onChange={(e) => setQuickSkillCategory(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #f9a8d4",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  color: "#9d174d",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>🎬 {cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleQuickAddSkill}
                disabled={!quickSkillName.trim() || isSubmittingSkill}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: !quickSkillName.trim() ? "#cbd5e1" : "#ee008f",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  cursor: !quickSkillName.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: !quickSkillName.trim() ? "none" : "0 2px 8px rgba(238, 0, 143, 0.3)"
                }}
              >
                <Plus size={15} />
                <span>+ Add to Catalog</span>
              </button>
            </div>
          </div>

          {/* Sticky Multi-Select Batch Add Bar */}
          {selectedSkillNames.length > 0 && (
            <div style={{
              position: "sticky",
              top: "16px",
              zIndex: 30,
              padding: "12px 20px",
              borderRadius: "14px",
              backgroundColor: "#ee008f",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(238, 0, 143, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "800" }}>
                <Sparkles size={18} />
                <span>{selectedSkillNames.length} {selectedSkillNames.length === 1 ? "skill" : "skills"} selected with (+) mark</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedSkillNames([])}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Deselect All
                </button>

                <button
                  type="button"
                  onClick={handleAddSelectedSkills}
                  disabled={isSubmittingSkill}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#ffffff",
                    color: "#ee008f",
                    fontSize: "12.5px",
                    fontWeight: "900",
                    cursor: isSubmittingSkill ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}
                >
                  <Plus size={16} />
                  <span>{isSubmittingSkill ? "Adding..." : `+ Add (${selectedSkillNames.length}) to Catalog`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Directory Filter, Search & Skills List */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Status Segmented Tabs + Search + Sort + View Mode */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
              {/* Status Segmented Tabs */}
              <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "12px", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => setSkillStatusFilter("ALL")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: skillStatusFilter === "ALL" ? "#ffffff" : "transparent",
                    color: skillStatusFilter === "ALL" ? "#0f172a" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: skillStatusFilter === "ALL" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  All ({allKnownSkills.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSkillStatusFilter("LIVE")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: skillStatusFilter === "LIVE" ? "#ffffff" : "transparent",
                    color: skillStatusFilter === "LIVE" ? "#059669" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: skillStatusFilter === "LIVE" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  ● In Portfolio Catalog ({liveSkillCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSkillStatusFilter("UNADDED")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: skillStatusFilter === "UNADDED" ? "#ffffff" : "transparent",
                    color: skillStatusFilter === "UNADDED" ? "#ee008f" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: skillStatusFilter === "UNADDED" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  + Available with (+) ({unaddedSkillCount})
                </button>
              </div>

              {/* Search Box */}
              <div style={{ position: "relative", minWidth: "240px", flex: "1 1 260px" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input 
                  type="text"
                  placeholder="Search all skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    color: "#0f172a",
                    outline: "none",
                    backgroundColor: "#f8fafc",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Sort & View Mode */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    backgroundColor: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <option value="name">Name (A - Z)</option>
                  <option value="usage">Most Talents Added</option>
                  <option value="newest">Recently Added</option>
                </select>

                <div style={{ display: "inline-flex", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: viewMode === "table" ? "#ffffff" : "transparent",
                      color: viewMode === "table" ? "#0f172a" : "#64748b",
                      boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="List / Table View"
                  >
                    <List size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                      color: viewMode === "grid" ? "#0f172a" : "#64748b",
                      boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Grid View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12px", color: "#64748b" }}>
              <div>
                Showing <strong>{filteredSkills.length === 0 ? 0 : (skillPage - 1) * SKILL_PER_PAGE + 1}–{Math.min(skillPage * SKILL_PER_PAGE, filteredSkills.length)}</strong> of <strong>{filteredSkills.length}</strong> skills ({SKILL_PER_PAGE} per page)
              </div>
              <span style={{ fontWeight: "700", color: "#ee008f", backgroundColor: "#fdf2f8", padding: "2px 8px", borderRadius: "6px", border: "1px solid #fbcfe8", fontSize: "11.5px" }}>
                Page {skillPage} of {totalSkillPages}
              </span>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: selectedCategory === "ALL" ? "#0f172a" : "#f1f5f9",
                  color: selectedCategory === "ALL" ? "#ffffff" : "#475569",
                  whiteSpace: "nowrap"
                }}
              >
                All Crafts ({allKnownSkills.length})
              </button>

              {allCategories.map(cat => {
                const count = allKnownSkills.filter(s => s.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#ee008f" : "#f8fafc",
                      color: isSelected ? "#ffffff" : "#64748b",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {cat} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>

            {/* Skills Display */}
            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto", color: "#ee008f" }} />
                <p style={{ fontSize: "14px", fontWeight: "700" }}>Loading skills from PostgreSQL...</p>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "18px", border: "1px dashed #cbd5e1" }}>
                <Tag size={32} style={{ color: "#94a3b8", margin: "0 auto 12px auto" }} />
                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 }}>No skills found</h4>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
                  {searchQuery ? `No skills match "${searchQuery}".` : "No skills match current filter."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: "14px" }}>
                {paginatedSkills.map(skill => {
                  const colors = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS["Specialized Craft"];
                  const isSelected = selectedSkillNames.includes(skill.name);
                  return (
                    <div 
                      key={skill.name}
                      onClick={() => {
                        if (!skill.isLiveInDb) {
                          toggleSelectSkill(skill.name);
                        }
                      }}
                      style={{
                        backgroundColor: skill.isLiveInDb 
                          ? "#ffffff" 
                          : isSelected 
                            ? "#fdf2f8" 
                            : "#fbfcfd",
                        borderRadius: "16px",
                        padding: "16px",
                        boxSizing: "border-box",
                        overflow: "hidden",
                        border: skill.isLiveInDb 
                          ? "1.5px solid #e2e8f0" 
                          : isSelected 
                            ? "2px solid #ee008f" 
                            : "1.5px dashed #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px",
                        cursor: !skill.isLiveInDb ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected 
                          ? "0 4px 14px rgba(238, 0, 143, 0.2)" 
                          : skill.isLiveInDb 
                            ? "0 1px 3px rgba(0,0,0,0.04)" 
                            : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {!skill.isLiveInDb && (
                              <div 
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "5px",
                                  border: isSelected ? "2px solid #ee008f" : "1.5px solid #cbd5e1",
                                  backgroundColor: isSelected ? "#ee008f" : "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  flexShrink: 0
                                }}
                              >
                                {isSelected && <CheckCircle2 size={12} />}
                              </div>
                            )}
                            <h4 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={skill.name}>
                              {skill.name}
                            </h4>
                          </div>

                          <span 
                            style={{
                              display: "inline-block",
                              marginTop: "6px",
                              padding: "3px 9px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "800",
                              backgroundColor: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {skill.category || "Specialized Craft"}
                          </span>
                        </div>

                        {/* Right Action: Deselect & Trash for live, Plus Button for unadded */}
                        {skill.isLiveInDb ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, marginLeft: "auto" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeselectSkill(skill);
                              }}
                              style={{
                                padding: "5px 8px",
                                borderRadius: "8px",
                                border: "1px solid #fde68a",
                                backgroundColor: "#fffbeb",
                                color: "#b45309",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "700",
                                whiteSpace: "nowrap"
                              }}
                              title={`Deselect "${skill.name}" from public UI (keeps preserved in Admin with + mark)`}
                            >
                              <EyeOff size={12} />
                              <span>Deselect</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSkill(skill);
                              }}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                border: "1px solid #fecaca",
                                backgroundColor: "#fef2f2",
                                color: "#ef4444",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                flexShrink: 0
                              }}
                              title={`Delete "${skill.name}"`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSingleSkill(skill);
                            }}
                            disabled={isSubmittingSkill}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "10px",
                              border: "none",
                              backgroundColor: isSelected ? "#ee008f" : "#db2777",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: isSubmittingSkill ? "not-allowed" : "pointer",
                              fontWeight: "800",
                              fontSize: "12px",
                              boxShadow: "0 2px 6px rgba(238, 0, 143, 0.3)",
                              flexShrink: 0
                            }}
                            title={`+ Add "${skill.name}" to catalog`}
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f1f5f9", fontSize: "11.5px" }}>
                        {skill.isLiveInDb ? (
                          <>
                            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: skill.usageCount > 0 ? "#059669" : "#64748b", fontWeight: "700" }}>
                              <Users size={13} />
                              {skill.usageCount || 0} {skill.usageCount === 1 ? "talent" : "talents"} using
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#10b981", fontWeight: "800", fontSize: "11px", backgroundColor: "#ecfdf5", padding: "2px 8px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                              ● In Portfolio Catalog
                            </span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>
                              Cinema Skills Library
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: isSelected ? "#ee008f" : "#64748b", fontWeight: "800", fontSize: "11px", backgroundColor: isSelected ? "#fdf2f8" : "#f1f5f9", padding: "2px 8px", borderRadius: "6px", border: isSelected ? "1px solid #fbcfe8" : "1px solid #e2e8f0" }}>
                              <Plus size={11} /> {isSelected ? "Selected to Add" : "Not in Catalog"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 14px", width: "40px" }}></th>
                      <th style={{ padding: "12px 14px" }}>ID / Source</th>
                      <th style={{ padding: "12px 14px" }}>Skill Name</th>
                      <th style={{ padding: "12px 14px" }}>Craft Category</th>
                      <th style={{ padding: "12px 14px" }}>Talents Added</th>
                      <th style={{ padding: "12px 14px" }}>Status</th>
                      <th style={{ padding: "12px 14px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSkills.map(skill => {
                      const colors = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS["Specialized Craft"];
                      const isSelected = selectedSkillNames.includes(skill.name);
                      return (
                        <tr 
                          key={skill.name} 
                          onClick={() => {
                            if (!skill.isLiveInDb) toggleSelectSkill(skill.name);
                          }}
                          style={{ 
                            borderBottom: "1px solid #f1f5f9",
                            backgroundColor: isSelected ? "#fdf2f8" : "transparent",
                            cursor: !skill.isLiveInDb ? "pointer" : "default"
                          }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            {!skill.isLiveInDb && (
                              <div 
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "5px",
                                  border: isSelected ? "2px solid #ee008f" : "1.5px solid #cbd5e1",
                                  backgroundColor: isSelected ? "#ee008f" : "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff"
                                }}
                              >
                                {isSelected && <CheckCircle2 size={12} />}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#94a3b8" }}>
                            {skill.isLiveInDb ? `#${skill.id}` : "Library"}
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: "800", color: "#0f172a" }}>
                            {skill.name}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ padding: "3px 9px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", backgroundColor: colors.bg, color: colors.text }}>
                              {skill.category}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: "700", color: skill.usageCount > 0 ? "#059669" : "#64748b" }}>
                            {skill.isLiveInDb ? `👥 ${skill.usageCount || 0} talents` : "—"}
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: "700" }}>
                            {skill.isLiveInDb ? (
                              <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                ● Active
                              </span>
                            ) : (
                              <span style={{ color: isSelected ? "#ee008f" : "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Plus size={12} /> {isSelected ? "Selected" : "Library Preset"}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            {skill.isLiveInDb ? (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeselectSkill(skill);
                                  }}
                                  style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #fde68a", backgroundColor: "#fffbeb", color: "#b45309", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                  title={`Deselect "${skill.name}" from public UI (keeps preserved in Admin with + mark)`}
                                >
                                  <EyeOff size={13} />
                                  <span>Deselect</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSkill(skill);
                                  }}
                                  style={{ padding: "6px 12px", borderRadius: "8px", border: "none", backgroundColor: "#fef2f2", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddSingleSkill(skill);
                                }}
                                disabled={isSubmittingSkill}
                                style={{ padding: "6px 12px", borderRadius: "8px", border: "none", backgroundColor: "#ee008f", color: "#ffffff", fontSize: "12px", fontWeight: "700", cursor: isSubmittingSkill ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}
                              >
                                <Plus size={13} />
                                <span>Add</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Skills Pagination Controls */}
            {totalSkillPages > 1 && (
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "20px",
                  marginTop: "8px",
                  borderTop: "1px solid #e2e8f0"
                }}
              >
                <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "600" }}>
                  Showing <strong style={{ color: "#0f172a" }}>{(skillPage - 1) * SKILL_PER_PAGE + 1}</strong> to <strong style={{ color: "#0f172a" }}>{Math.min(skillPage * SKILL_PER_PAGE, filteredSkills.length)}</strong> of <strong style={{ color: "#0f172a" }}>{filteredSkills.length}</strong> skills (12 per page)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* First */}
                  <button
                    type="button"
                    disabled={skillPage === 1}
                    onClick={() => setSkillPage(1)}
                    title="First page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: skillPage === 1 ? "#f8fafc" : "#ffffff",
                      color: skillPage === 1 ? "#cbd5e1" : "#475569",
                      cursor: skillPage === 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Prev */}
                  <button
                    type="button"
                    disabled={skillPage === 1}
                    onClick={() => setSkillPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: skillPage === 1 ? "#f8fafc" : "#ffffff",
                      color: skillPage === 1 ? "#cbd5e1" : "#334155",
                      cursor: skillPage === 1 ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {/* Page numbers with ellipsis */}
                  {getPageNumbers(skillPage, totalSkillPages).map((pNum, idx) => {
                    if (pNum === "...") {
                      return (
                        <span 
                          key={`ell-skill-${idx}`} 
                          style={{ padding: "0 6px", color: "#94a3b8", fontWeight: "700", fontSize: "13px" }}
                        >
                          …
                        </span>
                      );
                    }
                    const isActive = pNum === skillPage;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => setSkillPage(pNum)}
                        style={{
                          minWidth: "34px",
                          height: "34px",
                          padding: "0 8px",
                          borderRadius: "10px",
                          border: isActive ? "1px solid #ee008f" : "1px solid #e2e8f0",
                          backgroundColor: isActive ? "#ee008f" : "#ffffff",
                          color: isActive ? "#ffffff" : "#334155",
                          fontWeight: isActive ? "800" : "600",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          boxShadow: isActive ? "0 2px 8px rgba(238, 0, 143, 0.35)" : "none",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    type="button"
                    disabled={skillPage >= totalSkillPages}
                    onClick={() => setSkillPage(p => Math.min(totalSkillPages, p + 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: skillPage >= totalSkillPages ? "#f8fafc" : "#ffffff",
                      color: skillPage >= totalSkillPages ? "#cbd5e1" : "#334155",
                      cursor: skillPage >= totalSkillPages ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    Next <ChevronRight size={15} />
                  </button>

                  {/* Last */}
                  <button
                    type="button"
                    disabled={skillPage >= totalSkillPages}
                    onClick={() => setSkillPage(totalSkillPages)}
                    title="Last page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: skillPage >= totalSkillPages ? "#f8fafc" : "#ffffff",
                      color: skillPage >= totalSkillPages ? "#cbd5e1" : "#475569",
                      cursor: skillPage >= totalSkillPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 3. SUBTAB: CRAFTS & DISCIPLINES VIEW */}
      {/* ============================================================== */}
      {activeSubTab === "crafts" && (
        <>
          {/* Top Overview & Custom Quick Add Bar */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    Master Cinema Crafts Directory
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Showing all <strong>{allKnownCrafts.length}</strong> cinema crafts & sign-up departments. Items live on Sign-Up have <strong>no plus mark</strong>. Items not yet in Sign-Up have a <strong>(+) symbol</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669", backgroundColor: "#ecfdf5", padding: "5px 12px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                  ● {liveCraftCount} Live on Sign-Up
                </span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", backgroundColor: "#eff6ff", padding: "5px 12px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                  + {unaddedCraftCount} with (+) to Add
                </span>
              </div>
            </div>

            {/* Quick Add Custom Craft */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 18px",
              backgroundColor: "#eff6ff",
              borderRadius: "16px",
              border: "1.5px solid #bfdbfe",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2563eb", fontWeight: "800", fontSize: "12.5px" }}>
                <Sparkles size={16} />
                <span>Add Custom Craft:</span>
              </div>
              <input
                type="text"
                placeholder="Type custom craft title (e.g. Aerial Arts, Virtual Production)..."
                value={quickCraftName}
                onChange={(e) => setQuickCraftName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddCraft(); }}
                style={{
                  flex: "1 1 200px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #93c5fd",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  outline: "none",
                  backgroundColor: "#ffffff"
                }}
              />
              <input
                type="text"
                placeholder="Brief craft description (optional)..."
                value={quickCraftDesc}
                onChange={(e) => setQuickCraftDesc(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddCraft(); }}
                style={{
                  flex: "1 1 240px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #93c5fd",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  outline: "none",
                  backgroundColor: "#ffffff"
                }}
              />
              <button
                type="button"
                onClick={handleQuickAddCraft}
                disabled={!quickCraftName.trim() || isSubmittingCraft}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: !quickCraftName.trim() ? "#cbd5e1" : "#2563eb",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  cursor: !quickCraftName.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: !quickCraftName.trim() ? "none" : "0 2px 8px rgba(37, 99, 235, 0.3)"
                }}
              >
                <Plus size={15} />
                <span>+ Add to Sign-Up Page</span>
              </button>
            </div>
          </div>

          {/* Sticky Multi-Select Batch Add Bar */}
          {selectedCraftNames.length > 0 && (
            <div style={{
              position: "sticky",
              top: "16px",
              zIndex: 30,
              padding: "12px 20px",
              borderRadius: "14px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "800" }}>
                <Sparkles size={18} />
                <span>{selectedCraftNames.length} {selectedCraftNames.length === 1 ? "craft" : "crafts"} selected with (+) mark</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedCraftNames([])}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Deselect All
                </button>

                <button
                  type="button"
                  onClick={handleAddSelectedCrafts}
                  disabled={isSubmittingCraft}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#ffffff",
                    color: "#2563eb",
                    fontSize: "12.5px",
                    fontWeight: "900",
                    cursor: isSubmittingCraft ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}
                >
                  <Plus size={16} />
                  <span>{isSubmittingCraft ? "Adding to Sign-Up..." : `+ Add (${selectedCraftNames.length}) to Sign-Up Page`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Crafts Directory Grid */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Status Segmented Tabs + Search + Results */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
              {/* Status Segmented Tabs */}
              <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "12px", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => setCraftStatusFilter("ALL")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: craftStatusFilter === "ALL" ? "#ffffff" : "transparent",
                    color: craftStatusFilter === "ALL" ? "#0f172a" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: craftStatusFilter === "ALL" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  All ({allKnownCrafts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCraftStatusFilter("LIVE")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: craftStatusFilter === "LIVE" ? "#ffffff" : "transparent",
                    color: craftStatusFilter === "LIVE" ? "#059669" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: craftStatusFilter === "LIVE" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  ● Live on Sign-Up ({liveCraftCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCraftStatusFilter("UNADDED")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: craftStatusFilter === "UNADDED" ? "#ffffff" : "transparent",
                    color: craftStatusFilter === "UNADDED" ? "#2563eb" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: craftStatusFilter === "UNADDED" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  + Available with (+) ({unaddedCraftCount})
                </button>
              </div>

              {/* Search Box */}
              <div style={{ position: "relative", minWidth: "260px", flex: "1", maxWidth: "360px" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input 
                  type="text"
                  placeholder="Search cinema crafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    color: "#0f172a",
                    outline: "none",
                    backgroundColor: "#f8fafc",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Page <strong>{craftPage}</strong> of <strong>{totalCraftPages}</strong> ({filteredCrafts.length} shown)
              </div>
            </div>

            {/* Results Indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12px", color: "#64748b" }}>
              <div>
                Showing <strong>{filteredCrafts.length === 0 ? 0 : (craftPage - 1) * CRAFT_PER_PAGE + 1}–{Math.min(craftPage * CRAFT_PER_PAGE, filteredCrafts.length)}</strong> of <strong>{filteredCrafts.length}</strong> crafts ({CRAFT_PER_PAGE} per page)
              </div>
              <span style={{ fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "11.5px" }}>
                Page {craftPage} of {totalCraftPages}
              </span>
            </div>

            {/* Crafts Cards Grid */}
            {filteredCrafts.length === 0 ? (
              <div 
                style={{ 
                  textAlign: "center", 
                  padding: "48px 20px", 
                  backgroundColor: "#f8fafc", 
                  borderRadius: "16px",
                  border: "1px dashed #cbd5e1"
                }}
              >
                <Layers size={36} style={{ color: "#94a3b8", marginBottom: "10px" }} />
                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#334155", margin: "0 0 6px 0" }}>
                  No Crafts Found
                </h4>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                  {searchQuery ? `No crafts match "${searchQuery}".` : "No crafts match the current status filter."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {paginatedCrafts.map(craft => {
                  const colors = CATEGORY_COLORS[craft.name] || CATEGORY_COLORS["Specialized Craft"];
                  const isSelected = selectedCraftNames.includes(craft.name);
                  return (
                    <div 
                      key={craft.name}
                      onClick={() => {
                        if (!craft.isLiveOnSignup) {
                          toggleSelectCraft(craft.name);
                        }
                      }}
                      style={{
                        backgroundColor: craft.isLiveOnSignup 
                          ? "#ffffff" 
                          : isSelected 
                            ? "#eff6ff" 
                            : "#fbfcfd",
                        borderRadius: "18px",
                        padding: "20px",
                        border: craft.isLiveOnSignup 
                          ? "1.5px solid #e2e8f0" 
                          : isSelected 
                            ? "2px solid #2563eb" 
                            : "1.5px dashed #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "14px",
                        cursor: !craft.isLiveOnSignup ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected 
                          ? "0 4px 14px rgba(37, 99, 235, 0.2)" 
                          : craft.isLiveOnSignup 
                            ? "0 1px 3px rgba(0,0,0,0.04)" 
                            : "none"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                            {!craft.isLiveOnSignup && (
                              <div 
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "5px",
                                  border: isSelected ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                                  backgroundColor: isSelected ? "#2563eb" : "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  flexShrink: 0
                                }}
                              >
                                {isSelected && <CheckCircle2 size={12} />}
                              </div>
                            )}
                            <div>
                              <h4 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                                {craft.name}
                              </h4>
                              <span 
                                style={{
                                  display: "inline-block",
                                  marginTop: "6px",
                                  padding: "3px 9px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  backgroundColor: colors.bg,
                                  color: colors.text,
                                  border: `1px solid ${colors.border}`
                                }}
                              >
                                Cinema Department
                              </span>
                            </div>
                          </div>

                          {/* Right Action: Deselect & Trash for live, Plus Button for unadded */}
                          {craft.isLiveOnSignup ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeselectCraft(craft);
                                }}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "8px",
                                  border: "1px solid #fde68a",
                                  backgroundColor: "#fffbeb",
                                  color: "#b45309",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  cursor: "pointer",
                                  fontSize: "11.5px",
                                  fontWeight: "700"
                                }}
                                title={`Deselect "${craft.name}" from Sign-Up (keeps preserved in Admin with + mark)`}
                              >
                                <EyeOff size={13} />
                                <span>Deselect</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCraft(craft);
                                }}
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "8px",
                                  border: "none",
                                  backgroundColor: "#fef2f2",
                                  color: "#ef4444",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  flexShrink: 0
                                }}
                                title={`Delete craft "${craft.name}"`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddSingleCraft(craft);
                              }}
                              disabled={isSubmittingCraft}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: "none",
                                backgroundColor: isSelected ? "#2563eb" : "#1d4ed8",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                cursor: isSubmittingCraft ? "not-allowed" : "pointer",
                                fontWeight: "800",
                                fontSize: "12px",
                                boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                                flexShrink: 0
                              }}
                              title={`+ Add "${craft.name}" to Sign-Up Page`}
                            >
                              <Plus size={14} />
                              <span>Add</span>
                            </button>
                          )}
                        </div>

                        <p style={{ fontSize: "12px", color: "#64748b", margin: "10px 0 0 0", lineHeight: "1.5" }}>
                          {craft.description || "Core creative discipline category."}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #f1f5f9", fontSize: "11.5px" }}>
                        {craft.isLiveOnSignup ? (
                          <>
                            <span style={{ fontWeight: "700", color: craft.skillCount > 0 ? "#059669" : "#64748b" }}>
                              🏷️ {craft.skillCount || 0} {craft.skillCount === 1 ? "skill" : "skills"} categorized
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#10b981", fontWeight: "800", fontSize: "11px", backgroundColor: "#ecfdf5", padding: "2px 8px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                              ● Live on Sign-Up (Dropdown 1)
                            </span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>
                              24 Canonical Film Crafts
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: isSelected ? "#2563eb" : "#64748b", fontWeight: "800", fontSize: "11px", backgroundColor: isSelected ? "#eff6ff" : "#f1f5f9", padding: "2px 8px", borderRadius: "6px", border: isSelected ? "1px solid #bfdbfe" : "1px solid #e2e8f0" }}>
                              <Plus size={11} /> {isSelected ? "Selected to Add" : "Not on Sign-Up"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Crafts Pagination Controls */}
            {totalCraftPages > 1 && (
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "20px",
                  marginTop: "8px",
                  borderTop: "1px solid #e2e8f0"
                }}
              >
                <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "600" }}>
                  Showing <strong style={{ color: "#0f172a" }}>{(craftPage - 1) * CRAFT_PER_PAGE + 1}</strong> to <strong style={{ color: "#0f172a" }}>{Math.min(craftPage * CRAFT_PER_PAGE, filteredCrafts.length)}</strong> of <strong style={{ color: "#0f172a" }}>{filteredCrafts.length}</strong> crafts (12 per page)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* First */}
                  <button
                    type="button"
                    disabled={craftPage === 1}
                    onClick={() => setCraftPage(1)}
                    title="First page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: craftPage === 1 ? "#f8fafc" : "#ffffff",
                      color: craftPage === 1 ? "#cbd5e1" : "#475569",
                      cursor: craftPage === 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Prev */}
                  <button
                    type="button"
                    disabled={craftPage === 1}
                    onClick={() => setCraftPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: craftPage === 1 ? "#f8fafc" : "#ffffff",
                      color: craftPage === 1 ? "#cbd5e1" : "#334155",
                      cursor: craftPage === 1 ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {/* Page numbers with ellipsis */}
                  {getPageNumbers(craftPage, totalCraftPages).map((pNum, idx) => {
                    if (pNum === "...") {
                      return (
                        <span 
                          key={`ell-craft-${idx}`} 
                          style={{ padding: "0 6px", color: "#94a3b8", fontWeight: "700", fontSize: "13px" }}
                        >
                          …
                        </span>
                      );
                    }
                    const isActive = pNum === craftPage;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => setCraftPage(pNum)}
                        style={{
                          minWidth: "34px",
                          height: "34px",
                          padding: "0 8px",
                          borderRadius: "10px",
                          border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                          backgroundColor: isActive ? "#2563eb" : "#ffffff",
                          color: isActive ? "#ffffff" : "#334155",
                          fontWeight: isActive ? "800" : "600",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          boxShadow: isActive ? "0 2px 8px rgba(37, 99, 235, 0.35)" : "none",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    type="button"
                    disabled={craftPage >= totalCraftPages}
                    onClick={() => setCraftPage(p => Math.min(totalCraftPages, p + 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: craftPage >= totalCraftPages ? "#f8fafc" : "#ffffff",
                      color: craftPage >= totalCraftPages ? "#cbd5e1" : "#334155",
                      cursor: craftPage >= totalCraftPages ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    Next <ChevronRight size={15} />
                  </button>

                  {/* Last */}
                  <button
                    type="button"
                    disabled={craftPage >= totalCraftPages}
                    onClick={() => setCraftPage(totalCraftPages)}
                    title="Last page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: craftPage >= totalCraftPages ? "#f8fafc" : "#ffffff",
                      color: craftPage >= totalCraftPages ? "#cbd5e1" : "#475569",
                      cursor: craftPage >= totalCraftPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 4. SUBTAB: PRIMARY PROFESSIONS VIEW (NEW FEATURE) */}
      {/* ============================================================== */}
      {activeSubTab === "professions" && (
        <>
          {/* Top Overview & Custom Quick Add Bar */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    Master Cinema Professions Directory
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Showing all <strong>{allKnownProfessions.length}</strong> canonical cinema designations. Items live on Sign-Up have <strong>no plus mark</strong>. Items not yet in Sign-Up have a <strong>(+) symbol</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669", backgroundColor: "#ecfdf5", padding: "5px 12px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                  ● {liveProfCount} Live on Sign-Up
                </span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#9333ea", backgroundColor: "#faf5ff", padding: "5px 12px", borderRadius: "10px", border: "1px solid #e9d5ff" }}>
                  + {unaddedProfCount} with (+) to Add
                </span>
              </div>
            </div>

            {/* Quick Add Custom Profession */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 18px",
              backgroundColor: "#faf5ff",
              borderRadius: "16px",
              border: "1.5px solid #e9d5ff",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9333ea", fontWeight: "800", fontSize: "12.5px" }}>
                <Sparkles size={16} />
                <span>Add Custom Profession:</span>
              </div>
              <input
                type="text"
                placeholder="Type any custom profession title..."
                value={quickProfName}
                onChange={(e) => setQuickProfName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddProfession(); }}
                style={{
                  flex: "1 1 240px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d8b4fe",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  outline: "none",
                  backgroundColor: "#ffffff"
                }}
              />
              <select
                value={quickProfCraft}
                onChange={(e) => setQuickProfCraft(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d8b4fe",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  color: "#581c87",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>🎬 {cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleQuickAddProfession}
                disabled={!quickProfName.trim() || isSubmittingProf}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: !quickProfName.trim() ? "#cbd5e1" : "#9333ea",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  cursor: !quickProfName.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: !quickProfName.trim() ? "none" : "0 2px 8px rgba(147, 51, 234, 0.3)"
                }}
              >
                <Plus size={15} />
                <span>+ Add to Sign-Up Page</span>
              </button>
            </div>
          </div>

          {/* Sticky Multi-Select Batch Add Bar */}
          {selectedProfNames.length > 0 && (
            <div style={{
              position: "sticky",
              top: "16px",
              zIndex: 30,
              padding: "12px 20px",
              borderRadius: "14px",
              backgroundColor: "#9333ea",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(147, 51, 234, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "800" }}>
                <Sparkles size={18} />
                <span>{selectedProfNames.length} {selectedProfNames.length === 1 ? "profession" : "professions"} selected with (+) mark</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedProfNames([])}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Deselect All
                </button>

                <button
                  type="button"
                  onClick={handleAddSelectedProfessions}
                  disabled={isSubmittingProf}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#ffffff",
                    color: "#9333ea",
                    fontSize: "12.5px",
                    fontWeight: "900",
                    cursor: isSubmittingProf ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}
                >
                  <Plus size={16} />
                  <span>{isSubmittingProf ? "Adding to Sign-Up..." : `+ Add (${selectedProfNames.length}) to Sign-Up Page`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Professions Directory */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Status Tabs + Search + Craft Filter */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
              
              {/* Status Segmented Tabs */}
              <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "12px", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => setProfStatusFilter("ALL")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: profStatusFilter === "ALL" ? "#ffffff" : "transparent",
                    color: profStatusFilter === "ALL" ? "#0f172a" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: profStatusFilter === "ALL" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  All ({allKnownProfessions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProfStatusFilter("LIVE")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: profStatusFilter === "LIVE" ? "#ffffff" : "transparent",
                    color: profStatusFilter === "LIVE" ? "#059669" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: profStatusFilter === "LIVE" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  ● Live on Sign-Up ({liveProfCount})
                </button>
                <button
                  type="button"
                  onClick={() => setProfStatusFilter("UNADDED")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: profStatusFilter === "UNADDED" ? "#ffffff" : "transparent",
                    color: profStatusFilter === "UNADDED" ? "#9333ea" : "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: profStatusFilter === "UNADDED" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  + Available with (+) ({unaddedProfCount})
                </button>
              </div>

              {/* Search Box */}
              <div style={{ position: "relative", minWidth: "240px", flex: "1", maxWidth: "340px" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input 
                  type="text"
                  placeholder="Search all professions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    color: "#0f172a",
                    outline: "none",
                    backgroundColor: "#f8fafc",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Craft Category Filter Dropdown */}
              <div style={{ minWidth: "200px" }}>
                <select
                  value={selectedProfCraftFilter}
                  onChange={(e) => setSelectedProfCraftFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: selectedProfCraftFilter === "ALL" ? "#334155" : "#9333ea",
                    backgroundColor: selectedProfCraftFilter === "ALL" ? "#f8fafc" : "#faf5ff",
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="ALL">📁 All Crafts ({allKnownProfessions.length})</option>
                  {uniqueProfCraftCategories.map(cat => {
                    const totalInCraft = allKnownProfessions.filter(p => p.craftCategory === cat).length;
                    return (
                      <option key={cat} value={cat}>
                        🎬 {cat} ({totalInCraft})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Page <strong>{profPage}</strong> of <strong>{totalProfPages}</strong> ({filteredProfessions.length} shown)
              </div>
            </div>

            {/* Interactive Horizontal Craft Filter Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
              <button
                type="button"
                onClick={() => setSelectedProfCraftFilter("ALL")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: selectedProfCraftFilter === "ALL" ? "#0f172a" : "#f1f5f9",
                  color: selectedProfCraftFilter === "ALL" ? "#ffffff" : "#475569",
                  whiteSpace: "nowrap"
                }}
              >
                All Crafts ({allKnownProfessions.length})
              </button>
              {uniqueProfCraftCategories.map(cat => {
                const totalInCraft = allKnownProfessions.filter(p => p.craftCategory === cat).length;
                const isSelected = selectedProfCraftFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedProfCraftFilter(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#9333ea" : "#f8fafc",
                      color: isSelected ? "#ffffff" : "#64748b",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {cat} {totalInCraft > 0 && `(${totalInCraft})`}
                  </button>
                );
              })}
            </div>

            {paginatedProfessions.length === 0 ? (
              <div 
                style={{ 
                  textAlign: "center", 
                  padding: "48px 20px", 
                  backgroundColor: "#f8fafc", 
                  borderRadius: "16px",
                  border: "1px dashed #cbd5e1"
                }}
              >
                <Film size={36} style={{ color: "#94a3b8", marginBottom: "10px" }} />
                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#334155", margin: "0 0 6px 0" }}>
                  No Professions Found
                </h4>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                  No professions match your current search, craft filter, or status selection.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: "14px" }}>
                {paginatedProfessions.map(prof => {
                  const colors = CATEGORY_COLORS[prof.craftCategory] || CATEGORY_COLORS["Specialized Craft"];
                  const isSelected = selectedProfNames.includes(prof.name);
                  return (
                    <div 
                      key={prof.name}
                      onClick={() => {
                        if (!prof.isLiveOnSignup) {
                          toggleSelectProf(prof.name);
                        }
                      }}
                      style={{
                        backgroundColor: prof.isLiveOnSignup 
                          ? "#ffffff" 
                          : isSelected 
                            ? "#faf5ff" 
                            : "#fbfcfd",
                        borderRadius: "16px",
                        padding: "16px",
                        boxSizing: "border-box",
                        overflow: "hidden",
                        border: prof.isLiveOnSignup 
                          ? "1.5px solid #e2e8f0" 
                          : isSelected 
                            ? "2px solid #9333ea" 
                            : "1.5px dashed #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px",
                        cursor: !prof.isLiveOnSignup ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected 
                          ? "0 4px 14px rgba(147, 51, 234, 0.2)" 
                          : prof.isLiveOnSignup 
                            ? "0 1px 3px rgba(0,0,0,0.04)" 
                            : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {!prof.isLiveOnSignup && (
                              <div 
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "5px",
                                  border: isSelected ? "2px solid #9333ea" : "1.5px solid #cbd5e1",
                                  backgroundColor: isSelected ? "#9333ea" : "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  flexShrink: 0
                                }}
                              >
                                {isSelected && <CheckCircle2 size={12} />}
                              </div>
                            )}
                            <h4 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={prof.name}>
                              {prof.name}
                            </h4>
                          </div>

                          <span 
                            style={{
                              display: "inline-block",
                              marginTop: "6px",
                              padding: "3px 9px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "800",
                              backgroundColor: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {prof.craftCategory || "General Craft"}
                          </span>
                        </div>

                        {/* Right Action: Deselect & Trash for live, Plus Button for unadded */}
                        {prof.isLiveOnSignup ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, marginLeft: "auto" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeselectProfession(prof);
                              }}
                              style={{
                                padding: "5px 8px",
                                borderRadius: "8px",
                                border: "1px solid #fde68a",
                                backgroundColor: "#fffbeb",
                                color: "#b45309",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "700",
                                whiteSpace: "nowrap"
                              }}
                              title={`Deselect "${prof.name}" from Sign-Up (keeps preserved in Admin with + mark)`}
                            >
                              <EyeOff size={12} />
                              <span>Deselect</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProfession(prof);
                              }}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                border: "1px solid #fecaca",
                                backgroundColor: "#fef2f2",
                                color: "#ef4444",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                flexShrink: 0
                              }}
                              title={`Delete "${prof.name}"`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSingleProfession(prof);
                            }}
                            disabled={isSubmittingProf}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "10px",
                              border: "none",
                              backgroundColor: isSelected ? "#9333ea" : "#7e22ce",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: isSubmittingProf ? "not-allowed" : "pointer",
                              fontWeight: "800",
                              fontSize: "12px",
                              boxShadow: "0 2px 6px rgba(147, 51, 234, 0.3)",
                              flexShrink: 0
                            }}
                            title={`+ Add "${prof.name}" to Sign-Up Page`}
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f1f5f9", fontSize: "11.5px" }}>
                        {prof.isLiveOnSignup ? (
                          <>
                            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: prof.userCount > 0 ? "#059669" : "#64748b", fontWeight: "700" }}>
                              <Users size={13} />
                              {prof.userCount || 0} registered
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#10b981", fontWeight: "800", fontSize: "11px", backgroundColor: "#ecfdf5", padding: "2px 8px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                              ● Live on Sign-Up
                            </span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>
                              Cinema Master Library
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: isSelected ? "#9333ea" : "#64748b", fontWeight: "800", fontSize: "11px", backgroundColor: isSelected ? "#faf5ff" : "#f1f5f9", padding: "2px 8px", borderRadius: "6px", border: isSelected ? "1px solid #d8b4fe" : "1px solid #e2e8f0" }}>
                              <Plus size={11} /> {isSelected ? "Selected to Add" : "Not on Sign-Up"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalProfPages > 1 && (
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "20px",
                  marginTop: "8px",
                  borderTop: "1px solid #e2e8f0"
                }}
              >
                <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "600" }}>
                  Showing <strong style={{ color: "#0f172a" }}>{(profPage - 1) * PROF_PER_PAGE + 1}</strong> to <strong style={{ color: "#0f172a" }}>{Math.min(profPage * PROF_PER_PAGE, filteredProfessions.length)}</strong> of <strong style={{ color: "#0f172a" }}>{filteredProfessions.length}</strong> professions (12 per page)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* First */}
                  <button
                    type="button"
                    disabled={profPage === 1}
                    onClick={() => setProfPage(1)}
                    title="First page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: profPage === 1 ? "#f8fafc" : "#ffffff",
                      color: profPage === 1 ? "#cbd5e1" : "#475569",
                      cursor: profPage === 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Prev */}
                  <button
                    type="button"
                    disabled={profPage === 1}
                    onClick={() => setProfPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: profPage === 1 ? "#f8fafc" : "#ffffff",
                      color: profPage === 1 ? "#cbd5e1" : "#334155",
                      cursor: profPage === 1 ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {/* Page numbers with ellipsis */}
                  {getPageNumbers(profPage, totalProfPages).map((pNum, idx) => {
                    if (pNum === "...") {
                      return (
                        <span 
                          key={`ell-${idx}`} 
                          style={{ padding: "0 6px", color: "#94a3b8", fontWeight: "700", fontSize: "13px" }}
                        >
                          …
                        </span>
                      );
                    }
                    const isActive = pNum === profPage;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => setProfPage(pNum)}
                        style={{
                          minWidth: "34px",
                          height: "34px",
                          padding: "0 8px",
                          borderRadius: "10px",
                          border: isActive ? "1px solid #ee008f" : "1px solid #e2e8f0",
                          backgroundColor: isActive ? "#ee008f" : "#ffffff",
                          color: isActive ? "#ffffff" : "#334155",
                          fontWeight: isActive ? "800" : "600",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          boxShadow: isActive ? "0 2px 8px rgba(238, 0, 143, 0.35)" : "none",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    type="button"
                    disabled={profPage >= totalProfPages}
                    onClick={() => setProfPage(p => Math.min(totalProfPages, p + 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: profPage >= totalProfPages ? "#f8fafc" : "#ffffff",
                      color: profPage >= totalProfPages ? "#cbd5e1" : "#334155",
                      cursor: profPage >= totalProfPages ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    Next <ChevronRight size={15} />
                  </button>

                  {/* Last */}
                  <button
                    type="button"
                    disabled={profPage >= totalProfPages}
                    onClick={() => setProfPage(totalProfPages)}
                    title="Last page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: profPage >= totalProfPages ? "#f8fafc" : "#ffffff",
                      color: profPage >= totalProfPages ? "#cbd5e1" : "#475569",
                      cursor: profPage >= totalProfPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 5. SUBTAB: MASTER CINEMA LANGUAGES DIRECTORY */}
      {/* ============================================================== */}
      {activeSubTab === "languages" && (
        <>
          {/* Top Overview & Custom Quick Add Bar */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fdf4ff", color: "#c026d3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    Master Cinema Languages Directory
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Showing all <strong>{allKnownLanguages.length}</strong> canonical cinema languages. Languages live on Sign-Up & Profiles have <strong>no plus mark</strong>. Languages not yet active have a <strong>(+) symbol</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669", backgroundColor: "#ecfdf5", padding: "5px 12px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                  ● {liveLangCount} Live on Sign-Up
                </span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#c026d3", backgroundColor: "#fdf4ff", padding: "5px 12px", borderRadius: "10px", border: "1px solid #f5d0fe" }}>
                  + {unaddedLangCount} with (+) to Add
                </span>
              </div>
            </div>

            {/* Quick Add Custom Language */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 18px",
              backgroundColor: "#fdf4ff",
              borderRadius: "16px",
              border: "1.5px solid #f5d0fe",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c026d3", fontWeight: "800", fontSize: "12.5px" }}>
                <Sparkles size={16} />
                <span>Add Custom Language:</span>
              </div>
              <input
                type="text"
                placeholder="Language name (e.g. Telugu, Spanish)..."
                value={quickLangName}
                onChange={(e) => setQuickLangName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddLanguage(); }}
                style={{
                  flex: "1 1 200px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e879f9",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  outline: "none",
                  backgroundColor: "#ffffff"
                }}
              />
              <input
                type="text"
                placeholder="Native script (e.g. తెలుగు, Español)..."
                value={quickLangNative}
                onChange={(e) => setQuickLangNative(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddLanguage(); }}
                style={{
                  flex: "1 1 180px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e879f9",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  outline: "none",
                  backgroundColor: "#ffffff"
                }}
              />
              <input
                type="text"
                placeholder="Code (e.g. te, es)..."
                value={quickLangCode}
                onChange={(e) => setQuickLangCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddLanguage(); }}
                style={{
                  width: "100px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e879f9",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  outline: "none",
                  backgroundColor: "#ffffff"
                }}
              />

              <button
                type="button"
                onClick={handleQuickAddLanguage}
                disabled={isSubmittingLang || !quickLangName.trim()}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #c026d3 0%, #a21caf 100%)",
                  color: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: "800",
                  cursor: isSubmittingLang || !quickLangName.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: !quickLangName.trim() ? 0.6 : 1,
                  boxShadow: "0 2px 6px rgba(192, 38, 211, 0.3)"
                }}
              >
                <Plus size={15} />
                <span>Add & Activate on Sign-Up</span>
              </button>

              <button
                type="button"
                onClick={handleBulkImportLanguages}
                disabled={isBulkImportingLang}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "1px solid #f0abfc",
                  backgroundColor: "#ffffff",
                  color: "#86198f",
                  fontSize: "12.5px",
                  fontWeight: "800",
                  cursor: isBulkImportingLang ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                title="Bulk import all 24 canonical cinema languages into PostgreSQL"
              >
                <Library size={15} />
                <span>{isBulkImportingLang ? "Importing..." : "Bulk Import 24 Languages"}</span>
              </button>
            </div>
          </div>

          {/* Catalog Grid Card */}
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Search, Filter & Multi-Action Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
                {/* Search */}
                <div style={{ position: "relative", minWidth: "220px", flex: "1 1 240px" }}>
                  <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search languages by English, script or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 14px 9px 38px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12.5px",
                      outline: "none",
                      backgroundColor: "#f8fafc"
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter Chips */}
                <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "10px", gap: "2px" }}>
                  <button
                    type="button"
                    onClick={() => setLangStatusFilter("ALL")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: langStatusFilter === "ALL" ? "#ffffff" : "transparent",
                      color: langStatusFilter === "ALL" ? "#0f172a" : "#64748b",
                      fontWeight: "800",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    All ({allKnownLanguages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLangStatusFilter("LIVE")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: langStatusFilter === "LIVE" ? "#ffffff" : "transparent",
                      color: langStatusFilter === "LIVE" ? "#059669" : "#64748b",
                      fontWeight: "800",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    ● Live on Sign-Up ({liveLangCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLangStatusFilter("UNADDED")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: langStatusFilter === "UNADDED" ? "#ffffff" : "transparent",
                      color: langStatusFilter === "UNADDED" ? "#c026d3" : "#64748b",
                      fontWeight: "800",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    + Catalog Only ({unaddedLangCount})
                  </button>
                </div>
              </div>

              {/* View Mode & Multi-Select Add Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {selectedLangNames.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddSelectedLanguages}
                    disabled={isSubmittingLang}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#c026d3",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(192, 38, 211, 0.25)"
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Selected ({selectedLangNames.length}) to Sign-Up</span>
                  </button>
                )}

                <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                      color: viewMode === "grid" ? "#0f172a" : "#64748b",
                      cursor: "pointer"
                    }}
                    title="Grid View (Scrollable)"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("shelf")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: viewMode === "shelf" ? "#ffffff" : "transparent",
                      color: viewMode === "shelf" ? "#0f172a" : "#64748b",
                      cursor: "pointer"
                    }}
                    title="Horizontal Scroll Shelf (Compact 1-Row)"
                  >
                    <SlidersHorizontal size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: viewMode === "table" ? "#ffffff" : "transparent",
                      color: viewMode === "table" ? "#0f172a" : "#64748b",
                      cursor: "pointer"
                    }}
                    title="Table View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Language Cards Renderer (Supports Grid, Horizontal Scroll Shelf, and Table) */}
            {(() => {
              const renderCard = (lang, isShelf = false) => {
                const isSelected = selectedLangNames.includes(lang.name);
                const isLive = lang.isLiveOnSignup;

                return (
                  <div
                    key={lang.name}
                    onClick={() => !isLive && toggleSelectLang(lang.name)}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      flex: isShelf ? "0 0 295px" : undefined,
                      minWidth: isShelf ? "295px" : undefined,
                      maxWidth: isShelf ? "295px" : undefined,
                      border: isSelected
                        ? "2px solid #c026d3"
                        : isLive
                        ? "1.5px solid #a7f3d0"
                        : "1.5px dashed #e2e8f0",
                      backgroundColor: isSelected
                        ? "#fdf4ff"
                        : isLive
                        ? "#ffffff"
                        : "#fafaf9",
                      cursor: !isLive ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                      position: "relative",
                      transition: "all 0.15s ease",
                      boxShadow: isLive ? "0 1px 3px rgba(0,0,0,0.04)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {!isLive && (
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                border: isSelected ? "2px solid #c026d3" : "1.5px solid #cbd5e1",
                                backgroundColor: isSelected ? "#c026d3" : "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                flexShrink: 0
                              }}
                            >
                              {isSelected && <CheckCircle2 size={12} />}
                            </div>
                          )}
                          <h4 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={lang.name}>
                            {lang.name}
                          </h4>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                          {lang.nativeName && (
                            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#c026d3", backgroundColor: "#fdf4ff", padding: "2px 7px", borderRadius: "6px", border: "1px solid #f5d0fe", whiteSpace: "nowrap" }}>
                              {lang.nativeName}
                            </span>
                          )}
                          {lang.code && (
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", backgroundColor: "#f1f5f9", padding: "2px 5px", borderRadius: "4px" }}>
                              {lang.code}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Top Right Action */}
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, marginLeft: "auto" }}>
                        {isLive ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLanguage(lang);
                              }}
                              style={{
                                padding: "5px 8px",
                                borderRadius: "8px",
                                border: "1px solid #fde68a",
                                backgroundColor: "#fffbeb",
                                color: "#b45309",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "700",
                                whiteSpace: "nowrap"
                              }}
                              title={`Deselect "${lang.name}" from Sign-Up`}
                            >
                              <EyeOff size={12} />
                              <span>Deselect</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (lang.id) handleDeleteLanguage(lang.id, lang.name);
                              }}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                border: "1px solid #fecaca",
                                backgroundColor: "#fef2f2",
                                color: "#ef4444",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                flexShrink: 0
                              }}
                              title={`Delete "${lang.name}"`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLanguage(lang);
                            }}
                            disabled={isSubmittingLang}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "8px",
                              border: "none",
                              backgroundColor: isSelected ? "#c026d3" : "#9333ea",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: isSubmittingLang ? "not-allowed" : "pointer",
                              fontWeight: "800",
                              fontSize: "11.5px",
                              boxShadow: "0 2px 6px rgba(192, 38, 211, 0.25)",
                              whiteSpace: "nowrap"
                            }}
                          >
                            <Plus size={12} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Status & Talent Usage */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                      {isLive ? (
                        <>
                          <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", backgroundColor: "#ecfdf5", padding: "3px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={11} color="#059669" /> Live on Sign-Up
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Users size={12} /> {lang.talentCount || 0} talents
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: "11px", fontWeight: "800", color: isSelected ? "#c026d3" : "#64748b", backgroundColor: isSelected ? "#fdf4ff" : "#f1f5f9", padding: "3px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Plus size={11} /> {isSelected ? "Selected to Add" : "Not on Sign-Up"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
                            Click (+) to Add
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              };

              if (viewMode === "shelf") {
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
                        ↔️ Horizontal Scroll Shelf: <strong>{paginatedLanguages.length}</strong> languages in 1 compact row (minimal height)
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => scrollLangShelf(-300)}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                          }}
                          title="Scroll Left"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollLangShelf(300)}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                          }}
                          title="Scroll Right"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={langScrollRef}
                      style={{
                        display: "flex",
                        alignItems: "stretch",
                        gap: "14px",
                        overflowX: "auto",
                        paddingBottom: "12px",
                        scrollBehavior: "smooth"
                      }}
                    >
                      {paginatedLanguages.map((lang) => renderCard(lang, true))}
                    </div>
                  </div>
                );
              }

              if (viewMode === "grid") {
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: "14px", maxHeight: "540px", overflowY: "auto", paddingRight: "4px" }}>
                    {paginatedLanguages.map((lang) => renderCard(lang, false))}
                  </div>
                );
              }

              return (
              /* Table View */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 14px", textAlign: "left", color: "#475569", fontWeight: "800" }}>Language</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", color: "#475569", fontWeight: "800" }}>Native Script</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", color: "#475569", fontWeight: "800" }}>Code</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", color: "#475569", fontWeight: "800" }}>Status</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", color: "#475569", fontWeight: "800" }}>Talent Users</th>
                      <th style={{ padding: "12px 14px", textAlign: "right", color: "#475569", fontWeight: "800" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLanguages.map((lang) => (
                      <tr key={lang.name} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 14px", fontWeight: "800", color: "#0f172a" }}>
                          {lang.name}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#c026d3", fontWeight: "700" }}>
                          {lang.nativeName || "—"}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                          {lang.code || "—"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {lang.isLiveOnSignup ? (
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", backgroundColor: "#ecfdf5", padding: "3px 8px", borderRadius: "6px" }}>
                              ● Live on Sign-Up
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", backgroundColor: "#f1f5f9", padding: "3px 8px", borderRadius: "6px" }}>
                              Catalog Only
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#64748b", fontWeight: "600" }}>
                          {lang.talentCount || 0}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          {lang.isLiveOnSignup ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <button
                                type="button"
                                onClick={() => handleToggleLanguage(lang)}
                                style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #fde68a", backgroundColor: "#fffbeb", color: "#b45309", cursor: "pointer", fontSize: "11.5px", fontWeight: "700" }}
                              >
                                Deselect
                              </button>
                              {lang.id && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLanguage(lang.id, lang.name)}
                                  style={{ padding: "5px 8px", borderRadius: "8px", border: "none", backgroundColor: "#fef2f2", color: "#ef4444", cursor: "pointer" }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleLanguage(lang)}
                              style={{ padding: "5px 12px", borderRadius: "8px", border: "none", backgroundColor: "#c026d3", color: "#ffffff", fontWeight: "800", fontSize: "11.5px", cursor: "pointer" }}
                            >
                              + Add to Sign-Up
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

            {/* Pagination Controls */}
            {totalLangPages > 1 && (
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "20px",
                  marginTop: "8px",
                  borderTop: "1px solid #e2e8f0"
                }}
              >
                <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "600" }}>
                  Showing <strong style={{ color: "#0f172a" }}>{(langPage - 1) * LANG_PER_PAGE + 1}</strong> to <strong style={{ color: "#0f172a" }}>{Math.min(langPage * LANG_PER_PAGE, filteredLanguages.length)}</strong> of <strong style={{ color: "#0f172a" }}>{filteredLanguages.length}</strong> languages (12 per page)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* First */}
                  <button
                    type="button"
                    disabled={langPage === 1}
                    onClick={() => setLangPage(1)}
                    title="First page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: langPage === 1 ? "#f8fafc" : "#ffffff",
                      color: langPage === 1 ? "#cbd5e1" : "#475569",
                      cursor: langPage === 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Previous */}
                  <button
                    type="button"
                    disabled={langPage === 1}
                    onClick={() => setLangPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: langPage === 1 ? "#f8fafc" : "#ffffff",
                      color: langPage === 1 ? "#cbd5e1" : "#475569",
                      cursor: langPage === 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers(langPage, totalLangPages).map((pNum, idx) => {
                    if (pNum === "...") {
                      return (
                        <span 
                          key={`ell-lang-${idx}`} 
                          style={{ padding: "0 6px", color: "#94a3b8", fontWeight: "700", fontSize: "13px" }}
                        >
                          …
                        </span>
                      );
                    }
                    const isActive = pNum === langPage;
                    return (
                      <button
                        key={`lang-p-${pNum}`}
                        type="button"
                        onClick={() => setLangPage(pNum)}
                        style={{
                          minWidth: "34px",
                          height: "34px",
                          padding: "0 8px",
                          borderRadius: "10px",
                          border: isActive ? "1px solid #c026d3" : "1px solid #e2e8f0",
                          backgroundColor: isActive ? "#c026d3" : "#ffffff",
                          color: isActive ? "#ffffff" : "#334155",
                          fontWeight: isActive ? "800" : "600",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          boxShadow: isActive ? "0 2px 8px rgba(192, 38, 211, 0.35)" : "none",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    type="button"
                    disabled={langPage >= totalLangPages}
                    onClick={() => setLangPage(p => Math.min(totalLangPages, p + 1))}
                    style={{
                      padding: "0 12px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: langPage >= totalLangPages ? "#f8fafc" : "#ffffff",
                      color: langPage >= totalLangPages ? "#cbd5e1" : "#475569",
                      cursor: langPage >= totalLangPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: "700",
                      transition: "all 0.15s ease"
                    }}
                  >
                    Next <ChevronRight size={15} />
                  </button>

                  {/* Last */}
                  <button
                    type="button"
                    disabled={langPage >= totalLangPages}
                    onClick={() => setLangPage(totalLangPages)}
                    title="Last page"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: langPage >= totalLangPages ? "#f8fafc" : "#ffffff",
                      color: langPage >= totalLangPages ? "#cbd5e1" : "#475569",
                      cursor: langPage >= totalLangPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 5. INTERACTIVE LIVE SIGN-UP DROPDOWNS PREVIEW MODAL */}
      {/* ============================================================== */}
      {showSignupPreviewModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setShowSignupPreviewModal(false)}
        >
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#fff1f8", color: "#ee008f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Eye size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    Live Sign-Up Dropdowns Simulation
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Exact 2-step cascading dropdowns that users see on the registration page (<code style={{ backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: "4px" }}>/join</code>)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSignupPreviewModal(false)}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* PostgreSQL Live Sync Status Banner */}
              <div style={{ padding: "12px 16px", borderRadius: "14px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#065f46" }}>
                    100% Synced: {professions.length} Professions loaded across {uniqueProfCraftCategories.length} Crafts
                  </span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "800", backgroundColor: "#ffffff", color: "#059669", padding: "3px 8px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                  GET /api/professions
                </span>
              </div>

              {/* Interactive Simulation Container */}
              <div style={{ backgroundColor: "#f8fafc", borderRadius: "18px", padding: "20px", border: "1.5px solid #e2e8f0" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
                  Interactive Sign-Up Dropdown Demo:
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Step 1: Craft Dropdown */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                      1. Creative Craft / Department <span style={{ color: "#ee008f" }}>*</span>
                    </label>
                    <select
                      value={previewCraft}
                      onChange={(e) => {
                        setPreviewCraft(e.target.value);
                        setPreviewSelectedProf("");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        color: "#0f172a",
                        backgroundColor: "#ffffff",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      {uniqueProfCraftCategories.map(craft => (
                        <option key={craft} value={craft}>
                          🎬 {craft} ({profCountByCraft[craft] || 0} roles)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Profession Dropdown */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                      2. Primary Profession / Role <span style={{ color: "#ee008f" }}>*</span>
                    </label>
                    <select
                      value={previewSelectedProf}
                      onChange={(e) => setPreviewSelectedProf(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1.5px solid #ee008f",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        color: "#0f172a",
                        backgroundColor: "#fffafd",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="">-- Choose Role in {previewCraft} ({professions.filter(p => (p.craftCategory || "General Craft") === previewCraft).length}) --</option>
                      {professions
                        .filter(p => (p.craftCategory || "General Craft") === previewCraft)
                        .map(p => (
                          <option key={p.id || p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Selection Result Pill */}
                {previewSelectedProf && (
                  <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "#fff1f8", borderRadius: "10px", border: "1px solid #fbcfe8", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                    <span style={{ fontWeight: "700", color: "#64748b" }}>User Selected:</span>
                    <strong style={{ color: "#ee008f", fontSize: "13px" }}>{previewSelectedProf}</strong>
                    <span style={{ color: "#94a3b8" }}>({previewCraft})</span>
                  </div>
                )}
              </div>

              {/* All Crafts Breakdown Summary Table */}
              <div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                  All Active Crafts & Role Counts on Sign-Up Screen:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px", maxHeight: "180px", overflowY: "auto", padding: "4px" }}>
                  {uniqueProfCraftCategories.map(craft => {
                    const count = profCountByCraft[craft] || 0;
                    const isSelected = previewCraft === craft;
                    return (
                      <div 
                        key={craft}
                        onClick={() => { setPreviewCraft(craft); setPreviewSelectedProf(""); }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: isSelected ? "1.5px solid #ee008f" : "1px solid #e2e8f0",
                          backgroundColor: isSelected ? "#fff1f8" : "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span style={{ fontWeight: isSelected ? "800" : "600", color: isSelected ? "#ee008f" : "#334155" }}>
                          {craft}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: isSelected ? "#ee008f" : "#64748b", backgroundColor: isSelected ? "#ffffff" : "#f1f5f9", padding: "2px 6px", borderRadius: "6px" }}>
                          {count} roles
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 26px", borderTop: "1px solid #f1f5f9", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <a 
                href="/join" 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: "12.5px", fontWeight: "800", color: "#ee008f", display: "inline-flex", alignItems: "center", gap: "5px", textDecoration: "none" }}
              >
                <span>Open Real Sign-Up Page (/join)</span>
                <ExternalLink size={13} />
              </a>
              <button
                type="button"
                onClick={() => setShowSignupPreviewModal(false)}
                style={{ padding: "8px 18px", borderRadius: "10px", backgroundColor: "#0f172a", color: "#ffffff", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
