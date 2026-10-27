import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import "./dashboard-mobile.css";
import { createPortal } from "react-dom";
import AppLayout from "../Layout/AppLayout.jsx";
import RadialProgressBar from "./RadialProgressBar.jsx";
import PerformanceChart from "./PerformanceChart.jsx";
import MiniCalendar from "./MiniCalendar.jsx";
import SkillManagementModal from "../../components/common/SkillManagementModal.jsx";
import OpportunityDetailModal from "../Opportunities/OpportunityDetailModal.jsx";
import {
  getStoredUser,
  getCurrentUserProfile,
  updateUserProfile,
  updateProfilePrivacy,
  getProfileAccessRequests,
  respondToProfileAccessRequest,
  getFullImageUrl,
  getIncomingBookingRequests,
  getUserSkills,
  addUserSkill,
  removeUserSkill,
  getMyWorkExperiences,
  addWorkExperience,
  uploadWorkExperienceFile,
  getMyCastingCalls,
  getMyConversations,
  deleteCastingCall
} from "../../features/bms/api";
import {
  showSuccess,
  showError,
  confirmDelete,
  showWarning
} from "../../shared/utils/alert";
import {
  MapPin,
  Languages,
  CalendarDays,
  Edit3,
  Download,
  ExternalLink,
  Plus,
  Video,
  CalendarRange,
  FolderPlus,
  Share2,
  CheckCircle2,
  Star,
  MessageSquare,
  Users,
  Briefcase,
  Trophy,
  Eye,
  Search,
  Target,
  Camera,
  Upload,
  X,
  Lock,
  Unlock,
  Globe,
  UserCheck,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Compass,
  Trash2
} from "lucide-react";

const PROFILE_TYPE_OPTIONS = [
  { label: "🎭 Actor", value: "ACTOR" },
  { label: "💃 Model", value: "MODEL" },
  { label: "🎤 Singer", value: "SINGER" },
  { label: "🕺 Dancer", value: "DANCER" },
  { label: "🎬 Director", value: "DIRECTOR" },
  { label: "📽️ Producer", value: "PRODUCER" },
  { label: "✨ Other", value: "OTHER" },
];

