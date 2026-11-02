import PagesButton from "../common/PagesButton";
import { useState } from "react";

const TABS = [
  "All Opportunities",
  "Auditions",
  "Casting Calls",
  "Projects",
  "Brand Collaborations",
  "Creative Jobs",
];

export default function OpportunityTabs({ activeTab, setActiveTab, myPostsCount = 0, directCount = 0 }) {
  return (
    <div className="opp-tabs-row" style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto" }}>
      {TABS.map((tab) => (
        <PagesButton
          key={tab}
          className={`opp-tab-btn ${activeTab === tab ? "active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </PagesButton>
      ))}

      {/* Dedicated Tab for Direct Opportunities Specifically For You */}
      <PagesButton
        className={`opp-tab-btn ${activeTab === "Specifically For You" ? "active" : ""}`}
        onClick={() => setActiveTab("Specifically For You")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: activeTab === "Specifically For You" ? "800" : "700",
          color: activeTab === "Specifically For You" ? "#ee008f" : "#be185d",
          backgroundColor: activeTab === "Specifically For You" ? "#fdf2f8" : "#fff1f2",
          borderColor: activeTab === "Specifically For You" ? "#f472b6" : "#fecdd3",
          borderRadius: "8px",
          padding: "6px 14px",
          whiteSpace: "nowrap"
        }}
      >
        <span>🎯 Specifically For You ({directCount})</span>
      </PagesButton>

      {/* Dedicated Tab for Logged-In User's Created Opportunities */}
      <PagesButton
        className={`opp-tab-btn ${activeTab === "My Posted Opportunities" ? "active" : ""}`}
        onClick={() => setActiveTab("My Posted Opportunities")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: activeTab === "My Posted Opportunities" ? "800" : "700",
          color: activeTab === "My Posted Opportunities" ? "#ee008f" : "#4338ca",
          backgroundColor: activeTab === "My Posted Opportunities" ? "#fdf2f8" : "#eef2ff",
          borderColor: activeTab === "My Posted Opportunities" ? "#f472b6" : "#c7d2fe",
          borderRadius: "8px",
          padding: "6px 14px",
          whiteSpace: "nowrap"
        }}
      >
        <span>⭐ My Posted ({myPostsCount})</span>
      </PagesButton>
    </div>
  );
}
