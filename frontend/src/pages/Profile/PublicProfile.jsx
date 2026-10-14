import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin, Calendar, Globe, Briefcase, Star,
  Play, CheckCircle2, Share2, ArrowLeft, ExternalLink,
  ChevronRight, Film, Image as ImageIcon, Ruler, Award, X,
  Music, FileText, Download, Lock, Unlock, Clock, UserCheck, Shield
} from "lucide-react";
import { getPublicUserProfile, requestProfileAccess, getStoredUser, getFullImageUrl } from "../../services/api";

function getYoutubeThumb(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}

function getYoutubeEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Modals for viewer
  const [activePhoto, setActivePhoto] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [copied, setCopied] = useState(false);

  // Access request state for private profiles
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const storedUser = getStoredUser();
  const [requestForm, setRequestForm] = useState({
    name: storedUser?.fullName || "",
    email: storedUser?.email || localStorage.getItem("bms_viewer_request_email") || "",
    role: storedUser?.accountType || "Viewer",
    message: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const viewerEmail = localStorage.getItem("bms_viewer_request_email") || storedUser?.email;
        const res = await getPublicUserProfile(userId, viewerEmail);
        setData(res);
      } catch (err) {
        setError(err.message || "Unable to load talent profile");
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCommunicate = () => {
    // Requirements: "if they want to communicate they should navigated back to this website home page"
    navigate("/");
  };

  const handleSendAccessRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.email) {
      alert("Please provide your email address to request access.");
      return;
    }
    try {
      setRequestSending(true);
      await requestProfileAccess(userId, {
        requesterName: requestForm.name || "Viewer",
        requesterEmail: requestForm.email,
        requesterRole: requestForm.role || "Viewer",
        requesterMessage: requestForm.message
      });
      localStorage.setItem("bms_viewer_request_email", requestForm.email);
      setData(prev => ({
        ...prev,
        accessStatus: "PENDING"
      }));
      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
      }, 1800);
    } catch (err) {
      alert("Failed to send request: " + err.message);
    } finally {
      setRequestSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#e91e8c", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "16px", color: "#64748b", fontWeight: "600" }}>Loading talent profile...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #e2e8f0", maxWidth: "480px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "20px", color: "#0f172a", marginBottom: "8px" }}>Profile Not Found</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
            The requested talent profile does not exist or may have been updated.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{ backgroundColor: "#e91e8c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            Go to Book My Stars Home
          </button>
        </div>
      </div>
    );
  }

  const { profile, portfolio = [], videos = [], workExperiences = [], measurements, audios = [], documents = [] } = data;
  const photoUrl = profile.profilePhoto ? getFullImageUrl(profile.profilePhoto) : "";
  const types = profile.profileTypes ? Array.from(profile.profileTypes) : [];
  const singleType = types.length > 0 ? types[0] : "";
  const roleLabel = profile.customProfession || (singleType ? singleType.charAt(0).toUpperCase() + singleType.slice(1).toLowerCase() : "Talent");
  const isLocked = Boolean(data?.isPrivate && data?.accessStatus !== "APPROVED");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "inherit" }}>
      {/* ── TOP NAVIGATION BAR ── */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #e91e8c, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800" }}>
              ★
            </div>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
              Book My Stars
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleShare}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "#f1f5f9", border: "1px solid #e2e8f0",
                padding: "8px 14px", borderRadius: "8px",
                fontSize: "13px", fontWeight: "600", color: "#475569", cursor: "pointer"
              }}
            >
              <Share2 size={14} />
              <span>{copied ? "Link Copied!" : "Share Profile"}</span>
            </button>

            <button
              onClick={handleCommunicate}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "#e91e8c", color: "#ffffff", border: "none",
                padding: "8px 18px", borderRadius: "8px",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(233, 30, 140, 0.3)"
              }}
            >
              <span>Connect / Book Talent</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── TALENT BANNER NOTICE ── */}
      <div style={{ backgroundColor: "#fdf2f8", borderBottom: "1px solid #fbcfe8", padding: "10px 20px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#9d174d", fontWeight: "500" }}>
          Viewing official public profile of <strong>{profile.fullName}</strong>. To contact, send scripts, or check availability,{" "}
          <button
            onClick={handleCommunicate}
            style={{ background: "none", border: "none", color: "#e91e8c", fontWeight: "700", textDecoration: "underline", cursor: "pointer", padding: 0 }}
          >
            connect on Book My Stars
          </button>.
        </p>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}>

        {/* ── HERO PROFILE CARD ── */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: "32px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>

            {/* Profile Avatar / Photo */}
            <div style={{ width: "220px", height: "275px", borderRadius: "14px", overflow: "hidden", backgroundColor: isLocked ? "#f8fafc" : "#f1f5f9", flexShrink: 0, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isLocked ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#f5f3ff", border: "2px solid #7c3aed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#7c3aed" }}>
                    <Lock size={36} />
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#7c3aed", margin: 0 }}>Private Account</p>
                </div>
              ) : photoUrl ? (
                <img src={photoUrl} alt={profile.fullName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#fce7f3", border: "2px dashed #e91e8c", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#e91e8c", fontSize: "24px", fontWeight: "800" }}>
                    {profile.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: "600", margin: 0 }}>Verified Talent</p>
                </div>
              )}
            </div>

            {/* Talent Details */}
            <div style={{ flex: 1, minWidth: "280px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{profile.fullName}</h1>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                  <CheckCircle2 size={13} /> Verified
                </span>
                {isLocked ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#f5f3ff", color: "#7c3aed", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                    <Lock size={12} /> Private Profile
                  </span>
                ) : data?.isPrivate && data?.accessStatus === "APPROVED" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#ecfdf5", color: "#059669", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                    <Unlock size={12} /> Access Approved
                  </span>
                ) : null}
              </div>

              {profile.stageName && (
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 10px 0" }}>Also known as: <em>{profile.stageName}</em></p>
              )}

              <p style={{ fontSize: "16px", color: "#e91e8c", fontWeight: "700", margin: "0 0 16px 0" }}>{roleLabel}</p>

              {!isLocked ? (
                <>
                  {/* Meta items */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "20px", fontSize: "13px", color: "#475569" }}>
                    {profile.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={15} color="#e91e8c" /> {profile.location}
                      </div>
                    )}
                    {profile.languages && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Globe size={15} color="#e91e8c" /> {profile.languages}
                      </div>
                    )}
                    {profile.workType && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Briefcase size={15} color="#e91e8c" /> {profile.workType}
                      </div>
                    )}
                    {profile.dayRate && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#0f172a" }}>
                        <span>₹</span> {profile.dayRate}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div style={{ backgroundColor: "#f8fafc", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "13px", textTransform: "uppercase", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>About</h4>
                    <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "#334155", whiteSpace: "pre-line" }}>
                      {profile.about || "Welcome to my portfolio! Connect with me on Book My Stars for bookings and collaborations."}
                    </p>
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={handleCommunicate}
                      style={{
                        backgroundColor: "#e91e8c", color: "#ffffff", border: "none",
                        padding: "10px 24px", borderRadius: "8px",
                        fontSize: "14px", fontWeight: "700", cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(233, 30, 140, 0.3)"
                      }}
                    >
                      Send Inquiry / Book
                    </button>
                    <button
                      onClick={handleShare}
                      style={{
                        backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1",
                        padding: "10px 18px", borderRadius: "8px",
                        fontSize: "14px", fontWeight: "600", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "6px"
                      }}
                    >
                      <Share2 size={15} /> {copied ? "Link Copied!" : "Share"}
                    </button>
                  </div>
                </>
              ) : (
                /* Locked Action Row */
                <div style={{ marginTop: "16px" }}>
                  {data?.accessStatus === "PENDING" ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#fef3c7", color: "#92400e", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", border: "1px solid #fde68a" }}>
                      <Clock size={16} />
                      <span>Request Sent · Awaiting Talent Approval</span>
                    </div>
                  ) : data?.accessStatus === "REJECTED" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ color: "#ef4444", fontSize: "13px", fontWeight: "700" }}>Request Declined</span>
                      <button
                        onClick={() => setShowRequestModal(true)}
                        style={{ backgroundColor: "#e91e8c", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                      >
                        Request Again
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRequestModal(true)}
                      style={{
                        backgroundColor: "#e91e8c", color: "#ffffff", border: "none",
                        padding: "10px 24px", borderRadius: "8px",
                        fontSize: "14px", fontWeight: "700", cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        boxShadow: "0 2px 10px rgba(233, 30, 140, 0.35)"
                      }}
                    >
                      <Lock size={15} />
                      <span>Request to View Profile</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {isLocked ? (
          /* ── INSTAGRAM-STYLE PRIVATE ACCOUNT PANEL ── */
          <div style={{
            background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0",
            padding: "54px 24px", textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "32px"
          }}>
            <div style={{
              width: "76px", height: "76px", borderRadius: "50%",
              border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px", backgroundColor: "#f8fafc", color: "#475569"
            }}>
              <Lock size={34} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              This Account is Private
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "460px", margin: "0 auto 24px", lineHeight: "1.6" }}>
              Request access to view {profile.fullName}’s portfolio photos, video showreels, physical measurements, and creative credentials.
            </p>

            {data?.accessStatus === "PENDING" ? (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                backgroundColor: "#fef3c7", color: "#92400e",
                padding: "12px 28px", borderRadius: "10px",
                fontWeight: "700", fontSize: "14px", border: "1px solid #fde68a"
              }}>
                <Clock size={16} />
                <span>Request Sent · Pending Talent Approval</span>
              </div>
            ) : data?.accessStatus === "REJECTED" ? (
              <div>
                <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                  Your previous request was declined by the talent.
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  style={{
                    backgroundColor: "#e91e8c", color: "#ffffff", border: "none",
                    padding: "12px 28px", borderRadius: "10px",
                    fontWeight: "700", fontSize: "14px", cursor: "pointer"
                  }}
                >
                  Request Again
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRequestModal(true)}
                style={{
                  backgroundColor: "#e91e8c", color: "#ffffff", border: "none",
                  padding: "12px 32px", borderRadius: "10px",
                  fontWeight: "700", fontSize: "14px", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 4px 14px rgba(233, 30, 140, 0.35)"
                }}
              >
                <Lock size={15} />
                <span>Request to View Profile</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── PORTFOLIO SECTION ── */}
            <section style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <ImageIcon size={20} color="#e91e8c" />
              <span>Portfolio Photos ({portfolio.length})</span>
            </h2>
          </div>

          {portfolio.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {portfolio.map(photo => {
                const imgUrl = getFullImageUrl(photo.imageUrl);
                return (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    style={{
                      aspectRatio: "3 / 4", borderRadius: "12px", overflow: "hidden",
                      position: "relative", cursor: "pointer", backgroundColor: "#e2e8f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0"
                    }}
                  >
                    <img src={imgUrl} alt={photo.title || "Portfolio"} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.2s ease" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", background: "linear-gradient(transparent, rgba(0,0,0,0.75))", color: "#fff" }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "700" }}>{photo.title || "Portfolio Photo"}</p>
                      <span style={{ fontSize: "11px", opacity: 0.85 }}>{photo.category || "General"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: "#ffffff", padding: "32px", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
              No portfolio photos published yet.
            </div>
          )}
        </section>

        {/* ── SHOWREEL & VIDEOS SECTION ── */}
        <section style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <Film size={20} color="#e91e8c" />
              <span>Videos & Showreels ({videos.length})</span>
            </h2>
          </div>

          {videos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
              {videos.map(vid => {
                const vidUrl = getFullImageUrl(vid.videoUrl);
                const ytThumb = getYoutubeThumb(vidUrl);
                const thumb = getFullImageUrl(vid.thumbnailUrl) || ytThumb;

                return (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideo({ ...vid, videoUrl: vidUrl, thumb })}
                    style={{
                      backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden",
                      border: "1px solid #e2e8f0", cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                  >
                    <div style={{ aspectRatio: "16 / 9", backgroundColor: "#0f172a", position: "relative" }}>
                      {thumb ? (
                        <img src={thumb} alt={vid.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : vidUrl ? (
                        <video src={vidUrl} preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px" }}>
                          No Preview
                        </div>
                      )}

                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "rgba(233, 30, 140, 0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play size={20} fill="#fff" color="#fff" style={{ marginLeft: "2px" }} />
                      </div>

                      {vid.duration && (
                        <span style={{ position: "absolute", bottom: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.75)", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>
                          {vid.duration}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: "14px" }}>
                      <p style={{ margin: "0 0 4px 0", fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>{vid.title || "Showreel"}</p>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{vid.category || "Performance"} {vid.year ? `• ${vid.year}` : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: "#ffffff", padding: "32px", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
              No videos or showreels published yet.
            </div>
          )}
        </section>

        {/* ── MEASUREMENTS & WORK EXPERIENCE TWO-COLUMN ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "36px" }}>

          {/* Measurements */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0" }}>
              <Ruler size={18} color="#e91e8c" />
              <span>Physical Attributes</span>
            </h3>

            {measurements ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {[
                  ["Height", measurements.height ? `${measurements.height} ft` : "—"],
                  ["Bust", measurements.bust ? `${measurements.bust} in` : "—"],
                  ["Waist", measurements.waist ? `${measurements.waist} in` : "—"],
                  ["Hips", measurements.hips ? `${measurements.hips} in` : "—"],
                  ["Dress Size", measurements.dressSize || "—"],
                  ["Shoe Size", measurements.shoeSize || "—"],
                  ["Hair Color", measurements.hairColor || "—"],
                  ["Eye Color", measurements.eyeColor || "—"],
                  ["Skin Tone", measurements.skinTone || "—"],
                  ["Body Type", measurements.bodyType || "—"]
                ].map(([label, val]) => (
                  <div key={label} style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>{label}</span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{val}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Measurements not provided.</p>
            )}
          </div>

          {/* Work Experience */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0" }}>
              <Award size={18} color="#e91e8c" />
              <span>Work & Credits ({workExperiences.length})</span>
            </h3>

            {workExperiences.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {workExperiences.map(exp => (
                  <div key={exp.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                    <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>{exp.title}</p>
                    <span style={{ fontSize: "12px", color: "#e91e8c", fontWeight: "600" }}>{exp.company}</span>
                    {exp.description && (
                      <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>No credits listed yet.</p>
            )}
          </div>

        </div>

        {/* ── AUDIO SAMPLES / VOICE REELS ── */}
        {audios.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0" }}>
              <Music size={18} color="#e91e8c" />
              <span>Voice Demos & Audio Samples ({audios.length})</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {audios.map(audio => (
                <div key={audio.id} style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>{audio.title}</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#e91e8c", background: "#fdf2f8", padding: "2px 8px", borderRadius: "10px" }}>{audio.category}</span>
                  </div>
                  <audio controls src={getFullImageUrl(audio.audioUrl)} style={{ width: "100%", height: "36px", marginTop: "4px" }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── DOCUMENTS & RESUMES ── */}
        {documents.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0" }}>
              <FileText size={18} color="#e91e8c" />
              <span>Resume & Press Kit ({documents.length})</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              {documents.map(doc => (
                <div key={doc.id} style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "11px", color: "#0f172a" }}>
                      {doc.format || "DOC"}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>{doc.title}</p>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{doc.category}</span>
                    </div>
                  </div>
                  <a
                    href={getFullImageUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{ background: "#fdf2f8", color: "#e91e8c", border: "1px solid #fbcfe8", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Download size={13} /> Download
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM CALL TO ACTION ── */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "16px", padding: "36px", color: "#ffffff", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 8px 0" }}>
            Ready to collaborate with {profile.fullName}?
          </h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto 20px auto" }}>
            Join Book My Stars to send inquiries, check real-time availability, and coordinate auditions and bookings directly.
          </p>
          <button
            onClick={handleCommunicate}
            style={{
              backgroundColor: "#e91e8c", color: "#ffffff", border: "none",
              padding: "12px 28px", borderRadius: "8px",
              fontSize: "15px", fontWeight: "700", cursor: "pointer",
              boxShadow: "0 4px 15px rgba(233, 30, 140, 0.4)"
            }}
          >
            Connect on Book My Stars
          </button>
        </div>
          </>
        )}

      </main>

      {/* ── PHOTO PREVIEW MODAL ── */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
        >
          <div style={{ maxWidth: "800px", width: "100%", maxHeight: "90vh", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActivePhoto(null)}
              style={{ position: "absolute", top: "-40px", right: 0, background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              <X size={28} />
            </button>
            <img src={getFullImageUrl(activePhoto.imageUrl)} alt={activePhoto.title} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "8px" }} />
            <div style={{ marginTop: "10px", color: "#fff", textAlign: "center" }}>
              <h4 style={{ margin: 0, fontSize: "16px" }}>{activePhoto.title}</h4>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>{activePhoto.category}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEO PLAYER MODAL ── */}
      {activeVideo && (
        <div
          onClick={() => setActiveVideo(null)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
        >
          <div style={{ maxWidth: "800px", width: "100%", position: "relative", backgroundColor: "#000", borderRadius: "12px", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" }}>
              <h4 style={{ margin: 0, color: "#fff", fontSize: "16px" }}>{activeVideo.title || "Showreel"}</h4>
              <button
                onClick={() => setActiveVideo(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ minHeight: "360px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {activeVideo.videoUrl && (activeVideo.videoUrl.includes("youtube.com") || activeVideo.videoUrl.includes("youtu.be")) ? (
                <iframe
                  src={getYoutubeEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  style={{ width: "100%", height: "420px", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeVideo.videoUrl ? (
                <video
                  controls
                  autoPlay
                  src={activeVideo.videoUrl}
                  poster={activeVideo.thumb}
                  style={{ width: "100%", maxHeight: "70vh", outline: "none" }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p style={{ color: "#fff" }}>Video link unavailable</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── REQUEST ACCESS MODAL ── */}
      {showRequestModal && (
        <div
          onClick={() => setShowRequestModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "16px"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#ffffff", borderRadius: "16px",
              width: "100%", maxWidth: "480px", padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#db2777" }}>
                  <Lock size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>Request Profile Access</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Ask {profile.fullName} to unlock their profile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {requestSuccess ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Request Sent!</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  {profile.fullName} will be notified. Once approved, the portfolio will unlock for you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendAccessRequest} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    value={requestForm.name}
                    onChange={e => setRequestForm({ ...requestForm, name: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Your Email *</label>
                  <input
                    type="email"
                    required
                    value={requestForm.email}
                    onChange={e => setRequestForm({ ...requestForm, email: e.target.value })}
                    placeholder="e.g. rahul@productionhouse.com"
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Your Role / Organization</label>
                  <input
                    type="text"
                    value={requestForm.role}
                    onChange={e => setRequestForm({ ...requestForm, role: e.target.value })}
                    placeholder="e.g. Casting Director / Producer / Agency"
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>Message (Optional)</label>
                  <textarea
                    rows={3}
                    value={requestForm.message}
                    onChange={e => setRequestForm({ ...requestForm, message: e.target.value })}
                    placeholder="Briefly state why you'd like to view this profile..."
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "9px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestSending}
                    style={{ background: "#e91e8c", color: "#ffffff", border: "none", padding: "9px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", opacity: requestSending ? 0.7 : 1 }}
                  >
                    {requestSending ? "Sending Request..." : "Send Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