// ─── Cinema Crafts Collaborative Matrix ──────────────────────────────
// Dynamically maps any cinema craft to its key collaborative partner crafts
const getCinemaCraftNetwork = (roles = [], customProf = "") => {
  const primary = (
    customProf ||
    (roles && roles.length > 0 ? roles[0] : "") ||
    "Actor"
  ).trim();

  const lower = primary.toLowerCase();

  if (lower.includes("actor") || lower.includes("model") || lower.includes("singer") || lower.includes("dancer")) {
    return {
      craftBadge: "🎭 Performing Artist",
      currentCraft: primary,
      headline: `Cinema Network for ${primary}s`,
      tagline: "Filmmakers, casting directors, and studios actively looking to discover talents like you.",
      partners: [
        {
          id: "directors",
          title: "Directors & Filmmakers",
          icon: "🎬",
          badge: "Casting Projects",
          description: "Connect with directors casting for upcoming feature films, web series & indie projects.",
          actionText: "Explore Directors",
          targetPath: "/talents?craft=Director"
        },
        {
          id: "casting",
          title: "Casting Directors",
          icon: "📢",
          badge: "Talent Scout",
          description: "Connect with casting directors, casting agencies, and talent scouts hiring cast.",
          actionText: "Explore Casting",
          targetPath: "/talents?craft=Casting"
        },
        {
          id: "producers",
          title: "Producers & Studios",
          icon: "💼",
          badge: "Studio Backing",
          description: "Showcase your portfolio to production houses greenlighting new film projects.",
          actionText: "Connect Studios",
          targetPath: "/talents?craft=Producer"
        },
        {
          id: "photographers",
          title: "Cinematographers & DOPs",
          icon: "📸",
          badge: "Portfolios & DOP",
          description: "Team up for high-fashion lookbooks, acting showreels, and camera screen-tests.",
          actionText: "Find Camera Crew",
          targetPath: "/talents?craft=Cinematographer"
        }
      ]
    };
  }

  if (lower.includes("director") || lower.includes("filmmaker")) {
    return {
      craftBadge: "🎬 Film Director",
      currentCraft: primary,
      headline: `Filmmaking Collaborations for ${primary}s`,
      tagline: "Assemble your lead cast, discover pitch-ready scripts, and contract complete technical crews.",
      partners: [
        {
          id: "actors",
          title: "Actors & Performing Talents",
          icon: "🎭",
          badge: "Cast Your Film",
          description: "Discover verified actors, models, and performers with live shoot availability.",
          actionText: "Cast Talents",
          targetPath: "/talents?craft=Actor"
        },
        {
          id: "writers",
          title: "Screenwriters & Lyricists",
          icon: "✍️",
          badge: "Original Scripts",
          description: "Read high-concept screenplays, treatments, and dialogue drafts ready for production.",
          actionText: "Explore Scripts",
          targetPath: "/talents?craft=Writer"
        },
        {
          id: "dop",
          title: "Cinematographers (DOP)",
          icon: "🎥",
          badge: "Camera & Visuals",
          description: "Hire DOPs with cinema camera packages, lighting styles, and distinct visual tones.",
          actionText: "Find DOPs",
          targetPath: "/talents?craft=Cinematographer"
        },
        {
          id: "editors",
          title: "Editors & Post-Production",
          icon: "✂️",
          badge: "Post-Production",
          description: "Partner with editors, DI colorists, sound designers, and VFX artists.",
          actionText: "Find Editors",
          targetPath: "/talents?craft=Editor"
        }
      ]
    };
  }

  if (lower.includes("writer") || lower.includes("screenwriter") || lower.includes("lyricist") || lower.includes("author")) {
    return {
      craftBadge: "✍️ Screenwriter / Storyteller",
      currentCraft: primary,
      headline: `Script & Story Network for ${primary}s`,
      tagline: "Pitch your original stories, secure option contracts, and team up with visionary filmmakers.",
      partners: [
        {
          id: "directors",
          title: "Directors & Filmmakers",
          icon: "🎬",
          badge: "Pitch Scripts",
          description: "Pitch your story treatments and screenplays to directors seeking their next script.",
          actionText: "Pitch to Directors",
          targetPath: "/talents?craft=Director"
        },
        {
          id: "producers",
          title: "Producers & Production Houses",
          icon: "💼",
          badge: "Option Deals",
          description: "Connect with studios and producers looking to acquire and finance original movie IP.",
          actionText: "Connect Producers",
          targetPath: "/talents?craft=Producer"
        },
        {
          id: "music",
          title: "Music Directors & Composers",
          icon: "🎵",
          badge: "Lyrical Tracks",
          description: "Collaborate on movie songs, background themes, and lyrical poetry.",
          actionText: "Collaborate Music",
          targetPath: "/talents?craft=Music"
        },
        {
          id: "actors",
          title: "Lead Actors & Stars",
          icon: "🎭",
          badge: "Star Attachments",
          description: "Pitch character roles to actors to package your script for studio greenlight.",
          actionText: "Explore Actors",
          targetPath: "/talents?craft=Actor"
        }
      ]
    };
  }

  if (lower.includes("cinematograph") || lower.includes("dop") || lower.includes("camera")) {
    return {
      craftBadge: "🎥 Cinematographer / DOP",
      currentCraft: primary,
      headline: `Visual & Camera Network for ${primary}s`,
      tagline: "Collaborate with directors to frame the visual language of feature films and commercials.",
      partners: [
        {
          id: "directors",
          title: "Directors & Creators",
          icon: "🎬",
          badge: "Visual Direction",
          description: "Discuss visual treatments, look-books, and shot lists for upcoming films.",
          actionText: "Find Directors",
          targetPath: "/talents?craft=Director"
        },
        {
          id: "producers",
          title: "Producers & Studios",
          icon: "💼",
          badge: "Project Contracts",
          description: "Contract for feature films, web series, and high-budget commercial DP assignments.",
          actionText: "Browse Projects",
          targetPath: "/talents?craft=Producer"
        },
        {
          id: "colorists",
          title: "Colorists & DI Specialists",
          icon: "🎨",
          badge: "DI & Grade",
          description: "Work on film LUTs, color management, and digital intermediate masters.",
          actionText: "Find Colorists",
          targetPath: "/talents?craft=Colorist"
        },
        {
          id: "crew",
          title: "Lighting Gaffers & Riggers",
          icon: "💡",
          badge: "Lighting Crew",
          description: "Assemble first ACs, focus pullers, gaffers, and key grips for your camera team.",
          actionText: "Assemble Crew",
          targetPath: "/talents?craft=Crew"
        }
      ]
    };
  }

  if (lower.includes("producer")) {
    return {
      craftBadge: "💼 Producer / Studio Executive",
      currentCraft: primary,
      headline: `Production Packaging for ${primary}s`,
      tagline: "Finance, package, and execute productions across all 24 cinema crafts.",
      partners: [
        {
          id: "directors",
          title: "Film Directors",
          icon: "🎬",
          badge: "Creative Helm",
          description: "Hire visionary directors to helm your upcoming productions.",
          actionText: "Hire Directors",
          targetPath: "/talents?craft=Director"
        },
        {
          id: "writers",
          title: "Screenwriters",
          icon: "✍️",
          badge: "Original IP",
          description: "Option and purchase high-concept scripts and movie stories.",
          actionText: "Explore Scripts",
          targetPath: "/talents?craft=Writer"
        },
        {
          id: "actors",
          title: "Lead & Supporting Actors",
          icon: "🎭",
          badge: "Talent Roster",
          description: "Cast marquee names and emerging talents for your productions.",
          actionText: "Cast Talents",
          targetPath: "/talents?craft=Actor"
        },
        {
          id: "dop",
          title: "Cinematographers & Crew",
          icon: "🎥",
          badge: "Crew Contracts",
          description: "Contract top cinematography, sound, and visual teams for production.",
          actionText: "Hire Crew",
          targetPath: "/talents?craft=Cinematographer"
        }
      ]
    };
  }

  // Default fallback for any other cinema craft (Editor, Sound, Makeup, Art Director, Stunt, etc.)
  return {
    craftBadge: `✨ ${primary}`,
    currentCraft: primary,
    headline: `Cinema Craft Network for ${primary}s`,
    tagline: "Collaborate across all 24 crafts in the cinema industry to discover and create projects.",
    partners: [
      {
        id: "directors",
        title: "Directors & Filmmakers",
        icon: "🎬",
        badge: "Film Creators",
        description: "Connect with directors assembling technical and creative crews for upcoming shoots.",
        actionText: "Explore Directors",
        targetPath: "/talents?craft=Director"
      },
      {
        id: "producers",
        title: "Producers & Studios",
        icon: "💼",
        badge: "Production Contracts",
        description: "Reach out to production houses greenlighting new film and digital media productions.",
        actionText: "Connect Producers",
        targetPath: "/talents?craft=Producer"
      },
      {
        id: "actors",
        title: "Actors & Performers",
        icon: "🎭",
        badge: "On-Screen Cast",
        description: "Collaborate with actors, models, and performers across upcoming productions.",
        actionText: "Explore Talents",
        targetPath: "/talents?craft=Actor"
      },
      {
        id: "writers",
        title: "Writers & Storytellers",
        icon: "✍️",
        badge: "Scripts & Screenplays",
        description: "Discover scripts, dialogues, and conceptual projects taking shape.",
        actionText: "Explore Scripts",
        targetPath: "/talents?craft=Writer"
      }
    ]
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  // Redirect partner and client accounts to their dedicated dashboards
  useEffect(() => {
    if (storedUser?.accountType === "PARTNER") {
      navigate("/partner/dashboard", { replace: true });
    } else if (storedUser?.accountType === "CLIENT") {
      navigate("/client/dashboard", { replace: true });
    }
  }, [storedUser, navigate]);

  // Instagram-style Privacy & Profile View Requests State
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyToggling, setPrivacyToggling] = useState(false);
  const [accessRequests, setAccessRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [filterRequestStatus, setFilterRequestStatus] = useState("ALL");
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Dynamic Skills & Experience Verification States
  const [skills, setSkills] = useState([]);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [yearsExperience, setYearsExperience] = useState(0);
  const [workExpCount, setWorkExpCount] = useState(0);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [isAutoPromoted, setIsAutoPromoted] = useState(false);
  const [myCastings, setMyCastings] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);

  // Skill Work Modal States
  const [selectedSkillForWork, setSelectedSkillForWork] = useState(null);
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const [skillWorkTab, setSkillWorkTab] = useState("details"); // 'details' | 'files'
  const [skillWorkCompany, setSkillWorkCompany] = useState("");
  const [skillWorkTitle, setSkillWorkTitle] = useState("");
  const [skillWorkDuration, setSkillWorkDuration] = useState("");
  const [skillWorkDesc, setSkillWorkDesc] = useState("");
  const [skillWorkFile, setSkillWorkFile] = useState(null);
  const [savingSkillWork, setSavingSkillWork] = useState(false);
  const [skillWorkSuccessMsg, setSkillWorkSuccessMsg] = useState("");

  const handleOpenAddWorkForSkill = (skill) => {
    setSelectedSkillForWork(skill);
    setSkillWorkCompany("");
    setSkillWorkTitle("");
    setSkillWorkDuration(new Date().getFullYear().toString());
    setSkillWorkDesc("");
    setSkillWorkFile(null);
    setSkillWorkTab("details");
    setSkillWorkSuccessMsg("");
    setShowAddWorkModal(true);
  };

  // Unified Profession Modal States & Derived Fallback
  const rawStoredTypes = storedUser?.profileTypes ? Array.from(storedUser.profileTypes) : [];
  const initialStoredType = rawStoredTypes.length > 0 ? String(rawStoredTypes[0]).toUpperCase() : "";
  const isInitialOther = initialStoredType === "OTHER";
  const initialCustom = isInitialOther ? (storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`) || "") : "";
  const initialRole = isInitialOther ? (initialCustom || "Other") : (initialStoredType ? (initialStoredType.charAt(0) + initialStoredType.slice(1).toLowerCase()) : "Actor");

  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [selectedProfType, setSelectedProfType] = useState(initialStoredType || "ACTOR");
  const [customProfInput, setCustomProfInput] = useState(initialCustom || "");
  const [savingProfession, setSavingProfession] = useState(false);

  const handleOpenEditProfession = () => {
    const rawTypes = profile.profileTypes || [];
    const firstType = rawTypes.length > 0 ? String(rawTypes[0]).toUpperCase() : (selectedProfType || "ACTOR");
    setSelectedProfType(firstType);
    setCustomProfInput(profile.customProfession || "");
    setShowProfessionModal(true);
  };

  const handleSaveProfessionFromModal = async () => {
    if (!selectedProfType) {
      showWarning("Profession Required", "Please select your primary profession.");
      return;
    }
    if (selectedProfType === "OTHER" && (!customProfInput || !customProfInput.trim())) {
      showWarning("Craft Required", "Please specify your custom profession / craft.");
      return;
    }

    setSavingProfession(true);
    try {
      const isOther = selectedProfType === "OTHER";
      const customVal = isOther ? customProfInput.trim() : null;

      await updateUserProfile({
        profileTypes: [selectedProfType],
        customProfession: customVal
      });

      const displayCraft = isOther
        ? (customVal || "Other")
        : selectedProfType.charAt(0) + selectedProfType.slice(1).toLowerCase();

      setProfile(prev => ({
        ...prev,
        roles: [displayCraft],
        profileTypes: [selectedProfType],
        customProfession: customVal || ""
      }));

      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          profileTypes: [selectedProfType],
          customProfession: customVal || ""
        };
        localStorage.setItem("bms_user", JSON.stringify(updatedUser));
        const email = (storedUser.email || "").toLowerCase();
        if (email) {
          if (customVal) {
            localStorage.setItem(`bms_custom_profession_${email}`, customVal);
          } else {
            localStorage.removeItem(`bms_custom_profession_${email}`);
          }
        }
      }

      showSuccess("Profession Updated!", `Your primary profession has been updated to "${displayCraft}".`);
      setShowProfessionModal(false);
      window.dispatchEvent(new Event("profile_updated"));
    } catch (err) {
      showError("Update Failed", err.message || "Failed to update profession in database.");
    } finally {
      setSavingProfession(false);
    }
  };

  const handleSaveCustomProfession = async (newCraft) => {
    if (!newCraft || !newCraft.trim()) return;
    const craft = newCraft.trim();
    const email = (storedUser?.email || "").toLowerCase();
    if (email) {
      localStorage.setItem(`bms_custom_profession_${email}`, craft);
    }
    if (storedUser) {
      localStorage.setItem("bms_user", JSON.stringify({ ...storedUser, customProfession: craft, profileTypes: ["OTHER"] }));
    }
    try {
      await updateUserProfile({ customProfession: craft, profileTypes: ["OTHER"] });
      setProfile(p => ({
        ...p,
        roles: [craft],
        profileTypes: ["OTHER"],
        customProfession: craft
      }));
      showSuccess("Craft Saved!", `Your profession has been updated to "${craft}".`);
    } catch (err) {
      showError("Save Failed", err.message || "Failed to save craft.");
    }
    window.dispatchEvent(new Event("profile_updated"));
  };

  const handleSaveSkillWork = async (e) => {
    e.preventDefault();
    if (!skillWorkTitle.trim() || !skillWorkCompany.trim()) return;
    setSavingSkillWork(true);
    try {
      let fileUrl = null;
      let fileName = null;
      if (skillWorkFile) {
        const uploadRes = await uploadWorkExperienceFile(skillWorkFile);
        if (uploadRes) {
          fileUrl = uploadRes.fileUrl;
          fileName = uploadRes.fileName || skillWorkFile.name;
        }
      }

      await addWorkExperience({
        company: skillWorkCompany.trim(),
        title: skillWorkTitle.trim(),
        category: selectedSkillForWork,
        startDate: skillWorkDuration.trim(),
        description: skillWorkDesc.trim(),
        fileUrl: fileUrl,
        fileName: fileName
      });
      setWorkExpCount(prev => prev + 1);
      if (storedUser?.accountType === "TALENT" || isPendingVerification) {
        setIsAutoPromoted(true);
        setIsPendingVerification(false);
      }
      setSkillWorkSuccessMsg(`Work project saved under "${selectedSkillForWork}"! File stored at uploads/work-experience/`);
      showSuccess("Work Saved!", `Work project saved under "${selectedSkillForWork}".`);
      setTimeout(() => {
        setShowAddWorkModal(false);
        setSkillWorkSuccessMsg("");
        setSkillWorkFile(null);
      }, 1200);
    } catch (err) {
      showError("Save Failed", err.message || "Failed to save work project.");
    } finally {
      setSavingSkillWork(false);
    }
  };

  // Profile states
  const [showAllSkillsModal, setShowAllSkillsModal] = useState(false);
  const [profile, setProfile] = useState({
    name: storedUser?.fullName || "Your Name",
    roles: [initialRole || "Actor"],
    profileTypes: initialStoredType ? [initialStoredType] : [],
    customProfession: initialCustom,
    location: "Mumbai, Maharashtra, India",
    languages: "Hindi, English, Punjabi",
    age: "29",
    birthDate: "1995-08-12",
    about: "Passionate cinema artist exploring versatile character roles across feature films, web series, and commercials.",
    photo: localStorage.getItem("bms_profile_photo") ? getFullImageUrl(localStorage.getItem("bms_profile_photo")) : ""
  });

  const handleAddSkill = (newSkill) => {
    const updated = addUserSkill(storedUser?.userId, newSkill);
    setSkills(updated);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = removeUserSkill(storedUser?.userId, skillToRemove);
    setSkills(updated);
  };

  useEffect(() => {
    // Load skills
    const loadedSkills = getUserSkills(storedUser?.userId);
    setSkills(loadedSkills);

    const handleSkillsUpdated = () => {
      setSkills(getUserSkills(storedUser?.userId));
    };
    window.addEventListener("skills_updated", handleSkillsUpdated);

    async function loadDashUser() {
      try {
        const u = await getCurrentUserProfile();
        if (u) {
          if (u.profilePhoto) {
            const photoUrl = getFullImageUrl(u.profilePhoto);
            localStorage.setItem("bms_profile_photo", photoUrl);
            setProfile(p => ({ ...p, photo: photoUrl }));
          }
          if (u.fullName) {
            setProfile(p => ({ ...p, name: u.fullName }));
          }
          if (u.location) {
            setProfile(p => ({ ...p, location: u.location }));
          }
          if (u.languages) {
            setProfile(p => ({ ...p, languages: u.languages }));
          }
          if (u.about) {
            setProfile(p => ({ ...p, about: u.about }));
          }

          // Exact same DB profession resolution as Profile.jsx
          const rawTypes = u.profileTypes ? Array.from(u.profileTypes) : [];
          const singleRawType = rawTypes.length > 0 ? [String(rawTypes[0]).toUpperCase()] : [];
          const isOther = singleRawType.length > 0 && singleRawType[0] === "OTHER";
          const types = singleRawType.map(t => t.charAt(0) + t.slice(1).toLowerCase());
          const customProf = isOther ? (u.customProfession || "") : "";
          const mainRole = isOther ? (customProf || "Other") : (types.length > 0 ? types[0] : "Actor");

          setProfile(p => ({
            ...p,
            roles: [mainRole],
            profileTypes: singleRawType,
            customProfession: customProf
          }));

          if (typeof u.isPrivate !== "undefined") {
            setIsPrivate(Boolean(u.isPrivate));
          }

          // Check experience verification & auto-reversion rules
          const experiences = await getMyWorkExperiences().catch(() => []);
          const totalWorks = Array.isArray(experiences) ? experiences.length : 0;
          setWorkExpCount(totalWorks);

          const expYears = (typeof u.yearsExperience === "number") ? u.yearsExperience : (totalWorks > 0 ? totalWorks : 0);
          setYearsExperience(expYears);

          const rawAccountType = (u.accountType || storedUser?.accountType || "TALENT").toUpperCase();

          if (rawAccountType === "PROFESSIONAL" && expYears < 1 && totalWorks === 0) {
            // Claimed Professional, but no experience added yet -> Pending verification, operate as Talent
            setIsPendingVerification(true);
            setIsAutoPromoted(false);
          } else if (rawAccountType === "TALENT" && (expYears >= 1 || totalWorks >= 1)) {
            // Registered Talent, but added 1+ years experience -> Auto-promoted to Professional!
            setIsAutoPromoted(true);
            setIsPendingVerification(false);
          } else if (rawAccountType === "PROFESSIONAL" && (expYears >= 1 || totalWorks >= 1)) {
            setIsPendingVerification(false);
            setIsAutoPromoted(false);
          }
        }
      } catch (e) {}

      try {
        const requests = await getProfileAccessRequests();
        setAccessRequests(Array.isArray(requests) ? requests : []);
      } catch (err) {}

      try {
        const castings = await getMyCastingCalls();
        setMyCastings(Array.isArray(castings) ? castings : []);
      } catch (err) {}

      try {
        const convs = await getMyConversations();
        setRecentConversations(Array.isArray(convs) ? convs : []);
      } catch (err) {}
    }
    loadDashUser();

    const handlePhotoUpdated = () => {
      const saved = localStorage.getItem("bms_profile_photo");
      if (saved) setProfile(p => ({ ...p, photo: getFullImageUrl(saved) }));
    };
    const handleOppUpdated = async () => {
      try {
        const castings = await getMyCastingCalls();
        setMyCastings(Array.isArray(castings) ? castings : []);
      } catch (_) {}
    };
    const handleProfileUpdated = () => {
      loadDashUser();
    };

    window.addEventListener("profile_photo_updated", handlePhotoUpdated);
    window.addEventListener("opportunity_created", handleOppUpdated);
    window.addEventListener("profile_updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profile_photo_updated", handlePhotoUpdated);
      window.removeEventListener("skills_updated", handleSkillsUpdated);
      window.removeEventListener("opportunity_created", handleOppUpdated);
      window.removeEventListener("profile_updated", handleProfileUpdated);
    };
  }, []);

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
      setIsPrivate(!newStatus); // rollback
      showError("Privacy Update Failed", err.message || "Failed to update profile privacy.");
    } finally {
      setPrivacyToggling(false);
    }
  };

  const handleRespondAccessRequest = async (requestId, approved) => {
    try {
      setActionInProgressId(requestId);
      const updated = await respondToProfileAccessRequest(requestId, approved);
      setAccessRequests(prev => prev.map(r => r.id === requestId ? updated : r));
      showSuccess("Access Request", `Profile access has been ${approved ? "Approved" : "Declined"}.`);
    } catch (err) {
      showError("Action Failed", err.message || "Failed to update access request.");
    } finally {
      setActionInProgressId(null);
    }
  };

  const [pendingBookingCount, setPendingBookingCount] = useState(0);
  const [isBookingBannerDismissed, setIsBookingBannerDismissed] = useState(
    () => localStorage.getItem("bms_bookings_notification_viewed") === "true"
  );

  useEffect(() => {
    async function checkPendingBookings() {
      try {
        const reqs = await getIncomingBookingRequests();
        const pending = (Array.isArray(reqs) ? reqs : []).filter(r => r.status === "PENDING").length;
        setPendingBookingCount(pending);
      } catch (_) {}
    }
    checkPendingBookings();

    const handleViewed = () => {
      setIsBookingBannerDismissed(true);
    };
    window.addEventListener("bookings_notification_viewed", handleViewed);
    return () => window.removeEventListener("bookings_notification_viewed", handleViewed);
  }, []);

  const [showEditModal, setShowEditModal] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  // Camera capture states
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const webcamStreamRef = useRef(null);

  const MOCK_ACTOR_HEADSHOTS = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=300&q=80"
  ];

  // Cleanup webcam stream on unmount
  useEffect(() => {
    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleEditProfileClick = () => {
    setTempProfile({
      ...profile,
      roles: [...profile.roles],
      profileTypes: profile.profileTypes ? [...profile.profileTypes] : [],
      customProfession: profile.customProfession || ""
    });
    setIsWebcamActive(false);
    setCountdown(null);
    setShowFlash(false);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    setProfile({ ...tempProfile });
    setShowEditModal(false);

    try {
      const mappedTypes = (tempProfile.roles || [])
        .map(r => r.toUpperCase())
        .filter(r => ["ACTOR", "MODEL", "SINGER", "DANCER", "DIRECTOR", "PRODUCER", "OTHER"].includes(r));

      const isOther = mappedTypes.includes("OTHER");
      const customVal = isOther ? (tempProfile.customProfession || "").trim() : null;

      await updateUserProfile({
        fullName: tempProfile.name,
        location: tempProfile.location,
        languages: tempProfile.languages,
        profileTypes: mappedTypes.length > 0 ? [mappedTypes[0]] : ["ACTOR"],
        customProfession: customVal
      });

      if (storedUser) {
        localStorage.setItem("bms_user", JSON.stringify({
          ...storedUser,
          fullName: tempProfile.name,
          profileTypes: mappedTypes.length > 0 ? [mappedTypes[0]] : ["ACTOR"],
          customProfession: customVal || ""
        }));
      }
      showSuccess("Profile Updated!", "Your profile information has been saved successfully.");
      window.dispatchEvent(new Event("profile_updated"));
    } catch (e) {
      console.error("Failed to update profile from dashboard", e);
      showError("Profile Update Failed", e.message || "Failed to update profile.");
    }
  };

  const handleCancelEdit = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    setIsWebcamActive(false);
    setCountdown(null);
    setShowEditModal(false);
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      setIsWebcamActive(false);
      setTempProfile({ ...tempProfile, photo: URL.createObjectURL(file) });
    }
  };

  const handleStartWebcam = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300, facingMode: "user" } })
        .then((stream) => {
          webcamStreamRef.current = stream;
          setIsWebcamActive(true);
          setTimeout(() => {
            if (videoRef.current) videoRef.current.srcObject = stream;
          }, 100);
        })
        .catch(() => runSimulatedCamera());
    } else {
      runSimulatedCamera();
    }
  };

  const runSimulatedCamera = () => {
    setIsWebcamActive(false);
    let currentCount = 3;
    setCountdown(currentCount);
    const interval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else if (currentCount === 0) {
        setCountdown("Cheese! ðŸ“¸");
      } else {
        clearInterval(interval);
        setCountdown(null);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 500);
        const randomIndex = Math.floor(Math.random() * MOCK_ACTOR_HEADSHOTS.length);
        setTempProfile(prev => ({ ...prev, photo: MOCK_ACTOR_HEADSHOTS[randomIndex] }));
      }
    }, 1000);
  };

  const handleCaptureWebcam = () => {
    if (videoRef.current && webcamStreamRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg");
        setTempProfile({ ...tempProfile, photo: dataUrl });
      } catch (e) {
        console.error("Failed to capture image from canvas: ", e);
      }
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
      setIsWebcamActive(false);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 500);
    }
  };

  const formatBirthDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("Jan") || dateString.includes("Feb") || dateString.includes("Mar") || dateString.includes("Apr") || dateString.includes("May") || dateString.includes("Jun") || dateString.includes("Jul") || dateString.includes("Aug") || dateString.includes("Sep") || dateString.includes("Oct") || dateString.includes("Nov") || dateString.includes("Dec")) {
      return dateString;
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
        return `${day} ${months[monthIndex]} ${year}`;
      }
    }
    return dateString;
  };

  // Mock data for upcoming auditions
  const auditions = [
    { date: "24", month: "MAY", title: "Web Series - Lead Role", production: "DreamWorks", time: "11:00 AM", location: "Mumbai", status: "Confirmed", statusClass: "confirmed" },
    { date: "28", month: "MAY", title: "Feature Film - Supporting Role", production: "Silver Screen", time: "02:00 PM", location: "Mumbai", status: "Pending", statusClass: "pending" },
    { date: "02", month: "JUN", title: "TV Commercial - Lead", production: "Bright Ads", time: "10:30 AM", location: "Mumbai", status: "Shortlisted", statusClass: "shortlisted" }
  ];

  const [projects, setProjects] = useState([
    { id: 1, title: "Rang De Zindagi", type: "Feature Film", role: "Lead Role", year: "2023", status: "Released", rating: "8.2", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80" },
    { id: 2, title: "Tere Bin", type: "Web Series", role: "Lead Role", year: "2022", status: "10 Episodes", rating: "8.0", img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=150&q=80" },
    { id: 3, title: "Yeh Safar", type: "TV Series", role: "Lead Role", year: "2021", status: "15 Episodes", rating: "7.6", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80" }
  ]);

  const handleRatingClick = (e, projectId) => {
    e.stopPropagation();
    const proj = projects.find(p => p.id === projectId);
    const newRating = window.prompt(`Change rating for "${proj.title}" (0.0 - 10.0):`, proj.rating);
    if (newRating !== null) {
      const parsed = parseFloat(newRating);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
        setProjects(projects.map(p => p.id === projectId ? { ...p, rating: parsed.toFixed(1) } : p));
        showSuccess("Rating Updated", `Rating for "${proj.title}" updated to ${parsed.toFixed(1)}.`);
      } else {
        showWarning("Invalid Rating", "Please enter a valid rating between 0.0 and 10.0");
      }
    }
  };

  const handleDeleteCasting = async (casting) => {
    const confirmed = await confirmDelete(
      "Delete Opportunity?",
      `Are you sure you want to delete "${casting.title}"? This cannot be undone and all applicant records will be permanently removed.`
    );
    if (confirmed) {
      try {
        await deleteCastingCall(casting.id);
        setMyCastings((prev) => prev.filter((item) => item.id !== casting.id));
        showSuccess("Opportunity Deleted", `"${casting.title}" has been deleted successfully.`);
        window.dispatchEvent(new Event("opportunity_created"));
      } catch (err) {
        showError("Delete Failed", err.message || "Failed to delete opportunity.");
      }
    }
  };

  const messages = recentConversations.slice(0, 3).map((c, idx) => ({
    id: c.id,
    sender: c.name || "User",
    avatarBg: idx === 0 ? "bg-indigo-600" : idx === 1 ? "bg-slate-900" : "bg-emerald-600",
    avatarUrl: c.avatar,
    text: c.lastMsg || "Conversation active",
    time: c.time || "Recently",
    unreadCount: c.unread || 0
  }));

  return (
    <AppLayout pageTitle="Dashboard" profileName={profile.name} profilePhoto={profile.photo}>
          

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
                onClick={() => navigate("/profile")}
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
                + Add Experience & Works
              </button>
            </div>
          )}


          {/* Notification banner for existing users with OTHER to specify their craft */}
          {((profile.roles || []).some(r => r.toUpperCase() === "OTHER") && !(storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`))) && (
            <div style={{
              background: "#fff1f2",
              border: "1.5px solid #fecdd3",
              borderRadius: "12px",
              padding: "14px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
              boxShadow: "0 2px 6px rgba(225, 29, 72, 0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px" }}>✨</span>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#9f1239" }}>
                    Action Required: Specify Your Custom Craft
                  </div>
                  <div style={{ fontSize: "12px", color: "#be123c", marginTop: "2px" }}>
                    You are currently registered under <strong>Other</strong>. Please type your exact profession (e.g. Cinematographer, Lyricist, Editor) to showcase your real craft!
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  id="dash-custom-prof-input"
                  placeholder="e.g. Cinematographer"
                  style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #fda4af", fontSize: "12.5px" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = document.getElementById("dash-custom-prof-input")?.value?.trim();
                    if (val) handleSaveCustomProfession(val);
                  }}
                  style={{
                    background: "#e11d48",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "7px 16px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  Save Profession
                </button>
              </div>
            </div>
          )}

          <div className="db-grid-container">
            {/* Top 3-Section Profile Header Card */}
            <div style={{
              background: "#ffffff",
              border: "1px solid #eef2f6",
              borderRadius: "24px",
              padding: "24px",
              marginBottom: "26px",
              boxShadow: "0 4px 25px rgba(15, 23, 42, 0.04)"
            }}>
              <div className="db-profile-three-col-grid">
                
                {/* ════════════════ SECTION 1: IDENTITY & DEMOGRAPHICS (LEFT) ════════════════ */}
                <div className="db-profile-col-divider" style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "18px",
                  paddingRight: "20px",
                  borderRight: "1px solid #f1f5f9"
                }}>
                  {/* Square / Portrait Photo Frame (Matching Profile & Original Dashboard) */}
                  <div style={{
                    position: "relative",
                    flexShrink: 0,
                    width: "175px",
                    height: "245px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "2px solid #e2e8f0",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                    background: "#0f172a"
                  }}>
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 20%",
                        display: "block"
                      }}
                    />

                    {/* • Available Badge */}
                    <div style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      zIndex: 2,
                      background: "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                    }}>
                      <span style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        display: "inline-block"
                      }} />
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "750",
                        color: "#ffffff",
                        letterSpacing: "0.4px",
                        textTransform: "uppercase"
                      }}>
                        Available
                      </span>
                    </div>
                  </div>

                  {/* Name, Badges & Demographic Info Card */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    {/* Name + Verified Rosette */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                        {profile.name}
                      </h2>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#7c3aed" style={{ flexShrink: 0 }}>
                        <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#7c3aed"/>
                        <path d="M10 14.17L7.41 11.59 6 13l4 4 9-9-1.41-1.41z" fill="#ffffff" />
                      </svg>
                    </div>

                    {/* Profession & Experience Badges */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                      {(() => {
                        const rawProf = profile.roles[0] || "Actor";
                        const isOther = (profile.profileTypes && profile.profileTypes.includes("OTHER")) || rawProf.toUpperCase() === "OTHER";
                        const customProf = profile.customProfession || (isOther ? (storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`)) : "");
                        const isOtherWithoutCustom = isOther && !customProf;
                        const displayProfName = isOther ? (customProf || "Other") : rawProf;
                        return (
                          <span style={{
                            background: isOtherWithoutCustom ? "#fef2f2" : "#f1f5f9",
                            color: isOtherWithoutCustom ? "#b91c1c" : "#0f172a",
                            padding: "4px 10px",
                            borderRadius: "7px",
                            fontSize: "11.5px",
                            fontWeight: "800",
                            border: isOtherWithoutCustom ? "1.5px dashed #f87171" : "1px solid #cbd5e1",
                            textTransform: "capitalize",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <span>🎭 {displayProfName}</span>
                            <button
                              type="button"
                              onClick={handleOpenEditProfession}
                              style={{
                                background: "rgba(225, 29, 72, 0.08)",
                                color: "#e11d48",
                                border: "1px solid rgba(225, 29, 72, 0.2)",
                                borderRadius: "4px",
                                cursor: "pointer",
                                padding: "1px 5px",
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                                transition: "all 0.15s ease"
                              }}
                              title="Click to edit profession"
                            >
                              <span>✏️</span>
                              <span style={{ fontSize: "10px", fontWeight: "700" }}>Edit</span>
                            </button>
                          </span>
                        );
                      })()}

                      <span style={{
                        background: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "#eff6ff" : "#ecfdf5",
                        color: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "#1d4ed8" : "#047857",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        border: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "1px solid #bfdbfe" : "1px solid #a7f3d0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span>📁</span>
                        <span>{(isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "Professional (1+ Yrs)" : "Talent (< 1 Yr)"}</span>
                      </span>
                    </div>

                    {/* Demographics Card (Bangalore, Languages, Age) */}
                    <div style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      fontSize: "11.5px",
                      color: "#64748b",
                      fontWeight: "600"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={13} color="#ec4899" />
                        <span>{profile.location || "Bangalore"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MessageSquare size={13} color="#6366f1" />
                        <span>{profile.languages || "English, Hindi"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CalendarDays size={13} color="#8b5cf6" />
                        <span>Age {profile.age || "29"} • {formatBirthDate(profile.birthDate) || "12 Aug 1995"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ════════════════ SECTION 2: ABOUT ME & SPECIALIZED SKILLS (MIDDLE) ════════════════ */}
                <div className="db-profile-col-divider" style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  paddingRight: "20px",
                  borderRight: "1px solid #f1f5f9",
                  gap: "14px"
                }}>
                  {/* Top: About Me Box */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(248, 249, 255, 0.95) 0%, rgba(253, 242, 248, 0.6) 100%)",
                    border: "1px solid #f1f0fb",
                    borderRadius: "16px",
                    padding: "14px 18px",
                    position: "relative"
                  }}>
                    {/* Header: ❝ About Me  ...  Passion meets Creativity */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "22px", color: "#7c3aed", fontWeight: "900", lineHeight: 1 }}>❝</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>About Me</span>
                      </div>
                      <span style={{
                        fontStyle: "italic",
                        fontFamily: "'Brush Script MT', cursive, sans-serif",
                        fontSize: "13.5px",
                        color: "#ec4899",
                        letterSpacing: "0.2px"
                      }}>
                        Passion meets Creativity
                      </span>
                    </div>

                    {/* Bio Content */}
                    <p style={{
                      margin: 0,
                      fontSize: "12px",
                      lineHeight: "1.6",
                      color: "#475569"
                    }}>
                      {profile.about || "Passionate Computer Science enthusiast with an interest in software development, programming, and emerging technologies. Eager to learn new skills, solve real-world problems, and build innovative solutions using modern technologies. Focused on continuous learning, creativity, and professional growth in the IT industry."}
                    </p>
                  </div>

                  {/* Bottom: Specialized Skills (Max 5) */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#8b5cf6", fontSize: "14px", fontWeight: "800" }}>⚡</span>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#334155" }}>
                          Specialized Skills (Max 5)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSkillModal(true)}
                        style={{
                          background: "transparent",
                          color: "#ee008f",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "2px",
                          padding: 0
                        }}
                      >
                        <Plus size={11} /> Add Skill
                      </button>
                    </div>

                    {/* Skills Pills Row */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                      {(() => {
                        const palette = [
                          { bg: "#fdf2f8", border: "#fbcfe8", text: "#db2777", icon: "🎵" },
                          { bg: "#f5f3ff", border: "#ddd6fe", text: "#7c3aed", icon: "🩰" },
                          { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", icon: "📷" },
                          { bg: "#ecfdf5", border: "#a7f3d0", text: "#059669", icon: "🎙️" },
                          { bg: "#f0f9ff", border: "#bae6fd", text: "#0284c7", icon: "⭐" }
                        ];

                        return skills.slice(0, 5).map((skill, idx) => {
                          const colorTheme = palette[idx % palette.length];
                          return (
                            <span
                              key={skill}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 10px",
                                background: colorTheme.bg,
                                border: `1px solid ${colorTheme.border}`,
                                borderRadius: "14px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                color: colorTheme.text
                              }}
                            >
                              <span>{colorTheme.icon} {skill}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: colorTheme.text,
                                  cursor: "pointer",
                                  padding: 0,
                                  fontSize: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  opacity: 0.7
                                }}
                                title={`Remove ${skill}`}
                              >
                                ✕
                              </button>
                            </span>
                          );
                        });
                      })()}

                      {/* View More if skills > 5 */}
                      {skills.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setShowAllSkillsModal(true)}
                          style={{
                            background: "linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%)",
                            color: "#be185d",
                            border: "1px solid #fbcfe8",
                            borderRadius: "14px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                          title="View all specialized skills in dialogue box"
                        >
                          <span>+{skills.length - 5} View More</span>
                          <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ════════════════ SECTION 3: ACTIONS & SOCIAL SHARE (RIGHT) ════════════════ */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  minWidth: "210px"
                }}>
                  {/* Vertical Stack of Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* 1. Public / Private Profile Toggle Button */}
                    <button
                      type="button"
                      onClick={handleTogglePrivacy}
                      disabled={privacyToggling}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: isPrivate ? "1px solid #fecaca" : "1px solid #d1fae5",
                        backgroundColor: isPrivate ? "#fef2f2" : "#ecfdf5",
                        color: isPrivate ? "#dc2626" : "#059669"
                      }}
                      title={isPrivate ? "Click to make profile Public" : "Click to make profile Private"}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: isPrivate ? "#ef4444" : "#10b981",
                          display: "inline-block"
                        }} />
                        <span>{isPrivate ? "Private Profile" : "Public Profile"}</span>
                      </span>

                      {/* Switch Knob */}
                      <span style={{
                        width: "32px",
                        height: "18px",
                        borderRadius: "10px",
                        backgroundColor: isPrivate ? "#cbd5e1" : "#10b981",
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px",
                        transition: "background-color 0.2s ease",
                        justifyContent: isPrivate ? "flex-start" : "flex-end"
                      }}>
                        <span style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                        }} />
                      </span>
                    </button>

                    {/* 2. View Profile Gradient Button */}
                    <button
                      type="button"
                      onClick={() => window.open(`/public-profile/${storedUser?.userId || profile.id || 7}`, "_blank")}
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg, #7c3aed 0%, #ee008f 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        padding: "9px 14px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        boxShadow: "0 3px 10px rgba(124, 58, 237, 0.25)"
                      }}
                      title="Open Public Profile in new tab"
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Users size={14} />
                        <span>View Profile</span>
                      </span>
                      <ArrowRight size={14} />
                    </button>

                    {/* 3. Requests Button */}
                    <button
                      type="button"
                      onClick={() => setShowRequestsModal(true)}
                      style={{
                        width: "100%",
                        background: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer"
                      }}
                      title="View Profile View Requests"
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Users size={14} color="#64748b" />
                        <span>Requests</span>
                        <span style={{
                          backgroundColor: "#e11d48",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: "800",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {accessRequests.filter(r => r.status === "PENDING").length > 0 ? accessRequests.filter(r => r.status === "PENDING").length : 2}
                        </span>
                      </span>
                      <ArrowRight size={13} color="#94a3b8" />
                    </button>

                    {/* 4. Download Profile Button */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        width: "100%",
                        background: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer"
                      }}
                      title="Download / Print Profile"
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Download size={14} color="#64748b" />
                        <span>Download Profile</span>
                      </span>
                      <ArrowRight size={13} color="#94a3b8" />
                    </button>
                  </div>

                  {/* Bottom Row: Share Profile + 4 Circular Social Icons */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "6px"
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                      Share Profile
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {/* Instagram */}
                      <button
                        type="button"
                        onClick={() => window.open("https://www.instagram.com", "_blank", "noopener,noreferrer")}
                        title="Share on Instagram"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: "1px solid #fbcfe8",
                          background: "#fdf2f8",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#E4405F" strokeWidth="2.2" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#E4405F" strokeWidth="2.2" />
                          <circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F" />
                        </svg>
                      </button>

                      {/* WhatsApp */}
                      <button
                        type="button"
                        onClick={() => {
                          const shareUrl = window.location.origin + `/public-profile/${storedUser?.userId || profile.id || 7}`;
                          const msg = encodeURIComponent(`Check out ${profile.name}'s cinema profile on BookMyStars: ${shareUrl}`);
                          window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank", "noopener,noreferrer");
                        }}
                        title="Share via WhatsApp"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: "1px solid #bbf7d0",
                          background: "#f0fdf4",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#25D366" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {/* Telegram */}
                      <button
                        type="button"
                        onClick={() => {
                          const shareUrl = window.location.origin + `/public-profile/${storedUser?.userId || profile.id || 7}`;
                          const text = encodeURIComponent(`Check out ${profile.name}'s cinema profile on BookMyStars!`);
                          window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, "_blank", "noopener,noreferrer");
                        }}
                        title="Share via Telegram"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: "1px solid #bae6fd",
                          background: "#f0f9ff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M21.5 2.5L2 10.5l7 3 2.5 7 3.5-4.5 5.5 4 1-17.5z" stroke="#229ED9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {/* Email */}
                      <button
                        type="button"
                        onClick={() => {
                          const shareUrl = window.location.origin + `/public-profile/${storedUser?.userId || profile.id || 7}`;
                          const subject = encodeURIComponent(`${profile.name} - Cinema Portfolio on BookMyStars`);
                          const body = encodeURIComponent(`Hi,\n\nExplore ${profile.name}'s cinema profile on BookMyStars:\n${shareUrl}`);
                          window.location.href = `mailto:?subject=${subject}&body=${body}`;
                        }}
                        title="Share via Email"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Incoming Shoot Requests Notification Banner */}
            {pendingBookingCount > 0 && !isBookingBannerDismissed && (
              <div style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "#ffffff",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                boxShadow: "0 4px 16px rgba(79, 70, 229, 0.22)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: 15, fontWeight: 800 }}>
                      You have {pendingBookingCount} new shoot booking request{pendingBookingCount > 1 ? "s" : ""}!
                    </h4>
                    <p style={{ margin: 0, fontSize: 12.5, opacity: 0.9 }}>
                      A professional or casting agency has booked you for an upcoming shoot.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <a
                    href="/bookings"
                    onClick={() => {
                      setIsBookingBannerDismissed(true);
                      localStorage.setItem("bms_bookings_notification_viewed", "true");
                    }}
                    style={{
                      background: "#ffffff",
                      color: "#4f46e5",
                      padding: "8px 18px",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                    }}
                  >
                    View & Respond &rarr;
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookingBannerDismissed(true);
                      localStorage.setItem("bms_bookings_notification_viewed", "true");
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                    title="Dismiss banner"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Profile View Requests Notification Banner */}
            {accessRequests.filter(r => r.status === "PENDING").length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                color: "#ffffff",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                boxShadow: "0 4px 16px rgba(124, 58, 237, 0.22)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: 15, fontWeight: 800 }}>
                      You have {accessRequests.filter(r => r.status === "PENDING").length} pending profile view request{accessRequests.filter(r => r.status === "PENDING").length > 1 ? "s" : ""}!
                    </h4>
                    <p style={{ margin: 0, fontSize: 12.5, opacity: 0.9 }}>
                      Industry viewers have requested permission to view your private portfolio and media.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFilterRequestStatus("PENDING");
                    setShowRequestsModal(true);
                  }}
                  style={{
                    background: "#ffffff",
                    color: "#7c3aed",
                    padding: "8px 18px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                  }}
                >
                  Review Requests &rarr;
                </button>
              </div>
            )}
                
                {/* Container 1: Core Statistics Container Box */}
                <div className="db-stats-container-box">
                  <div className="db-stats-grid-wrapper" style={{ gap: '11px' }}>
                    
                    {/* Stat 1: Views */}
                    <div
                      className="db-stat-item-card"
                      onClick={() => navigate("/analytics")}
                      title="Click to view detailed visitor analytics"
                    >
                      <div className="db-stat-top-row">
                        <div className="db-stat-icon-wrapper views">
                          <Users size={22} className="text-purple-600" />
                        </div>
                        <div className="db-stat-data">
                          <span className="db-stat-val">2.4M+</span>
                          <span className="db-stat-lbl">Profile Views</span>
                        </div>
                      </div>
                      <span className="db-stat-trend up whitespace-nowrap">
                        &uarr; 18.6% <span className="text-black ml-1">this month</span>
                      </span>
                    </div>

                    {/* Stat 2: Auditions */}
                    <div
                      className="db-stat-item-card"
                      onClick={() => navigate("/auditions")}
                      title="Click to explore casting calls and auditions"
                    >
                      <div className="db-stat-top-row">
                        <div className="db-stat-icon-wrapper auditions">
                          <Star size={22} className="text-pink-500" />
                        </div>
                        <div className="db-stat-data">
                          <span className="db-stat-val">128</span>
                          <span className="db-stat-lbl">Auditions</span>
                        </div>
                      </div>
                      <span className="db-stat-trend up whitespace-nowrap">
                        &uarr; 12 <span className="text-black ml-1">this month</span>
                      </span>
                    </div>

                    {/* Stat 3: Bookings */}
                    <div
                      className="db-stat-item-card"
                      onClick={() => navigate("/bookings")}
                      title="Click to view shoot bookings"
                    >
                      <div className="db-stat-top-row">
                        <div className="db-stat-icon-wrapper bookings">
                          <CalendarDays size={22} className="text-purple-600" />
                        </div>
                        <div className="db-stat-data">
                          <span className="db-stat-val">{pendingBookingCount > 0 ? pendingBookingCount : "24"}</span>
                          <span className="db-stat-lbl">Bookings</span>
                        </div>
                      </div>
                      <span className="db-stat-trend up whitespace-nowrap">
                        &uarr; 14 <span className="text-black ml-1">this month</span>
                      </span>
                    </div>

                    {/* Stat 4: Awards / Projects */}
                    <div
                      className="db-stat-item-card"
                      onClick={() => navigate("/profile")}
                      title="Click to view your work experience and portfolio"
                    >
                      <div className="db-stat-top-row">
                        <div className="db-stat-icon-wrapper awards">
                          <Trophy size={22} className="text-orange-500" />
                        </div>
                        <div className="db-stat-data">
                          <span className="db-stat-val">{workExpCount > 0 ? workExpCount : "8"}</span>
                          <span className="db-stat-lbl">Projects & Works</span>
                        </div>
                      </div>
                      <PagesButton
                        className="db-stat-view-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/profile");
                        }}
                      >
                        View all
                      </PagesButton>
                    </div>

                  </div>
                </div>

                {/* Container 2: Quick Actions Container Box */}
                <div className="db-quick-actions-container-box">
                  <h4 className="db-quick-actions-title">Quick Actions</h4>
                  <div className="db-quick-actions-grid-wrapper gap-3">
                    
                    {/* Action 1 */}
                    <PagesButton className="db-action-item-btn" onClick={() => navigate("/my-media")}>
                      <div className="db-action-icon-box">
                        <Plus size={16} />
                      </div>
                      <span>Add New Media</span>
                    </PagesButton>

                    {/* Action 2 */}
                    <PagesButton className="db-action-item-btn" onClick={() => navigate("/opportunities")}>
                      <div className="db-action-icon-box">
                        <Video size={16} />
                      </div>
                      <span>Apply for Casting</span>
                    </PagesButton>

                    {/* Action 3 */}
                    <PagesButton className="db-action-item-btn" onClick={() => navigate("/calendar")}>
                      <div className="db-action-icon-box">
                        <CalendarRange size={16} />
                      </div>
                      <span>Update Availability</span>
                    </PagesButton>

                    {/* Action 4 */}
                    <PagesButton className="db-action-item-btn" onClick={() => navigate("/profile")}>
                      <div className="db-action-icon-box">
                        <FolderPlus size={16} />
                      </div>
                      <span>Add New Project</span>
                    </PagesButton>

                    {/* Action 5 */}
                    <PagesButton
                      className="db-action-item-btn"
                      onClick={() => {
                        const url = window.location.origin + `/public-profile/${storedUser?.userId || profile.id || 7}`;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(url);
                          showSuccess("Link Copied!", "Public profile link copied to clipboard.");
                        } else {
                          window.prompt("Copy profile link:", url);
                        }
                      }}
                    >
                      <div className="db-action-icon-box">
                        <Share2 size={16} />
                      </div>
                      <span>Share Profile</span>
                    </PagesButton>

                    {/* Action 6: Post Opportunity */}
                    <PagesButton
                      className="db-action-item-btn"
                      onClick={() => navigate("/opportunities")}
                      style={{ border: "1.5px solid #f472b6", background: "#fdf2f8" }}
                    >
                      <div className="db-action-icon-box" style={{ background: "linear-gradient(135deg, #ee008f, #7c3aed)", color: "#ffffff" }}>
                        <Plus size={16} />
                      </div>
                      <span style={{ color: "#be185d", fontWeight: "800" }}>Post Opportunity</span>
                    </PagesButton>

                  </div>
                </div>

            {/* ── My Active Opportunities & Videos Showcase ── */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              borderRadius: "16px",
              padding: "22px 24px",
              marginBottom: "24px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #ee008f, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                    <Video size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                      My Active Opportunities & Auditions
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                      Castings, auditions, and crew calls created by you with live video showcases.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/opportunities")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(238, 0, 143, 0.25)"
                  }}
                >
                  <Plus size={14} />
                  <span>+ Post Opportunity</span>
                </button>
              </div>

              {myCastings.length > 0 ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: "22px"
                }}>
                  {myCastings.map((c) => {
                    const poster = c.posterUrl
                      ? (c.posterUrl.startsWith("http") ? c.posterUrl : getFullImageUrl(c.posterUrl))
                      : "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80";
                    const videoSrc = c.videoUrl
                      ? (c.videoUrl.startsWith("http") ? c.videoUrl : getFullImageUrl(c.videoUrl))
                      : null;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedOpportunity(c)}
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "18px",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.borderColor = "#f472b6";
                          e.currentTarget.style.boxShadow = "0 14px 28px -6px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(238, 0, 143, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
                        }}
                      >
                        <div>
                          {/* 16:9 Media Preview (Video Showcase or Photo Poster) */}
                          <div style={{ position: "relative", width: "100%", height: "210px", background: "#0f172a", overflow: "hidden" }}>
                            <img
                              src={poster}
                              alt={c.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                opacity: 0.88
                              }}
                            />
                            {/* Dark gradient overlay for text readability */}
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.25) 55%, rgba(15, 23, 42, 0.1) 100%)"
                            }} />

                            {/* Top Badges */}
                            <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{
                                  fontSize: "10.5px",
                                  fontWeight: "900",
                                  textTransform: "uppercase",
                                  background: "#ee008f",
                                  color: "#ffffff",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  letterSpacing: "0.5px",
                                  boxShadow: "0 2px 6px rgba(238,0,143,0.35)"
                                }}>
                                  {c.projectType || "Feature Film"}
                                </span>
                                <span style={{
                                  fontSize: "10.5px",
                                  fontWeight: "700",
                                  background: "rgba(16, 185, 129, 0.92)",
                                  color: "#ffffff",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} /> Active
                                </span>
                              </div>

                              {videoSrc ? (
                                <span style={{
                                  fontSize: "10.5px",
                                  fontWeight: "800",
                                  background: "rgba(15, 23, 42, 0.85)",
                                  color: "#ffffff",
                                  border: "1px solid rgba(255,255,255,0.25)",
                                  backdropFilter: "blur(6px)",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  <span style={{ color: "#f472b6" }}>📹</span> Video Reel Attached
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: "10.5px",
                                  fontWeight: "800",
                                  background: "rgba(15, 23, 42, 0.85)",
                                  color: "#ffffff",
                                  border: "1px solid rgba(255,255,255,0.25)",
                                  backdropFilter: "blur(6px)",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  <span>🖼️</span> Poster Preview
                                </span>
                              )}
                            </div>

                            {/* Center Play Button for Video */}
                            {videoSrc && (
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                                <div style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #ee008f, #9333ea)",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "17px",
                                  fontWeight: "900",
                                  boxShadow: "0 6px 18px rgba(238, 0, 143, 0.5)",
                                  border: "2px solid rgba(255,255,255,0.9)",
                                  paddingLeft: "3px"
                                }}>
                                  ▶
                                </div>
                              </div>
                            )}

                            {/* Bottom Title & Craft on media */}
                            <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px", color: "#ffffff" }}>
                              <h4 style={{
                                fontSize: "16px",
                                fontWeight: "900",
                                color: "#ffffff",
                                margin: "0 0 4px 0",
                                lineHeight: 1.3,
                                textShadow: "0 2px 4px rgba(0,0,0,0.7)"
                              }}>
                                {c.title}
                              </h4>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", color: "#f1f5f9" }}>
                                <span style={{ fontWeight: "700" }}>🎭 {c.customCraft || (c.roleType ? c.roleType.charAt(0) + c.roleType.slice(1).toLowerCase() : "Actor")}</span>
                                <span>•</span>
                                <span>📍 {c.location || "Mumbai"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Body: Criteria Pills & Synopsis */}
                          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {/* 4 Criteria Pills: Age, Gender, Budget, Deadline */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "16px" }}>🎂</span>
                                <div style={{ overflow: "hidden" }}>
                                  <div style={{ fontSize: "9.5px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Required Age</div>
                                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                    {c.age ? `${c.age} Yrs` : "Any Age"}
                                  </div>
                                </div>
                              </div>

                              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "16px" }}>👤</span>
                                <div style={{ overflow: "hidden" }}>
                                  <div style={{ fontSize: "9.5px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Gender</div>
                                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                    {c.gender || "Any Gender"}
                                  </div>
                                </div>
                              </div>

                              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "16px" }}>💰</span>
                                <div style={{ overflow: "hidden" }}>
                                  <div style={{ fontSize: "9.5px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Budget / Pay</div>
                                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#059669", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                    {typeof c.budget === "number" ? `₹ ${c.budget.toLocaleString("en-IN")}` : (c.budget ? `₹ ${c.budget}` : "Flexible")}
                                  </div>
                                </div>
                              </div>

                              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "16px" }}>📅</span>
                                <div style={{ overflow: "hidden" }}>
                                  <div style={{ fontSize: "9.5px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Deadline</div>
                                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                    {c.applicationDeadline || c.shootStartDate || "Open"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Synopsis snippet */}
                            {c.description && (
                              <p style={{
                                fontSize: "12px",
                                color: "#64748b",
                                margin: 0,
                                lineHeight: 1.5,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}>
                                {c.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Submissions count + Actions */}
                        <div style={{
                          padding: "12px 18px",
                          background: "#f8fafc",
                          borderTop: "1.5px solid #f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>👥</span>
                            <div>
                              <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#4f46e5" }}>
                                {c.applicantCount || 0} Submissions
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                Audition: {c.applicationDeadline || c.shootStartDate || "Open"}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDeleteCasting(c)}
                              style={{
                                background: "#fef2f2",
                                border: "1.5px solid #fecaca",
                                borderRadius: "8px",
                                padding: "7px 10px",
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#dc2626",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              title="Delete Opportunity"
                            >
                              <Trash2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate("/messages", { state: { opportunityId: c.id, opportunityTitle: c.title } })}
                              style={{
                                background: "#ffffff",
                                border: "1.5px solid #cbd5e1",
                                borderRadius: "8px",
                                padding: "7px 12px",
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#334155",
                                cursor: "pointer"
                              }}
                            >
                              💬 Chat
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate("/opportunities")}
                              style={{
                                background: "#4f46e5",
                                border: "none",
                                borderRadius: "8px",
                                padding: "7px 14px",
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#ffffff",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)"
                              }}
                            >
                              Review Applicants &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  background: "#fdf4ff",
                  border: "1.5px dashed #f472b6",
                  borderRadius: "14px",
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "28px" }}>🎬</span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#831843" }}>
                        Planning a Shoot, Music Video, or Film Project?
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#9d174d", marginTop: "2px" }}>
                        Post a casting call with an audition reference video to discover and contract talents across all 24 cinema crafts.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/opportunities")}
                    style={{
                      background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "9px 20px",
                      fontSize: "12.5px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(238, 0, 143, 0.25)"
                    }}
                  >
                    + Create First Casting Call
                  </button>
                </div>
              )}
            </div>

            {/* ── Cinema Craft Network: Explore Related Crafts ── */}
            {(() => {
              const craftNetwork = getCinemaCraftNetwork(
                profile.roles,
                storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`)
              );
              return (
                <div style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1.5px solid #e2e8f0",
                  padding: "22px 24px",
                  marginBottom: "24px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
                    <div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fdf2f8", color: "#be185d", padding: "4px 12px", borderRadius: "14px", fontSize: "11.5px", fontWeight: "800", marginBottom: "6px" }}>
                        <Sparkles size={13} /> {craftNetwork.craftBadge} &bull; Cinema Craft Collaborations
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>
                        Explore Related Crafts & Opportunities
                      </h3>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                        {craftNetwork.tagline}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/talents")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <Compass size={14} color="#ee008f" />
                      <span>Browse All 24+ Cinema Crafts</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px"
                  }}>
                    {craftNetwork.partners.map((partner) => (
                      <div
                        key={partner.id}
                        style={{
                          background: "#fafaf9",
                          border: "1px solid #e7e5e4",
                          borderRadius: "14px",
                          padding: "18px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          transition: "all 0.2s ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <span style={{ fontSize: "28px" }}>{partner.icon}</span>
                            <span style={{
                              background: "#e0e7ff",
                              color: "#3730a3",
                              fontSize: "10.5px",
                              fontWeight: "800",
                              padding: "2px 8px",
                              borderRadius: "8px",
                              textTransform: "uppercase"
                            }}>
                              {partner.badge}
                            </span>
                          </div>
                          <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px 0" }}>
                            {partner.title}
                          </h4>
                          <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.45" }}>
                            {partner.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(partner.targetPath)}
                          style={{
                            width: "100%",
                            background: "#ffffff",
                            border: "1.5px solid #cbd5e1",
                            color: "#0f172a",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "all 0.15s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#ee008f";
                            e.currentTarget.style.color = "#ee008f";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#cbd5e1";
                            e.currentTarget.style.color = "#0f172a";
                          }}
                        >
                          <span>{partner.actionText}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Widgets Section Grid */}
            <div className="db-widgets-grid">
              
              {/* Auditions Widget */}
              <div className="card-widget db-col-span-8">
                <div className="widget-header">
                  <h3>Upcoming Auditions</h3>
                  <PagesButton className="btn-link-db text-xs" onClick={() => navigate("/auditions")}>View All</PagesButton>
                </div>

                <div className="widget-list">
                  {auditions.map((aud, index) => (
                    <div
                      key={index}
                      className="audition-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/auditions")}
                      title="Click to view audition & casting details"
                    >
                      {/* Date Box */}
                      <div className="audition-date-box">
                        <span className="audition-date-num">{aud.date}</span>
                        <span className="audition-date-month">{aud.month}</span>
                      </div>
                      <div className="audition-details text-left">
                        <h4 className="audition-title">{aud.title}</h4>
                        <div className="flex flex-col gap-0.5">
                          <span className="audition-meta block">
                            Production House: {aud.production}
                          </span>
                          <span className="audition-meta block text-slate-400 font-medium">
                            {aud.time} &nbsp;&bull;&nbsp; {aud.location}
                          </span>
                        </div>
                      </div>
                      {/* Status Badge */}
                      <span className={`badge-status ${aud.statusClass}`}>
                        {aud.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Projects Widget */}
              <div className="card-widget db-col-span-8">
                <div className="widget-header">
                  <h3>Recent Projects</h3>
                  <PagesButton className="btn-link-db text-xs" onClick={() => navigate("/profile")}>View All</PagesButton>
                </div>

                <div className="widget-list">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="project-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/profile")}
                      title="Click to manage project credits in your profile"
                    >
                      <div className="project-thumb">
                        <img src={proj.img} alt={proj.title} />
                      </div>
                      <div className="project-info text-left">
                        <h4 className="project-title">{proj.title}</h4>
                        <div className="flex flex-col gap-0.5">
                          <span className="project-meta block">
                            {proj.type} &nbsp;&bull;&nbsp; {proj.role}
                          </span>
                          <span className="project-meta block text-slate-400 font-medium">
                            {proj.year} &nbsp;&bull;&nbsp; {proj.status}
                          </span>
                        </div>
                      </div>
                      <span 
                        className="badge-rating cursor-pointer"
                        onClick={(e) => handleRatingClick(e, proj.id)}
                        title="Click to edit rating"
                      >
                        <Star size={13} className="fill-emerald-600 text-emerald-600" />
                        {proj.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Completion Circular Progress Widget */}
              <div className="db-col-span-8">
                <RadialProgressBar />
              </div>

              {/* Performance Overview Line Chart Widget */}
              <div className="db-col-span-12">
                <PerformanceChart />
              </div>

              {/* Recent Messages Feed Widget */}
              <div className="card-widget flex flex-col justify-between db-col-span-6 messages-widget-card">
                <div>
                  <div className="widget-header">
                    <h3>Recent Messages</h3>
                    <PagesButton className="btn-link-db text-xs" onClick={() => navigate("/messages")}>View All</PagesButton>
                  </div>

                  <div className="widget-list">
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="msg-item"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/messages", { state: { targetChatId: msg.id } })}
                          title="Click to open conversation"
                        >
                          <div className={`msg-avatar ${msg.avatarBg}`} style={{ overflow: "hidden" }}>
                            {msg.avatarUrl ? (
                              <img src={msg.avatarUrl} alt={msg.sender} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              msg.sender.charAt(0)
                            )}
                          </div>
                          <div className="msg-body">
                            <h4 className="msg-sender">{msg.sender}</h4>
                            <p className="msg-snippet">{msg.text}</p>
                          </div>
                          <div className="msg-meta">
                            <span className="msg-time">{msg.time}</span>
                            {msg.unreadCount > 0 && (
                              <span className="msg-unread-badge">{msg.unreadCount}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "28px 12px", textAlign: "center", color: "#64748b" }}>
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>💬</div>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: "#334155", margin: 0 }}>No recent messages</p>
                        <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>Direct inquiries and booking chats will appear here</p>
                      </div>
                    )}
                  </div>
                </div>

                <PagesButton
                  className="w-full font-extrabold text-xs rounded-lg flex items-center justify-center gap-2 transition duration-150 cursor-pointer btn-messages-go"
                  onClick={() => navigate("/messages")}
                >
                  <MessageSquare size={13} />
                  Go to Messages
                </PagesButton>
              </div>

              {/* Mini Calendar Widget */}
              <div className="db-col-span-6">
                <MiniCalendar />
              </div>

            </div>
          </div>


      {showEditModal && createPortal(
        <div className="edit-profile-backdrop" onClick={handleCancelEdit}>
          <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-profile-header">
              <h3>Edit Profile</h3>
              <PagesButton className="edit-profile-close-btn" onClick={handleCancelEdit} aria-label="Close modal">
                <X size={18} />
              </PagesButton>
            </div>

            <div className="edit-profile-body">
              {/* Left Side: Photo Section */}
              <div className="edit-profile-photo-section">
                <div className="edit-profile-photo-preview-wrapper">
                  {isWebcamActive ? (
                    <video 
                      ref={videoRef} 
                      className="edit-profile-camera-view" 
                      autoPlay 
                      playsInline 
                      muted
                    />
                  ) : (
                    <img
                      src={tempProfile.photo}
                      alt="Profile Preview"
                    />
                  )}
                  
                  {/* Countdown Overlay */}
                  {countdown !== null && (
                    <div className="edit-profile-countdown-overlay">
                      {countdown > 0 ? countdown : "Cheese! Ã°Å¸â€œÂ¸"}
                    </div>
                  )}

                  {/* Flash Effect Overlay */}
                  <div className={`edit-profile-flash-overlay ${showFlash ? "edit-profile-flash-active" : ""}`} />
                </div>

                <div className="edit-profile-upload-options">
                  {isWebcamActive ? (
                    <PagesButton className="edit-profile-upload-btn primary justify-center" onClick={handleCaptureWebcam}>
                      <Camera size={15} />
                      Capture Photo
                    </PagesButton>
                  ) : (
                    <PagesButton className="edit-profile-upload-btn primary" onClick={handleStartWebcam}>
                      <Camera size={15} />
                      Click from Camera
                    </PagesButton>
                  )}

                  <PagesButton 
                    className="edit-profile-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={15} />
                    Choose from Gallery
                  </PagesButton>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleGalleryUpload}
                  />
                </div>
              </div>

              {/* Right Side: Form Fields Section */}
              <div className="edit-profile-form-section">
                {/* Name */}
                <div className="edit-profile-field-group">
                  <label htmlFor="edit-name">Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="edit-profile-input"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  />
                </div>

                {/* Primary Profession Selection (Single select matching Profile tab) */}
                <div className="edit-profile-field-group">
                  <label>Primary Profession <span style={{ color: "#ee008f" }}>*</span></label>
                  <div className="edit-profile-role-chips">
                    {PROFILE_TYPE_OPTIONS.map((opt) => {
                      const firstRole = (tempProfile.roles && tempProfile.roles.length > 0)
                        ? tempProfile.roles[0].toUpperCase()
                        : "ACTOR";
                      const isSelected = firstRole === opt.value || ((tempProfile.profileTypes && tempProfile.profileTypes.includes(opt.value)));
                      return (
                        <PagesButton
                          key={opt.value}
                          type="button"
                          className={`edit-profile-role-chip ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            const displayRole = opt.value === "OTHER"
                              ? (tempProfile.customProfession || "Other")
                              : (opt.value.charAt(0) + opt.value.slice(1).toLowerCase());
                            setTempProfile({
                              ...tempProfile,
                              roles: [displayRole],
                              profileTypes: [opt.value]
                            });
                          }}
                        >
                          {opt.label}
                        </PagesButton>
                      );
                    })}
                  </div>

                  {/* Custom craft input if OTHER */}
                  {((tempProfile.roles && tempProfile.roles[0]?.toUpperCase() === "OTHER") || (tempProfile.profileTypes && tempProfile.profileTypes[0] === "OTHER")) && (
                    <div style={{ marginTop: "10px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "700", color: "#db2777" }}>Specify Custom Craft *</label>
                      <input
                        type="text"
                        className="edit-profile-input"
                        placeholder="e.g. Cinematographer, Lyricist, Editor"
                        value={tempProfile.customProfession || ""}
                        onChange={(e) => setTempProfile({ ...tempProfile, customProfession: e.target.value })}
                        style={{ marginTop: "4px" }}
                      />
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="edit-profile-field-group">
                  <label htmlFor="edit-location">Location</label>
                  <input
                    id="edit-location"
                    type="text"
                    className="edit-profile-input"
                    value={tempProfile.location}
                    onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                  />
                </div>

                {/* Languages */}
                <div className="edit-profile-field-group">
                  <label htmlFor="edit-languages">Languages</label>
                  <input
                    id="edit-languages"
                    type="text"
                    className="edit-profile-input"
                    value={tempProfile.languages}
                    onChange={(e) => setTempProfile({ ...tempProfile, languages: e.target.value })}
                  />
                </div>

                {/* Age & Birth Date */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="edit-profile-field-group flex-1 text-left">
                    <label htmlFor="edit-age">Age</label>
                    <input
                      id="edit-age"
                      type="number"
                      className="edit-profile-input"
                      value={tempProfile.age}
                      onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })}
                    />
                  </div>
                  <div className="edit-profile-field-group flex-1 text-left">
                    <label htmlFor="edit-birthdate">Birth Date</label>
                    <input
                      id="edit-birthdate"
                      type="date"
                      className="edit-profile-input"
                      value={tempProfile.birthDate}
                      onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="edit-profile-footer">
              <PagesButton className="edit-profile-footer-btn cancel" onClick={handleCancelEdit}>
                Cancel
              </PagesButton>
              <PagesButton className="edit-profile-footer-btn save" onClick={handleSaveProfile}>
                Save Changes
              </PagesButton>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Profile Access Requests Modal */}
      {showRequestsModal && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRequestsModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#f5f3ff",
                    color: "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Lock size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    Profile View Requests
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                    Approve or decline requests to view your private portfolio and media
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestsModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "12px 24px",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0"
              }}
            >
              {[
                { id: "ALL", label: `All (${accessRequests.length})` },
                { id: "PENDING", label: `Pending (${accessRequests.filter(r => r.status === "PENDING").length})` },
                { id: "APPROVED", label: `Approved (${accessRequests.filter(r => r.status === "APPROVED").length})` },
                { id: "REJECTED", label: `Declined (${accessRequests.filter(r => r.status === "REJECTED").length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterRequestStatus(tab.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: filterRequestStatus === tab.id ? "#7c3aed" : "transparent",
                    color: filterRequestStatus === tab.id ? "#ffffff" : "#64748b",
                    transition: "all 0.15s ease"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List Body */}
            <div
              style={{
                padding: "20px 24px",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 14
              }}
            >
              {accessRequests
                .filter(r => filterRequestStatus === "ALL" ? true : r.status === filterRequestStatus)
                .length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 16px", color: "#94a3b8" }}>
                  <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#475569" }}>
                    No requests found
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                    {filterRequestStatus === "PENDING"
                      ? "You don't have any pending requests to view your profile."
                      : "No access requests in this category yet."}
                  </p>
                </div>
              ) : (
                accessRequests
                  .filter(r => filterRequestStatus === "ALL" ? true : r.status === filterRequestStatus)
                  .map(req => {
                    const isPending = req.status === "PENDING";
                    const isApproved = req.status === "APPROVED";
                    const isRejected = req.status === "REJECTED";
                    const isBusy = actionInProgressId === req.id;

                    return (
                      <div
                        key={req.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: 16,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          backgroundColor: "#ffffff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                                {req.requesterName || req.requester?.fullName || "Industry Viewer"}
                              </h4>
                              {req.requesterRole && (
                                <span style={{
                                  backgroundColor: "#ede9fe",
                                  color: "#6d28d9",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 12
                                }}>
                                  {req.requesterRole}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>
                              {req.requesterEmail || req.requester?.email || "No email provided"}
                              {req.createdAt && (
                                <span style={{ marginLeft: 8, opacity: 0.8 }}>
                                  • {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span
                            style={{
                              fontSize: 11.5,
                              fontWeight: 800,
                              padding: "4px 10px",
                              borderRadius: 12,
                              whiteSpace: "nowrap",
                              backgroundColor: isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7",
                              color: isApproved ? "#15803d" : isRejected ? "#b91c1c" : "#b45309"
                            }}
                          >
                            {isApproved ? "Approved" : isRejected ? "Declined" : "Pending Approval"}
                          </span>
                        </div>

                        {req.requesterMessage && (
                          <div
                            style={{
                              backgroundColor: "#f8fafc",
                              borderRadius: 8,
                              padding: "10px 12px",
                              fontSize: 13,
                              color: "#334155",
                              borderLeft: "3px solid #7c3aed"
                            }}
                          >
                            <span style={{ fontWeight: 600, color: "#64748b" }}>Note: </span>
                            "{req.requesterMessage}"
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRespondAccessRequest(req.id, false)}
                                style={{
                                  padding: "7px 16px",
                                  borderRadius: 8,
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  border: "1px solid #cbd5e1",
                                  backgroundColor: "#ffffff",
                                  color: "#64748b",
                                  cursor: isBusy ? "not-allowed" : "pointer"
                                }}
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRespondAccessRequest(req.id, true)}
                                style={{
                                  padding: "7px 18px",
                                  borderRadius: 8,
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  border: "none",
                                  backgroundColor: "#10b981",
                                  color: "#ffffff",
                                  cursor: isBusy ? "not-allowed" : "pointer",
                                  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)"
                                }}
                              >
                                {isBusy ? "Processing..." : "Approve Access"}
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleRespondAccessRequest(req.id, false)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                border: "1px solid #fee2e2",
                                backgroundColor: "#fff1f2",
                                color: "#e11d48",
                                cursor: isBusy ? "not-allowed" : "pointer"
                              }}
                            >
                              {isBusy ? "Processing..." : "Revoke Access"}
                            </button>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleRespondAccessRequest(req.id, true)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                border: "1px solid #a7f3d0",
                                backgroundColor: "#ecfdf5",
                                color: "#059669",
                                cursor: isBusy ? "not-allowed" : "pointer"
                              }}
                            >
                              {isBusy ? "Processing..." : "Grant Access"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fafafa"
              }}
            >
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Current Profile Status: <strong style={{ color: isPrivate ? "#7c3aed" : "#059669" }}>{isPrivate ? "Private (Locked)" : "Public (Open)"}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowRequestsModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Skill Management Modal */}
      <SkillManagementModal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        skills={skills}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
      />

      {/* Complete Specialized Skills Dialogue Box Modal */}
      {showAllSkillsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setShowAllSkillsModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>✨</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                    All Specialized Skills
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", color: "#64748b" }}>
                    {skills.length} specialized skills on your cinema profile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllSkillsModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
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

            {/* Modal Body: Complete list of skills without "+ Add Work" */}
            <div style={{ padding: "20px", maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      background: "#fdf2f8",
                      border: "1.5px solid #fbcfe8",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#be185d",
                      boxShadow: "0 1px 3px rgba(190, 24, 93, 0.08)"
                    }}
                  >
                    <span>✨ {skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#db2777",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title={`Remove ${skill}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "14px 20px",
              background: "#f8fafc",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowAllSkillsModal(false);
                  setShowSkillModal(true);
                }}
                style={{
                  background: "#ee008f",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(238, 0, 143, 0.25)"
                }}
              >
                <Plus size={14} /> Add Another Skill
              </button>
              <button
                type="button"
                onClick={() => setShowAllSkillsModal(false)}
                style={{
                  background: "#ffffff",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "7px 16px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Work For Specific Skill Modal */}
      {showAddWorkModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }} onClick={() => setShowAddWorkModal(false)}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e2e8f0",
            padding: "24px"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                  Add Work for {selectedSkillForWork}
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                  Document your completed projects and credits under {selectedSkillForWork}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddWorkModal(false)}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b"
                }}
              >
                ✕
              </button>
            </div>

            {skillWorkSuccessMsg ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "14px", borderRadius: "10px", textAlign: "center", fontWeight: "700" }}>
                🎉 {skillWorkSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveSkillWork} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Modal Tab Headers */}
                <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setSkillWorkTab("details")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: skillWorkTab === "details" ? "#fdf2f8" : "transparent",
                      color: skillWorkTab === "details" ? "#db2777" : "#64748b",
                      fontWeight: "700",
                      fontSize: "12.5px",
                      cursor: "pointer"
                    }}
                  >
                    📝 Project Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkillWorkTab("files")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: skillWorkTab === "files" ? "#fdf2f8" : "transparent",
                      color: skillWorkTab === "files" ? "#db2777" : "#64748b",
                      fontWeight: "700",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    📁 Attach Files / Proof {skillWorkFile ? `(1 file attached)` : ""}
                  </button>
                </div>

                {skillWorkTab === "details" ? (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                        Production Banner / Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Netflix, Zee Studios, T-Series, Independent Play"
                        value={skillWorkCompany}
                        onChange={e => setSkillWorkCompany(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                        Project / Role Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`e.g. Lead ${selectedSkillForWork || "Artist"}, Performer, Contributor`}
                        value={skillWorkTitle}
                        onChange={e => setSkillWorkTitle(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                        Year / Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2024, 2023 - 2024"
                        value={skillWorkDuration}
                        onChange={e => setSkillWorkDuration(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                        Description & Highlights
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Key performance highlights, scene details, or responsibilities..."
                        value={skillWorkDesc}
                        onChange={e => setSkillWorkDesc(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px" }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "6px 0" }}>
                    <div style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                      <FolderPlus size={36} color="#db2777" style={{ margin: "0 auto 8px" }} />
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                        Attach Certificate, Script, Project Still, or Contract
                      </div>
                      <p style={{ fontSize: "11.5px", color: "#64748b", margin: "4px 0 14px 0" }}>
                        Supports PDF documents, Word documents, or project stills (JPG/PNG).
                      </p>
                      <input
                        type="file"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) setSkillWorkFile(file);
                        }}
                        style={{ fontSize: "12.5px" }}
                      />
                    </div>

                    {skillWorkFile && (
                      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "700", color: "#065f46" }}>
                          <span>📎 {skillWorkFile.name}</span>
                          <span style={{ fontSize: "11px", color: "#047857" }}>({Math.round(skillWorkFile.size / 1024)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSkillWorkFile(null)}
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddWorkModal(false)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSkillWork}
                    style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#ee008f", color: "#ffffff", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                  >
                    {savingSkillWork ? "Uploading & Saving..." : `Save ${selectedSkillForWork} Project`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
 
      {/* Edit Profession Modal (Unified with Profile Tab) */}
      {showProfessionModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
          onClick={() => setShowProfessionModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, rgba(238, 0, 143, 0.04), rgba(124, 58, 237, 0.04))"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #ee008f, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "18px"
                }}>
                  🎭
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Edit Profession / Craft
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                    Select your primary cinema craft. Saved to DB & synced across your profile.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfessionModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "22px 24px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "10px" }}>
                Primary Profession <span style={{ color: "#ee008f" }}>*</span> <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "400" }}>(Select one craft)</span>
              </label>

              {/* The Exact 7 PROFILE_TYPE_OPTIONS chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {PROFILE_TYPE_OPTIONS.map((opt) => {
                  const isSelected = selectedProfType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedProfType(opt.value);
                        if (opt.value !== "OTHER") {
                          setCustomProfInput("");
                        }
                      }}
                      style={{
                        padding: "9px 15px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        fontWeight: isSelected ? "800" : "600",
                        background: isSelected ? "linear-gradient(135deg, #ee008f, #9333ea)" : "#f8fafc",
                        color: isSelected ? "#ffffff" : "#334155",
                        border: isSelected ? "1.5px solid transparent" : "1.5px solid #e2e8f0",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 4px 12px rgba(238, 0, 143, 0.3)" : "none"
                      }}
                    >
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Profession input when OTHER is selected */}
              {selectedProfType === "OTHER" && (
                <div style={{
                  background: "#fdf2f8",
                  border: "1.5px solid #fbcfe8",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "16px"
                }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#db2777", display: "block", marginBottom: "6px" }}>
                    Specify Your Custom Craft / Profession <span style={{ color: "#ee008f" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Cinematographer, Lyricist, Editor, Stunt Director"
                    value={customProfInput}
                    onChange={(e) => setCustomProfInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1.5px solid #f472b6",
                      borderRadius: "8px",
                      fontSize: "13px",
                      background: "#ffffff",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              )}

              <div style={{ fontSize: "11.5px", color: "#64748b", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                💡 This updates your craft directly in the database. Your portfolio, dashboard matrix, and casting recommendations will automatically sync.
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 24px",
              borderTop: "1px solid #f1f5f9",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px"
            }}>
              <button
                type="button"
                onClick={() => setShowProfessionModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "9px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  color: "#475569",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingProfession}
                onClick={handleSaveProfessionFromModal}
                style={{
                  padding: "8px 20px",
                  borderRadius: "9px",
                  border: "none",
                  background: "linear-gradient(135deg, #ee008f, #9333ea)",
                  color: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: "800",
                  cursor: savingProfession ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(238, 0, 143, 0.3)",
                  opacity: savingProfession ? 0.7 : 1
                }}
              >
                {savingProfession ? "Saving to DB..." : "Save Profession"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opp={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}

    </AppLayout>
  );
}



