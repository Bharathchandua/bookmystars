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
import LocationMiniMap from "../../components/common/LocationMiniMap";
import SocialChannelsSection from "../../components/common/SocialChannelsSection";

export default function ClientProfile({ currentUser, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Clean up any deprecated bloated localStorage keys on load
  useEffect(() => {
    try {
      if (currentUser?.userId) {
        localStorage.removeItem(`bms_client_profile_${currentUser.userId}`);
      }
      localStorage.removeItem("bms_client_profile_guest");
    } catch (_) {}
  }, [currentUser?.userId]);

  const defaultProfile = {
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
    facebook: "https://facebook.com/Tanishq",
    twitter: "@TanishqJewellery",
    whatsapp: "+91 98765 43210",
    socialVisibility: {},
    establishedYear: "1994",
    annualShoots: "25+ Commercial Campaigns / Year",
    budgetRange: "₹50,000 - ₹3,00,000 per Shoot",
    bio: "Tanishq is a flagship brand of the Tata Group, crafting exquisite festive gold, polki, and diamond jewelry. We frequently commission high-gloss television commercials, digital video ad campaigns, and print billboards featuring top Indian models, actors, and classical dancers.",
    preferredProfiles: ["High-Fashion Models", "Bridal Jewelry Models", "Commercial Actors", "Voiceover Artists"],
    logoUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80",
    verified: true
  };

  const [profileData, setProfileData] = useState(defaultProfile);
  const [editForm, setEditForm] = useState(defaultProfile);

  // Load live profile directly from PostgreSQL database on mount
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
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not fetch remote client profile from database:", err);
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

    try {
      const updated = await clientProfileApi.updateClientProfile(editForm);
      if (updated) {
        const merged = {
          ...editForm,
          ...updated,
          preferredProfiles: Array.isArray(updated.preferredProfiles) && updated.preferredProfiles.length > 0
            ? updated.preferredProfiles
            : editForm.preferredProfiles
        };
        setProfileData(merged);
        setEditForm(merged);
        if (onProfileUpdate) {
          onProfileUpdate(merged);
        }
        showSuccess("Profile Updated", "Your official corporate brand profile has been saved to the database successfully!");
      }
    } catch (err) {
      console.warn("Server profile update failed:", err);
      showError("Update Failed", err.response?.data?.message || err.message || "Failed to save profile to database.");
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }

    const storedUser = sessionStorage.getItem("bms_user") || localStorage.getItem("bms_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.fullName = editForm.companyName;
        parsed.customProfession = editForm.industry;
        sessionStorage.setItem("bms_user", JSON.stringify(parsed));
      } catch (err) {}
    }
  };

  const handleCancel = () => {
    setEditForm(profileData);
    setIsEditing(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate local preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, logoUrl: previewUrl }));
    setEditForm(prev => ({ ...prev, logoUrl: previewUrl }));

    try {
      const updated = await clientProfileApi.uploadClientLogo(file);
      if (updated && updated.logoUrl) {
        const finalUrl = updated.logoUrl.includes("?")
          ? updated.logoUrl
          : `${updated.logoUrl}?t=${Date.now()}`;
        setProfileData(prev => ({ ...prev, ...updated, logoUrl: finalUrl }));
        setEditForm(prev => ({ ...prev, ...updated, logoUrl: finalUrl }));
        if (onProfileUpdate) onProfileUpdate({ ...updated, logoUrl: finalUrl });
        showSuccess("Logo Updated", "Company logo uploaded and saved to database successfully!");
      }
    } catch (err) {
      console.warn("Multipart logo upload failed, trying base64 fallback:", err);
      try {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64Logo = ev.target.result;
          const updated = await clientProfileApi.updateClientProfile({ ...editForm, logoUrl: base64Logo });
          if (updated && updated.logoUrl) {
            const finalUrl = updated.logoUrl.includes("?")
              ? updated.logoUrl
              : `${updated.logoUrl}?t=${Date.now()}`;
            setProfileData(prev => ({ ...prev, ...updated, logoUrl: finalUrl }));
            setEditForm(prev => ({ ...prev, ...updated, logoUrl: finalUrl }));
            if (onProfileUpdate) onProfileUpdate({ ...updated, logoUrl: finalUrl });
            showSuccess("Logo Updated", "Company logo saved to database successfully!");
          }
        };
        reader.readAsDataURL(file);
      } catch (fallbackErr) {
        showError("Upload Failed", err.response?.data?.message || err.message || "Failed to save logo to database.");
      }
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
                  <LocationMiniMap
                    address={profileData.address}
                    locationName={profileData.companyName || "Corporate Office"}
                    theme="pink"
                  />
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
          
          {/* Social Channels with Authentic Brand Icons & Handles */}
          <SocialChannelsSection
            profileData={profileData}
            isEditing={isEditing}
            editForm={editForm}
            onChange={handleInputChange}
            title="Digital Footprint & Channels"
          />

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
