import React from "react";
import { ExternalLink, Eye, EyeOff, ShieldAlert } from "lucide-react";
import {
  WebsiteIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
  FacebookIcon,
  TwitterXIcon,
  WhatsAppIcon,
  buildSocialUrl,
  formatSocialDisplay
} from "./SocialBrandIcons";

const CHANNELS = [
  { key: "website", label: "Official Website", placeholder: "https://yourbrand.com", icon: WebsiteIcon, color: "text-sky-600", bg: "bg-sky-50/50 hover:bg-sky-50", border: "border-sky-200" },
  { key: "instagram", label: "Instagram", placeholder: "@your_handle or profile link", icon: InstagramIcon, color: "text-pink-600", bg: "bg-pink-50/50 hover:bg-pink-50", border: "border-pink-200" },
  { key: "linkedin", label: "LinkedIn Page", placeholder: "https://linkedin.com/company/...", icon: LinkedInIcon, color: "text-blue-700", bg: "bg-blue-50/50 hover:bg-blue-50", border: "border-blue-200" },
  { key: "youtube", label: "YouTube / Reel Channel", placeholder: "https://youtube.com/@channel", icon: YouTubeIcon, color: "text-rose-600", bg: "bg-rose-50/50 hover:bg-rose-50", border: "border-rose-200" },
  { key: "facebook", label: "Facebook Page", placeholder: "https://facebook.com/...", icon: FacebookIcon, color: "text-blue-600", bg: "bg-indigo-50/50 hover:bg-indigo-50", border: "border-indigo-200" },
  { key: "twitter", label: "X / Twitter", placeholder: "@handle or profile link", icon: TwitterXIcon, color: "text-slate-900", bg: "bg-slate-100/70 hover:bg-slate-100", border: "border-slate-300" },
  { key: "whatsapp", label: "WhatsApp Contact", placeholder: "+91 98765 43210 or wa.me link", icon: WhatsAppIcon, color: "text-emerald-600", bg: "bg-emerald-50/50 hover:bg-emerald-50", border: "border-emerald-200" }
];

export function parseVisibility(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export default function SocialChannelsSection({
  profileData = {},
  isEditing = false,
  editForm = {},
  onChange,
  onToggleVisibility,
  isAdmin = false,
  title = "Digital Footprint & Channels"
}) {
  const vis = parseVisibility(isEditing ? editForm.socialVisibility : profileData.socialVisibility);

  // Filter channels to display in read-only mode
  const activeChannels = CHANNELS.filter(ch => {
    const val = profileData[ch.key];
    const isVisible = vis[ch.key] !== false; // defaults to true
    if (isAdmin) return Boolean(val); // admin sees all filled channels
    return Boolean(val) && isVisible; // users only see allowed channels
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-2">
          <WebsiteIcon size={16} className="text-pink-600" />
          <span>{title}</span>
        </h3>
        {isAdmin && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Eye size={11} /> Admin Visibility Controls Active
          </span>
        )}
      </div>

      {!isEditing ? (
        /* ================= READ ONLY MODE ================= */
        activeChannels.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            No social channels currently public
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeChannels.map(ch => {
              const IconComp = ch.icon;
              const rawVal = profileData[ch.key];
              const url = buildSocialUrl(ch.key, rawVal);
              const display = formatSocialDisplay(ch.key, rawVal);
              const isHidden = vis[ch.key] === false;

              return (
                <a
                  key={ch.key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between p-3 rounded-xl border border-slate-200/70 transition-all ${ch.bg} group`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-6 h-6">
                      <IconComp size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {ch.label}
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {display}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isHidden && isAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <EyeOff size={10} /> Hidden from Users
                      </span>
                    )}
                    <ExternalLink size={13} className="text-slate-400 group-hover:text-slate-700 transition" />
                  </div>
                </a>
              );
            })}
          </div>
        )
      ) : (
        /* ================= EDIT MODE ================= */
        <div className="space-y-3.5">
          {CHANNELS.map(ch => {
            const IconComp = ch.icon;
            const currentVal = editForm[ch.key] || "";
            const isVisible = vis[ch.key] !== false;

            return (
              <div key={ch.key} className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5 m-0">
                    <IconComp size={15} />
                    <span>{ch.label}</span>
                  </label>

                  {/* Admin Visibility Toggle (Only visible in admin edit or if onToggleVisibility provided) */}
                  {isAdmin && onToggleVisibility && (
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(ch.key, !isVisible)}
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                        isVisible
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-slate-200 text-slate-600 border-slate-300"
                      }`}
                      title={isVisible ? "Visible to normal users" : "Hidden from normal users"}
                    >
                      {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{isVisible ? "Public (ON)" : "Hidden (OFF)"}</span>
                    </button>
                  )}
                </div>

                <input
                  type={ch.key === "website" ? "url" : "text"}
                  name={ch.key}
                  value={currentVal}
                  onChange={onChange}
                  placeholder={ch.placeholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-pink-600 focus:bg-white bg-white/80 outline-none transition"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
