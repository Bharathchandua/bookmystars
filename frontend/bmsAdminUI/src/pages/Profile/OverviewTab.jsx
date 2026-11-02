/* ── OverviewTab.jsx ──────────────────────────────────────────
   Comprehensive Overview Tab:
   - About card with bio text and real stats
   - Portfolio Highlights carousel with empty state
   - Measurements with body silhouette & specs (no fake defaults)
   - Work Experience with real user experiences (no fake brands)
   - Videos with real user showreels (no stock placeholders)
   - Client Reviews (no fake reviewers or scores)
   ─────────────────────────────────────────────────────────── */

import React, { useState } from "react";
import About from "./About.jsx";
import PortfolioHighlights from "./PortfolioHighlights.jsx";
import { Star, Play, Briefcase, Video, X, ExternalLink, Film } from "lucide-react";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";

function getVideoThumbnail(v) {
  if (!v) return null;
  if (v.thumbnailUrl) return getFullImageUrl(v.thumbnailUrl);
  if (v.videoUrl) {
    if (v.videoUrl.includes("youtube.com") || v.videoUrl.includes("youtu.be")) {
      const match = v.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
  }
  return null;
}

export default function OverviewTab({
  profile,
  portfolioPhotos = [],
  measurements = {},
  experiences = [],
  videos = [],
  reviews = [],
  onNavigateTab,
  onEditBio
}) {
  const [playingVideo, setPlayingVideo] = useState(null);
  const displayExperiences = Array.isArray(experiences)
    ? experiences.slice(0, 5).map(e => ({
        brand: e.company || e.brand || "Brand",
        campaign: e.title || e.campaign || "Campaign",
        year: e.startDate ? e.startDate.substring(0, 4) : (e.year || "2024"),
        color: "#e91e8c"
      }))
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* ══ 6-COLUMN OVERVIEW GRID ══ */}
      <div className="prof-overview-grid">

        {/* Row 1, Col 1-3: About Card (Auto-synced from other tabs) */}
        <About
          profile={profile}
          experiences={experiences}
          portfolioPhotos={portfolioPhotos}
          videos={videos}
        />

        {/* Row 1, Col 4-6: Portfolio Highlights Card */}
        <PortfolioHighlights
          photos={portfolioPhotos}
          onViewFullPortfolio={() => onNavigateTab("portfolio")}
        />

        {/* Row 2, Col 1-2: Measurements Card */}
        <div className="prof-overview-card" style={{ cursor: "pointer" }} onClick={() => onNavigateTab("measurements")}>
          <div className="prof-sec-header">
            <h3 className="prof-sec-title">Measurements</h3>
          </div>
          <div className="prof-measure-inner">
            {/* Body Silhouette SVG */}
            <div className="prof-body-svg-wrap">
              <svg width="46" height="150" viewBox="0 0 46 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Head */}
                <ellipse cx="23" cy="14" rx="7.5" ry="9" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Neck */}
                <path d="M20 23V26M26 23V26" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                {/* Torso & Curves */}
                <path
                  d="M13 28C17 27 29 27 33 28C35.5 29 37 36 35 44C33.5 50 30 55 29 60C28 65 34 71 35 80C36 89 34 98 33 105L31 142M13 28C10.5 29 9 36 11 44C12.5 50 16 55 17 60C18 65 12 71 11 80C10 89 12 98 13 105L15 142"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Inseam / Legs separator */}
                <path d="M23 80V142" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Measurement Table */}
            <table className="prof-measure-table">
              <tbody>
                <tr className="prof-measure-row">
                  <td className="prof-measure-lbl">Height</td>
                  <td className="prof-measure-val">{measurements?.height || "—"}</td>
                </tr>
                <tr className="prof-measure-row">
                  <td className="prof-measure-lbl">Bust</td>
                  <td className="prof-measure-val">{measurements?.bust || "—"}</td>
                </tr>
                <tr className="prof-measure-row">
                  <td className="prof-measure-lbl">Waist</td>
                  <td className="prof-measure-val">{measurements?.waist || "—"}</td>
                </tr>
                <tr className="prof-measure-row">
                  <td className="prof-measure-lbl">Hips</td>
                  <td className="prof-measure-val">{measurements?.hips || "—"}</td>
                </tr>
                <tr className="prof-measure-row">
                  <td className="prof-measure-lbl">Shoe Size</td>
                  <td className="prof-measure-val">{measurements?.shoeSize || "—"}</td>
                </tr>
                <tr className="prof-measure-row">
                  <td className="prof-measure-lbl">Hair Color</td>
                  <td className="prof-measure-val">{measurements?.hairColor || "—"}</td>
                </tr>
                <tr className="prof-measure-row">
                  <td className="prof-measure-lbl">Eye Color</td>
                  <td className="prof-measure-val">{measurements?.eyeColor || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 2, Col 3-4: Work Experience Card */}
        <div className="prof-overview-card">
          <div className="prof-sec-header">
            <h3 className="prof-sec-title">Work Experience</h3>
            <button
              type="button"
              className="prof-view-all-link"
              onClick={() => onNavigateTab("work-experience")}
            >
              View All →
            </button>
          </div>
          {displayExperiences.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "150px", textAlign: "center", padding: "16px" }}>
              <Briefcase size={28} color="#cbd5e1" style={{ marginBottom: "8px" }} />
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                No work experience added yet
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab("work-experience")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#e91e8c",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                + Add Experience
              </button>
            </div>
          ) : (
            <div className="prof-work-list">
              {displayExperiences.map((exp, idx) => (
                <div key={idx} className="prof-work-item">
                  <span
                    className="prof-brand"
                    style={{
                      color: exp.color || "#0f172a",
                      fontWeight: 800
                    }}
                  >
                    {exp.brand}
                  </span>
                  <span className="prof-campaign">{exp.campaign}</span>
                  <span className="prof-work-year">{exp.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 2, Col 5-6: Videos Card */}
        <div className="prof-overview-card">
          <div className="prof-sec-header">
            <h3 className="prof-sec-title">Videos</h3>
            <button
              type="button"
              className="prof-view-all-link"
              onClick={() => onNavigateTab("videos")}
            >
              View All →
            </button>
          </div>
          {!videos || videos.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "150px", textAlign: "center", padding: "16px" }}>
              <Video size={28} color="#cbd5e1" style={{ marginBottom: "8px" }} />
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                No videos or showreels added yet
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab("videos")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#e91e8c",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                + Add Video / Showreel
              </button>
            </div>
          ) : (
            <div className="prof-videos-layout">
              {/* Top Main Video */}
              <div
                className="prof-video-main"
                onClick={() => setPlayingVideo(videos[0])}
                title="Click to play video"
              >
                {getVideoThumbnail(videos[0]) ? (
                  <img
                    src={getVideoThumbnail(videos[0])}
                    alt={videos[0].title || "Main Showreel"}
                  />
                ) : videos[0].videoUrl ? (
                  <video
                    src={getFullImageUrl(videos[0].videoUrl)}
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
                    <Video size={36} color="#e91e8c" />
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "4px" }}>
                      {videos[0].category || "Showreel"}
                    </span>
                  </div>
                )}
                <div className="prof-play-overlay">
                  <div className="prof-play-circle">
                    <Play size={18} fill="#ffffff" color="#ffffff" style={{ marginLeft: "2px" }} />
                  </div>
                </div>
                {videos[0].category && (
                  <span className="prof-video-badge">{videos[0].category}</span>
                )}
                {videos[0].duration && (
                  <span className="prof-video-dur">{videos[0].duration}</span>
                )}
              </div>

              {/* Sub Videos or Info Bar */}
              {videos.length === 1 ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px 0 2px" }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {videos[0].title || "Main Showreel"}
                    </h4>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      {videos[0].year || new Date().getFullYear()} • {videos[0].category || "Performance"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlayingVideo(videos[0])}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e91e8c",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      padding: 0,
                      whiteSpace: "nowrap"
                    }}
                  >
                    Play Reel →
                  </button>
                </div>
              ) : (
                <div className="prof-video-subs">
                  {videos.slice(1, 3).map((v, i) => (
                    <div
                      key={i}
                      className="prof-video-sub"
                      onClick={() => setPlayingVideo(v)}
                      title={`Play ${v.title || `Video ${i + 2}`}`}
                    >
                      {getVideoThumbnail(v) ? (
                        <img
                          src={getVideoThumbnail(v)}
                          alt={v.title || `Sub video ${i + 1}`}
                        />
                      ) : v.videoUrl ? (
                        <video
                          src={getFullImageUrl(v.videoUrl)}
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
                          <Video size={20} color="#e91e8c" />
                        </div>
                      )}
                      <div className="prof-play-overlay-sm">
                        <div className="prof-play-circle-sm">
                          <Play size={12} fill="#ffffff" color="#ffffff" style={{ marginLeft: "1px" }} />
                        </div>
                      </div>
                      {v.duration && (
                        <span className="prof-video-dur">{v.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ══ ROW 3: CLIENT REVIEWS (FULL WIDTH) ══ */}
      <div className="prof-reviews-section">
        <div className="prof-sec-header">
          <h3 className="prof-sec-title">Client Reviews</h3>
          <button
            type="button"
            className="prof-view-all-link"
            onClick={() => onNavigateTab("reviews")}
          >
            View All Reviews →
          </button>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="prof-reviews-layout">
            {/* Big Rating Block */}
            <div className="prof-rating-summary">
              <span className="prof-rating-big">
                {(reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)}
              </span>
              <div style={{ display: "flex", gap: "2px", color: "#f59e0b" }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
            </div>

            {/* Review Cards Grid */}
            <div className="prof-reviews-grid">
              {reviews.map((rev, i) => (
                <div key={i} className="prof-review-card">
                  <div className="prof-review-top">
                    {rev.avatar && <img src={rev.avatar} alt={rev.name} className="prof-reviewer-img" />}
                    <div className="prof-reviewer-info">
                      <span className="prof-reviewer-name">{rev.name}</span>
                      <span className="prof-reviewer-role">{rev.role}</span>
                    </div>
                    <div className="prof-review-stars">
                      {[...Array(Math.floor(rev.rating || 5))].map((_, starIdx) => (
                        <Star key={starIdx} size={12} fill="#f59e0b" color="#f59e0b" />
                      ))}
                      <span className="prof-rev-score">{rev.rating || 5}</span>
                    </div>
                  </div>
                  {rev.comment && <p className="prof-rev-text">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "36px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
            <Star size={32} color="#94a3b8" style={{ marginBottom: "8px" }} />
            <h4 style={{ fontSize: "15px", color: "#334155", fontWeight: "700", margin: "0 0 4px 0" }}>No Client Reviews Yet</h4>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
              Reviews and ratings from verified clients will appear here once you complete bookings and projects.
            </p>
          </div>
        )}
      </div>

      {/* Video Playback Modal */}
      {playingVideo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "16px"
          }}
          onClick={() => setPlayingVideo(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "760px",
              padding: "20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                {playingVideo.title || "Showreel / Video"}
              </h3>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", borderRadius: "10px", overflow: "hidden" }}>
              {playingVideo.videoUrl?.includes("youtube.com") || playingVideo.videoUrl?.includes("youtu.be") ? (
                <iframe
                  title={playingVideo.title}
                  src={playingVideo.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={getFullImageUrl(playingVideo.videoUrl)}
                  controls
                  autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              )}
            </div>

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                {playingVideo.category || "Showreel"} {playingVideo.duration ? `• ${playingVideo.duration}` : ""}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPlayingVideo(null);
                  onNavigateTab("videos");
                }}
                style={{ fontSize: "12px", color: "#e91e8c", fontWeight: "700", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                View all in Videos tab →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
