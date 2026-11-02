import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, RotateCcw, Sparkles, ChevronRight, Upload, Check, X, Info } from "lucide-react";
import { showSuccess, showWarning } from "../../shared/utils/alert";

// Default industry/academy banner images
export const DEFAULT_BANNERS = {
  // Partner Category Banners
  DANCE: "/banners/banner_dance_partner.png",
  ACTING: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85",
  MUSIC: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1800&q=85",
  MODELING: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85",

  // Client Industry Banners
  JEWELRY: "/banners/banner_client_jewelry.png?v=2",
  FASHION: "/banners/banner_client_jewelry.png?v=2",
  FILM_MEDIA: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1800&q=85",
  CORPORATE: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=85"
};

/**
 * Returns appropriate default banner URL based on portal type and category/industry string.
 */
export function getDefaultBanner(portalType, categoryOrIndustry = "") {
  const text = (categoryOrIndustry || "").toLowerCase();

  if (portalType === "CLIENT") {
    if (text.includes("jewel") || text.includes("luxury") || text.includes("diamond") || text.includes("gold") || text.includes("gem")) {
      return DEFAULT_BANNERS.JEWELRY;
    }
    if (text.includes("fashion") || text.includes("apparel") || text.includes("clothing") || text.includes("wear")) {
      return DEFAULT_BANNERS.FASHION;
    }
    if (text.includes("film") || text.includes("media") || text.includes("product") || text.includes("agency") || text.includes("ad")) {
      return DEFAULT_BANNERS.FILM_MEDIA;
    }
    if (text.includes("tech") || text.includes("software") || text.includes("corp") || text.includes("enterprise")) {
      return DEFAULT_BANNERS.CORPORATE;
    }
    // Default client is jewelry / luxury commercial
    return DEFAULT_BANNERS.JEWELRY;
  }

  // PARTNER Portal
  if (text.includes("dance") || text.includes("choreograph") || text.includes("kathak") || text.includes("bharatanatyam") || text.includes("ballet")) {
    return DEFAULT_BANNERS.DANCE;
  }
  if (text.includes("act") || text.includes("theatre") || text.includes("drama") || text.includes("film") || text.includes("cinema")) {
    return DEFAULT_BANNERS.ACTING;
  }
  if (text.includes("music") || text.includes("vocal") || text.includes("sing") || text.includes("instrument")) {
    return DEFAULT_BANNERS.MUSIC;
  }
  if (text.includes("model") || text.includes("pageant") || text.includes("runway") || text.includes("fashion")) {
    return DEFAULT_BANNERS.MODELING;
  }

  // Default partner is the dancer graphic asset
  return DEFAULT_BANNERS.DANCE;
}

