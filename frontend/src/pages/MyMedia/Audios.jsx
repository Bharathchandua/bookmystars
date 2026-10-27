import PagesButton from "../common/PagesButton";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, MoreVertical, Plus, Trash2, Download } from "lucide-react";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import { confirmDelete } from "../../shared/utils/alert";

export default function Audios({ audios, onUploadClick, onDeleteAudio }) {
  const [playingId, setPlayingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    const clickAway = () => setActiveMenu(null);
    document.addEventListener("click", clickAway);
    return () => document.removeEventListener("click", clickAway);
  }, []);

  const togglePlay = (audio) => {
    if (playingId === audio.id) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = getFullImageUrl(audio.audioUrl);
        audioPlayerRef.current.play().catch(e => console.log("Audio play error:", e));
        setPlayingId(audio.id);
      }
    }
  };

  return (
    <div className="mm-audio-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Hidden audio element for browser playback */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />

      {audios.map((audio) => {
        const fullUrl = getFullImageUrl(audio.audioUrl);
        const isPlaying = playingId === audio.id;

        return (
          <div
            key={audio.id}
            className="mm-audio-row"
            style={{
              background: "#fff",
              border: "1px solid #f1f5f9",
              borderRadius: 12,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              transition: "box-shadow 0.2s",
            }}
          >
            {/* Left: Play + Info */}
            <div className="mm-audio-left" style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
              <PagesButton
                onClick={() => togglePlay(audio)}
                className="mm-audio-play-btn"
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: isPlaying ? "#e91e8c" : "#7c3aed",
                  color: "#fff", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(124,58,237,0.3)",
                  flexShrink: 0
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
              </PagesButton>

              <div className="mm-audio-info" style={{ minWidth: 0, flex: 1 }}>
                <p className="mm-audio-title" style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {audio.title}
                </p>
                <span className="mm-audio-meta" style={{ fontSize: 11, color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {audio.format} • {audio.sizeStr || "2.4 MB"} • {audio.duration || "01:15"}
                </span>
              </div>
            </div>

            {/* Waveform */}
            <div className="mm-audio-wave" style={{ display: "flex", alignItems: "center", gap: 2.5, height: 24, flexShrink: 0 }}>
              {[6, 12, 18, 10, 14, 8, 12, 6].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: isPlaying ? `${h}px` : `${h * 0.6}px`,
                    background: isPlaying ? "#e91e8c" : "#cbd5e1",
                    borderRadius: 1.5,
                    transition: "height 0.2s, background 0.2s",
                    animation: isPlaying ? `audioWave 1.2s ${i * 0.1}s ease-in-out infinite alternate` : "none",
                  }}
                />
              ))}
            </div>

            {/* Right: time + menu */}
            <div className="mm-audio-right" style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              <span className="mm-audio-duration" style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                {audio.duration || "01:15"}
              </span>
              <div style={{ position: "relative" }}>
                <PagesButton
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === audio.id ? null : audio.id); }}
                  className="mm-audio-menu-btn"
                  style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
                >
                  <MoreVertical size={14} />
                </PagesButton>
                {activeMenu === audio.id && (
                  <div
                    style={{ position: "absolute", right: 0, top: 32, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 4, minWidth: 120, zIndex: 30 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {fullUrl && (
                      <a
                        href={fullUrl}
                        download={`${audio.title || "audio"}.mp3`}
                        style={{ textDecoration: "none", padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#475569", borderRadius: 5, display: "flex", alignItems: "center", gap: 8 }}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Download size={13} /> Download
                      </a>
                    )}
                    <PagesButton
                      style={{ background: "none", border: "none", padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#ef4444", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%" }}
                      onClick={async () => {
                        const confirmed = await confirmDelete(audio.title || "this audio track");
                        if (confirmed) {
                          onDeleteAudio(audio.id);
                          setActiveMenu(null);
                        }
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </PagesButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Upload placeholder */}
      <div
        onClick={onUploadClick}
        className="mm-audio-upload-card"
        style={{
          border: "1.5px dashed #cbd5e1", background: "#fafbfd", borderRadius: 12,
          padding: "18px", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, cursor: "pointer", transition: "all 0.2s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#e91e8c"; e.currentTarget.style.background = "#fdf2f8"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#fafbfd"; }}
      >
        <div className="mm-audio-upload-plus" style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "1px solid #f0e6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#e91e8c" }}>
          <Plus size={16} />
        </div>
        <div className="mm-audio-upload-info">
          <p style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", margin: 0 }}>Upload Audio</p>
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, margin: 0 }}>MP3, WAV, AAC</p>
        </div>
      </div>

      <style>{`
        @keyframes audioWave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
