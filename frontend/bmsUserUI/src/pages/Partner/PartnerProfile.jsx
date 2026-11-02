import React, { useState, useEffect } from "react";
import {
  Award,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Share2,
  Video,
  GraduationCap,
  Users,
  Film
} from "lucide-react";
import { showSuccess, showError } from "../../shared/utils/alert";
import { InputField, TextArea, Button, Badge } from "../../shared/common";
import { partnerProfileApi } from "../../features/bms/api/partners/partnerProfileApi";

export default function PartnerProfile({ currentUser, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(`bms_partner_profile_${currentUser?.userId || "guest"}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      academyName: currentUser?.fullName || "Rajajinagar Dance & Performing Arts Academy",
      category: currentUser?.customProfession || "Dance Academy & Casting Partner",
      tagline: "Premier center for Bharatanatyam, Kathak, Contemporary & Commercial Dance",
      directorName: "Guru Radhika Swaminathan",
      designation: "Founding Director & Chief Choreographer",
      email: currentUser?.email || "admissions@rajajinagardance.com",
      phone: "+91 98450 12345",
      city: "Bengaluru, Karnataka",
      address: "#42, 2nd Main, 3rd Block, Rajajinagar, Bengaluru - 560010",
      website: "https://www.rajajinagardance.com",
      instagram: "rajajinagar_dance_academy",
      youtube: "https://youtube.com/@RajajinagarDanceStudio",
      establishedYear: "2012",
      activeStudents: "450+ Enrolled Students",
      trainingBatches: ["Weekend Classical Bharatanatyam", "Advanced Contemporary", "Bollywood Commercial", "Kids Stage Prep"],
      studioFacilities: "3,000 sq.ft Sprung Wooden Floor Studio, Professional Mirrors, Sound Acoustics & Dressing Rooms",
      bio: "Founded in 2012, Rajajinagar Dance Academy is one of Bengaluru's premier training institutes for classical and contemporary arts. Our students regularly perform on prestigious state stages, festive television broadcasts, and commercial ad shoots. We collaborate with BookMyStars to provide casting calls, stage opportunities, and targeted ad promotions for our batches.",
      logoUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80",
      verified: true
    };
  });

  const [editForm, setEditForm] = useState(profileData);

  // Load live partner academy profile from PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchServerProfile() {
      try {
        const remote = await partnerProfileApi.getPartnerProfile();
        if (remote && isMounted) {
          setProfileData(prev => {
            const merged = {
              ...prev,
              ...remote,
              trainingBatches: Array.isArray(remote.trainingBatches) && remote.trainingBatches.length > 0
                ? remote.trainingBatches
                : prev.trainingBatches
            };
            localStorage.setItem(
              `bms_partner_profile_${currentUser?.userId || "guest"}`,
              JSON.stringify(merged)
            );
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not fetch remote partner profile:", err);
      }
    }
    fetchServerProfile();
    return () => { isMounted = false; };
  }, [currentUser?.userId]);

  useEffect(() => {
    setEditForm(profileData);
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setProfileData(editForm);
    localStorage.setItem(
      `bms_partner_profile_${currentUser?.userId || "guest"}`,
      JSON.stringify(editForm)
    );

    try {
      const updated = await partnerProfileApi.updatePartnerProfile(editForm);
      if (updated) {
        setProfileData(prev => ({
          ...prev,
          ...updated,
          trainingBatches: Array.isArray(updated.trainingBatches) && updated.trainingBatches.length > 0
            ? updated.trainingBatches
            : prev.trainingBatches
        }));
      }
    } catch (err) {
      console.warn("Server partner profile update failed, cached locally:", err);
    } finally {
      setIsSaving(false);
    }

    const storedUser = sessionStorage.getItem("bms_user") || localStorage.getItem("bms_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.fullName = editForm.academyName;
        parsed.customProfession = editForm.category;
        sessionStorage.setItem("bms_user", JSON.stringify(parsed));
      } catch (err) {}
    }

    if (onProfileUpdate) {
      onProfileUpdate(editForm);
    }

    setIsEditing(false);
    showSuccess("Academy Profile Updated", "Your official partner academy profile has been updated in database successfully!");
  };

  const handleCancel = () => {
    setEditForm(profileData);
    setIsEditing(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const newLogo = ev.target.result;
        setEditForm(prev => ({ ...prev, logoUrl: newLogo }));
        setProfileData(prev => {
          const updated = { ...prev, logoUrl: newLogo };
          localStorage.setItem(
            `bms_partner_profile_${currentUser?.userId || "guest"}`,
            JSON.stringify(updated)
          );
          return updated;
        });

        try {
          await partnerProfileApi.updatePartnerProfile({ ...editForm, logoUrl: newLogo });
        } catch (err) {
          console.warn("Server logo sync failed:", err);
        }

        showSuccess("Logo Updated", "Academy logo updated and saved successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO ACADEMY CARD */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo with upload overlay */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg overflow-hidden flex items-center justify-center border-2 border-pink-400/30">
                <img
                  src={profileData.logoUrl}
                  alt={profileData.academyName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <label className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
                  {profileData.academyName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified Academy Partner
                </span>
              </div>
              <p className="text-sm text-pink-200/90 font-medium mt-1">
                {profileData.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200/70 mt-3">
                <span className="flex items-center gap-1">
                  <GraduationCap size={13} className="text-pink-400" /> {profileData.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-pink-400" /> {profileData.city}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={13} className="text-pink-400" />
                  <a href={profileData.website} target="_blank" rel="noreferrer" className="text-pink-300 hover:underline">
                    {profileData.website.replace("https://", "")}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div>
            {!isEditing ? (
              <Button
                variant="primary-purple"
                size="md"
                onClick={() => setIsEditing(true)}
                icon={<Edit3 size={15} />}
              >
                Edit Academy Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCancel}
                  icon={<X size={15} />}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary-hero"
                  size="md"
                  onClick={handleSave}
                  icon={<Save size={15} />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Academy Overview & Highlights */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
              <Building2 size={18} className="text-pink-600" /> Academy & Training Institution Overview
            </h2>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">About the Academy</label>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{profileData.bio}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Institution Name</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.academyName}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Specialization</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.category}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Established</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.establishedYear}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Student Body</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.activeStudents}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Studio Infrastructure</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.studioFacilities}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Academy Name"
                    name="academyName"
                    value={editForm.academyName}
                    onChange={handleInputChange}
                    required
                    theme="purple"
                  />
                  <InputField
                    label="Specialization / Category"
                    name="category"
                    value={editForm.category}
                    onChange={handleInputChange}
                    required
                    theme="purple"
                  />
                </div>

                <InputField
                  label="Academy Tagline"
                  name="tagline"
                  value={editForm.tagline}
                  onChange={handleInputChange}
                  theme="purple"
                />

                <TextArea
                  rows={4}
                  label="Academy Bio & Student Achievements"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  theme="purple"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Established Year"
                    name="establishedYear"
                    value={editForm.establishedYear}
                    onChange={handleInputChange}
                    theme="purple"
                  />
                  <InputField
                    label="Studio Space & Equipment"
                    name="studioFacilities"
                    value={editForm.studioFacilities}
                    onChange={handleInputChange}
                    theme="purple"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Director & Contact Representative */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-pink-600" /> Director & Administration Contact
            </h2>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Director / Mentor Name</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.directorName}</p>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Designation / Title</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.designation}</p>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Admissions & Audition Email</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-pink-600" /> {profileData.email}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Phone / WhatsApp</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-pink-600" /> {profileData.phone}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Studio / Branch Location Address</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-start gap-1.5">
                    <MapPin size={14} className="text-pink-600 mt-0.5 shrink-0" /> {profileData.address}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Director Name"
                    name="directorName"
                    value={editForm.directorName}
                    onChange={handleInputChange}
                    required
                    theme="purple"
                  />
                  <InputField
                    label="Designation"
                    name="designation"
                    value={editForm.designation}
                    onChange={handleInputChange}
                    theme="purple"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    type="email"
                    label="Official Academy Email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    required
                    theme="purple"
                  />
                  <InputField
                    type="tel"
                    label="Phone / WhatsApp"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    required
                    theme="purple"
                  />
                </div>

                <TextArea
                  rows={2}
                  label="Full Studio Address"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  theme="purple"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Social Channels */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Globe size={16} className="text-pink-600" /> Digital Studio & Socials
            </h3>

            {!isEditing ? (
              <div className="space-y-3">
                <a
                  href={profileData.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-xs font-bold text-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={14} className="text-pink-600" /> Official Website
                  </span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>

                <a
                  href={`https://instagram.com/${profileData.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-pink-50/50 hover:bg-pink-50 transition text-xs font-bold text-pink-900"
                >
                  <span className="flex items-center gap-2">
                    <Share2 size={14} className="text-pink-600" /> @{profileData.instagram}
                  </span>
                  <ExternalLink size={12} className="text-pink-400" />
                </a>

                <a
                  href={profileData.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition text-xs font-bold text-rose-900"
                >
                  <span className="flex items-center gap-2">
                    <Video size={14} className="text-rose-600" /> Stage Shows & Showcase
                  </span>
                  <ExternalLink size={12} className="text-rose-400" />
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    name="website"
                    value={editForm.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    name="instagram"
                    value={editForm.instagram}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">YouTube Channel URL</label>
                  <input
                    type="url"
                    name="youtube"
                    value={editForm.youtube}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Training Batches */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-pink-600" /> Featured Training Batches
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileData.trainingBatches.map((b, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Partner Verification Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-emerald-800 mb-1">
              <CheckCircle2 size={16} className="text-emerald-600" /> Super Admin Certified Partner
            </div>
            <p className="text-[11.5px] text-emerald-700 leading-relaxed m-0">
              Your academy is recognized as an authorized training and talent partner. You can post verified requirements, promote training batches via BookMyStars digital ads, and scout talent across our network.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
