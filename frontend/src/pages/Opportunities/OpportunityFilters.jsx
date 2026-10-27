import PagesButton from "../common/PagesButton";
import { ChevronDown, XCircle, Globe, Film, MapPin } from "lucide-react";

export default function OpportunityFilters({
  disciplineFilter = "ALL",
  onDisciplineChange,
  languageFilter = "ALL",
  onLanguageChange,
  availableLanguages = [],
  locationFilter = "ALL",
  onLocationChange,
  onClearFilters,
}) {
  const hasActiveFilters =
    disciplineFilter !== "ALL" ||
    languageFilter !== "ALL" ||
    locationFilter !== "ALL";

  return (
    <div className="opp-filter-row" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", margin: "14px 0" }}>
      {/* 1. Discipline / Post Type Filter */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <select
          value={disciplineFilter}
          onChange={(e) => onDisciplineChange && onDisciplineChange(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            border: disciplineFilter !== "ALL" ? "1.5px solid #ee008f" : "1px solid #cbd5e1",
            backgroundColor: disciplineFilter !== "ALL" ? "#fff1f8" : "#ffffff",
            color: disciplineFilter !== "ALL" ? "#be185d" : "#475569",
            fontWeight: "700",
            fontSize: "12.5px",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
          }}
        >
          <option value="ALL">🎭 All Disciplines</option>
          <option value="ACTING">🎭 Acting / Drama</option>
          <option value="SINGING">🎤 Singing / Music</option>
          <option value="DANCING">💃 Dancing / Choreography</option>
          <option value="MODELING">✨ Modeling / Fashion</option>
          <option value="CREW">🎬 Crew / Direction & Tech</option>
        </select>
      </div>

      {/* 2. Audition & Performance Language Filter */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <select
          value={languageFilter}
          onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            border: languageFilter !== "ALL" ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
            backgroundColor: languageFilter !== "ALL" ? "#faf5ff" : "#ffffff",
            color: languageFilter !== "ALL" ? "#6d28d9" : "#475569",
            fontWeight: "700",
            fontSize: "12.5px",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
          }}
        >
          <option value="ALL">🌐 All Languages</option>
          {availableLanguages.map((lang) => {
            const name = typeof lang === "string" ? lang : lang.name;
            return (
              <option key={name} value={name}>
                🌐 {name}
              </option>
            );
          })}
        </select>
      </div>

      {/* 3. Shoot Location Filter */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <select
          value={locationFilter}
          onChange={(e) => onLocationChange && onLocationChange(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            border: locationFilter !== "ALL" ? "1.5px solid #0284c7" : "1px solid #cbd5e1",
            backgroundColor: locationFilter !== "ALL" ? "#f0f9ff" : "#ffffff",
            color: locationFilter !== "ALL" ? "#0369a1" : "#475569",
            fontWeight: "700",
            fontSize: "12.5px",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
          }}
        >
          <option value="ALL">📍 All Locations</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Chennai">Chennai</option>
          <option value="Delhi">Delhi NCR</option>
          <option value="Kolkata">Kolkata</option>
          <option value="Kochi">Kochi</option>
          <option value="Goa">Goa</option>
          <option value="Pan India">Pan India</option>
        </select>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          style={{
            padding: "7px 12px",
            borderRadius: "8px",
            border: "1px solid #fecaca",
            backgroundColor: "#fff1f2",
            color: "#dc2626",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <XCircle size={14} />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
}
