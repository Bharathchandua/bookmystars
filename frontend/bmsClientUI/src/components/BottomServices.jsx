import React from "react";
import { bottomServices } from "../data/siteData.js";
import Card from "./common/Card";

// Pure vector Clapperboard matching RiMovie2Line
const CustomClapperboardIcon = ({ size = 55, color = "#d100d1" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M3 8h18" />
    <path d="M3 5h18" />
    <path d="M6 5l2 3" />
    <path d="M11 5l2 3" />
    <path d="M16 5l2 3" />
    <polygon points="10 11, 15 14, 10 17" fill="none" stroke={color} strokeWidth="2" />
  </svg>
);

// Pure vector Megaphone pointing left matching HiOutlineSpeakerphone
const CustomMegaphoneIcon = ({ size = 55, color = "#7b2cff" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17 10 L8 6 L8 18 L17 14 Z" />
    <rect x="17" y="9" width="2" height="6" rx="1" />
    <path d="M15 13 L15 18 C15 19, 14 19.5, 13 19.5" />
    <path d="M5 9 L2 7" />
    <path d="M4 12 L1 12" />
    <path d="M5 15 L2 17" />
  </svg>
);

// Pure vector Presentation Chart Board matching HiOutlinePresentationChartLine
const CustomMarketingGraphIcon = ({ size = 55, color = "#d100d1" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="18" height="12" rx="2" />
    <path d="M7 15 L5 21" />
    <path d="M17 15 L19 21" />
    <path d="M12 15 L12 21" />
    <path d="M6 11 L10 8 L14 10 L18 6" />
    <path d="M15 6 H18 V9" />
  </svg>
);

const customIcons = [
  { Component: CustomClapperboardIcon, color: "#d100d1" },
  { Component: CustomMegaphoneIcon, color: "#7b2cff" },
  { Component: CustomMarketingGraphIcon, color: "#d100d1" }
];

const formatLinkText = (text) => {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function BottomServices() {
  return (
    <section className="container bottom-services">
      {bottomServices.map(([t, d, originalIcon], i) => {
        const { Component: IconComponent, color: iconColor } = customIcons[i];
        let cardId = "";
        if (i === 0) cardId = "post-production";
        else if (i === 1) cardId = "promotion";
        else if (i === 2) cardId = "digital-marketing";
        return (
          <Card
            key={t}
            variant="service"
            id={cardId}
            icon={<IconComponent size={55} color={iconColor} />}
            title={t}
            description={d}
            link={i === 0 ? "/services/post-production" : i === 1 ? "/services/promotion" : "/services/digital-marketing"}
            linkText={`Explore ${formatLinkText(t)}`}
          />
        );
      })}
    </section>
  );
}