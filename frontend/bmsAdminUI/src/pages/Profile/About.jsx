/* ── About.jsx ─────────────────────────────────────────────
   Displays the "About" overview card with bio text + stats.
   Auto-synced in real-time from Work Experience, Portfolio,
   Videos, and Profile tabs without requiring manual editing.
   ────────────────────────────────────────────────────────── */
import React from "react";
import { Sparkles } from "lucide-react";

export default function About({
  profile = {},
  experiences = [],
  portfolioPhotos = [],
  videos = [],
  about,
  stats
}) {
  // 1. Projects Completed (Auto-synced from Work Experience tab)
  const totalProjects = Array.isArray(experiences) ? experiences.length : 0;

  // 2. Brands Worked (Auto-synced unique brands from Work Experience tab)
  const uniqueBrands = Array.isArray(experiences)
    ? new Set(experiences.map(e => (e.company || e.brand || "").trim()).filter(Boolean)).size
    : 0;

  // 3. Years Experience (Auto-synced from Work Experience date span)
  let calculatedYears = 0;
  if (Array.isArray(experiences) && experiences.length > 0) {
    const years = [];
    experiences.forEach(e => {
      const yr = e.startDate ? parseInt(String(e.startDate).substring(0, 4), 10) : (e.year ? parseInt(String(e.year), 10) : null);
      if (yr && !isNaN(yr)) years.push(yr);
      const endYr = e.endDate ? parseInt(String(e.endDate).substring(0, 4), 10) : null;
      if (endYr && !isNaN(endYr)) years.push(endYr);
    });
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years, new Date().getFullYear());
      calculatedYears = Math.max(1, maxYear - minYear + 1);
    } else {
      calculatedYears = Math.max(1, experiences.length);
    }
  } else if (profile?.yearsExperience) {
    calculatedYears = profile.yearsExperience;
  }

  // 4. Features (Auto-synced from Portfolio photos + Showreel videos)
  const totalMediaFeatures = (Array.isArray(portfolioPhotos) ? portfolioPhotos.length : 0) +
                             (Array.isArray(videos) ? videos.length : 0);
  const totalFeatures = (profile?.magazineFeatures && profile.magazineFeatures > 0)
    ? profile.magazineFeatures
    : totalMediaFeatures;

  // Compose the 4 stats bar
  const displayStats = [
    { value: String(totalProjects), label: "Projects Completed" },
    { value: String(uniqueBrands), label: "Brands Worked" },
    { value: String(calculatedYears), label: "Years Experience" },
    { value: String(totalFeatures), label: "Features" }
  ];

  // Auto-synced Bio Text
  const rawAbout = (about || profile?.about || "").trim();
  const isDefaultPlaceholder = !rawAbout ||
    rawAbout.toLowerCase().includes("click 'edit profile'") ||
    rawAbout.toLowerCase().includes("no bio added yet") ||
    rawAbout === "Welcome to my profile!";

  let displayBio = rawAbout;

  if (isDefaultPlaceholder) {
    const role = profile?.role || "Professional Talent";
    const location = profile?.location && profile.location !== "Location not set"
      ? `based in ${profile.location}`
      : "";
    const brandList = Array.isArray(experiences)
      ? [...new Set(experiences.map(e => (e.company || e.brand || "").trim()).filter(Boolean))].slice(0, 3).join(", ")
      : "";

    const parts = [];
    parts.push(`${role}${location ? ` ${location}` : ""}.`);

    if (totalProjects > 0) {
      parts.push(`Completed ${totalProjects} professional production${totalProjects > 1 ? "s" : ""}${brandList ? ` with clients including ${brandList}` : ""}.`);
    }

    if (totalMediaFeatures > 0) {
      parts.push(`Features ${portfolioPhotos.length || 0} portfolio highlights and ${videos.length || 0} showreels.`);
    }

    if (profile?.languages) {
      parts.push(`Fluent in ${profile.languages}.`);
    }

    if (parts.length > 1) {
      displayBio = parts.join(" ");
    } else {
      displayBio = rawAbout || "Professional talent profile on Book My Stars. Add work experiences, portfolio photos, and videos to automatically populate this section.";
    }
  }

  return (
    <div className="prof-overview-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h3 className="prof-sec-title" style={{ margin: 0 }}>About</h3>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#059669",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            padding: "3px 8px",
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
          title="This section is automatically synchronized from your Work Experience, Portfolio, and Videos tabs"
        >
          <Sparkles size={11} color="#059669" /> Auto-Synced
        </span>
      </div>

      <p
        className="prof-about-text"
        style={{
          whiteSpace: "pre-line",
          color: "#475569",
          lineHeight: "1.6",
          fontSize: "13px",
          margin: "0 0 16px 0"
        }}
      >
        {displayBio}
      </p>

      <div className="prof-stats-bar">
        {displayStats.map((s, i) => (
          <div key={i} className="prof-stat-box">
            <span className="prof-stat-val">{s.value}</span>
            <span className="prof-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