export default function WorkspaceHeroBanner({
  portalType = "PARTNER", // "PARTNER" | "CLIENT"
  entityName = "Rajajinagar Dance & Performing Arts Academy",
  categoryOrIndustry = "Dance Academy",
  subtitle,
  primaryBtnText,
  secondaryBtnText,
  onPrimaryAction,
  onSecondaryAction,
  storageKey = "bms_workspace_banner",
  onOpenGuide
}) {
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  // Dynamic default button labels based on portal type
  const actualPrimaryBtnText = primaryBtnText || (portalType === "CLIENT" ? "+ Post Shoot Requirement" : "+ Post New Requirement");
  const actualSecondaryBtnText = secondaryBtnText || (portalType === "CLIENT" ? "View Brand Profile" : "View Academy Profile");
  
  // Calculate the default banner based on category or industry
  const defaultBannerUrl = getDefaultBanner(portalType, categoryOrIndustry);

  // Custom banner stored in localStorage
  const [customBanner, setCustomBanner] = useState(() => {
    return localStorage.getItem(storageKey) || null;
  });

  // Floating desk card dismiss state
  const deskStorageKey = `bms_dismiss_desk_${portalType.toLowerCase()}`;
  const [isDeskDismissed, setIsDeskDismissed] = useState(() => {
    return localStorage.getItem(deskStorageKey) === "true";
  });

  // Current active banner (custom overrides default, with automatic cache refresh for default jewelry asset)
  const activeBannerUrl = (customBanner && !customBanner.includes("banner_client_jewelry.png"))
    ? customBanner
    : defaultBannerUrl;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showWarning("Invalid Image Format", "Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showWarning("File Too Large", "Banner image is too large. Please select an image under 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result;
      if (base64Data) {
        setCustomBanner(base64Data);
        try {
          localStorage.setItem(storageKey, base64Data);
          showSuccess("Banner Updated", "Your custom banner photo has been saved successfully!");
        } catch (err) {
          console.warn("Could not save to localStorage (quota exceeded)", err);
          showSuccess("Banner Applied", "Banner preview updated for this session.");
        }
      }
    };
    reader.readAsDataURL(file);
    setShowMenu(false);
  };

  const handleResetToDefault = () => {
    localStorage.removeItem(storageKey);
    setCustomBanner(null);
    setShowMenu(false);
    showSuccess("Banner Reset", `Reset to default ${categoryOrIndustry} theme.`);
  };

  const handlePresetSelect = (url, name) => {
    setCustomBanner(url);
    try {
      localStorage.setItem(storageKey, url);
      showSuccess("Banner Applied", `Applied ${name} theme banner.`);
    } catch (e) {}
    setShowMenu(false);
  };

  const handleDismissDesk = () => {
    setIsDeskDismissed(true);
    localStorage.setItem(deskStorageKey, "true");
  };

  const handleRestoreDesk = () => {
    setIsDeskDismissed(false);
    localStorage.removeItem(deskStorageKey);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultSub = portalType === "PARTNER"
    ? "Manage your academy, post requirements, scout talented performers, and connect with opportunities on BookMyStars."
    : "Source top verified models, post urgent shoot briefs, and manage your commercial campaign requirements.";

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 bg-white group">
      
      {/* Dynamic Background Image Confined Strictly to the Right - Never Overlapping Left Text */}
      <div 
        className="absolute top-0 bottom-0 right-0 w-full sm:w-1/2 lg:w-5/12 overflow-hidden pointer-events-none select-none z-0 opacity-20 sm:opacity-100"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.5) 15%, rgba(0, 0, 0, 1) 40%)",
          maskImage: "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.5) 15%, rgba(0, 0, 0, 1) 40%)",
        }}
      >
        <img
          src={activeBannerUrl}
          alt="Workspace Banner"
          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            if (activeBannerUrl !== defaultBannerUrl) {
              setCustomBanner(null);
              localStorage.removeItem(storageKey);
            }
          }}
        />
        {/* Soft edge blend overlay */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: "linear-gradient(to right, #ffffff 0%, rgba(255, 255, 255, 0.2) 20%, transparent 60%)",
          }}
        />
      </div>

      {/* Main Hero Banner Content Layout */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6">
        
        {/* 1. TOP FULL-WIDTH HEADER ROW: Category Subtitle Pill on Left & Controls on Far Right */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="inline-flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full font-mono bg-pink-50 text-pink-700 border border-pink-200/90 shadow-2xs">
              {portalType === "PARTNER" ? "🎭 PARTNER ACADEMY HUB" : "👑 COMMERCIAL CLIENT DESK"}
            </span>
          </div>

          {/* Top Controls: Change Banner Action Bar & Studio Desk Restore Pill */}
          <div className="flex items-center gap-2 shrink-0" ref={menuRef}>
            {/* If studio desk is dismissed, show a neat pill to restore it */}
            {isDeskDismissed && (
              <button
                type="button"
                onClick={handleRestoreDesk}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-slate-700 text-[11px] font-bold shadow-xs backdrop-blur-md border border-white/60 transition cursor-pointer"
                title="Restore studio desk card"
              >
                <Sparkles size={11} className="text-amber-500" />
                <span>Studio Desk</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", color: "#1e293b" }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-800 text-[11px] font-bold shadow-xs backdrop-blur-md border border-slate-200/80 transition-all hover:scale-105 cursor-pointer"
                title="Change workspace banner image"
              >
                <Camera size={13} className="text-pink-600" />
                <span>Change Banner</span>
              </button>

              {/* Banner Options Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-48px)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 p-2 space-y-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-extrabold text-slate-900 m-0 text-xs">Banner Customization</p>
                    <p className="text-[11px] text-slate-500 m-0">Upload your own or choose a preset</p>
                  </div>

                  {/* Upload Custom File */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-pink-50 hover:text-pink-700 font-bold transition text-left cursor-pointer"
                  >
                    <Upload size={14} className="text-pink-600 shrink-0" />
                    <span>Upload from Device</span>
                  </button>

                  {/* Reset to Category Default */}
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition text-left cursor-pointer"
                  >
                    <RotateCcw size={14} className="text-slate-500 shrink-0" />
                    <span>Reset to {categoryOrIndustry} Default</span>
                  </button>

                  {/* Presets Submenu */}
                  <div className="pt-2 border-t border-slate-100 px-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                      Curated Presets
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pb-1">
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(DEFAULT_BANNERS.DANCE, "Dance Studio")}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition text-left truncate cursor-pointer"
                      >
                        <span>💃 Dance</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(DEFAULT_BANNERS.ACTING, "Film & Acting")}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition text-left truncate cursor-pointer"
                      >
                        <span>🎬 Acting</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(DEFAULT_BANNERS.JEWELRY, "Jewelry & Luxury")}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition text-left truncate cursor-pointer"
                      >
                        <span>💎 Jewelry</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(DEFAULT_BANNERS.FASHION, "Fashion & Apparel")}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition text-left truncate cursor-pointer"
                      >
                        <span>👗 Fashion</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* 2. HERO CONTENT ROW: Heading & Buttons on Left, Studio Desk Card on Right */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
          
          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <div className="max-w-xl space-y-3.5 w-full">
            
            {/* Welcome Heading */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
                Welcome back,
              </h1>
              <h2 
                className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight m-0 break-words text-pink-600"
                style={{
                  color: "#db2777",
                  background: "linear-gradient(135deg, #db2777 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "initial"
                }}
              >
                {entityName || (portalType === "CLIENT" ? "Tanishq Fine Jewelry" : "Partner Academy")} 👋
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg m-0 font-normal">
              {subtitle || defaultSub}
            </p>

            {/* Buttons: Primary + Secondary */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={onPrimaryAction}
                style={{
                  background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
                  backgroundColor: "#ec4899",
                  color: "#ffffff"
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/25 transition-all hover:opacity-95 hover:scale-[1.01] cursor-pointer w-full sm:w-auto text-center border-0"
              >
                <span style={{ color: "#ffffff", fontWeight: "800" }}>{actualPrimaryBtnText}</span>
              </button>

              <button
                type="button"
                onClick={onSecondaryAction}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a"
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm shadow-xs backdrop-blur-md transition-all hover:bg-slate-50 cursor-pointer w-full sm:w-auto text-center"
              >
                <span style={{ color: "#0f172a", fontWeight: "700" }}>{actualSecondaryBtnText}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Floating Desk Info Card (Matching Screenshot, with Dismiss Close 'X' Button) */}
          {!isDeskDismissed && (
            <div className="w-full lg:w-auto shrink-0 flex justify-end">
              <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-purple-100 max-w-xs w-full space-y-2 hover:shadow-md transition">
                {/* Close / Dismiss Button for the Guide Card */}
                <button
                  type="button"
                  onClick={handleDismissDesk}
                  className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition cursor-pointer"
                  title="Dismiss guide card"
                  aria-label="Close guide card"
                >
                  <X size={15} />
                </button>

                <div className="flex items-center gap-2 pr-6">
                  <span className="text-base">👑</span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 m-0">
                    {portalType === "PARTNER" ? "Your Partner Studio Desk" : "Your Client Studio Desk"}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed m-0 font-medium">
                  {portalType === "PARTNER"
                    ? "Official access to BookMyStars audition tools, batches and performer rosters."
                    : "Priority access to BookMyStars verified roster, custom casting & escrow guarantees."}
                </p>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="text-purple-600 hover:text-purple-800 text-xs font-bold flex items-center gap-1 transition pt-1 cursor-pointer"
                >
                  <span>View Guide</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
