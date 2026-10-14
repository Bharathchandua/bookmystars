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
  uploadWorkExperienceFile
} from "../../services/api";
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
  ShieldAlert
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();

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
    try {
      await updateUserProfile({ customProfession: craft });
    } catch (_) {}
    window.dispatchEvent(new Event("profile_updated"));
    window.location.reload();
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
      setTimeout(() => {
        setShowAddWorkModal(false);
        setSkillWorkSuccessMsg("");
        setSkillWorkFile(null);
      }, 1800);
    } catch (err) {
      alert("Failed to save work: " + (err.message || "Unknown error"));
    } finally {
      setSavingSkillWork(false);
    }
  };

  // Profile states
  const [profile, setProfile] = useState({
    name: storedUser?.fullName || "Your Name",
    roles: ["Actor"],
    location: "Mumbai, Maharashtra, India",
    languages: "Hindi, English, Punjabi",
    age: "29",
    birthDate: "1995-08-12",
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
          if (u.profileTypes && u.profileTypes.length > 0) {
            setProfile(p => ({ ...p, roles: Array.from(u.profileTypes).map(r => r.charAt(0) + r.slice(1).toLowerCase()) }));
          }
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
    }
    loadDashUser();

    const handlePhotoUpdated = () => {
      const saved = localStorage.getItem("bms_profile_photo");
      if (saved) setProfile(p => ({ ...p, photo: getFullImageUrl(saved) }));
    };
    window.addEventListener("profile_photo_updated", handlePhotoUpdated);
    return () => {
      window.removeEventListener("profile_photo_updated", handlePhotoUpdated);
      window.removeEventListener("skills_updated", handleSkillsUpdated);
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
    } catch (err) {
      setIsPrivate(!newStatus); // rollback
      alert("Failed to update profile privacy: " + err.message);
    } finally {
      setPrivacyToggling(false);
    }
  };

  const handleRespondAccessRequest = async (requestId, approved) => {
    try {
      setActionInProgressId(requestId);
      const updated = await respondToProfileAccessRequest(requestId, approved);
      setAccessRequests(prev => prev.map(r => r.id === requestId ? updated : r));
    } catch (err) {
      alert("Failed to update access request: " + err.message);
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
    setTempProfile({ ...profile, roles: [...profile.roles] });
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

      await updateUserProfile({
        fullName: tempProfile.name,
        location: tempProfile.location,
        languages: tempProfile.languages,
        profileTypes: mappedTypes
      });

      if (storedUser) {
        localStorage.setItem("bms_user", JSON.stringify({
          ...storedUser,
          fullName: tempProfile.name,
          profileTypes: mappedTypes
        }));
      }
    } catch (e) {
      console.error("Failed to update profile from dashboard", e);
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
      } else {
        alert("Please enter a valid rating between 0.0 and 10.0");
      }
    }
  };

  const messages = [
    { id: 1, sender: "DreamWorks Casting", avatarBg: "bg-indigo-600", text: "We liked your profile and would like...", time: "10:30 AM", unreadCount: 2 },
    { id: 2, sender: "Silver Screen Productions", avatarBg: "bg-slate-900", text: "Your profile has been shortlisted for...", time: "Yesterday", unreadCount: 1 },
    { id: 3, sender: "Bright Ads Agency", avatarBg: "bg-emerald-600", text: "Invitation for TV Commercial audition.", time: "2 May", unreadCount: 0 }
  ];

  return (
    <AppLayout pageTitle="Dashboard" profileName={profile.name} profilePhoto={profile.photo}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <PagesButton
                className="btn-link-db-premium"
                onClick={() => window.open(`/public-profile/${storedUser?.userId || profile.id || 7}`, "_blank")}
              >
                View Public Profile
                <ExternalLink size={14} />
              </PagesButton>
            </div>

            {/* Profile View Requests Button */}
            <button
              type="button"
              onClick={() => setShowRequestsModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 16px",
                borderRadius: "24px",
                fontSize: "13px",
                fontWeight: "700",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#334155",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <UserCheck size={14} color="#db2777" />
              <span>Profile View Requests</span>
              {accessRequests.filter(r => r.status === "PENDING").length > 0 && (
                <span style={{
                  backgroundColor: "#db2777",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "1px 7px",
                  borderRadius: "10px"
                }}>
                  {accessRequests.filter(r => r.status === "PENDING").length}
                </span>
              )}
            </button>
          </div>

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

          {/* Auto-Promotion Banner for Talents with >= 1 Yr Experience */}
          {isAutoPromoted && (
            <div style={{
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: "12px",
              padding: "14px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
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
            {/* Top Row: Profile Card on left & Basic Metrics / Quick Actions Grid on right */}
            <div className="flex flex-col md:flex-row gap-6 items-start relative mb-6">
              
              {/* Left Column: Actor Main Details */}
              <div className="w-full md:w-[340px] lg:w-[480px] flex-shrink-0 db-profile-no-container">
                <div className="db-profile-row">
                  
                  {/* Photo Frame */}
                  <div className="db-profile-photo-wrapper">
                    <img
                      src={profile.photo}
                      alt={profile.name}
                    />
                    
                    {/* Available Status tag */}
                    <div className="db-availability-badge">
                      <span className="db-availability-dot" />
                      Available
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="db-profile-info text-left">
                    <div className="db-profile-header flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h2>{profile.name}</h2>
                        {/* Premium Rosette Verified Badge */}
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#7c3aed" className="flex-shrink-0">
                          <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#7c3aed"/>
                          <path d="M10 14.17L7.41 11.59 6 13l4 4 9-9-1.41-1.41z" fill="#ffffff" />
                        </svg>
                      </div>

                      {/* Instagram-style Toggle Switch Button at Right Side Top Next to Photo */}
                      <button
                        type="button"
                        onClick={handleTogglePrivacy}
                        disabled={privacyToggling}
                        style={{
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
                    </div>
                    
                    {/* Primary Profession, Classification & Dynamic [+ Add Skill] Button */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", margin: "6px 0 8px 0" }}>
                      {(() => {
                        const rawProf = profile.roles[0] || "Actor";
                        const isOther = rawProf.toUpperCase() === "OTHER";
                        const customProf = isOther ? (storedUser?.customProfession || localStorage.getItem(`bms_custom_profession_${(storedUser?.email || "").toLowerCase()}`)) : "";
                        const isOtherWithoutCustom = isOther && !customProf;
                        const displayProfName = isOther ? (customProf || "Other") : rawProf;
                        return (
                          <span style={{
                            background: isOtherWithoutCustom ? "#fef2f2" : "#f1f5f9",
                            color: isOtherWithoutCustom ? "#b91c1c" : "#0f172a",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "12.5px",
                            fontWeight: "800",
                            border: isOtherWithoutCustom ? "1.5px dashed #f87171" : "1px solid #cbd5e1",
                            textTransform: "uppercase",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <span>🎭 {displayProfName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const craft = prompt("Specify your profession / craft (e.g. Cinematographer, Lyricist, Editor):", customProf || "");
                                if (craft && craft.trim()) {
                                  handleSaveCustomProfession(craft.trim());
                                }
                              }}
                              style={{
                                background: isOtherWithoutCustom ? "#dc2626" : "transparent",
                                color: isOtherWithoutCustom ? "#ffffff" : "#64748b",
                                border: isOtherWithoutCustom ? "none" : "1px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "2px 6px",
                                fontSize: "10px",
                                fontWeight: "700",
                                cursor: "pointer",
                                textTransform: "none"
                              }}
                              title="Click to edit or set your profession name"
                            >
                              {isOtherWithoutCustom ? "+ Set Profession" : "✏️"}
                            </button>
                          </span>
                        );
                      })()}

                      <span style={{
                        background: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "#eff6ff" : "#ecfdf5",
                        color: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "#1d4ed8" : "#047857",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: "700",
                        border: (isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "1px solid #bfdbfe" : "1px solid #a7f3d0"
                      }}>
                        {(isAutoPromoted || (!isPendingVerification && (storedUser?.accountType === "PROFESSIONAL" || yearsExperience >= 1))) ? "🎬 Professional (1+ Yrs)" : "🌟 Talent (< 1 Yr)"}
                      </span>

                      {/* Interactive [+ Add Skill] Button */}
                      <button
                        type="button"
                        onClick={() => setShowSkillModal(true)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "#ee008f",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "16px",
                          padding: "4px 12px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 2px 5px rgba(238, 0, 143, 0.25)"
                        }}
                      >
                        <Plus size={13} /> Add Skill
                      </button>
                    </div>

                    {/* Specialized Skills Tags with [+ Add Work] action */}
                    {skills.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Specialized Skills:</span>
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "3px 10px",
                              background: "#fdf2f8",
                              border: "1px solid #fbcfe8",
                              borderRadius: "14px",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#be185d"
                            }}
                          >
                            <span>✨ {skill}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenAddWorkForSkill(skill)}
                              style={{
                                background: "#ee008f",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "10px",
                                padding: "2px 8px",
                                fontSize: "10px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                                boxShadow: "0 1px 3px rgba(238, 0, 143, 0.25)"
                              }}
                              title={`Add project/experience for ${skill}`}
                            >
                              + Add Work
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#db2777",
                                cursor: "pointer",
                                padding: 0,
                                fontSize: "11px",
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
                    )}

                    {/* Info List Items */}
                    <div className="db-profile-meta-grid">
                      <div className="db-meta-item">
                        <MapPin size={15} className="db-meta-icon" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="db-meta-item">
                        <Languages size={15} className="db-meta-icon" />
                        <span>{profile.languages}</span>
                      </div>
                      <div className="db-meta-item">
                        <CalendarDays size={15} className="db-meta-icon" />
                        <span>Age {profile.age} &nbsp;|&nbsp; {formatBirthDate(profile.birthDate)}</span>
                      </div>
                    </div>

                    {/* Profile Card Actions */}
                    <div className="db-profile-actions">
                      <PagesButton className="btn-primary-db" onClick={handleEditProfileClick}>
                        <Edit3 size={13} />
                        Edit Profile
                      </PagesButton>
                      <PagesButton className="btn-secondary-db">
                        <Download size={13} className="text-slate-500" />
                        Download Profile
                      </PagesButton>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Stats & Quick Actions Containers */}
              <div className="flex-1 w-full flex flex-col gap-2 pt-0">

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
                    marginBottom: 10,
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
                    marginBottom: 10,
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
                    <div className="db-stat-item-card">
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
                    <div className="db-stat-item-card">
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
                    <div className="db-stat-item-card">
                      <div className="db-stat-top-row">
                        <div className="db-stat-icon-wrapper bookings">
                          <CalendarDays size={22} className="text-purple-600" />
                        </div>
                        <div className="db-stat-data">
                          <span className="db-stat-val">24</span>
                          <span className="db-stat-lbl">Bookings</span>
                        </div>
                      </div>
                      <span className="db-stat-trend up whitespace-nowrap">
                        &uarr; 14 <span className="text-black ml-1">this month</span>
                      </span>
                    </div>

                    {/* Stat 4: Awards */}
                    <div className="db-stat-item-card">
                      <div className="db-stat-top-row">
                        <div className="db-stat-icon-wrapper awards">
                          <Trophy size={22} className="text-orange-500" />
                        </div>
                        <div className="db-stat-data">
                          <span className="db-stat-val">8</span>
                          <span className="db-stat-lbl">Awards</span>
                        </div>
                      </div>
                      <PagesButton className="db-stat-view-all">
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
                    <PagesButton className="db-action-item-btn">
                      <div className="db-action-icon-box">
                        <Plus size={16} />
                      </div>
                      <span>Add New Media</span>
                    </PagesButton>

                    {/* Action 2 */}
                    <PagesButton className="db-action-item-btn">
                      <div className="db-action-icon-box">
                        <Video size={16} />
                      </div>
                      <span>Apply for Casting</span>
                    </PagesButton>

                    {/* Action 3 */}
                    <PagesButton className="db-action-item-btn">
                      <div className="db-action-icon-box">
                        <CalendarRange size={16} />
                      </div>
                      <span>Update Availability</span>
                    </PagesButton>

                    {/* Action 4 */}
                    <PagesButton className="db-action-item-btn">
                      <div className="db-action-icon-box">
                        <FolderPlus size={16} />
                      </div>
                      <span>Add New Project</span>
                    </PagesButton>

                    {/* Action 5 */}
                    <PagesButton className="db-action-item-btn">
                      <div className="db-action-icon-box">
                        <Share2 size={16} />
                      </div>
                      <span>Share Profile</span>
                    </PagesButton>

                  </div>
                </div>

              </div>

            </div>

            {/* Widgets Section Grid */}
            <div className="db-widgets-grid">
              
              {/* Auditions Widget */}
              <div className="card-widget db-col-span-8">
                <div className="widget-header">
                  <h3>Upcoming Auditions</h3>
                  <PagesButton className="btn-link-db text-xs">View All</PagesButton>
                </div>

                <div className="widget-list">
                  {auditions.map((aud, index) => (
                    <div key={index} className="audition-item">
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
                  <PagesButton className="btn-link-db text-xs">View All</PagesButton>
                </div>

                <div className="widget-list">
                  {projects.map((proj) => (
                    <div key={proj.id} className="project-item">
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
                    <PagesButton className="btn-link-db text-xs">View All</PagesButton>
                  </div>

                  <div className="widget-list">
                    {messages.map((msg) => (
                      <div key={msg.id} className="msg-item">
                        <div className={`msg-avatar ${msg.avatarBg}`}>
                          {msg.sender.charAt(0)}
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
                    ))}
                  </div>
                </div>

                <PagesButton className="w-full font-extrabold text-xs rounded-lg flex items-center justify-center gap-2 transition duration-150 cursor-pointer btn-messages-go">
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

                {/* Roles Selection */}
                <div className="edit-profile-field-group">
                  <label>Roles</label>
                  <div className="edit-profile-role-chips">
                    {["Actor", "Model", "Singer", "Dancer", "Director", "Producer", "Other"].map((r) => {
                      const isSelected = tempProfile.roles.includes(r);
                      return (
                        <PagesButton
                          key={r}
                          type="button"
                          className={`edit-profile-role-chip ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            const newRoles = isSelected
                              ? tempProfile.roles.filter((role) => role !== r)
                              : [...tempProfile.roles, r];
                            setTempProfile({ ...tempProfile, roles: newRoles });
                          }}
                        >
                          {r}
                        </PagesButton>
                      );
                    })}
                  </div>
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

    </AppLayout>
  );
}



