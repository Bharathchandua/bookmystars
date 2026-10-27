import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Play, MoreVertical, Trash2, Download, Plus } from "lucide-react";
import { confirmDelete } from "../../shared/utils/alert";

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

export default function Videos({ videos, onUploadClick, onDeleteVideo }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <>
      <div className="mm-videos-grid">
        {videos.map((vid) => {
          const ytThumb = getYoutubeThumb(vid.videoUrl);
          const thumbSrc = vid.thumb || ytThumb;
          const isYoutube = vid.videoUrl && (vid.videoUrl.includes("youtube.com") || vid.videoUrl.includes("youtu.be"));

          return (
            <div key={vid.id} className="mm-video-card" onClick={() => setPlayingVideo(vid)}>
              <div className="mm-video-thumb">
                {thumbSrc ? (
                  <img src={thumbSrc} alt={vid.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : vid.videoUrl ? (
                  <video
                    src={vid.videoUrl}
                    preload="metadata"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px" }}>
                    No Preview
                  </div>
                )}

                <div className="mm-video-play">
                  <div className="mm-play-circle">
                    <Play size={18} fill="white" color="white" style={{ marginLeft: 2 }} />
                  </div>
                </div>
                {vid.duration && <span className="mm-duration-badge">{vid.duration}</span>}

                {/* Three-dot menu */}
                <PagesButton
                  className="mm-video-menu-btn"
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 26, height: 26, borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", zIndex: 5
                  }}
                  onClick={(e) => toggleMenu(e, vid.id)}
                >
                  <MoreVertical size={14} color="#475569" />
                </PagesButton>

                {activeMenu === vid.id && (
                  <div
                    style={{
                      position: "absolute", top: 38, right: 8,
                      background: "#fff", borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      padding: "4px", minWidth: 120, zIndex: 30,
                      display: "flex", flexDirection: "column", gap: 2
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <PagesButton
                      style={{ background: "none", border: "none", padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#475569", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      onClick={() => { setPlayingVideo(vid); setActiveMenu(null); }}
                    >
                      <Play size={13} /> Play Video
                    </PagesButton>
                    {vid.videoUrl && !isYoutube && (
                      <a
                        href={vid.videoUrl}
                        download={`${vid.title || "video"}.mp4`}
                        style={{ background: "none", padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#475569", borderRadius: 5, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Download size={13} /> Download
                      </a>
                    )}
                    <PagesButton
                      style={{ background: "none", border: "none", padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#ef4444", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      onClick={async () => {
                        const confirmed = await confirmDelete(vid.title || "this video");
                        if (confirmed) {
                          onDeleteVideo(vid.id);
                          setActiveMenu(null);
                        }
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </PagesButton>
                  </div>
                )}
              </div>

              <div className="mm-video-info">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="mm-video-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{vid.title || "Untitled Video"}</p>
                  <p className="mm-video-meta">{vid.category || "Showreel"}{vid.duration ? ` • ${vid.duration}` : ""}</p>
                </div>
                <PagesButton
                  className="mm-video-menu-btn"
                  onClick={(e) => toggleMenu(e, vid.id)}
                >
                  <MoreVertical size={14} />
                </PagesButton>
              </div>
            </div>
          );
        })}

        {/* Upload Placeholder */}
        <div className="mm-video-upload-card" onClick={onUploadClick}>
          <div className="mm-upload-plus"><Plus size={18} /></div>
          <p className="mm-upload-title">Upload Videos</p>
          <p className="mm-upload-sub">MP4, MOV, YouTube</p>
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="mm-video-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="mm-video-modal" onClick={e => e.stopPropagation()}>
            <div className="mm-video-modal-head">
              <h3>{playingVideo.title || "Video Player"}</h3>
              <PagesButton className="mm-video-modal-close" onClick={() => setPlayingVideo(null)}>&times;</PagesButton>
            </div>
            <div className="mm-video-player" style={{ backgroundColor: "#000", minHeight: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {playingVideo.videoUrl && (playingVideo.videoUrl.includes("youtube.com") || playingVideo.videoUrl.includes("youtu.be")) ? (
                <iframe
                  src={getYoutubeEmbedUrl(playingVideo.videoUrl)}
                  title={playingVideo.title}
                  style={{ width: "100%", height: "380px", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : playingVideo.videoUrl ? (
                <video
                  controls
                  autoPlay
                  src={playingVideo.videoUrl}
                  poster={playingVideo.thumb}
                  style={{ width: "100%", maxHeight: "65vh", outline: "none" }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p style={{ color: "#fff" }}>No video URL available</p>
              )}
            </div>
            <div className="mm-video-footer">
              <span className="mm-video-tag">{playingVideo.category || "Showreel"}</span>
              {playingVideo.duration && <span className="mm-video-tag">Duration: {playingVideo.duration}</span>}
              {playingVideo.year && <span className="mm-video-tag">Year: {playingVideo.year}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
