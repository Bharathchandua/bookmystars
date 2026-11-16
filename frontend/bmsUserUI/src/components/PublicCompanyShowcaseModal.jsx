import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  ExternalLink,
  Sparkles,
  Play,
  Film,
  Camera,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Eye,
  MessageCircle,
  Briefcase
} from "lucide-react";
import {
  WebsiteIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
  FacebookIcon,
  TwitterXIcon,
  WhatsAppIcon
} from "./common/SocialBrandIcons";
import { getPublicCompanyProfile } from "../features/bms/api/showcase/showcaseApi";
import LocationMiniMap from "./common/LocationMiniMap";
import { onLiveSync } from "../shared/utils/liveSync";

export default function PublicCompanyShowcaseModal({
  isOpen,
  onClose,
  companyUserId,
  fallbackCompanyName = "Production Enterprise"
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SHOWCASE"); // SHOWCASE | OPPORTUNITIES
  const [mediaFilter, setMediaFilter] = useState("ALL"); // ALL | PHOTO | VIDEO
  const [activeMediaItem, setActiveMediaItem] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchDossier(showSpinner = true) {
      if (!companyUserId) {
        setProfile({
          companyName: fallbackCompanyName,
          bio: "Registered enterprise on BookMyStars. Opportunities and showcase works are managed through verified channels.",
          showcaseItems: [],
          activeOpportunities: []
        });
        setLoading(false);
        return;
      }

      if (showSpinner) {
        setLoading(true);
      }
      try {
        const data = await getPublicCompanyProfile(companyUserId);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.warn("Could not fetch full company profile:", err);
        if (isMounted && showSpinner) {
          setProfile({
            companyName: fallbackCompanyName,
            bio: "Registered enterprise on BookMyStars.",
            showcaseItems: [],
            activeOpportunities: []
          });
        }
      } finally {
        if (isMounted && showSpinner) setLoading(false);
      }
    }

    fetchDossier(true);

    const unsub = onLiveSync(
      ["showcase_reviewed", "showcase_updated", "bms_live_sync"],
      () => {
        fetchDossier(false);
      },
      { pollIntervalMs: 5000, triggerOnFocus: true }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, [isOpen, companyUserId, fallbackCompanyName]);

  if (!isOpen) return null;

  // Filter social channels by visibility if configured
  const getSocialVisibility = (channel) => {
    if (!profile?.socialVisibility) return true;
    try {
      const parsed = typeof profile.socialVisibility === "string" ? JSON.parse(profile.socialVisibility) : profile.socialVisibility;
      return parsed[channel] !== false;
    } catch {
      return true;
    }
  };

  const showcaseItems = profile?.showcaseItems || [];
  const filteredShowcase = showcaseItems.filter((i) => {
    if (mediaFilter === "ALL") return true;
    return i.mediaType === mediaFilter;
  });

  const photoCount = showcaseItems.filter((i) => i.mediaType === "PHOTO").length;
  const videoCount = showcaseItems.filter((i) => i.mediaType === "VIDEO").length;
  const activeOpps = profile?.activeOpportunities || [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header Hero Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo */}
            <div className="relative shrink-0">
              {profile?.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.companyName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-lg bg-slate-800"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  <Building2 size={36} />
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 border border-pink-500/30 text-pink-300">
                  <Sparkles size={11} />
                  <span>{profile?.entityType === "PARTNER" ? "Academy Partner" : "Commercial Client"}</span>
                </span>
                {profile?.verified !== false && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                    <CheckCircle2 size={11} />
                    <span>Verified Enterprise</span>
                  </span>
                )}
                {profile?.industry && (
                  <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                    {profile.industry}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                {profile?.companyName || fallbackCompanyName}
              </h2>

              {profile?.tagline && (
                <p className="text-xs text-pink-300 font-semibold italic">
                  "{profile.tagline}"
                </p>
              )}

              {profile?.address && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
                  <MapPin size={13} className="text-pink-400 shrink-0" />
                  <span className="truncate">{profile.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Icons Bar */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
            {profile?.website && getSocialVisibility("website") && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                <WebsiteIcon size={14} className="text-pink-400" />
                <span>Official Website</span>
                <ExternalLink size={10} className="text-slate-400" />
              </a>
            )}
            {profile?.instagram && getSocialVisibility("instagram") && (
              <a
                href={profile.instagram.startsWith("http") ? profile.instagram : `https://instagram.com/${profile.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold transition-colors"
              >
                <InstagramIcon size={14} />
                <span>Instagram</span>
              </a>
            )}
            {profile?.youtube && getSocialVisibility("youtube") && (
              <a
                href={profile.youtube.startsWith("http") ? profile.youtube : `https://youtube.com/${profile.youtube}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition-colors"
              >
                <YouTubeIcon size={14} />
                <span>YouTube</span>
              </a>
            )}
            {profile?.linkedin && getSocialVisibility("linkedin") && (
              <a
                href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/company/${profile.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold transition-colors"
              >
                <LinkedInIcon size={14} />
                <span>LinkedIn</span>
              </a>
            )}
            {profile?.facebook && getSocialVisibility("facebook") && (
              <a
                href={profile.facebook.startsWith("http") ? profile.facebook : `https://facebook.com/${profile.facebook}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold transition-colors"
              >
                <FacebookIcon size={14} />
                <span>Facebook</span>
              </a>
            )}
            {profile?.twitter && getSocialVisibility("twitter") && (
              <a
                href={profile.twitter.startsWith("http") ? profile.twitter : `https://x.com/${profile.twitter.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                <TwitterXIcon size={14} />
                <span>X / Twitter</span>
              </a>
            )}
            {profile?.whatsapp && getSocialVisibility("whatsapp") && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors"
              >
                <WhatsAppIcon size={14} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("SHOWCASE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "SHOWCASE"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Sparkles size={14} className={activeTab === "SHOWCASE" ? "text-pink-400" : ""} />
              <span>Showcase Works</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "SHOWCASE" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}>
                {showcaseItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("OPPORTUNITIES")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "OPPORTUNITIES"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Briefcase size={14} className={activeTab === "OPPORTUNITIES" ? "text-pink-400" : ""} />
              <span>Active Casting Calls</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "OPPORTUNITIES" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}>
                {activeOpps.length}
              </span>
            </button>
          </div>

          {/* Media Sub-filter if on Showcase tab */}
          {activeTab === "SHOWCASE" && showcaseItems.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "ALL", label: `All (${showcaseItems.length})` },
                { id: "PHOTO", label: `Photos (${photoCount})` },
                { id: "VIDEO", label: `Videos (${videoCount})` }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMediaFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mediaFilter === f.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw size={28} className="animate-spin text-pink-500" />
              <p className="text-sm font-semibold">Loading company portfolio...</p>
            </div>
          ) : activeTab === "SHOWCASE" ? (
            <div className="space-y-6">
              {/* Bio & Location Summary */}
              {profile?.bio && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                    About {profile.companyName}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Showcase Media Grid */}
              {filteredShowcase.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-base font-black text-slate-800 mb-1">
                    No Showcase Works Available Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    This company has not published any verified portfolio media yet.
                    All productions are vetted before public display.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredShowcase.map((item) => {
                    const isVideo = item.mediaType === "VIDEO";
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveMediaItem(item)}
                        className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                      >
                        {/* Media Container */}
                        <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
                          {isVideo ? (
                            <div className="w-full h-full flex items-center justify-center relative">
                              <video
                                src={item.mediaUrl}
                                preload="metadata"
                                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play size={20} className="ml-1 fill-white" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.mediaUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}

                          {/* Media Type Badge */}
                          <div className="absolute top-2.5 left-2.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-950/80 text-white backdrop-blur-md">
                              {isVideo ? <Film size={11} className="text-pink-400" /> : <Camera size={11} className="text-purple-400" />}
                              <span>{isVideo ? "Video Reel" : "Photo"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="p-3.5 flex flex-col justify-between flex-1 gap-1">
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-pink-600 transition-colors">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span>Verified Production</span>
                            <span className="text-pink-600 flex items-center gap-1">
                              <Eye size={11} />
                              <span>View Fullscreen</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Location Mini Map Section */}
              {profile?.address && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin size={14} className="text-pink-600" />
                    <span>Office / Studio Location</span>
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-700 font-semibold m-0">
                      {profile.address}
                    </p>
                    <LocationMiniMap
                      address={profile.address}
                      companyName={profile.companyName}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Opportunities Tab */
            <div className="space-y-4">
              {activeOpps.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Briefcase size={28} />
                  </div>
                  <h4 className="text-base font-black text-slate-800 mb-1">
                    No Active Casting Calls Right Now
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    This company currently has no active casting notices. Check back soon or bookmark their profile!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeOpps.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-100">
                            {opp.projectType || opp.postType || "Feature Film"}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ● Open
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                          {opp.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {opp.description || opp.requirements}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500 font-semibold">
                        <span>{opp.location || "Location TBD"}</span>
                        {opp.budget && (
                          <span className="text-slate-900 font-black">
                            ₹{Number(opp.budget).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fullscreen Lightbox / Video Modal */}
        {activeMediaItem && (
          <div
            onClick={() => setActiveMediaItem(null)}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setActiveMediaItem(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-pink-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center justify-center bg-black min-h-[300px] max-h-[75vh]">
                {activeMediaItem.mediaType === "VIDEO" ? (
                  <video
                    src={activeMediaItem.mediaUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[75vh] object-contain"
                  />
                ) : (
                  <img
                    src={activeMediaItem.mediaUrl}
                    alt={activeMediaItem.title}
                    className="w-full max-h-[75vh] object-contain"
                  />
                )}
              </div>

              <div className="p-5 bg-slate-900 text-white">
                <span className="text-[10px] font-black uppercase text-pink-400">
                  {activeMediaItem.mediaType === "VIDEO" ? "Commercial Reel" : "Photography Campaign"}
                </span>
                <h3 className="text-base font-black text-white mt-0.5">{activeMediaItem.title}</h3>
                {activeMediaItem.description && (
                  <p className="text-xs text-slate-400 mt-1">{activeMediaItem.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
