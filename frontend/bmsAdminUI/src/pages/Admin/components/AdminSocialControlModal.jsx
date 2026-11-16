import React, { useState, useEffect } from "react";
import { X, Save, RefreshCw, Eye, EyeOff, Check, ShieldCheck, Globe } from "lucide-react";
import apiClient from "../../../shared/services/axiosConfig";
import { showSuccess, showError } from "../../../shared/utils/alert";
import {
  WebsiteIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
  FacebookIcon,
  TwitterXIcon,
  WhatsAppIcon
} from "../../../components/common/SocialBrandIcons";

const CHANNELS = [
  { key: "website", label: "Official Website", placeholder: "https://yourbrand.com", icon: WebsiteIcon },
  { key: "instagram", label: "Instagram", placeholder: "@your_handle or profile URL", icon: InstagramIcon },
  { key: "linkedin", label: "LinkedIn Company / Page", placeholder: "https://linkedin.com/company/...", icon: LinkedInIcon },
  { key: "youtube", label: "YouTube / Reel Channel", placeholder: "https://youtube.com/@channel", icon: YouTubeIcon },
  { key: "facebook", label: "Facebook Page", placeholder: "https://facebook.com/...", icon: FacebookIcon },
  { key: "twitter", label: "X / Twitter", placeholder: "@handle or profile URL", icon: TwitterXIcon },
  { key: "whatsapp", label: "WhatsApp Direct", placeholder: "+91 98765 43210 or wa.me link", icon: WhatsAppIcon }
];

export default function AdminSocialControlModal({
  isOpen,
  onClose,
  entityType = "CLIENT", // "CLIENT" | "PARTNER"
  entity = null,
  onUpdated
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    website: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    facebook: "",
    twitter: "",
    whatsapp: "",
    socialVisibility: {}
  });

  const entityName = entity?.companyName || entity?.businessName || entity?.fullName || "Account";
  const endpointBase = entityType === "CLIENT" ? "/admin/clients" : "/admin/partners";

  useEffect(() => {
    if (!isOpen || !entity?.id) return;
    let isMounted = true;
    setLoading(true);

    async function fetchProfile() {
      try {
        const res = await apiClient.get(`${endpointBase}/${entity.id}/profile`);
        if (isMounted && res.data) {
          let vis = {};
          if (res.data.socialVisibility) {
            try {
              vis = typeof res.data.socialVisibility === "object"
                ? res.data.socialVisibility
                : JSON.parse(res.data.socialVisibility);
            } catch (e) {
              vis = {};
            }
          }
          setFormData({
            ...res.data,
            website: res.data.website || entity.websiteUrl || "",
            instagram: res.data.instagram || "",
            linkedin: res.data.linkedin || "",
            youtube: res.data.youtube || "",
            facebook: res.data.facebook || "",
            twitter: res.data.twitter || "",
            whatsapp: res.data.whatsapp || entity.mobileNumber || "",
            socialVisibility: vis || {}
          });
        }
      } catch (err) {
        console.warn("Could not load full profile from server, using entity fallbacks:", err);
        setFormData({
          website: entity.websiteUrl || "",
          instagram: "",
          linkedin: "",
          youtube: "",
          facebook: "",
          twitter: "",
          whatsapp: entity.mobileNumber || "",
          socialVisibility: {}
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();
    return () => { isMounted = false; };
  }, [isOpen, entity, endpointBase]);

  if (!isOpen || !entity) return null;

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleVisibility = (key) => {
    setFormData(prev => {
      const currentVis = prev.socialVisibility || {};
      const isCurrentlyVisible = currentVis[key] !== false; // defaults to true
      return {
        ...prev,
        socialVisibility: {
          ...currentVis,
          [key]: !isCurrentlyVisible
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        socialVisibility: JSON.stringify(formData.socialVisibility || {})
      };
      const res = await apiClient.put(`${endpointBase}/${entity.id}/profile`, payload);
      showSuccess(
        "Social Channels & Visibility Updated",
        `Successfully updated social footprint and admin controls for ${entityName}.`
      );
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      console.error("Failed to save social controls:", err);
      showError("Update Failed", "Could not save social controls. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 m-0 tracking-tight">
                  Social Channels & Visibility Controls
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                  {entityType} Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Managing verified footprint for <strong className="text-slate-800">{entityName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw size={24} className="animate-spin text-pink-600" />
              <span className="text-xs font-bold">Loading live profile...</span>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Admin Privacy & Moderation Rule:</strong> You can edit any handle and toggle whether each social channel appears publicly on user profiles. Channels set to <em>"Hidden from Users"</em> will only be visible within this Admin Console.
                </div>
              </div>

              <div className="space-y-3">
                {CHANNELS.map(ch => {
                  const IconComp = ch.icon;
                  const val = formData[ch.key] || "";
                  const isVisible = (formData.socialVisibility || {})[ch.key] !== false;

                  return (
                    <div
                      key={ch.key}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                            <IconComp size={16} />
                          </div>
                          <span className="text-xs font-extrabold text-slate-800">
                            {ch.label}
                          </span>
                        </div>

                        {/* Visibility Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(ch.key)}
                          className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer border ${
                            isVisible
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {isVisible ? <Eye size={12} className="text-emerald-600" /> : <EyeOff size={12} className="text-slate-400" />}
                          <span>{isVisible ? "Public (Visible)" : "Hidden from Users"}</span>
                        </button>
                      </div>

                      <input
                        type={ch.key === "website" ? "url" : "text"}
                        value={val}
                        onChange={(e) => handleInputChange(ch.key, e.target.value)}
                        placeholder={ch.placeholder}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-pink-600 outline-none bg-slate-50/60 focus:bg-white transition"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-black shadow-md shadow-pink-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? "Saving Changes..." : "Save Social Controls"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
