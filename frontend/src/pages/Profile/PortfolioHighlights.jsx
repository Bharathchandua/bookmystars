/* ── PortfolioHighlights.jsx ────────────────────────────────
   Carousel card showing portfolio photos with < > navigation
   and a zoom-enter animation on the newly visible photo.
   ────────────────────────────────────────────────────────── */

import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";

const PORTFOLIO_VISIBLE = 4;

export default function PortfolioHighlights({ photos = [], onViewFullPortfolio }) {
  const [portStart, setPortStart]   = useState(0);
  const [newPortIdx, setNewPortIdx] = useState(null);

  const displayPhotos = Array.isArray(photos) ? photos : [];
  const total = displayPhotos.length;

  const goNext = () => {
    if (portStart + PORTFOLIO_VISIBLE >= total) return;
    const nextStart        = portStart + 1;
    const newPhotoGlobalIdx = nextStart + PORTFOLIO_VISIBLE - 1; // rightmost incoming photo
    setPortStart(nextStart);
    setNewPortIdx(newPhotoGlobalIdx);
    setTimeout(() => setNewPortIdx(null), 700);
  };

  const goPrev = () => {
    if (portStart === 0) return;
    const nextStart        = portStart - 1;
    const newPhotoGlobalIdx = nextStart;                          // leftmost incoming photo
    setPortStart(nextStart);
    setNewPortIdx(newPhotoGlobalIdx);
    setTimeout(() => setNewPortIdx(null), 700);
  };

  const visiblePhotos = displayPhotos.slice(portStart, portStart + PORTFOLIO_VISIBLE);

  return (
    <div className="prof-overview-card">
      {/* Header */}
      <div className="prof-sec-header">
        <h3 className="prof-sec-title">Portfolio Highlights</h3>
        <button
          type="button"
          className="prof-view-all-link"
          onClick={onViewFullPortfolio}
        >
          View Full Portfolio →
        </button>
      </div>

      {total === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "175px", textAlign: "center", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
          <Image size={28} color="#94a3b8" style={{ marginBottom: "8px" }} />
          <p style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
            No portfolio photos added yet
          </p>
          <button
            type="button"
            onClick={onViewFullPortfolio}
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
            + Upload Photos
          </button>
        </div>
      ) : (
        <div className="prof-portfolio-area">
          {/* Left button */}
          <PagesButton
            className={`prof-port-nav-btn prof-port-nav-btn--left${portStart === 0 ? " prof-port-nav-btn--off" : ""}`}
            onClick={goPrev}
            aria-label="Previous photos"
          >
            <ChevronLeft size={15} />
          </PagesButton>

          {/* 4 visible photos */}
          <div className="prof-portfolio-grid">
            {visiblePhotos.map((src, i) => {
              const globalIdx = portStart + i;
              const isNew     = globalIdx === newPortIdx;
              return (
                <img
                  key={globalIdx}
                  src={src}
                  alt={`Portfolio ${globalIdx + 1}`}
                  className={`prof-portfolio-img${isNew ? " zoom-enter" : ""}`}
                  onClick={onViewFullPortfolio}
                />
              );
            })}
          </div>

          {/* Right button */}
          <PagesButton
            className={`prof-port-nav-btn prof-port-nav-btn--right${portStart + PORTFOLIO_VISIBLE >= total ? " prof-port-nav-btn--off" : ""}`}
            onClick={goNext}
            aria-label="Next photos"
          >
            <ChevronRight size={15} />
          </PagesButton>
        </div>
      )}
    </div>
  );
}
