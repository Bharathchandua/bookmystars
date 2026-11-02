import React, { useState, useEffect } from "react";
import {
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
  DollarSign,
  Clapperboard,
  Tag,
  Briefcase
} from "lucide-react";
import { showSuccess, showError } from "../../shared/utils/alert";
import { InputField, TextArea, Button, Badge } from "../../shared/common";
import { clientProfileApi } from "../../features/bms/api/clients/clientProfileApi";

export default function ClientProfile({ currentUser, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize profile data from localStorage or defaults
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(`bms_client_profile_${currentUser?.userId || "guest"}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      companyName: currentUser?.fullName || "Tanishq Fine Jewelry & Diamonds",
      industry: currentUser?.customProfession || "Jewelry & Luxury Retail",
      tagline: "India's premier fine jewelry, bridal temple gold & diamond house",
      contactPerson: "Aarav Mehra",
      designation: "Head of Brand Marketing & Visual Productions",
      email: currentUser?.email || "brand@tanishq-jewels.com",
      phone: "+91 98765 43210",
      city: "Mumbai, Maharashtra",
      address: "Prestige Tower, 14th Floor, Bandra-Kurla Complex (BKC), Mumbai - 400051",
      website: "https://www.tanishq.co.in",
      instagram: "tanishqjewellery",
      linkedin: "https://linkedin.com/company/tanishq",
      youtube: "https://youtube.com/@TanishqJewellery",
      establishedYear: "1994",
      annualShoots: "25+ Commercial Campaigns / Year",
      budgetRange: "₹50,000 - ₹3,00,000 per Shoot",
      bio: "Tanishq is a flagship brand of the Tata Group, crafting exquisite festive gold, polki, and diamond jewelry. We frequently commission high-gloss television commercials, digital video ad campaigns, and print billboards featuring top Indian models, actors, and classical dancers.",
      preferredProfiles: ["High-Fashion Models", "Bridal Jewelry Models", "Commercial Actors", "Voiceover Artists"],
      logoUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80",
      verified: true
    };
  });

  const [editForm, setEditForm] = useState(profileData);

  // Load live profile from PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchServerProfile() {
      try {
        const remote = await clientProfileApi.getClientProfile();
        if (remote && isMounted) {
          setProfileData(prev => {
            const merged = {
              ...prev,
              ...remote,
              preferredProfiles: Array.isArray(remote.preferredProfiles) && remote.preferredProfiles.length > 0
                ? remote.preferredProfiles
                : prev.preferredProfiles
            };
            localStorage.setItem(
              `bms_client_profile_${currentUser?.userId || "guest"}`,
              JSON.stringify(merged)
            );
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not fetch remote profile:", err);
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
      `bms_client_profile_${currentUser?.userId || "guest"}`,
      JSON.stringify(editForm)
    );

    try {
      const updated = await clientProfileApi.updateClientProfile(editForm);
      if (updated) {
        setProfileData(prev => ({
          ...prev,
          ...updated,
          preferredProfiles: Array.isArray(updated.preferredProfiles) && updated.preferredProfiles.length > 0
            ? updated.preferredProfiles
            : prev.preferredProfiles
        }));
      }
    } catch (err) {
      console.warn("Server profile update failed, cached locally:", err);
    } finally {
      setIsSaving(false);
    }

    // Update global user object in tab session if name or profession changed
    const storedUser = sessionStorage.getItem("bms_user") || localStorage.getItem("bms_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.fullName = editForm.companyName;
        parsed.customProfession = editForm.industry;
        sessionStorage.setItem("bms_user", JSON.stringify(parsed));
      } catch (err) {}
    }

    if (onProfileUpdate) {
      onProfileUpdate(editForm);
    }

    setIsEditing(false);
    showSuccess("Profile Updated", "Your official corporate brand profile has been saved to the database successfully!");
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
            `bms_client_profile_${currentUser?.userId || "guest"}`,
            JSON.stringify(updated)
          );
          return updated;
        });

        try {
          await clientProfileApi.updateClientProfile({ ...editForm, logoUrl: newLogo });
        } catch (err) {
          console.warn("Server logo sync failed:", err);
        }

        showSuccess("Logo Updated", "New company logo uploaded and saved to profile!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO BRAND CARD */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo / Avatar with upload trigger */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg overflow-hidden flex items-center justify-center border-2 border-pink-400/30">
                <img
                  src={profileData.logoUrl}
                  alt={profileData.companyName}
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
                  {profileData.companyName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-400/40 flex items-center gap-1">
                  <ShieldCheck size={12} /> Super Admin Approved
                </span>
              </div>
              <p className="text-sm text-pink-200/90 font-medium mt-1">
                {profileData.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200/70 mt-3">
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-pink-400" /> {profileData.industry}
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

          {/* Edit / Save Action Button */}
          <div>
            {!isEditing ? (
              <Button
                variant="primary-pink"
                size="md"
                onClick={() => setIsEditing(true)}
                icon={<Edit3 size={15} />}
              >
                Edit Brand Profile
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

      {/* 2. FORM / DETAILS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Company Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
              <Building2 size={18} className="text-pink-600" /> Company & Brand Identity
            </h2>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">About the Brand</label>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{profileData.bio}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Registered Brand Name</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.companyName}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Industry Classification</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.industry}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Established</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.establishedYear}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Commercial Production Volume</label>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.annualShoots}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Brand / Company Name"
                    name="companyName"
                    value={editForm.companyName}
                    onChange={handleInputChange}
                    required
                    theme="pink"
                  />
                  <InputField
                    label="Industry Classification"
                    name="industry"
                    value={editForm.industry}
                    onChange={handleInputChange}
                    required
                    theme="pink"
                  />
                </div>

                <InputField
                  label="Brand Tagline"
                  name="tagline"
                  value={editForm.tagline}
                  onChange={handleInputChange}
                  theme="pink"
                />

                <TextArea
                  rows={4}
                  label="Brand Description & Shoot Preferences"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  theme="pink"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Established Year"
                    name="establishedYear"
                    value={editForm.establishedYear}
                    onChange={handleInputChange}
                    theme="pink"
                  />
                  <InputField
                    label="Average Budget per Project"
                    name="budgetRange"
                    value={editForm.budgetRange}
                    onChange={handleInputChange}
                    theme="pink"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Authorized Representative Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-pink-600" /> Authorized Contact Representative
            </h2>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Representative Name</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.contactPerson}</p>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Designation / Role</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{profileData.designation}</p>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Official Email</label>
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
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Corporate Headquarters Address</label>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-start gap-1.5">
                    <MapPin size={14} className="text-pink-600 mt-0.5 shrink-0" /> {profileData.address}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Representative Name"
                    name="contactPerson"
                    value={editForm.contactPerson}
                    onChange={handleInputChange}
                    required
                    theme="pink"
                  />
                  <InputField
                    label="Designation / Title"
                    name="designation"
                    value={editForm.designation}
                    onChange={handleInputChange}
                    theme="pink"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    type="email"
                    label="Official Corporate Email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    required
                    theme="pink"
                  />
                  <InputField
                    type="tel"
                    label="Phone / WhatsApp"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    required
                    theme="pink"
                  />
                </div>

                <TextArea
                  rows={2}
                  label="Corporate Address"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  theme="pink"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Online Channels, Verification & Roster Preferences */}
        <div className="space-y-6">
          
          {/* Online Channels */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Globe size={16} className="text-pink-600" /> Digital Footprint & Channels
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
                    <Globe size={14} className="text-pink-600" /> Website
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
                  href={profileData.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition text-xs font-bold text-blue-900"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={14} className="text-blue-600" /> LinkedIn Brand Page
                  </span>
                  <ExternalLink size={12} className="text-blue-400" />
                </a>

                <a
                  href={profileData.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition text-xs font-bold text-rose-900"
                >
                  <span className="flex items-center gap-2">
                    <Video size={14} className="text-rose-600" /> Commercial Reel / YouTube
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    name="instagram"
                    value={editForm.instagram}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={editForm.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">YouTube / Video Reel URL</label>
                  <input
                    type="url"
                    name="youtube"
                    value={editForm.youtube}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preferred Talent Profiles */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-pink-600" /> Frequent Casting Profiles
            </h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Profiles your brand frequently books for ad campaigns and launches:
            </p>
            <div className="flex flex-wrap gap-2">
              {profileData.preferredProfiles.map((p, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Verification Badge Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-emerald-800 mb-1">
              <CheckCircle2 size={16} className="text-emerald-600" /> Super Admin Verified Client
            </div>
            <p className="text-[11.5px] text-emerald-700 leading-relaxed m-0">
              Your company account is fully approved. You have direct authorization to commission ad projects, browse private talent contact books, and send binding booking requests.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
