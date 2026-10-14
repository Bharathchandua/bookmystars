import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect, useCallback } from "react";
import AppLayout from "../Layout/AppLayout.jsx";
import VideosSection from "./Videos.jsx";
import DocumentsSection from "./Documents.jsx";
import AudiosSection from "./Audios.jsx";
import "./MyMedia.css";
import "./MyMedia-mobile.css";

import {
  Film, Image as ImageIcon, Music, FileText,
  Plus, Upload, FolderOpen, Share2, Settings,
  Grid, List, CloudUpload, Check, FolderPlus, Trash2, Link as LinkIcon
} from "lucide-react";

import {
  getMyPortfolio,
  uploadPortfolioPhoto,
  deletePortfolioPhoto,
  getMyVideos,
  uploadVideoFile,
  addVideo,
  deleteVideo,
  getMyAudios,
  uploadAudioFile,
  deleteAudio,
  getMyDocuments,
  uploadDocumentFile,
  deleteDocument,
  getShareProfileData,
  getFullImageUrl,
  getStoredUser
} from "../../services/api";

/* ══════════════════════════════════════════
   STORAGE OVERVIEW – sub-component
   ══════════════════════════════════════════ */
function StorageOverview({ percentage, usedGB, totalGB, photosCount, videosCount, audiosCount, docsCount }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const durationUp = 800;
    const holdTime = 150;
    const durationDown = 800;

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      if (elapsed < durationUp) {
        const progress = elapsed / durationUp;
        const ease = progress * (2 - progress);
        setDisplay(ease * 100);
        requestAnimationFrame(animate);
      } else if (elapsed < durationUp + holdTime) {
        setDisplay(100);
        requestAnimationFrame(animate);
      } else if (elapsed < durationUp + holdTime + durationDown) {
        const elapsedDown = elapsed - (durationUp + holdTime);
        const progress = elapsedDown / durationDown;
        const ease = progress * (2 - progress);
        setDisplay(100 - ease * (100 - percentage));
        requestAnimationFrame(animate);
      } else {
        setDisplay(percentage);
      }
    };

    const t = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 200);

    return () => clearTimeout(t);
  }, [percentage]);

  const r = 65;
  const cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * (2 / 3);
  const gap = circ / 3;
  const filled = (display / 100) * arcLen;

  return (
    <div className="mm-widget">
      <div className="mm-widget-head">
        <h3 className="mm-widget-title">Storage Overview</h3>
        <PagesButton className="mm-widget-link" onClick={() => alert(`Total Storage: ${totalGB} GB\nUsed: ${usedGB.toFixed(2)} GB`)}>
          View Details
        </PagesButton>
      </div>

      <div className="mm-gauge-wrap">
        <svg className="mm-gauge-svg" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e91e8c" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#f0f4f8"
            strokeWidth="13"
            strokeDasharray={`${arcLen} ${gap}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(150 ${cx} ${cy})`}
          />
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="url(#gauge-grad)"
            strokeWidth="13"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(150 ${cx} ${cy})`}
          />
        </svg>
        <div className="mm-gauge-text">
          <span className="mm-gauge-pct">{Math.round(display)}%</span>
          <span className="mm-gauge-lbl">Used</span>
        </div>
      </div>

      <p className="mm-storage-summary">{usedGB.toFixed(2)} GB / {totalGB} GB Used</p>

      <div className="mm-storage-list">
        <div className="mm-storage-row">
          <div className="mm-storage-left"><span className="mm-dot purple" />Photos ({photosCount})</div>
          <span className="mm-storage-val">{(photosCount * 0.003).toFixed(2)} GB</span>
        </div>
        <div className="mm-storage-row">
          <div className="mm-storage-left"><span className="mm-dot pink" />Videos ({videosCount})</div>
          <span className="mm-storage-val">{(videosCount * 0.05).toFixed(2)} GB</span>
        </div>
        <div className="mm-storage-row">
          <div className="mm-storage-left"><span className="mm-dot blue" />Documents ({docsCount})</div>
          <span className="mm-storage-val">{(docsCount * 0.002).toFixed(2)} GB</span>
        </div>
        <div className="mm-storage-row">
          <div className="mm-storage-left"><span className="mm-dot green" />Audios ({audiosCount})</div>
          <span className="mm-storage-val">{(audiosCount * 0.005).toFixed(2)} GB</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function MyMedia() {
  const [activeTab, setActiveTab]     = useState("all");
  const [viewMode, setViewMode]       = useState("grid");
  const [sortBy, setSortBy]           = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading]         = useState(false);

  // Modals
  const [showUpload, setShowUpload]     = useState(false);
  const [uploadType, setUploadType]     = useState("photo");
  const [videoMode, setVideoMode]       = useState("file"); // "file" or "url"
  const [videoUrl, setVideoUrl]         = useState("");
  const [uploadTitle, setUploadTitle]   = useState("");
  const [uploadCategory, setUploadCategory] = useState("Portfolio");
  const [selFile, setSelFile]           = useState(null);
  const [uploading, setUploading]       = useState(false);

  const [showFolder, setShowFolder]     = useState(false);
  const [folderName, setFolderName]     = useState("");
  const [showShare, setShowShare]       = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const [toast, setToast] = useState({ show: false, msg: "" });
  const fileRef = useRef(null);

  // ── Real Data States ──
  const [photos, setPhotos]       = useState([]);
  const [videos, setVideos]       = useState([]);
  const [documents, setDocuments] = useState([]);
  const [audios, setAudios]       = useState([]);

  const currentUser = getStoredUser();
  const userId = currentUser?.userId || 7;

  const [shareData, setShareData]       = useState(null);

  // Toast helper
  const toast_ = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  // ── Fetch Portfolio, Videos, Audios & Documents from Backend ──
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const [portfolioRes, videosRes, audiosRes, docsRes] = await Promise.all([
        getMyPortfolio(),
        getMyVideos(),
        getMyAudios(),
        getMyDocuments()
      ]);

      if (Array.isArray(portfolioRes)) {
        const mappedPhotos = portfolioRes.map(p => ({
          id: p.id,
          name: p.title || "Portfolio Photo",
          category: p.category || "Portfolio",
          url: getFullImageUrl(p.imageUrl),
          type: (p.imageUrl?.split(".").pop() || "JPG").toUpperCase(),
          sizeStr: "2.4 MB",
          sizeBytes: 2516582,
          date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recently",
          ts: p.createdAt ? new Date(p.createdAt).getTime() : Date.now()
        }));
        setPhotos(mappedPhotos);
      }

      if (Array.isArray(videosRes)) {
        const mappedVideos = videosRes.map(v => ({
          id: v.id,
          title: v.title || "Showreel Video",
          category: v.category || "Showreel",
          duration: v.duration || "01:00",
          videoUrl: getFullImageUrl(v.videoUrl),
          thumb: getFullImageUrl(v.thumbnailUrl),
          year: v.year,
          format: v.videoUrl?.includes(".mp4") ? "MP4" : "LINK",
          sizeStr: "45 MB",
          sizeBytes: 47185920,
          date: "Recently",
          ts: Date.now()
        }));
        setVideos(mappedVideos);
      }

      if (Array.isArray(audiosRes)) {
        const mappedAudios = audiosRes.map(a => ({
          id: a.id,
          title: a.title || "Voice Track",
          category: a.category || "Voice Sample",
          audioUrl: a.audioUrl,
          format: a.format || "MP3",
          duration: a.duration || "01:15",
          sizeStr: a.sizeStr || "2.4 MB",
          date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Recently",
          ts: a.createdAt ? new Date(a.createdAt).getTime() : Date.now()
        }));
        setAudios(mappedAudios);
      }

      if (Array.isArray(docsRes)) {
        const mappedDocs = docsRes.map(d => ({
          id: d.id,
          title: d.title || "Document",
          category: d.category || "Resume / CV",
          fileUrl: d.fileUrl,
          format: d.format || "PDF",
          sizeStr: d.sizeStr || "1.2 MB",
          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recently",
          ts: d.createdAt ? new Date(d.createdAt).getTime() : Date.now()
        }));
        setDocuments(mappedDocs);
      }
    } catch (err) {
      console.error("Failed to load user media:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
    getShareProfileData().then(setShareData).catch(() => {});

    const handlePortfolioChange = () => fetchMedia();
    const handleVideosChange = () => fetchMedia();
    const handleAudiosChange = () => fetchMedia();
    const handleDocumentsChange = () => fetchMedia();

    window.addEventListener("portfolio_updated", handlePortfolioChange);
    window.addEventListener("videos_updated", handleVideosChange);
    window.addEventListener("audios_updated", handleAudiosChange);
    window.addEventListener("documents_updated", handleDocumentsChange);

    return () => {
      window.removeEventListener("portfolio_updated", handlePortfolioChange);
      window.removeEventListener("videos_updated", handleVideosChange);
      window.removeEventListener("audios_updated", handleAudiosChange);
      window.removeEventListener("documents_updated", handleDocumentsChange);
    };
  }, [fetchMedia]);

  // ── Storage Calculations ──
  const totalGB = 20;
  const usedMB = (photos.length * 2.5) + (videos.length * 45) + (audios.length * 4) + (documents.length * 1.5);
  const usedGB = Math.max(0.05, +(usedMB / 1024));
  const pct = Math.min(100, Math.max(1, Math.round((usedGB / totalGB) * 100)));
  const totalFiles = photos.length + videos.length + audios.length + documents.length;

  // ── Delete Handlers (Unified with backend) ──
  const delPhoto = async (id) => {
    try {
      await deletePortfolioPhoto(id);
      setPhotos(p => p.filter(x => x.id !== id));
      window.dispatchEvent(new Event("portfolio_updated"));
      toast_("Portfolio photo deleted");
    } catch (err) {
      toast_("Failed to delete photo");
    }
  };

  const delVideo = async (id) => {
    try {
      await deleteVideo(id);
      setVideos(v => v.filter(x => x.id !== id));
      window.dispatchEvent(new Event("videos_updated"));
      toast_("Video deleted");
    } catch (err) {
      toast_("Failed to delete video");
    }
  };

  const delDoc = async (id) => {
    try {
      await deleteDocument(id);
      setDocuments(d => d.filter(x => x.id !== id));
      window.dispatchEvent(new Event("documents_updated"));
      toast_("Document deleted successfully");
    } catch (err) {
      toast_("Failed to delete document");
    }
  };

  const delAudio = async (id) => {
    try {
      await deleteAudio(id);
      setAudios(a => a.filter(x => x.id !== id));
      window.dispatchEvent(new Event("audios_updated"));
      toast_("Audio track deleted successfully");
    } catch (err) {
      toast_("Failed to delete audio track");
    }
  };

  // ── Upload logic (Unified with backend) ──
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelFile(f);
      if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (uploadType === "photo") {
      if (!selFile) {
        toast_("Please select an image file to upload");
        return;
      }
      try {
        setUploading(true);
        await uploadPortfolioPhoto(selFile, uploadTitle.trim() || selFile.name, uploadCategory);
        await fetchMedia();
        window.dispatchEvent(new Event("portfolio_updated"));
        toast_("Photo added to portfolio and media successfully!");
        setShowUpload(false);
        setSelFile(null);
        setUploadTitle("");
      } catch (err) {
        toast_(err.message || "Failed to upload photo");
      } finally {
        setUploading(false);
      }
    } else if (uploadType === "video") {
      if (videoMode === "file") {
        if (!selFile) {
          toast_("Please select a video file");
          return;
        }
        try {
          setUploading(true);
          await uploadVideoFile({
            file: selFile,
            title: uploadTitle.trim() || selFile.name,
            category: uploadCategory || "Showreel"
          });
          await fetchMedia();
          window.dispatchEvent(new Event("videos_updated"));
          toast_("Video uploaded successfully!");
          setShowUpload(false);
          setSelFile(null);
          setUploadTitle("");
        } catch (err) {
          toast_(err.message || "Failed to upload video file");
        } finally {
          setUploading(false);
        }
      } else {
        if (!videoUrl.trim()) {
          toast_("Please enter a video URL");
          return;
        }
        try {
          setUploading(true);
          await addVideo({
            videoUrl: videoUrl.trim(),
            title: uploadTitle.trim() || "Showreel Video",
            category: uploadCategory || "Showreel"
          });
          await fetchMedia();
          window.dispatchEvent(new Event("videos_updated"));
          toast_("Video link added successfully!");
          setShowUpload(false);
          setVideoUrl("");
          setUploadTitle("");
        } catch (err) {
          toast_(err.message || "Failed to save video URL");
        } finally {
          setUploading(false);
        }
      }
    } else if (uploadType === "audio") {
      if (!selFile) {
        toast_("Please select an audio file to upload");
        return;
      }
      try {
        setUploading(true);
        await uploadAudioFile({
          file: selFile,
          title: uploadTitle.trim() || selFile.name,
          category: uploadCategory || "Voice Sample",
          duration: "01:15"
        });
        await fetchMedia();
        window.dispatchEvent(new Event("audios_updated"));
        toast_("Audio track uploaded successfully!");
        setShowUpload(false);
        setSelFile(null);
        setUploadTitle("");
      } catch (err) {
        toast_(err.message || "Failed to upload audio track");
      } finally {
        setUploading(false);
      }
    } else {
      if (!selFile) {
        toast_("Please select a document file to upload");
        return;
      }
      try {
        setUploading(true);
        await uploadDocumentFile({
          file: selFile,
          title: uploadTitle.trim() || selFile.name,
          category: uploadCategory || "Resume / CV"
        });
        await fetchMedia();
        window.dispatchEvent(new Event("documents_updated"));
        toast_("Document uploaded successfully!");
        setShowUpload(false);
        setSelFile(null);
        setUploadTitle("");
      } catch (err) {
        toast_(err.message || "Failed to upload document");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleFolderCreate = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setShowFolder(false);
    setFolderName("");
    toast_(`Folder "${folderName}" created!`);
  };

  // Filtered lists
  const fPhotos = photos.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const fVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const fAudios = audios.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const fDocs   = documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const publicProfileUrl = shareData?.shareUrl || `${window.location.origin}/public-profile/${userId}`;

  const handleOpenMailto = (e) => {
    e.preventDefault();
    const subject = shareData?.emailSubject || `Official Talent Portfolio (${shareData?.shareCode || `BMS-${userId}`})`;
    const body = shareData?.emailBody || `Dear Casting Director / Production Team,\r\n\r\nI am pleased to share my official talent profile and portfolio on Book My Stars:\r\n${publicProfileUrl}\r\n\r\nTalent ID: ${shareData?.shareCode || `BMS-${userId}`}\r\nAvailable for casting calls and productions.`;
    const mailto = shareData?.emailUrl || `mailto:?subject=${encodeURIComponent(subject).replace(/\+/g, "%20")}&body=${encodeURIComponent(body).replace(/\+/g, "%20")}`;

    try {
      navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      toast_("Email invitation copied to clipboard!");
    } catch (_) {}

    const tempLink = document.createElement("a");
    tempLink.href = mailto;
    tempLink.target = "_blank";
    tempLink.rel = "noopener noreferrer";
    document.body.appendChild(tempLink);
    tempLink.click();
    setTimeout(() => {
      try {
        document.body.removeChild(tempLink);
      } catch (_) {}
    }, 500);
  };

  // Doc icon class
  const docIconClass = (fmt) => {
    if (fmt === "PDF")  return "mm-doc-icon pdf";
    if (fmt === "DOCX") return "mm-doc-icon docx";
    if (fmt === "PPTX") return "mm-doc-icon pptx";
    return "mm-doc-icon gen";
  };

  // Header Upload button
  const headerExtras = (
    <div style={{ display: "flex", gap: "10px" }}>
      <PagesButton
        className="prof-share-btn"
        style={{ backgroundColor: "#ffffff", color: "#334155", borderColor: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}
        onClick={() => setShowShare(true)}
      >
        <Share2 size={14} /> <span>Share Profile</span>
      </PagesButton>
      <PagesButton
        className="prof-share-btn"
        style={{ backgroundColor: "#e91e8c", color: "#fff", borderColor: "#e91e8c", display: "flex", alignItems: "center", gap: "6px" }}
        onClick={() => { setUploadType("photo"); setShowUpload(true); }}
      >
        <Upload size={14} /> <span>Upload</span>
      </PagesButton>
    </div>
  );

  return (
    <AppLayout
      pageTitle="My Media"
      subTitle="Manage your photos, videos, and portfolio files"
      searchPlaceholder="Search media..."
      headerExtras={headerExtras}
    >
      <div className="mm-page">
        <div className="mm-layout">
          {/* ════ LEFT MAIN COLUMN ════ */}
          <div className="mm-main">
            {/* ── TAB BAR + SORT ROW ── */}
            <div className="mm-controls">
              <div className="mm-tabs">
                {[
                  { id: "all",       label: `All Media (${totalFiles})` },
                  { id: "photos",    label: `Photos (${photos.length})` },
                  { id: "videos",    label: `Videos (${videos.length})` },
                  { id: "audios",    label: `Audios (${audios.length})` },
                  { id: "documents", label: `Documents (${documents.length})` },
                ].map(t => (
                  <PagesButton
                    key={t.id}
                    className={`mm-tab${activeTab === t.id ? " active" : ""}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </PagesButton>
                ))}
              </div>

              <div className="mm-controls-right">
                <div className="mm-sort-wrap">
                  <span>Sort by:</span>
                  <select className="mm-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="recent">Recently Added</option>
                    <option value="name">Name (A–Z)</option>
                    <option value="size">Size (Large first)</option>
                  </select>
                </div>
                <div className="mm-view-toggles">
                  <PagesButton className={`mm-view-btn${viewMode === "grid" ? " active" : ""}`} onClick={() => setViewMode("grid")} aria-label="Grid View"><Grid size={15} /></PagesButton>
                  <PagesButton className={`mm-view-btn${viewMode === "list" ? " active" : ""}`} onClick={() => setViewMode("list")} aria-label="List View"><List size={15} /></PagesButton>
                </div>
              </div>
            </div>

            {/* STATS BAR */}
            {activeTab === "all" && (
              <div className="mm-stats-bar">
                <div className="mm-stat" onClick={() => setActiveTab("all")}>
                  <div className="mm-stat-icon purple"><FolderOpen size={18} /></div>
                  <div className="mm-stat-data">
                    <span className="mm-stat-label">Total Files</span>
                    <span className="mm-stat-value">{totalFiles}</span>
                    <span className="mm-stat-sub">All media items</span>
                  </div>
                </div>
                <div className="mm-stat" onClick={() => setActiveTab("photos")}>
                  <div className="mm-stat-icon green"><ImageIcon size={18} /></div>
                  <div className="mm-stat-data">
                    <span className="mm-stat-label">Photos</span>
                    <span className="mm-stat-value">{photos.length}</span>
                    <span className="mm-stat-sub">Portfolio shots</span>
                  </div>
                </div>
                <div className="mm-stat" onClick={() => setActiveTab("videos")}>
                  <div className="mm-stat-icon pink"><Film size={18} /></div>
                  <div className="mm-stat-data">
                    <span className="mm-stat-label">Videos</span>
                    <span className="mm-stat-value">{videos.length}</span>
                    <span className="mm-stat-sub">Showreels & Clips</span>
                  </div>
                </div>
                <div className="mm-stat" onClick={() => setActiveTab("audios")}>
                  <div className="mm-stat-icon orange"><Music size={18} /></div>
                  <div className="mm-stat-data">
                    <span className="mm-stat-label">Audios</span>
                    <span className="mm-stat-value">{audios.length}</span>
                    <span className="mm-stat-sub">Voice Tracks</span>
                  </div>
                </div>
                <div className="mm-stat" onClick={() => setActiveTab("documents")}>
                  <div className="mm-stat-icon blue"><FileText size={18} /></div>
                  <div className="mm-stat-data">
                    <span className="mm-stat-label">Documents</span>
                    <span className="mm-stat-value">{documents.length}</span>
                    <span className="mm-stat-sub">Resumes & Decks</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── GRID VIEW ── */}
            {viewMode === "grid" && (
              <>
                {/* PHOTOS */}
                {(activeTab === "all" || activeTab === "photos") && (
                  <div className="mm-section">
                    {activeTab === "all" && (
                      <div className="mm-section-head">
                        <h3 className="mm-section-title">Photos ({photos.length})</h3>
                        <PagesButton className="mm-view-all-btn" onClick={() => setActiveTab("photos")}>View All</PagesButton>
                      </div>
                    )}
                    <div className="mm-photos-grid">
                      {fPhotos.map(img => (
                        <div key={img.id} className="mm-photo-card" onClick={() => setPreviewPhoto(img)}>
                          <img src={img.url} alt={img.name} />
                          <div className="mm-photo-overlay">
                            <span className="mm-photo-name">{img.name}</span>
                            <span className="mm-photo-size">{img.category} • {img.date}</span>
                          </div>
                          <PagesButton
                            className="mm-photo-del-btn"
                            onClick={e => {
                              e.stopPropagation();
                              if (window.confirm("Delete this photo from your portfolio & media?")) delPhoto(img.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </PagesButton>
                        </div>
                      ))}

                      {/* Upload placeholder */}
                      <div className="mm-upload-card" onClick={() => { setUploadType("photo"); setShowUpload(true); }}>
                        <div className="mm-upload-plus"><Plus size={18} /></div>
                        <p className="mm-upload-title">Upload Photos</p>
                        <p className="mm-upload-sub">Portfolio shots</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIDEOS */}
                {(activeTab === "all" || activeTab === "videos") && (
                  <div className="mm-section">
                    {activeTab === "all" && (
                      <div className="mm-section-head">
                        <h3 className="mm-section-title">Videos ({videos.length})</h3>
                        <PagesButton className="mm-view-all-btn" onClick={() => setActiveTab("videos")}>View All</PagesButton>
                      </div>
                    )}
                    <VideosSection
                      videos={fVideos}
                      onUploadClick={() => { setUploadType("video"); setShowUpload(true); }}
                      onDeleteVideo={delVideo}
                    />
                  </div>
                )}

                {/* AUDIOS */}
                {activeTab === "audios" && (
                  <div className="mm-section">
                    <AudiosSection
                      audios={fAudios}
                      onUploadClick={() => { setUploadType("audio"); setShowUpload(true); }}
                      onDeleteAudio={delAudio}
                    />
                  </div>
                )}

                {/* DOCUMENTS */}
                {(activeTab === "all" || activeTab === "documents") && (
                  <div className="mm-section">
                    {activeTab === "all" && (
                      <div className="mm-section-head">
                        <h3 className="mm-section-title">Documents ({documents.length})</h3>
                        <PagesButton className="mm-view-all-btn" onClick={() => setActiveTab("documents")}>View All</PagesButton>
                      </div>
                    )}
                    <div className="mm-docs-grid">
                      {fDocs.map(doc => (
                        <div key={doc.id} className="mm-doc-card">
                          <div className="mm-doc-top">
                            <div className={docIconClass(doc.format)}>{doc.format}</div>
                            <PagesButton className="mm-doc-menu" onClick={e => { e.stopPropagation(); if(window.confirm(`Delete "${doc.title}"?`)) delDoc(doc.id); }} title="Delete">
                              <Trash2 size={14} />
                            </PagesButton>
                          </div>
                          <div className="mm-doc-details">
                            <p className="mm-doc-title">{doc.title}</p>
                            <span className="mm-doc-date">{doc.date}</span>
                          </div>
                        </div>
                      ))}
                      <div className="mm-doc-upload-card" onClick={() => { setUploadType("document"); setShowUpload(true); }}>
                        <div className="mm-upload-plus"><Plus size={18} /></div>
                        <p className="mm-upload-title">Upload Documents</p>
                        <p className="mm-upload-sub">PDF, DOCX, PPTX</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── LIST VIEW ── */}
            {viewMode === "list" && (
              <div className="mm-list-wrap">
                <table className="mm-list-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Date</th>
                      <th style={{ width: 60 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...((activeTab === "all" || activeTab === "photos") ? fPhotos.map(p => ({ ...p, kind: "photo", title: p.name, format: p.type })) : []),
                      ...((activeTab === "all" || activeTab === "videos") ? fVideos.map(v => ({ ...v, kind: "video", format: v.format, size: v.sizeStr })) : []),
                      ...((activeTab === "all" || activeTab === "audios") ? fAudios.map(a => ({ ...a, kind: "audio", title: a.title, size: a.sizeStr })) : []),
                      ...((activeTab === "all" || activeTab === "documents") ? fDocs.map(d => ({ ...d, kind: "document", title: d.title, size: d.sizeStr })) : []),
                    ].map(f => (
                      <tr key={f.id}>
                        <td>
                          <div className="mm-list-file-cell">
                            <div className={`mm-list-icon ${f.kind === "photo" ? "p" : f.kind === "video" ? "v" : f.kind === "audio" ? "a" : "d"}`}>
                              {f.kind === "photo" ? <ImageIcon size={15} /> : f.kind === "video" ? <Film size={15} /> : f.kind === "audio" ? <Music size={15} /> : <FileText size={15} />}
                            </div>
                            <span>{f.title || f.name}</span>
                          </div>
                        </td>
                        <td className="mm-list-meta"><span style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{f.format || f.type}</span></td>
                        <td className="mm-list-meta">{f.sizeStr || f.size}</td>
                        <td className="mm-list-meta">{f.date}</td>
                        <td>
                          <PagesButton
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}
                            title="Delete"
                            onClick={() => {
                              if (!window.confirm(`Delete "${f.title || f.name}"?`)) return;
                              if (f.kind === "photo") delPhoto(f.id);
                              if (f.kind === "video") delVideo(f.id);
                              if (f.kind === "audio") delAudio(f.id);
                              if (f.kind === "document") delDoc(f.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </PagesButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ════ RIGHT SIDEBAR ════ */}
          {activeTab === "all" && (
            <div className="mm-sidebar">
              {/* Storage Overview */}
              <StorageOverview
                percentage={pct}
                usedGB={usedGB}
                totalGB={totalGB}
                photosCount={photos.length}
                videosCount={videos.length}
                audiosCount={audios.length}
                docsCount={documents.length}
              />

              {/* Quick Actions */}
              <div className="mm-widget">
                <h3 className="mm-widget-title" style={{ marginBottom: 14 }}>Quick Actions</h3>
                <div className="mm-qa-list">
                  <PagesButton className="mm-qa-btn" onClick={() => { setUploadType("photo"); setShowUpload(true); }}>
                    <div className="mm-qa-icon"><Upload size={14} /></div>
                    <div className="mm-qa-text"><span className="mm-qa-title">Upload Files</span><span className="mm-qa-desc">Add photos, videos or docs</span></div>
                  </PagesButton>
                  <PagesButton className="mm-qa-btn" onClick={() => setShowFolder(true)}>
                    <div className="mm-qa-icon"><FolderPlus size={14} /></div>
                    <div className="mm-qa-text"><span className="mm-qa-title">Create New Folder</span><span className="mm-qa-desc">Organize your media</span></div>
                  </PagesButton>
                  <PagesButton className="mm-qa-btn" onClick={() => setShowShare(true)}>
                    <div className="mm-qa-icon"><Share2 size={14} /></div>
                    <div className="mm-qa-text"><span className="mm-qa-title">Share Profile</span><span className="mm-qa-desc">Share profile with clients</span></div>
                  </PagesButton>
                  <PagesButton className="mm-qa-btn" onClick={() => setShowSettings(true)}>
                    <div className="mm-qa-icon"><Settings size={14} /></div>
                    <div className="mm-qa-text"><span className="mm-qa-title">Media Settings</span><span className="mm-qa-desc">Manage preferences</span></div>
                  </PagesButton>
                </div>
              </div>

              {/* Recent Portfolio Uploads */}
              <div className="mm-widget">
                <div className="mm-widget-head">
                  <h3 className="mm-widget-title">Recent Media ({photos.length + videos.length})</h3>
                  <PagesButton className="mm-widget-link" onClick={() => setActiveTab("photos")}>View All</PagesButton>
                </div>
                <div className="mm-recent-list">
                  {photos.slice(0, 3).map(p => (
                    <div key={p.id} className="mm-recent-item" onClick={() => setPreviewPhoto(p)}>
                      <div className="mm-recent-left">
                        <div className="mm-recent-avatar"><img src={p.url} alt={p.name} /></div>
                        <div><p className="mm-recent-name">{p.name}</p><span className="mm-recent-meta">{p.category}</span></div>
                      </div>
                      <span className="mm-recent-time">{p.date}</span>
                    </div>
                  ))}
                  {photos.length === 0 && videos.length === 0 && (
                    <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>No media uploaded yet</p>
                  )}
                </div>
              </div>

              {/* Share Talent Link Card */}
              <div className="mm-upgrade-widget" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
                <div className="mm-upgrade-content">
                  <h4 className="mm-upgrade-title" style={{ color: "#fff" }}>Public Profile Link</h4>
                  <p className="mm-upgrade-desc" style={{ color: "#94a3b8" }}>Share your complete media portfolio and contact link with directors.</p>
                  <PagesButton className="mm-upgrade-btn" style={{ backgroundColor: "#e91e8c", color: "#fff" }} onClick={() => setShowShare(true)}>
                    <Share2 size={13} style={{ marginRight: 6 }} /> Share Profile
                  </PagesButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PHOTO PREVIEW MODAL ── */}
      {previewPhoto && (
        <div className="mm-overlay" onClick={() => setPreviewPhoto(null)}>
          <div className="mm-modal" style={{ maxWidth: "600px", padding: "16px" }} onClick={e => e.stopPropagation()}>
            <div className="mm-modal-head" style={{ marginBottom: "12px" }}>
              <h3 className="mm-modal-title">{previewPhoto.name}</h3>
              <PagesButton className="mm-modal-close" onClick={() => setPreviewPhoto(null)}>&times;</PagesButton>
            </div>
            <img src={previewPhoto.url} alt={previewPhoto.name} style={{ width: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: "8px" }} />
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>{previewPhoto.category} • {previewPhoto.date}</span>
              <PagesButton
                style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => {
                  if (window.confirm("Delete this photo?")) {
                    delPhoto(previewPhoto.id);
                    setPreviewPhoto(null);
                  }
                }}
              >
                <Trash2 size={13} /> Delete Photo
              </PagesButton>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast.show && (
        <div className="mm-toast">
          <Check size={15} /><span>{toast.msg}</span>
        </div>
      )}

      {/* ── UPLOAD MODAL (Unified with Backend DB) ── */}
      {showUpload && (
        <div className="mm-overlay" onClick={() => setShowUpload(false)}>
          <div className="mm-modal" onClick={e => e.stopPropagation()}>
            <div className="mm-modal-head">
              <h3 className="mm-modal-title">Upload New File</h3>
              <PagesButton className="mm-modal-close" onClick={() => setShowUpload(false)}>&times;</PagesButton>
            </div>
            {uploading ? (
              <div className="mm-spinner-wrap">
                <div className="mm-spinner" />
                <span className="mm-spinner-text">Uploading to Server...</span>
                <span className="mm-spinner-sub">Saving securely to database</span>
              </div>
            ) : (
              <form onSubmit={handleUpload}>
                <div className="mm-form-group">
                  <label className="mm-form-label">Media Type</label>
                  <select className="mm-form-select" value={uploadType} onChange={e => setUploadType(e.target.value)}>
                    <option value="photo">Photo (Portfolio)</option>
                    <option value="video">Video / Showreel</option>
                    <option value="audio">Audio (Voice Track)</option>
                    <option value="document">Document (Resume / Deck)</option>
                  </select>
                </div>

                {uploadType === "video" && (
                  <div className="mm-form-group">
                    <label className="mm-form-label">Upload Mode</label>
                    <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="vmode"
                          checked={videoMode === "file"}
                          onChange={() => setVideoMode("file")}
                        />
                        Local File (.mp4)
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="vmode"
                          checked={videoMode === "url"}
                          onChange={() => setVideoMode("url")}
                        />
                        YouTube / Link
                      </label>
                    </div>
                  </div>
                )}

                <div className="mm-form-group">
                  <label className="mm-form-label">Title / Label</label>
                  <input
                    type="text"
                    className="mm-form-input"
                    placeholder="Enter file description"
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    required
                  />
                </div>

                {(uploadType === "photo" || uploadType === "video") && (
                  <div className="mm-form-group">
                    <label className="mm-form-label">Category</label>
                    <select className="mm-form-select" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                      <option value="Portfolio">Portfolio</option>
                      <option value="Showreel">Showreel</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Runway">Runway</option>
                      <option value="Lifestyle">Lifestyle</option>
                    </select>
                  </div>
                )}

                {uploadType === "video" && videoMode === "url" ? (
                  <div className="mm-form-group">
                    <label className="mm-form-label">Video URL</label>
                    <input
                      type="url"
                      className="mm-form-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="mm-form-group">
                    <label className="mm-form-label">Choose File</label>
                    <div className="mm-file-drop" onClick={() => fileRef.current?.click()}>
                      <CloudUpload size={24} color="#94a3b8" style={{ margin: "0 auto 6px", display: "block" }} />
                      {selFile
                        ? <span className="mm-file-selected">{selFile.name}</span>
                        : <span className="mm-file-drop-text">Click to choose file from device</span>
                      }
                    </div>
                    <input
                      type="file"
                      ref={fileRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                      accept={uploadType === "photo" ? "image/*" : uploadType === "video" ? "video/*" : uploadType === "audio" ? "audio/*" : ".pdf,.docx,.doc,.pptx"}
                    />
                  </div>
                )}

                <PagesButton type="submit" className="mm-submit-btn" disabled={uploading}>
                  {uploading ? "Saving to Database..." : "Upload File"}
                </PagesButton>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── FOLDER MODAL ── */}
      {showFolder && (
        <div className="mm-overlay" onClick={() => setShowFolder(false)}>
          <div className="mm-modal" onClick={e => e.stopPropagation()}>
            <div className="mm-modal-head">
              <h3 className="mm-modal-title">Create New Folder</h3>
              <PagesButton className="mm-modal-close" onClick={() => setShowFolder(false)}>&times;</PagesButton>
            </div>
            <form onSubmit={handleFolderCreate}>
              <div className="mm-form-group">
                <label className="mm-form-label">Folder Name</label>
                <input type="text" className="mm-form-input" placeholder="e.g. Audition Shoots" value={folderName} onChange={e => setFolderName(e.target.value)} required autoFocus />
              </div>
              <div className="mm-folder-btns">
                <PagesButton type="button" className="mm-folder-cancel" onClick={() => setShowFolder(false)}>Cancel</PagesButton>
                <PagesButton type="submit" className="mm-folder-submit">Create Folder</PagesButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SHARE MODAL (Authentic Public Profile Link) ── */}
      {showShare && (
        <div className="mm-overlay" onClick={() => setShowShare(false)}>
          <div className="mm-modal" onClick={e => e.stopPropagation()}>
            <div className="mm-modal-head">
              <h3 className="mm-modal-title">Share Public Profile</h3>
              <PagesButton className="mm-modal-close" onClick={() => setShowShare(false)}>&times;</PagesButton>
            </div>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <Share2 size={36} color="#e91e8c" style={{ margin: "0 auto 12px", display: "block" }} />
              {shareData?.shareCode && (
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#e91e8c", background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "4px 12px", borderRadius: "20px", display: "inline-block" }}>
                    Talent ID: {shareData.shareCode}
                  </span>
                </div>
              )}
              <p style={{ fontSize: 13, color: "#475569", marginBottom: 14 }}>
                Share your full talent portfolio, showreels, voice samples, and documents with casting directors.
              </p>
              <input
                type="text"
                className="mm-form-input"
                value={publicProfileUrl}
                readOnly
                style={{ textAlign: "center", fontWeight: "600", fontSize: "12px", backgroundColor: "#f8fafc" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "16px", marginBottom: "8px" }}>
                <PagesButton
                  className="mm-submit-btn"
                  style={{ backgroundColor: "#e91e8c", margin: 0 }}
                  onClick={() => {
                    navigator.clipboard.writeText(publicProfileUrl);
                    toast_("Profile link copied to clipboard!");
                  }}
                >
                  Copy Link
                </PagesButton>
                <a
                  href={shareData?.whatsappUrl || `https://api.whatsapp.com/send?text=${encodeURIComponent(`Official Talent & Casting Profile on Book My Stars:\n${publicProfileUrl}\n\nTalent ID: ${shareData?.shareCode || `BMS-${userId}`}\nAvailable for casting calls, commercials, fashion shoots, and feature productions.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mm-submit-btn"
                  style={{ backgroundColor: "#22c55e", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", margin: 0 }}
                >
                  WhatsApp
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                <a
                  href={shareData?.gmailUrl || `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(`Official Talent Portfolio (${shareData?.shareCode || `BMS-${userId}`})`).replace(/\+/g, "%20")}&body=${encodeURIComponent(`Dear Casting Director / Production Team,\r\n\r\nI am pleased to share my official talent profile and portfolio on Book My Stars:\r\n\r\nProfile & Showreels: ${publicProfileUrl}\r\nTalent ID: ${shareData?.shareCode || `BMS-${userId}`}\r\n\r\nAvailable for casting calls, commercial campaigns, fashion shoots, and feature productions.`).replace(/\+/g, "%20")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mm-submit-btn"
                  style={{ backgroundColor: "#ea4335", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", margin: 0, padding: "10px 4px" }}
                  title="Open directly in Gmail web composer"
                >
                  Gmail
                </a>
                <a
                  href={shareData?.outlookUrl || `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(`Official Talent Portfolio (${shareData?.shareCode || `BMS-${userId}`})`).replace(/\+/g, "%20")}&body=${encodeURIComponent(`Dear Casting Director / Production Team,\r\n\r\nI am pleased to share my official talent profile and portfolio on Book My Stars:\r\n\r\nProfile & Showreels: ${publicProfileUrl}\r\nTalent ID: ${shareData?.shareCode || `BMS-${userId}`}\r\n\r\nAvailable for casting calls, commercial campaigns, fashion shoots, and feature productions.`).replace(/\+/g, "%20")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mm-submit-btn"
                  style={{ backgroundColor: "#0078d4", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", margin: 0, padding: "10px 4px" }}
                  title="Open directly in Outlook web composer"
                >
                  Outlook Web
                </a>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={handleOpenMailto}
                  className="mm-submit-btn"
                  style={{ backgroundColor: "#0f172a", color: "#fff", width: "100%", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", margin: 0, padding: "10px 4px", border: "none", cursor: "pointer" }}
                  title="Open default email application and copy invitation text"
                >
                  Email App
                </button>
              </div>

              <div style={{ marginTop: "14px" }}>
                <a
                  href={publicProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "#e91e8c", fontWeight: "600", textDecoration: "none" }}
                >
                  Preview Public View ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div className="mm-overlay" onClick={() => setShowSettings(false)}>
          <div className="mm-modal" onClick={e => e.stopPropagation()}>
            <div className="mm-modal-head">
              <h3 className="mm-modal-title">Media Settings</h3>
              <PagesButton className="mm-modal-close" onClick={() => setShowSettings(false)}>&times;</PagesButton>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Allow public viewing of portfolio", true], ["Display file size tags", true], ["Watermark images & video", false]].map(([label, def]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{label}</span>
                  <input type="checkbox" defaultChecked={def} style={{ width: 16, height: 16, accentColor: "#e91e8c", cursor: "pointer" }} />
                </div>
              ))}
              <PagesButton className="mm-submit-btn" style={{ marginTop: 8 }} onClick={() => setShowSettings(false)}>Save Settings</PagesButton>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
