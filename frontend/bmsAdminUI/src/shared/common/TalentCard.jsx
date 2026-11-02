import React from "react";
import {
  Bookmark,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Eye,
  Send
} from "lucide-react";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

export default function TalentCard({
  talent,
  isShortlisted = false,
  onToggleShortlist,
  onViewDetails,
  onPrimaryAction,
  primaryActionText = "Direct Invite",
  primaryActionIcon,
  secondaryActionText = "Lookbook",
  secondaryActionIcon,
  theme = "pink",
  className = ""
}) {
  if (!talent) return null;

  const primaryBtnTheme = {
    pink: "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700",
    purple: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
  };

  const craftBadgeTheme = {
    pink: "text-purple-700",
    purple: "text-pink-700"
  };

  const ratingValue = typeof talent.rating === "number" ? talent.rating.toFixed(1) : talent.rating || "4.8";
  const reviewsCount = talent.reviewsCount ?? talent.reviews ?? 12;

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition group flex flex-col justify-between ${className}`}
    >
      {/* Photo & Top Badge Overlay */}
      <div className="relative h-64 bg-slate-100 overflow-hidden">
        <img
          src={talent.image || FALLBACK_AVATAR}
          alt={talent.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_AVATAR;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-black uppercase shadow-xs ${craftBadgeTheme[theme] || craftBadgeTheme.pink}`}>
            {talent.craft || "Model"}
          </span>

          {onToggleShortlist && (
            <button
              type="button"
              onClick={() => onToggleShortlist(talent.id)}
              className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
                isShortlisted
                  ? "bg-amber-400 text-white shadow-md shadow-amber-400/40"
                  : "bg-white/80 hover:bg-white text-slate-700"
              }`}
              title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
            >
              <Bookmark size={14} fill={isShortlisted ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {/* Shoot Availability Pill */}
        {talent.availability && (
          <div className="absolute top-12 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold backdrop-blur-xs">
              <Clock size={10} /> {talent.availability}
            </span>
          </div>
        )}

        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-black text-white m-0">{talent.name}</h3>
            <CheckCircle2 size={15} className="text-pink-400 shrink-0" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-200 mt-0.5">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-pink-400" /> {talent.location || "Mumbai"}
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Star size={11} fill="currentColor" /> {ratingValue} ({reviewsCount})
            </span>
          </div>
        </div>
      </div>

      {/* Content & Action Buttons */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-1">
              {talent.title || talent.craft}
            </p>
            {talent.dailyRate && (
              <span className="text-xs font-black text-purple-600 shrink-0 ml-2">
                {talent.dailyRate}
              </span>
            )}
          </div>

          {talent.bio && (
            <p className="text-[11.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {talent.bio}
            </p>
          )}

          {Array.isArray(talent.tags) && talent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {talent.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(talent)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              {secondaryActionIcon || <Eye size={13} />} {secondaryActionText}
            </button>
          )}

          {onPrimaryAction && (
            <button
              type="button"
              onClick={() => onPrimaryAction(talent)}
              className={`px-3 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                primaryBtnTheme[theme] || primaryBtnTheme.pink
              } ${!onViewDetails ? "col-span-2" : ""}`}
            >
              {primaryActionIcon || <Send size={12} />} {primaryActionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
