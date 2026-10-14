import React from "react";
import { Play, Trophy, ArrowRight, ShieldCheck, Users, LayoutGrid, TrendingUp } from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from '../../common/Button.jsx';
import Card from '../../common/Card.jsx';

// Import Hero Image and Posters
import digitalMarketingHero from "../../../assets/Digitalmarketing_Hero.png";
import digitalChart from "../../../assets/Digital_chart.png";
import echoesPoster from "../../../assets/broken_silence_poster.png";
import fitfuelPoster from "../../../assets/legends_rise_poster.png";
import urbanPoster from "../../../assets/dreams_live_poster.png";
import diaryPoster from "../../../assets/the_journey_poster.png";
import graphicsSymbol from "../../../assets/Graphics-symbol.png";

import "./digitalmarketing.css";

/* ==========================================================================
   CUSTOM SVG ICONS FOR FLOATING BADGES & LOGOS
   ========================================================================== */
const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="igGlyphGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285aeb" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#igGlyphGrad)" />
    <circle cx="12" cy="12" r="4.2" stroke="url(#igGlyphGrad)" />
    <line x1="18" y1="6" x2="18.01" y2="6" stroke="url(#igGlyphGrad)" strokeWidth="3" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="11" fill="#1877F2" />
    <path d="M15 12h-2.5v9h-3.5v-9H7V8.5h2V6.8C9 4.3 10.3 3 12.8 3c1.2 0 2.2.1 2.5.1v2.9h-1.7c-1.2 0-1.5.6-1.5 1.4v1.1H15.5L15 12z" fill="#ffffff" />
  </svg>
);

const GoogleAdsLogo = ({ size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    {/* Bottom-left green circle/dot */}
    <path d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998z" fill="#34A852" />
    {/* Right long blue bar */}
    <path d="M23.4641 16.9287L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644z" fill="#4285F4" />
    {/* Left short yellow/orange bar */}
    <path d="M7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z" fill="#FABC04" />
  </svg>
);

const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" style={{ flexShrink: 0 }}>
    <rect x="2" y="4" width="20" height="16" rx="4.5" fill="#FF0000" />
    <polygon points="9.5 8.5 15.5 12 9.5 15.5" fill="#ffffff" />
  </svg>
);

/* ==========================================================================
   CUSTOM SVG ICONS FOR SERVICES SECTION
   ========================================================================== */
const SocialMarketingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dm-purple)" }}>
    {/* Back speech bubble */}
    <path d="M34 16h14a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5h-4l-6 6v-6h-4a5 5 0 0 1-5-5V26" />
    {/* Front speech bubble */}
    <path d="M10 24h18a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5h-6l-8 8v-8h-4a5 5 0 0 1-5-5V29a5 5 0 0 1 5-5z" fill="#ffffff" />
    <path d="M10 24h18a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5h-6l-8 8v-8h-4a5 5 0 0 1-5-5V29a5 5 0 0 1 5-5z" />
    {/* Heart inside front speech bubble */}
    <path d="M19 37.5c-1.8-1.6-3.2-3.1-3.2-4.3 0-.9.7-1.6 1.6-1.6.7 0 1.2.4 1.6.9.4-.5.9-.9 1.6-.9.9 0 1.6.7 1.6 1.6 0 1.2-1.4 2.7-3.2 4.3z" fill="currentColor" stroke="none" />
  </svg>
);

const PerformanceAdIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dm-purple)" }}>
    <g transform="rotate(-15 32 32)">
      <path d="M14 36h8l14 8V18L24 26h-8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
      <path d="M22 36v6a2 2 0 0 0 2 2h2" />
      <path d="M44 24c2 1.5 3 3.5 3 6s-1 4.5-3 6" />
      <path d="M50 18c4 3 6 7 6 12s-2 9-6 12" />
    </g>
  </svg>
);

const InfluencerIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dm-purple)" }}>
    {/* Person shoulders */}
    <path d="M16 48c0-6 7-8 16-8s16 2 16 8" />
    {/* Person head */}
    <circle cx="32" cy="28" r="7" />
    {/* Star above head */}
    <polygon points="32 6, 35 11, 41 12, 36.5 16, 38 22, 32 19, 26 22, 27.5 16, 23 12, 29 11" fill="currentColor" />
    {/* Brackets representing influence */}
    <path d="M12 36c-2-4-2-9 0-13" />
    <path d="M52 23c2 4 2 9 0 13" />
  </svg>
);

const SeoIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dm-purple)" }}>
    <circle cx="26" cy="26" r="14" />
    <line x1="36" y1="36" x2="52" y2="52" strokeWidth="3.5" />
    <path d="M20 20a9 9 0 0 1 8 0" strokeWidth="1.5" opacity="0.7" />
  </svg>
);

const ContentMarketingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dm-purple)" }}>
    <rect x="16" y="14" width="28" height="38" rx="4" />
    <path d="M26 14v-3h12v3" />
    <line x1="22" y1="24" x2="38" y2="24" />
    <line x1="22" y1="32" x2="38" y2="32" />
    <line x1="22" y1="40" x2="30" y2="40" />
    <path d="M42 22l6-6a2 2 0 0 1 3 3l-6 6v3h-3v-3z" fill="#ffffff" />
    <path d="M42 22l6-6a2 2 0 0 1 3 3l-6 6v3h-3v-3z" />
  </svg>
);

const EmailIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dm-purple)" }}>
    <rect x="8" y="14" width="48" height="36" rx="6" />
    <path d="M8 16l24 18 24-18" />
  </svg>
);

/* ==========================================================================
   CUSTOM SVG ICONS FOR PROCESS SECTION
   ========================================================================== */
const DiscoveryIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <circle cx="11" cy="11" r="6" />
    <line x1="15.2" y1="15.2" x2="21" y2="21" strokeWidth="3" />
  </svg>
);

const StrategyIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    {/* Circular bulb body */}
    <path d="M15 15a6 6 0 1 0-6 0c0 1 1 2 2 3h2c1-1 2-2 2-3z" />
    {/* Screw base threads */}
    <path d="M10 21h4" />
    <path d="M11 23h2" />
    {/* Filament (vertical line with loop/circle on top) */}
    <circle cx="12" cy="8.5" r="1.5" />
    <line x1="12" y1="10" x2="12" y2="15" />
    {/* 5 Glow rays */}
    <line x1="12" y1="1" x2="12" y2="2.5" />
    <line x1="5.5" y1="3.5" x2="7" y2="5" />
    <line x1="18.5" y1="3.5" x2="17" y2="5" />
    <line x1="2" y1="9" x2="3.5" y2="9" />
    <line x1="22" y1="9" x2="20.5" y2="9" />
  </svg>
);

const ExecuteIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const OptimizeIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ReportIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2.5" />
    <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2.5" />
    <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2.5" />
    <path d="M3 18c3-3 7-1 11-5s5-5 5-5" strokeWidth="2.2" />
    <polyline points="15 8 19 8 19 12" strokeWidth="2.2" />
  </svg>
);

const ScaleIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <g transform="rotate(45 12 12)">
      {/* Rocket Body */}
      <path d="M12 2c-3.8 0-6 4-6 10 0 3.3 2 6 5 6.7V20h2v-1.3c3-.7 5-3.4 5-6.7 0-6-2.2-10-6-10z" />
      {/* Window */}
      <circle cx="12" cy="11" r="1.5" />
      {/* Side Fins */}
      <path d="M6 15l-3 4h3z" />
      <path d="M18 15l3 4h-3z" />
      {/* Flame */}
      <path d="M10.5 20c0 2.5 1.5 3.5 1.5 3.5s1.5-1 1.5-3.5" />
    </g>
  </svg>
);

/* ==========================================================================
   CUSTOM SVG ICONS FOR PLATFORMS tags
   ========================================================================== */
const PlatformFbLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path d="M13.25 21.85v-8.385h2.796l.532-3.47h-3.328V7.77c0-.949.465-1.874 1.956-1.874h1.491V2.943s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.338H7.078v3.47h3.047v8.385h3.125z" fill="#ffffff" />
  </svg>
);

const PlatformIgLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="igPlatGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285aeb" />
      </linearGradient>
    </defs>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="url(#igPlatGrad)" />
    <circle cx="12" cy="12" r="4.5" stroke="url(#igPlatGrad)" />
    <circle cx="17.5" cy="6.5" r="1" fill="url(#igPlatGrad)" stroke="url(#igPlatGrad)" />
  </svg>
);

const PlatformYtLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <rect x="1" y="4" width="22" height="16" rx="4.5" fill="#FF0000" />
    <polygon points="10 8 16 12 10 16" fill="#ffffff" />
  </svg>
);

const PlatformLiLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="5" fill="#0A66C2" />
    <path d="M8 19H5v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#ffffff" />
  </svg>
);

const PlatformXLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="5" fill="#000000" />
    <g transform="matrix(0.65 0 0 0.65 4.2 4.2)">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#ffffff" />
    </g>
  </svg>
);

const PlatformTtLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <path
      d="M16 4a5 5 0 0 0-4 4.88v8.66a3.5 3.5 0 1 1-2.5-3.36v-2.04A5.5 5.5 0 1 0 13.5 17V8a4.99 4.99 0 0 0 4-4H16z"
      fill="#25F4EE"
      transform="translate(-1, 0)"
    />
    <path
      d="M16 4a5 5 0 0 0-4 4.88v8.66a3.5 3.5 0 1 1-2.5-3.36v-2.04A5.5 5.5 0 1 0 13.5 17V8a4.99 4.99 0 0 0 4-4H16z"
      fill="#FE0979"
      transform="translate(1, 0)"
    />
    <path
      d="M16 4a5 5 0 0 0-4 4.88v8.66a3.5 3.5 0 1 1-2.5-3.36v-2.04A5.5 5.5 0 1 0 13.5 17V8a4.99 4.99 0 0 0 4-4H16z"
      fill="#111111"
    />
  </svg>
);

const PlatformPinLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#BD081C" />
    <path d="M12.017 2.7c-5.1 0-9.2 4.1-9.2 9.2 0 3.9 2.4 7.2 5.8 8.6-.1-.7-.2-1.8 0-2.6.2-.7 1.1-4.6 1.1-4.6s-.3-.5-.3-1.4c0-1.3.7-2.2 1.7-2.2.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2.9.4 1.7 1.3 1.7 1.6 0 2.9-1.7 2.9-4.2 0-2.2-1.6-3.8-3.9-3.8-2.6 0-4.2 2-4.2 4 0 .8.3 1.6.7 2.1 0 .1 0 .2 0 .3l-.3 1c-.1.2-.2.2-.4.1-1.1-.5-1.9-2.2-1.9-3.5 0-2.9 2.1-5.6 6.1-5.6 3.2 0 5.7 2.3 5.7 5.3 0 3.2-2 5.7-4.8 5.7-.9 0-1.8-.5-2.1-1.1l-.6 2.2c-.2.8-.8 1.8-1.1 2.4.9.3 1.8.4 2.8.4 5.1 0 9.2-4.1 9.2-9.2 0-5.1-4.1-9.2-9.2-9.2z" fill="#ffffff" />
  </svg>
);

const PlatformScLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="5" fill="#FFFC00" />
    <g transform="matrix(0.8 0 0 0.8 2.4 2.4)">
      <path
        d="M12 2C9 2 6 4 6 8c0 1 0 3 1.5 4.5C6 13 4 14.5 4 16.5c0 1.5 2 2.5 3 2.5a3.5 3.5 0 0 0 2.5-1.5c1.5.5 3 .5 4.5 0A3.5 3.5 0 0 0 17 19c1 0 3-1 3-2.5 0-2-2-3.5-3.5-4C18 11 18 9 18 8c0-4-3-6-6-6z"
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export default function DigitalMarketing() {


  const services = [
    {
      title: "Social Media Marketing",
      desc: "Engaging content, community management, and targeted campaigns across all major platforms.",
      icon: <SocialMarketingIcon size={80} />
    },
    {
      title: "Performance Advertising",
      desc: "High-converting ads on Google, Meta, YouTube, LinkedIn and more to maximize ROI.",
      icon: <PerformanceAdIcon size={80} />
    },
    {
      title: "Influencer Marketing",
      desc: "Collaborate with the right influencers to reach targeted audiences and build trust.",
      icon: <InfluencerIcon size={80} />
    },
    {
      title: "Search Engine Optimization",
      desc: "Improve your website ranking, drive organic traffic, and increase brand visibility.",
      icon: <SeoIcon size={80} />
    },
    {
      title: "Content Marketing",
      desc: "Compelling content strategies that attract, engage, and convert your audience.",
      icon: <ContentMarketingIcon size={80} />
    },
    {
      title: "Email Marketing",
      desc: "Nurture leads and retain customers with personalized email campaigns.",
      icon: <EmailIcon size={80} />
    }
  ];

  const processSteps = [
    {
      num: "01",
      title: "Discovery",
      desc: <>
        <span>We understand your brand,</span>
        <span>audience, goals, and</span>
        <span>market opportunities.</span>
      </>,
      icon: <DiscoveryIcon size={32} />
    },
    {
      num: "02",
      title: "Strategy",
      desc: <>
        <span>We create a customized</span>
        <span>digital strategy tailored</span>
        <span>to your business goals.</span>
      </>,
      icon: <StrategyIcon size={32} />
    },
    {
      num: "03",
      title: "Execute",
      desc: <>
        <span>We launch campaigns across</span>
        <span>the right channels with</span>
        <span>engaging content.</span>
      </>,
      icon: <ExecuteIcon size={32} />
    },
    {
      num: "04",
      title: "Optimize",
      desc: <>
        <span>We analyze performance</span>
        <span>and optimize campaigns for</span>
        <span>better results.</span>
      </>,
      icon: <OptimizeIcon size={32} />
    },
    {
      num: "05",
      title: "Report",
      desc: <>
        <span>You get clear reports with</span>
        <span>insights and growth</span>
        <span>recommendations.</span>
      </>,
      icon: <ReportIcon size={32} />
    },
    {
      num: "06",
      title: "Scale",
      desc: <>
        <span>We scale successful</span>
        <span>campaigns to maximize</span>
        <span>growth and ROI.</span>
      </>,
      icon: <ScaleIcon size={32} />
    }
  ];

  const platforms = [
    { name: "Facebook", logo: <PlatformFbLogo size={22} /> },
    { name: "Instagram", logo: <PlatformIgLogo size={22} /> },
    { name: "YouTube", logo: <PlatformYtLogo size={22} /> },
    { name: "Google Ads", logo: <GoogleAdsLogo size={22} /> },
    { name: "LinkedIn", logo: <PlatformLiLogo size={22} /> },
    { name: "X (Twitter)", logo: <PlatformXLogo size={22} /> },
    { name: "TikTok", logo: <PlatformTtLogo size={22} /> },
    { name: "Pinterest", logo: <PlatformPinLogo size={22} /> },
    { name: "Snapchat", logo: <PlatformScLogo size={22} /> }
  ];

  const successStories = [
    {
      title: "ECHOES (The Short Film)",
      category: "Film Promotion Campaign",
      img: echoesPoster,
      stats: [
        { val: "8.6M+", lbl: "Reach" },
        { val: "1.2M+", lbl: "Engagement" },
        { val: "240K+", lbl: "Video Views" }
      ]
    },
    {
      title: "FITFUEL (Nutrition Brand)",
      category: "Performance Ad Campaign",
      img: fitfuelPoster,
      stats: [
        { val: "5.3X", lbl: "ROAS" },
        { val: "120K+", lbl: "Leads" },
        { val: "35%", lbl: "CPA Reduced" }
      ]
    },
    {
      title: "URBAN STYLE (Fashion Brand)",
      category: "Influencer + Social Campaign",
      img: urbanPoster,
      stats: [
        { val: "6.2M+", lbl: "Reach" },
        { val: "980K+", lbl: "Engagement" },
        { val: "3X", lbl: "Sales Growth" }
      ]
    },
    {
      title: "TRAVELLER'S DIARY (Travel Channel)",
      category: "YouTube Growth Campaign",
      img: diaryPoster,
      stats: [
        { val: "250K+", lbl: "Subscribers" },
        { val: "12M+", lbl: "Views" },
        { val: "4.8%", lbl: "Engagement" }
      ]
    }
  ];

  const [startIndex, setStartIndex] = React.useState(0);
  const [mobileIndex, setMobileIndex] = React.useState(0);

  const handlePrev = () => {
    let visibleCards = 4;
    if (typeof window !== "undefined") {
      if (window.innerWidth <= 768) {
        visibleCards = 3;
      } else if (window.innerWidth <= 850) {
        visibleCards = 2;
      } else if (window.innerWidth <= 1024) {
        visibleCards = 3;
      }
    }
    setStartIndex((prev) => (prev > 0 ? prev - 1 : successStories.length - visibleCards));
  };

  const handleNext = () => {
    let visibleCards = 4;
    if (typeof window !== "undefined") {
      if (window.innerWidth <= 768) {
        visibleCards = 3;
      } else if (window.innerWidth <= 850) {
        visibleCards = 2;
      } else if (window.innerWidth <= 1024) {
        visibleCards = 3;
      }
    }
    setStartIndex((prev) => (prev < successStories.length - visibleCards ? prev + 1 : 0));
  };

  const handleMobilePrev = () => {
    setMobileIndex((prev) => (prev > 0 ? prev - 1 : successStories.length - 1));
  };

  const handleMobileNext = () => {
    setMobileIndex((prev) => (prev < successStories.length - 1 ? prev + 1 : 0));
  };

  // Touch handlers for swipe gestures on mobile
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const touchEndX = React.useRef(0);
  const touchEndY = React.useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      const swipeThreshold = 50;
      if (diffX > swipeThreshold) {
        handleMobileNext();
      } else if (diffX < -swipeThreshold) {
        handleMobilePrev();
      }
    }
  };

  return (
    <div className="dm-page-wrapper" style={{ overflowX: 'hidden', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <Navbar />

      <main className="dm-page-content" style={{ overflowX: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* =============================================
           1. HERO SECTION & BREADCRUMBS
           ============================================= */}
        <section className="dm-hero-section">


          <div className="dm-hero-container">
            <div className="dm-hero-left">
              <div className="dm-badge-wrap">
                <span className="dm-badge">Digital Marketing</span>
              </div>

              <h1 className="dm-main-title">
                <span className="dm-title-line-1">Grow Your Brand.</span>
                <span className="dm-title-line-2">Reach Your <span className="text-pink">Audience.</span></span>
              </h1>

              <p className="dm-hero-desc">
                Leverage data-driven digital marketing, influencer partnerships, mobile social media campaigns, and performance advertising to increase visibility, engagement, and business growth.
              </p>

              {/* Action Buttons */}
              <div className="dm-hero-buttons">
                <a href="#connect" className="btn-dm-connect">
                  <span>Start Your Campaign</span>
                  <ArrowRight size={16} />
                </a>
                <a href="#stories" className="btn-dm-work">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dm-purple)" }}>
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" fill="none" />
                  </svg>
                  <span>View Success Stories</span>
                </a>
              </div>

              {/* Benefits strip inside Hero content columns */}
              <div className="dm-hero-benefits">
                <div className="dm-benefit-item">
                  <div className="dm-benefit-icon">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <div className="dm-benefit-text">
                    <span className="dm-benefit-title">Data-Driven Strategies</span>
                    <span className="dm-benefit-desc">Smart decisions backed by real data and insights.</span>
                  </div>
                </div>
                <div className="dm-benefit-item">
                  <div className="dm-benefit-icon">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <div className="dm-benefit-text">
                    <span className="dm-benefit-title">ROI-Focused Campaigns</span>
                    <span className="dm-benefit-desc">High-converting campaigns that maximize results.</span>
                  </div>
                </div>
                <div className="dm-benefit-item">
                  <div className="dm-benefit-icon">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="dm-benefit-text">
                    <span className="dm-benefit-title">Transparent Reporting</span>
                    <span className="dm-benefit-desc">Clear performance reports and measurable growth.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dm-hero-right">
              <div className="dm-hero-image-wrapper">
                <img src={digitalMarketingHero} alt="Grow Your Brand. Reach Your Audience" className="dm-hero-image" />

                {/* Floating Overlay Badges */}
                <div className="dm-floating-logo dm-float-instagram">
                  <InstagramLogo />
                </div>
                <div className="dm-floating-logo dm-float-facebook">
                  <FacebookLogo />
                </div>
                <div className="dm-floating-logo dm-float-googleads">
                  <GoogleAdsLogo />
                </div>
                <div className="dm-floating-logo dm-float-youtube">
                  <YouTubeLogo />
                </div>

                {/* Floating Digital Chart Graphic */}
                <div className="floating-digital-chart-wrap">
                  <img src={digitalChart} alt="Digital Marketing Performance Chart" className="floating-digital-chart" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================
           2. OUR DIGITAL MARKETING SERVICES SECTION
           ============================================= */}
        <section className="dm-services-section" style={{ overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}>
          <div className="dm-section-header">
            <div className="dm-section-title-wrapper">
              <div className="dm-title-decorator"></div>
              <h2 className="dm-section-title">Our Digital Marketing Services</h2>
              <div className="dm-title-decorator"></div>
            </div>
          </div>

          <div className="dm-services-grid" style={{ boxSizing: 'border-box', maxWidth: '100%' }}>
            {services.map((serv, idx) => (
              <Card className="dm-service-card" key={idx} style={{ boxSizing: 'border-box', minWidth: 0 }}>
                <div className="dm-card-icon-wrap">
                  {serv.icon}
                </div>
                <h3 className="dm-service-title">{serv.title}</h3>
                <p className="dm-service-desc">{serv.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* =============================================
           3. OUR DIGITAL MARKETING PROCESS SECTION
           ============================================= */}
        <section className="dm-process-section">
          <div className="dm-section-header">
            <h2 className="dm-section-title" style={{ marginBottom: "12px" }}>Our Digital Marketing Process</h2>
            <p className="dm-section-subtitle">A proven process that drives results.</p>
          </div>

          <div className="dm-process-timeline">
            {processSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="dm-step-arrow">
                    <ArrowRight size={20} />
                  </div>
                )}
                <div className="dm-process-step">
                  <div className="dm-process-icon-wrap">
                    {step.icon}
                  </div>
                  <h4 className="dm-step-title">{step.num}. {step.title}</h4>
                  <p className="dm-step-desc">{step.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* =============================================
           4. PLATFORMS & CHANNELS SECTION
           ============================================= */}
        <section className="dm-platforms-section">
          <div className="dm-section-header" style={{ marginBottom: "24px" }}>
            <h2 className="dm-section-title">Platforms & Channels We Specialize In</h2>
          </div>

          <div className="dm-platforms-grid">
            {platforms.map((p, idx) => (
              <div className="dm-platform-badge" key={idx}>
                {p.logo}
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =============================================
           5. WHY CHOOSE SECTION
           ============================================= */}
        <section className="dm-choose-section">
          <div className="dm-choose-container">
            {/* Left Column Checklist */}
            <div className="dm-choose-left">
              <h2 className="dm-choose-title">Why Choose BookMyStars for Digital Marketing?</h2>
              <div className="dm-choose-list">
                <div className="dm-choose-list-item">
                  <div className="dm-choose-check-wrap">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Experienced digital marketers & strategists</span>
                </div>
                <div className="dm-choose-list-item">
                  <div className="dm-choose-check-wrap">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Customized strategies for your goals</span>
                </div>
                <div className="dm-choose-list-item">
                  <div className="dm-choose-check-wrap">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Advanced tools and data-driven insights</span>
                </div>
                <div className="dm-choose-list-item">
                  <div className="dm-choose-check-wrap">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Transparent communication & reporting</span>
                </div>
                <div className="dm-choose-list-item">
                  <div className="dm-choose-check-wrap">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Proven track record of delivering results</span>
                </div>
              </div>
            </div>

            {/* Right Column Stats */}
            <div className="dm-choose-right">
              <div className="dm-stat-column">
                <div className="dm-stat-icon-wrap">
                  <Trophy size={30} />
                </div>
                <span className="dm-stat-number">500+</span>
                <span className="dm-stat-label">Campaigns<br />Executed</span>
              </div>
              <div className="dm-stat-column">
                <div className="dm-stat-icon-wrap">
                  <Users size={30} />
                </div>
                <span className="dm-stat-number">200+</span>
                <span className="dm-stat-label">Happy<br />Clients</span>
              </div>
              <div className="dm-stat-column">
                <div className="dm-stat-icon-wrap">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <span className="dm-stat-number">50M+</span>
                <span className="dm-stat-label">People<br />Reached</span>
              </div>
              <div className="dm-stat-column">
                <div className="dm-stat-icon-wrap">
                  <LayoutGrid size={30} />
                </div>
                <span className="dm-stat-number">15+</span>
                <span className="dm-stat-label">Platforms<br />Managed</span>
              </div>
              <div className="dm-stat-column">
                <div className="dm-stat-icon-wrap">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <span className="dm-stat-number">3X</span>
                <span className="dm-stat-label">Average ROI<br />Growth</span>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================
           6. SUCCESS STORIES SECTION (Grid / Slider)
           ============================================= */}
        <section className="dm-stories-section" id="stories">
          <div className="dm-section-header">
            <h2 className="dm-section-title" style={{ marginBottom: "12px" }}>Success Stories</h2>
            <p className="dm-section-subtitle">Real results from real brands.</p>
          </div>

          {/* ── DESKTOP CAROUSEL ── */}
          <div className="dm-carousel-container dm-carousel-desktop">
            <Button className="dm-carousel-btn prev-btn" onClick={handlePrev}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>

            <div className="dm-stories-grid-wrapper">
              <div className="dm-stories-grid" style={{ "--dm-slide-index": String(startIndex) }}>
                {successStories.map((story, idx) => (
                  <Card className="dm-story-card" key={idx}>
                    <div className="dm-story-img-wrap">
                      <img src={story.img} alt={story.title} />
                    </div>
                    <div className="dm-story-body">
                      <span className="dm-story-category">{story.category}</span>
                      <h3 className="dm-story-title">{story.title}</h3>
                      <div className="dm-story-stats">
                        {story.stats.map((stat, sIdx) => (
                          <div className="dm-story-stat-item" key={sIdx}>
                            <span className="dm-story-stat-val">{stat.val}</span>
                            <span className="dm-story-stat-lbl">{stat.lbl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Button className="dm-carousel-btn next-btn" onClick={handleNext}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>

          {/* ── MOBILE CAROUSEL ── */}
          <div className="dm-carousel-mobile-container">
            <Button className="dm-mobile-side-btn prev-btn" onClick={handleMobilePrev}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>
            
            <div 
              className="dm-mobile-card-wrap"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {(() => {
                const story = successStories[mobileIndex];
                return (
                  <Card className="dm-story-card dm-mobile-card">
                    <div className="dm-story-img-wrap">
                      <img src={story.img} alt={story.title} />
                    </div>
                    <div className="dm-story-body">
                      <span className="dm-story-category">{story.category}</span>
                      <h3 className="dm-story-title">{story.title}</h3>
                      <div className="dm-story-stats">
                        {story.stats.map((stat, sIdx) => (
                          <div className="dm-story-stat-item" key={sIdx}>
                            <span className="dm-story-stat-val">{stat.val}</span>
                            <span className="dm-story-stat-lbl">{stat.lbl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>

            <Button className="dm-mobile-side-btn next-btn" onClick={handleMobileNext}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>

            <div className="dm-mobile-dots">
              {successStories.map((_, idx) => (
                <Button
                  key={idx}
                  className={`dm-mobile-dot ${idx === mobileIndex ? 'active' : ''}`}
                  onClick={() => setMobileIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="dm-more-btn-wrap">
            <a href="#more" className="btn-dm-work" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>View More Success Stories</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* =============================================
           7. BOTTOM CTA SECTION
           ============================================= */}
        <section className="dm-cta-section" id="connect">
          <div className="dm-cta-container">
            <div className="dm-cta-box">
              <div className="dm-cta-left">
                <div className="dm-cta-target-icon">
                  <img src={graphicsSymbol} alt="Graphics Symbol" className="dm-cta-symbol-img" />
                </div>
                <div className="dm-cta-text-wrap">
                  <h3 className="dm-cta-title">Ready to Grow Your Brand?</h3>
                  <p className="dm-cta-desc">Let's build high-performing digital marketing campaigns that drive real growth for your business.</p>
                </div>
              </div>
              <div className="dm-cta-right">
                <a href="#connect-now" className="btn-dm-cta-white">
                  <span>Start Your Campaign</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <FooterAgency />
    </div>
  );
}
