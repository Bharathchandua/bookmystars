/* ── TalentWorkModal.jsx ────────────────────────────────────────
   Modal allowing professionals to view a talent's complete work:
   portfolio photos, video showreels, past credits, physical stats, and bio.
   ────────────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { 
  X, Image as ImageIcon, Film, Award, Ruler, ExternalLink, 
  MapPin, IndianRupee, Play, Loader2, Sparkles, Calendar, CheckCircle2
} from "lucide-react";
import { getPublicUserProfile } from "../../features/bms/api/profile/profileApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";

function getYoutubeEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

function getYoutubeThumb(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}

export default function TalentWorkModal({ isOpen, onClose, talent, onOpenBookingModal }) {
  const [activeTab, setActiveTab] = useState("photos");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (!isOpen || !talent?.userId) return;

    let isMounted = true;
    async function loadWork() {
      setLoading(true);
      try {
        const data = await getPublicUserProfile(talent.userId);
        if (isMounted) {
          setProfileData(data);
        }
      } catch (err) {
        console.error("Failed to load talent portfolio:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWork();
    return () => { isMounted = false; };
  }, [isOpen, talent?.userId]);

  if (!isOpen || !talent) return null;

  const isPrivate = Boolean(profileData?.isPrivate ?? talent?.isPrivate);

  const photos = profileData?.portfolio || profileData?.portfolioPhotos || [];
  const videos = profileData?.videos || [];
  const credits = profileData?.workExperiences || profileData?.actingCredits || [];
  const user = profileData?.profile || profileData?.user || talent;
  const profile = profileData?.profile || {};

  return (
    <div className="pro-modal-overlay" style={{ zIndex: 1050 }}>
      <div 
        className="pro-modal-card" 
        style={{ 
          maxWidth: 900, 
          width: "95%", 
          maxHeight: "90vh", 
          display: "flex", 
          flexDirection: "column",
          padding: 0,
          overflow: "hidden"
        }}
      >
        {/* Header Strip */}
        <div 
          style={{ 
            padding: "20px 24px", 
            borderBottom: "1px solid #e2e8f0", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            color: "#ffffff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {(talent.profilePhoto || talent.profilePhotoUrl || profile.profilePhoto) ? (
              <img 
                src={getFullImageUrl(talent.profilePhoto || talent.profilePhotoUrl || profile.profilePhoto)} 
                alt={talent.fullName} 
                style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} 
              />
            ) : (
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
                {talent.fullName?.charAt(0) || "T"}
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  {talent.fullName} {talent.stageName ? `("${talent.stageName}")` : ""}
                </h3>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>
                  Verified Artist
                </span>
                {isPrivate && (
                  <span style={{ fontSize: 11, background: "rgba(234, 179, 8, 0.25)", color: "#fef08a", border: "1px solid rgba(234, 179, 8, 0.4)", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>
                    🔒 Private Profile
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 12, color: "#cbd5e1" }}>
                {(talent.profileType || profile.workType) && <span>🎭 {talent.profileType || profile.workType}</span>}
                {(talent.location || talent.city || profile.location) && <span>📍 {talent.location || talent.city || profile.location}</span>}
                {(talent.dayRate || profile.dayRate) && <span>💰 ₹{talent.dayRate || profile.dayRate}/day</span>}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 20px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "photos" ? "2.5px solid #4f46e5" : "2.5px solid transparent",
              color: activeTab === "photos" ? "#4f46e5" : "#64748b",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer"
            }}
          >
            <ImageIcon size={15} /> Portfolio Photos ({photos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "videos" ? "2.5px solid #4f46e5" : "2.5px solid transparent",
              color: activeTab === "videos" ? "#4f46e5" : "#64748b",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer"
            }}
          >
            <Film size={15} /> Showreels & Auditions ({videos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credits")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "credits" ? "2.5px solid #4f46e5" : "2.5px solid transparent",
              color: activeTab === "credits" ? "#4f46e5" : "#64748b",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer"
            }}
          >
            <Award size={15} /> Credits & Experience ({credits.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "about" ? "2.5px solid #4f46e5" : "2.5px solid transparent",
              color: activeTab === "about" ? "#4f46e5" : "#64748b",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer"
            }}
          >
            <Ruler size={15} /> Bio & Stats
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, minHeight: 320 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
              <Loader2 size={36} className="animate-spin" style={{ color: "#4f46e5", marginBottom: 12 }} />
              <p style={{ color: "#64748b", fontSize: 14 }}>Loading artist's portfolio & media files...</p>
            </div>
          ) : (
            <>
              {/* Photos Tab */}
              {activeTab === "photos" && (
                <div>
                  {photos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                      <ImageIcon size={44} style={{ marginBottom: 10 }} />
                      <p style={{ margin: 0, fontSize: 14 }}>No portfolio photos uploaded yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                      {photos.map((item, index) => {
                        const rawUrl = typeof item === "string" ? item : (item?.imageUrl || item?.photoUrl || item?.url || item?.filePath || "");
                        const imgUrl = getFullImageUrl(rawUrl);
                        return (
                          <div
                            key={index}
                            onClick={() => setActivePhoto(imgUrl)}
                            style={{
                              position: "relative",
                              borderRadius: 12,
                              overflow: "hidden",
                              height: 220,
                              cursor: "pointer",
                              border: "1px solid #e2e8f0",
                              background: "#0f172a"
                            }}
                          >
                            <img
                              src={imgUrl}
                              alt={item.title || `Work ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.2s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                            />
                            {item.title && (
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", color: "#fff", fontSize: 11, fontWeight: 600 }}>
                                {item.title}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === "videos" && (
                <div>
                  {videos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                      <Film size={44} style={{ marginBottom: 10 }} />
                      <p style={{ margin: 0, fontSize: 14 }}>No audition videos or showreels uploaded yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                      {videos.map((vid) => {
                        const isYt = vid.videoUrl && (vid.videoUrl.includes("youtube.com") || vid.videoUrl.includes("youtu.be"));
                        const thumb = vid.thumbnailUrl 
                          ? getFullImageUrl(vid.thumbnailUrl)
                          : isYt 
                            ? getYoutubeThumb(vid.videoUrl)
                            : "";

                        return (
                          <div
                            key={vid.id || vid.title}
                            onClick={() => setActiveVideo(vid)}
                            style={{
                              borderRadius: 12,
                              overflow: "hidden",
                              border: "1px solid #e2e8f0",
                              background: "#fff",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                              cursor: "pointer"
                            }}
                          >
                            <div style={{ position: "relative", height: 160, background: "#0f172a" }}>
                              {thumb ? (
                                <img src={thumb} alt={vid.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                  <Film size={36} />
                                </div>
                              )}
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Play size={20} style={{ marginLeft: 2 }} />
                                </div>
                              </div>
                            </div>
                            <div style={{ padding: "12px 14px" }}>
                              <h5 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                {vid.title || "Showreel Clip"}
                              </h5>
                              <div style={{ fontSize: 12, color: "#64748b", display: "flex", justifyContent: "space-between" }}>
                                <span>{vid.category || "General"}</span>
                                {vid.duration && <span>{vid.duration}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Credits Tab */}
              {activeTab === "credits" && (
                <div>
                  {credits.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                      <Award size={44} style={{ marginBottom: 10 }} />
                      <p style={{ margin: 0, fontSize: 14 }}>No acting/modeling credits listed yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {credits.map((c, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "14px 18px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div>
                            <h5 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                              {c.title || c.projectName || c.company || "Credit Project"}
                            </h5>
                            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                              Role: <strong style={{ color: "#334155" }}>{c.description || c.characterName || c.role || "Featured Talent"}</strong> {c.company ? `• ${c.company}` : c.productionHouse ? `• ${c.productionHouse}` : ""}
                            </p>
                            {c.category && (
                              <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, display: "inline-block", marginTop: 4 }}>
                                Category: {c.category}
                              </span>
                            )}
                          </div>
                          {(c.startDate || c.year) && (
                            <span style={{ fontSize: 12, fontWeight: 700, background: "#f1f5f9", padding: "4px 10px", borderRadius: 8, color: "#475569" }}>
                              {c.startDate ? String(c.startDate).substring(0, 4) : c.year}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* About & Stats Tab */}
              {activeTab === "about" && (
                <div>
                  {(profile.about || profile.bio) && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        About the Artist
                      </h4>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#334155", background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        {profile.about || profile.bio}
                      </p>
                    </div>
                  )}

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Physical Attributes & Details
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Height</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                        {profileData?.measurements?.height || profile.height || "Not specified"}
                      </div>
                    </div>

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Bust / Waist / Hips</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                        {profileData?.measurements?.bust && profileData?.measurements?.waist && profileData?.measurements?.hips
                          ? `${profileData.measurements.bust}" - ${profileData.measurements.waist}" - ${profileData.measurements.hips}"`
                          : profile.bustWaistHip || profile.measurements || "Not specified"}
                      </div>
                    </div>

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Eye / Hair Color</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                        {profileData?.measurements?.eyeColor || profile.eyeColor || "Black"} / {profileData?.measurements?.hairColor || profile.hairColor || "Black"}
                      </div>
                    </div>

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Body Type & Skin Tone</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                        {profileData?.measurements?.bodyType || profile.bodyType || "Slim"} • {profileData?.measurements?.skinTone || profile.skinTone || "Dusky"}
                      </div>
                    </div>

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Shoe & Dress Size</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                        Shoe: {profileData?.measurements?.shoeSize || "N/A"} • Dress: {profileData?.measurements?.dressSize || "N/A"}
                      </div>
                    </div>

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Languages</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                        {profile.languages || "English, Hindi"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div 
          style={{ 
            padding: "16px 24px", 
            borderTop: "1px solid #e2e8f0", 
            background: "#f8fafc", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}
        >
          <a
            href={`/public-profile/${talent.userId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#4f46e5",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            <ExternalLink size={15} /> Open Full Public Profile
          </a>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1.5px solid #cbd5e1",
                background: "#fff",
                color: "#475569",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenBookingModal) onOpenBookingModal(talent);
              }}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)"
              }}
            >
              <Calendar size={15} /> Book / Request Date
            </button>
          </div>
        </div>
      </div>

      {/* High-res Image Modal */}
      {activePhoto && (
        <div 
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setActivePhoto(null)}
        >
          <img src={activePhoto} alt="Full view" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: 8 }} />
          <button 
            type="button" 
            onClick={() => setActivePhoto(null)}
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div 
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setActiveVideo(null)}
        >
          <div style={{ width: "90%", maxWidth: 800, background: "#000", borderRadius: 12, overflow: "hidden", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#1e293b", color: "#fff" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{activeVideo.title}</span>
              <button type="button" onClick={() => setActiveVideo(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              {activeVideo.videoUrl?.includes("youtube") || activeVideo.videoUrl?.includes("youtu.be") ? (
                <iframe
                  src={getYoutubeEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={getFullImageUrl(activeVideo.videoUrl)}
                  controls
                  autoPlay
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
