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

export default function OpportunityTabs({ activeTab, setActiveTab }) {
  return (
    <div className="opp-tabs-row">
      {TABS.map((tab) => (
        <PagesButton
          key={tab}
          className={`opp-tab-btn ${activeTab === tab ? "active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </PagesButton>
      ))}
    </div>
  );
}
