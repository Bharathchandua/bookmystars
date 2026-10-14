import PagesButton from "../common/PagesButton";
import React from "react";

export default function ContactTabs({ activeTab, onSelectTab }) {
  const tabs = [
    "All Contacts",
    "Industry Professionals",
    "Agencies",
    "Casting Directors",
    "Co-stars",
    "Personal"
  ];

  return (
    <div className="contacts-top-tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <PagesButton
            key={tab}
            className={`contacts-tab-btn ${isActive ? "active" : ""}`}
            onClick={() => onSelectTab(tab)}
          >
            {tab}
            {isActive && <div className="contacts-tab-underline" />}
          </PagesButton>
        );
      })}
    </div>
  );
}
