/* ── TalentsTab.jsx ──────────────────────────────────────────
   Talents Discovery directory with category filters (Actors, Models, etc.),
   live 3-day availability schedule indicators, full work showcase modal,
   and direct booking capabilities.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import { 
  Search, MapPin, Sparkles, Loader2, Users, Eye, Calendar, 
  Film, CheckCircle2, IndianRupee, Briefcase, Lock, Globe 
} from "lucide-react";
import { getTalentsDirectory } from "../../features/bms/api/talents/talentsApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";
import TalentSchedulePanel from "./TalentSchedulePanel";
import TalentWorkModal from "./TalentWorkModal";
import BookingRequestModal from "./BookingRequestModal";

const CATEGORIES = [
  { label: "All Talents", value: null },
  { label: "🎭 Actors", value: "ACTOR" },
  { label: "💃 Models", value: "MODEL" },
  { label: "🎤 Singers", value: "SINGER" },
  { label: "🕺 Dancers", value: "DANCER" },
  { label: "🎬 Directors", value: "DIRECTOR" },
  { label: "✨ Other", value: "OTHER" },
];

export default function TalentsTab() {
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals for complete work showcase and booking
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalTalent, setModalTalent] = useState(null);

  const fetchTalents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTalentsDirectory({
        type: selectedType,
        query: searchQuery,
      });
      setTalents(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedTalent((prev) => {
          if (prev) {
            const found = data.find((t) => t.userId === prev.userId);
            return found || data[0];
          }
          return data[0];
        });
      } else {
        setSelectedTalent(null);
      }
    } catch (err) {
      console.error("Error fetching talent directory:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, searchQuery]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const handleOpenWorkModal = (talent, e) => {
    if (e) e.stopPropagation();
    setModalTalent(talent);
    setIsWorkModalOpen(true);
  };

  const handleOpenBookingModal = (talent, e) => {
    if (e) e.stopPropagation();
    setModalTalent(talent);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="talents-tab-container">
      {/* Category Pills & Search Bar */}
      <div className="talents-header-bar">
        <div className="talents-search-row">
          <div className="talents-search-box">
            <Search size={18} className="talents-search-icon" />
            <input
              type="text"
              placeholder="Search talent by full name, stage name, or city..."
              className="talents-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="talents-filter-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className={`talent-pill ${selectedType === cat.value ? "talent-pill--active" : ""}`}
              onClick={() => setSelectedType(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split Grid: Left Roster, Right Schedule Panel */}
      <div className="talents-split-grid">
        {/* Left Column: Talent Cards */}
        <div className="talents-roster-list">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <Loader2 size={28} className="spin" style={{ margin: "0 auto 12px auto", color: "#db2777" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Loading verified registered talents from database...</p>
            </div>
          ) : talents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: 16, border: "1.5px dashed #cbd5e1" }}>
              <Users size={36} style={{ color: "#94a3b8", marginBottom: 10 }} />
              <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontWeight: 800 }}>No Talents Found</h4>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                No registered talents match your search filter. Try clearing the filter or selecting another category.
              </p>
            </div>
          ) : (
            talents.map((talent) => {
              const isSelected = selectedTalent?.userId === talent.userId;
              const photoUrl = talent.profilePhoto ? getFullImageUrl(talent.profilePhoto) : null;

              return (
                <div
                  key={talent.userId}
                  className={`talent-card-item ${isSelected ? "talent-card-item--selected" : ""}`}
                  onClick={() => setSelectedTalent(talent)}
                >
                  <div className="talent-card-top-row">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={talent.fullName}
                        className="talent-card-avatar"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="talent-card-avatar-placeholder">
                        {talent.fullName?.charAt(0) || "T"}
                      </div>
                    )}

                    <div className="talent-card-info">
                      <h4 className="talent-card-name" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span>{talent.fullName}</span>
                        {talent.stageName && talent.stageName.trim() !== talent.fullName.trim() && (
                          <span className="talent-stage-pill">"{talent.stageName}"</span>
                        )}
                        {talent.isPrivate ? (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: 10,
                            backgroundColor: "#f5f3ff",
                            color: "#7c3aed",
                            border: "1px solid #ddd6fe"
                          }}>
                            <Lock size={10} /> Private
                          </span>
                        ) : (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: 10,
                            backgroundColor: "#ecfdf5",
                            color: "#059669",
                            border: "1px solid #a7f3d0"
                          }}>
                            <Globe size={10} /> Public
                          </span>
                        )}
                      </h4>

                      <div className="talent-card-types">
                        {talent.profileTypes && talent.profileTypes.map((type, idx) => (
                          <span key={idx} className="talent-type-tag">
                            {type}
                          </span>
                        ))}
                      </div>

                      <div className="talent-card-meta">
                        {talent.location && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={13} style={{ color: "#db2777" }} /> {talent.location}
                          </span>
                        )}
                        {talent.yearsExperience !== null && talent.yearsExperience !== undefined && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Briefcase size={13} /> {talent.yearsExperience} yrs exp
                          </span>
                        )}
                        {talent.dayRate && (
                          <span style={{ color: "#0f172a", fontWeight: 800 }}>
                            ₹{talent.dayRate} / day
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="talent-card-actions">
                    <button
                      type="button"
                      className="btn-card-view-work"
                      onClick={(e) => handleOpenWorkModal(talent, e)}
                    >
                      <Film size={14} /> View Work & Portfolio
                    </button>

                    <button
                      type="button"
                      className="btn-card-book"
                      onClick={(e) => handleOpenBookingModal(talent, e)}
                    >
                      <Calendar size={14} /> Book Talent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Schedule & Calendar Panel */}
        <TalentSchedulePanel 
          selectedTalent={selectedTalent} 
          onOpenWorkModal={(t) => handleOpenWorkModal(t || selectedTalent)}
          onOpenBookingModal={(t) => handleOpenBookingModal(t || selectedTalent)}
        />
      </div>

      {/* Talent Complete Work Showcase Modal */}
      {isWorkModalOpen && modalTalent && (
        <TalentWorkModal
          isOpen={isWorkModalOpen}
          talent={modalTalent}
          onClose={() => setIsWorkModalOpen(false)}
          onOpenBookingModal={() => {
            setIsWorkModalOpen(false);
            setIsBookingModalOpen(true);
          }}
        />
      )}

      {/* Direct Booking Request Modal */}
      {isBookingModalOpen && modalTalent && (
        <BookingRequestModal
          isOpen={isBookingModalOpen}
          talent={modalTalent}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={() => {
            setIsBookingModalOpen(false);
            fetchTalents();
          }}
        />
      )}
    </div>
  );
}
