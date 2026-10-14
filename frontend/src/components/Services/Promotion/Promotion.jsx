import React from "react";
import { Link } from "react-router-dom";
import { 
  Megaphone, Play, Users, FileText, Calendar, 
  ClipboardList, Lightbulb, Video, Activity, Trophy, 
  ArrowRight, Share2, Eye, Link2, CheckCircle2, Globe, Heart, Hash, Sparkles, Rocket 
} from "lucide-react";
import { 
  FaYoutube, FaInstagram, FaFacebook, FaLinkedin, 
  FaWhatsapp, FaGoogle, FaEnvelope 
} from "react-icons/fa6";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button";
import Card from "../../common/Card.jsx";

// Import Hero Image and Campaign Posters
import promotionHero from "../../../assets/promotion_Hero.png";
import shadowPoster from "../../../assets/broken_silence_poster.png";
import dreamPoster from "../../../assets/dreams_live_poster.png";
import soundPoster from "../../../assets/legends_rise_poster.png";
import glowPoster from "../../../assets/beyond_the_spotlight_poster.png";
import cityPoster from "../../../assets/city_lights_poster.png";
import journeyPoster from "../../../assets/the_journey_poster.png";
import rhythmPoster from "../../../assets/rhythm_unplugged_poster.png";
import beyondSpotlight from "../../../assets/beyond_spotlight.png";
import cityNew from "../../../assets/city_lights_new.png";

import "./promotion.css";

// Custom outline SVG icons for stats bar:
const CampaignsDeliveredIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 4l3.8 2.2 4.4-.3 2.7 3.5 4.3 1.1 1.2 4.3 3.5 2.7-.3 4.4 2.2 3.8-2.2 3.8.3 4.4-3.5 2.7-1.2 4.3-4.3 1.1-2.7 3.5-4.4-.3-3.8 2.2-3.8-2.2-4.4.3-2.7-3.5-4.3-1.1-1.2-4.3-3.5-2.7.3-4.4-2.2-3.8 2.2-3.8-.3-4.4 3.5-2.7 1.2-4.3 4.3-1.1 2.7-3.5 4.4.3z" />
    <path d="M38 27h-4l-7-5v16l7-5h4a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5z" />
    <path d="M31 33v5a1.5 1.5 0 0 0 1.5 1.5h1" />
    <path d="M22 26a5 5 0 0 0 0 8" />
    <path d="M18 22a11 11 0 0 0 0 16" />
  </svg>
);

const HappyClientsIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="19" cy="26" r="5" />
    <path d="M8 45a9 9 0 0 1 14.5-6" />
    <circle cx="45" cy="26" r="5" />
    <path d="M41.5 39a9 9 0 0 1 14.5 6" />
    <circle cx="32" cy="21" r="6" />
    <path d="M20 45a12 12 0 0 1 24 0" />
  </svg>
);

const PeopleReachedIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="50" x2="58" y2="50" />
    <path d="M10 50V26a7 7 0 0 1 14 0v24" />
    <path d="M22 50V18a10 10 0 0 1 20 0v32" />
    <path d="M40 50V26a7 7 0 0 1 14 0v24" />
    <circle cx="17" cy="32" r="3" />
    <path d="M12 44a5 5 0 0 1 10 0" />
    <circle cx="47" cy="32" r="3" />
    <path d="M42 44a5 5 0 0 1 10 0" />
    <circle cx="32" cy="26" r="4.5" />
    <path d="M25 44a7 7 0 0 1 14 0" />
  </svg>
);

const PlatformsCoveredIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="12" width="16" height="16" rx="4" />
    <rect x="36" y="12" width="16" height="16" rx="4" />
    <rect x="12" y="36" width="16" height="16" rx="4" />
    <rect x="36" y="36" width="16" height="16" rx="4" />
  </svg>
);

const ResultFocusedIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 6s16 4 16 18c0 14-16 26-16 26S16 38 16 24c0-14 16-18 16-18z" />
    <circle cx="32" cy="23" r="8" />
    <polyline points="28 23 31 26 36 19" />
  </svg>
);

// Custom outline SVG icons matching the UI design crops:
const MegaphoneIcon = ({ size = 44 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.6 16.8l2.9 5c.4.7 1.3.9 2 .5.7-.4.9-1.3.5-2l-2.9-5" />
    <path d="M17 14h-3v-4h3" />
    <path d="M3 13v-2c0-1.1.9-2 2-2h4l6-3.5v11L9 13H5a2 2 0 0 1-2-2z" />
    <path d="M19 8c.8.9 1.3 2.1 1.3 3.3s-.5 2.4-1.3 3.3" />
  </svg>
);

const PlayCircleIcon = ({ size = 44 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="none" />
  </svg>
);

const SocialBubblesIcon = ({ size = 44 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 16.5H5.5a3.5 3.5 0 0 1-3.5-3.5V8a3.5 3.5 0 0 1 3.5-3.5h7A3.5 3.5 0 0 1 16 8v1.5" />
    <line x1="6" y1="7" x2="10" y2="7" />
    <line x1="5.5" y1="10" x2="9.5" y2="10" />
    <path d="M18.5 19.5h-5.83l-2.83.75.75-2.83A5 5 0 0 1 13.5 13.5h5a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5z" />
    <path d="M18.5 15.6c-.2-.25-.5-.35-.8-.35-.45 0-.8.34-.8.8 0 .44.3.74.8 1.14.28.25.8.74.8.74s.52-.49.8-.74c.5-.4.8-.7.8-1.14 0-.46-.35-.8-.8-.8-.3 0-.6.1-.8.35z" fill="currentColor" stroke="none" />
  </svg>
);

const InfluencerUserIcon = ({ size = 44 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 1.5, 12.9 3.5, 15.1 3.7, 13.5 5.1, 14 7.3, 12 6.2, 10 7.3, 10.5 5.1, 8.9 3.7, 11.1 3.5" />
    <circle cx="12" cy="11.8" r="3.2" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const PRDocumentIcon = ({ size = 44 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    <rect x="8" y="6" width="13" height="15" rx="2" />
    <line x1="12" y1="11" x2="17" y2="11" />
    <line x1="12" y1="14" x2="17" y2="14" />
    <line x1="12" y1="17" x2="15" y2="17" />
    <rect x="11" y="9" width="3" height="1" rx="0.5" fill="currentColor" />
  </svg>
);

const EventCalendarIcon = ({ size = 44 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <polygon points="12 12, 12.6 13.6, 14.3 13.8, 13 14.9, 13.4 16.6, 12 15.6, 10.6 16.6, 11 14.9, 9.7 13.8, 11.4 13.6" />
  </svg>
);

const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <path d="M23.498 6.163c-.272-1.016-1.071-1.815-2.087-2.087C19.578 3.5 12 3.5 12 3.5s-7.578 0-9.411.576c-1.016.272-1.815 1.071-2.087 2.087C0 8.002 0 12 0 12s0 3.998.576 5.837c.272 1.016 1.071 1.815 2.087 2.087C4.422 20.5 12 20.5 12 20.5s7.578 0 9.411-.576c1.016-.272 1.815-1.071 2.087-2.087C24 15.998 24 12 24 12s0-3.998-.576-5.837z" fill="#FF0000" />
    <path d="M9.5 15.5l6.5-3.5-6.5-3.5v7z" fill="#ffffff" />
  </svg>
);

const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285aeb" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instagramGradient)" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="4" stroke="url(#instagramGradient)" strokeWidth="2" fill="none" />
    <circle cx="18" cy="6" r="1.2" fill="url(#instagramGradient)" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path d="M14.65 12h-2.13v7.35H9.47V12H8v-2.52h1.47V7.8c0-2.05 1-3.23 3.09-3.23 1 0 1.86.07 2.11.1v2.44H13.2c-1 0-1.18.47-1.18 1.16v1.73h2.79l-.36 2.52z" fill="#ffffff" />
  </svg>
);

const XLogo = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#000000" />
    <path d="M17.48 5h2.42l-5.29 6.05L21 19h-4.87l-3.82-5L7.93 19H5.5l5.66-6.47L5 5h5l3.44 4.56L17.48 5zm-.85 12.56h1.34L9.08 6.36H7.65l8.98 11.2z" fill="#ffffff" />
  </svg>
);

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <circle cx="6.2" cy="5.8" r="1.8" fill="#ffffff" />
    <rect x="4.4" y="9.2" width="3.6" height="9.8" fill="#ffffff" />
    <path d="M10.8 9.2h3.45v1.34h.05c.48-.91 1.66-1.87 3.4-1.87 3.63 0 4.3 2.4 4.3 5.5v4.83H18.4v-4.4c0-1.05-.02-2.4-1.47-2.4-1.47 0-1.69 1.15-1.69 2.33v4.47h-3.6v-9.8z" fill="#ffffff" />
  </svg>
);

const WhatsAppLogo = () => (
  <svg viewBox="0 0 175.216 175.552" width="28" height="28" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="whatsappGradient" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#57d163"/>
        <stop offset="1" stopColor="#23b33a"/>
      </linearGradient>
    </defs>
    <path fill="#fff" d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>
    <path fill="url(#whatsappGradient)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"/>
    <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>
  </svg>
);

const GoogleAdsLogo = () => (
  <svg viewBox="0 0 250.8 250.8" width="28" height="28" style={{ flexShrink: 0 }}>
    <g transform="translate(0, 12)">
      <path fill="#3C8BD9" d="M85.9,28.6c2.4-6.3,5.7-12.1,10.6-16.8c19.6-19.1,52-14.3,65.3,9.7c10,18.2,20.6,36,30.9,54 c17.2,29.9,34.6,59.8,51.6,89.8c14.3,25.1-1.2,56.8-29.6,61.1c-17.4,2.6-33.7-5.4-42.7-21c-15.1-26.3-30.3-52.6-45.4-78.8 c-0.3-0.6-0.7-1.1-1.1-1.6c-1.6-1.3-2.3-3.2-3.3-4.9c-6.7-11.8-13.6-23.5-20.3-35.2c-4.3-7.6-8.8-15.1-13.1-22.7 c-3.9-6.8-5.7-14.2-5.5-22C83.6,36.2,84.1,32.2,85.9,28.6" />
      <path fill="#FABC04" d="M85.9,28.6c-0.9,3.6-1.7,7.2-1.9,11c-0.3,8.4,1.8,16.2,6,23.5C101,82,112,101,122.9,120c1,1.7,1.8,3.4,2.8,5 c-6,10.4-12,20.7-18.1,31.1c-8.4,14.5-16.8,29.1-25.3,43.6c-0.4,0-0.5-0.2-0.6-0.5c-0.1-0.8,0.2-1.5,0.4-2.3 c4.1-15,0.7-28.3-9.6-39.7c-6.3-6.9-14.3-10.8-23.5-12.1c-12-1.7-22.6,1.4-32.1,8.9c-1.7,1.3-2.8,3.2-4.8,4.2 c-0.4,0-0.6-0.2-0.7-0.5c4.8-8.3,9.5-16.6,14.3-24.9C45.5,98.4,65.3,64,85.2,29.7C85.4,29.3,85.7,29,85.9,28.6" />
      <path fill="#34A852" d="M11.8,158c1.9-1.7,3.7-3.5,5.7-5.1c24.3-19.2,60.8-5.3,66.1,25.1c1.3,7.3,0.6,14.3-1.6,21.3 c-0.1,0.6-0.2,1.1-0.4,1.7c-0.9,1.6-1.7,3.3-2.7,4.9c-8.9,14.7-22,22-39.2,20.9C20,225.4,4.5,210.6,1.8,191 c-1.3-9.5,0.6-18.4,5.5-26.6c1-1.8,2.2-3.4,3.3-5.2C11.1,158.8,10.9,158,11.8,158" />
      <path fill="#FABC04" d="M11.8,158c-0.4,0.4-0.4,1.1-1.1,1.2c-0.1-0.7,0.3-1.1,0.7-1.6L11.8,158" />
      <path fill="#E1C025" d="M81.6,201c-0.4-0.7,0-1.2,0.4-1.7c0.1,0.1,0.3,0.3,0.4,0.4L81.6,201" />
    </g>
  </svg>
);

const InfluencersLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }} fill="none" stroke="#7b2cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const EmailMarketingLogo = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }} fill="none" stroke="#ec008c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

export default function Promotion() {
  const breadcrumbs = [
    { label: "Home", link: "/" },
    { label: "Agencies", link: "#" },
    { label: "Promotion", link: "/services/promotion" }
  ];

  const services = [
    {
      title: "Campaign Strategy",
      desc: "Data-driven strategies customized for your project goals.",
      icon: <MegaphoneIcon size={44} />
    },
    {
      title: "Teasers & Trailers",
      desc: "High-impact teasers and trailers that create curiosity and hype.",
      icon: <PlayCircleIcon size={44} />
    },
    {
      title: "Social Media Campaigns",
      desc: "Creative content and paid campaigns across all major social platforms.",
      icon: <SocialBubblesIcon size={44} />
    },
    {
      title: "Influencer Marketing",
      desc: "Collaborate with the right influencers to reach and engage your audience.",
      icon: <InfluencerUserIcon size={44} />
    },
    {
      title: "PR & Media Outreach",
      desc: "Media coverage, press releases, and interviews to build credibility.",
      icon: <PRDocumentIcon size={44} />
    },
    {
      title: "Event & Launch Promotion",
      desc: "Promote your events, premieres and launches to maximize attendance.",
      icon: <EventCalendarIcon size={44} />
    }
  ];

  const processSteps = [
    {
      num: "01",
      title: "Research & Planning",
      desc: "We analyze your audience, market trends and set clear campaign objectives.",
      icon: <ClipboardList size={30} />
    },
    {
      num: "02",
      title: "Strategy & Concept",
      desc: "We craft unique promotion strategies and creative concepts that stand out.",
      icon: <Lightbulb size={30} />
    },
    {
      num: "03",
      title: "Content Creation",
      desc: "We create engaging teasers, posters, videos and content for all platforms.",
      icon: <Video size={30} />
    },
    {
      num: "04",
      title: "Campaign Execution",
      desc: "We execute across digital, social, influencers, media and offline channels.",
      icon: <Megaphone size={30} />
    },
    {
      num: "05",
      title: "Monitor & Optimize",
      desc: "We track performance, optimize in real-time and maximize results.",
      icon: <Activity size={30} />
    },
    {
      num: "06",
      title: "Results That Matter",
      desc: "We deliver measurable impact and help your project grow.",
      icon: <Trophy size={30} />
    }
  ];

  const channels = [
    { name: "YouTube", icon: <YouTubeLogo />, className: "youtube" },
    { name: "Instagram", icon: <InstagramLogo />, className: "instagram" },
    { name: "Facebook", icon: <FacebookLogo />, className: "facebook" },
    { name: "X (Twitter)", icon: <XLogo />, className: "x" },
    { name: "LinkedIn", icon: <LinkedInLogo />, className: "linkedin" },
    { name: "WhatsApp", icon: <WhatsAppLogo />, className: "whatsapp" },
    { name: "Google Ads", icon: <GoogleAdsLogo />, className: "googleads" },
    { name: "Influencers", icon: <InfluencersLogo />, className: "influencers" },
    { name: "Email Marketing", icon: <EmailMarketingLogo />, className: "email" }
  ];

  const campaigns = [
    {
      title: "SHADOWS",
      subtitle: "Film Promotion",
      campaignType: "Theatrical Release Campaign",
      img: shadowPoster,
      stats: [
        { label: "Reach", val: "12M+" },
        { label: "Engagement", val: "4.8M+" },
        { label: "Link Clicks", val: "230K+" }
      ]
    },
    {
      title: "BEHIND THE DREAM",
      subtitle: "Web Series Promotion",
      campaignType: "Digital Campaign",
      img: dreamPoster,
      stats: [
        { label: "Reach", val: "8.6M+" },
        { label: "Engagement", val: "3.2M+" },
        { label: "Video Views", val: "160K+" }
      ]
    },
    {
      title: "SOUND OF LIFE",
      subtitle: "Music Video Promotion",
      campaignType: "Social Media Campaign",
      img: soundPoster,
      stats: [
        { label: "Reach", val: "6.4M+" },
        { label: "Engagement", val: "2.7M+" },
        { label: "Shares", val: "95K+" }
      ]
    },
    {
      title: "Glow Naturally",
      subtitle: "Brand Campaign",
      campaignType: "Digital & Influencer Campaign",
      img: glowPoster,
      stats: [
        { label: "Reach", val: "5.1M+" },
        { label: "Engagement", val: "1.9M+" },
        { label: "Leads", val: "120K+" }
      ]
    },
    {
      title: "City Lights",
      subtitle: "Short Film Promotion",
      campaignType: "Social Media Campaign",
      img: cityPoster,
      stats: [
        { label: "Reach", val: "4.2M+" },
        { label: "Engagement", val: "1.8M+" },
        { label: "Link Clicks", val: "85K+" }
      ]
    },
    {
      title: "The Journey",
      subtitle: "Documentary Promotion",
      campaignType: "PR & Media Campaign",
      img: journeyPoster,
      stats: [
        { label: "Reach", val: "3.5M+" },
        { label: "Engagement", val: "1.2M+" },
        { label: "Views", val: "90K+" }
      ]
    },
    {
      title: "Rhythm Unplugged",
      subtitle: "Live Concert Promotion",
      campaignType: "Event Ticket Sales",
      img: rhythmPoster,
      stats: [
        { label: "Reach", val: "5.8M+" },
        { label: "Engagement", val: "2.1M+" },
        { label: "Leads", val: "140K+" }
      ]
    },
    {
      title: "BEYOND SPOTLIGHT",
      subtitle: "Talk Show Promotion",
      campaignType: "YouTube & Spotify Campaign",
      img: beyondSpotlight,
      stats: [
        { label: "Reach", val: "8.2M+" },
        { label: "Engagement", val: "3.5M+" },
        { label: "Listeners", val: "110K+" }
      ]
    },
    {
      title: "METROPOLIS",
      subtitle: "Web Series Launch",
      campaignType: "Influencer Marketing",
      img: cityNew,
      stats: [
        { label: "Reach", val: "9.5M+" },
        { label: "Engagement", val: "4.1M+" },
        { label: "Subscribers", val: "180K+" }
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
    setStartIndex((prev) => (prev > 0 ? prev - 1 : campaigns.length - visibleCards));
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
    setStartIndex((prev) => (prev < campaigns.length - visibleCards ? prev + 1 : 0));
  };

  const handleMobilePrev = () => {
    setMobileIndex((prev) => (prev > 0 ? prev - 1 : campaigns.length - 1));
  };

  const handleMobileNext = () => {
    setMobileIndex((prev) => (prev < campaigns.length - 1 ? prev + 1 : 0));
  };

  // Touch handlers for mobile swipe navigation
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
    
    // Check if swipe is mostly horizontal
    if (Math.abs(diffX) > Math.abs(diffY)) {
      const swipeThreshold = 50;
      if (diffX > swipeThreshold) {
        handleMobileNext();
      } else if (diffX < -swipeThreshold) {
        handleMobilePrev();
      }
    }
  };

  const statsData = [
    { val: "500+", lbl: "Campaigns Delivered", icon: <CampaignsDeliveredIcon size={38} /> },
    { val: "200+", lbl: "Happy Clients", icon: <HappyClientsIcon size={38} /> },
    { val: "50M+", lbl: "People Reached", icon: <PeopleReachedIcon size={38} /> },
    { val: "15+", lbl: "Platforms Covered", icon: <PlatformsCoveredIcon size={38} /> },
    { val: "100%", lbl: "Result Focused", icon: <ResultFocusedIcon size={38} /> }
  ];

  return (
    <div className="promotion-page-wrapper">
      <Navbar />

      <main className="promotion-page-content">
        
        {/* =============================================
           1. HERO SECTION & BREADCRUMBS
           ============================================= */}
        <section className="promotion-hero-section">
          <div className="promotion-hero-container">
            <div className="promotion-hero-left">
              <div className="promotion-badge-wrap">
                <span className="promotion-badge">Promotion</span>
              </div>

              <h1 className="promotion-main-title">
                <span className="promo-title-line-1">Create Buzz.</span>
                <span className="promo-title-line-2">Drive <span className="text-pink">Engagement.</span></span>
              </h1>

              <p className="promotion-hero-desc">
                We design and execute strategic promotion campaigns that amplify your content, build excitement, and connect you with the right audience across every platform.
              </p>

              {/* Benefit features */}
              <div className="promotion-hero-benefits">
                <div className="promo-benefit-item">
                  <div className="promo-benefit-header">
                    <Users size={16} />
                    <span>Wider Reach</span>
                  </div>
                  <span className="promo-benefit-desc">Reach the right audience across multiple platforms.</span>
                </div>
                <div className="promo-benefit-item">
                  <div className="promo-benefit-header">
                    <Share2 size={16} />
                    <span>Max Engagement</span>
                  </div>
                  <span className="promo-benefit-desc">Engaging content strategies that spark conversations.</span>
                </div>
                <div className="promo-benefit-item">
                  <div className="promo-benefit-header">
                    <Trophy size={16} />
                    <span>Result Driven</span>
                  </div>
                  <span className="promo-benefit-desc">Data-backed campaigns that deliver measurable results.</span>
                </div>
              </div>

              <div className="promotion-hero-buttons">
                <a href="#connect" className="btn-promo-connect">
                  Connect With Us
                </a>
                <a href="#work" className="btn-promo-work">
                  <Play size={15} fill="currentColor" style={{ marginRight: "4px" }} />
                  View Our Work
                </a>
              </div>
            </div>

            <div className="promotion-hero-right">
              <img src={promotionHero} alt="Create Buzz. Drive Engagement" className="promotion-hero-image" />
              
              {/* Floating Social Media Logos */}
              <div className="floating-logo float-instagram">
                <FaInstagram size={28} />
              </div>
              <div className="floating-logo float-youtube">
                <FaYoutube size={26} />
              </div>
              <div className="floating-logo float-facebook">
                <FaFacebook size={28} />
              </div>
              <div className="floating-logo float-x">
                <span className="x-text">𝕏</span>
              </div>

              {/* Floating Interaction Bubbles */}
              <div className="floating-bubble bubble-8k-left">
                <Heart size={15} fill="currentColor" />
                <span>8K</span>
              </div>
              <div className="floating-bubble bubble-8k-right">
                <Heart size={15} fill="currentColor" />
                <span>8K</span>
              </div>
              <div className="floating-bubble bubble-12k-center">
                <Users size={15} />
                <span>12K</span>
              </div>
              <div className="floating-bubble bubble-23k-right">
                <Share2 size={15} fill="currentColor" />
                <span>23K</span>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================
           2. WHAT WE DO SECTION
           ============================================= */}
        <section className="promo-what-we-do">
          <div className="promo-section-header">
            <h2 className="promo-section-title decorated-title">
              <span className="title-decorator-group">
                <span className="title-decorator-line"></span>
                <span className="title-decorator-dot"></span>
                <span className="title-decorator-line"></span>
              </span>
              <span className="title-text">What We Do</span>
              <span className="title-decorator-group">
                <span className="title-decorator-line"></span>
                <span className="title-decorator-dot"></span>
                <span className="title-decorator-line"></span>
              </span>
            </h2>
            <p className="promo-section-subtitle">
              End-to-end promotion solutions to make your project stand out and succeed.
            </p>
          </div>

          <div className="promo-services-grid">
            {services.map((serv, idx) => (
              <Card className="promo-service-card" key={idx}>
                <div className="promo-card-icon-wrap">
                  {serv.icon}
                </div>
                <h3 className="promo-card-title">{serv.title}</h3>
                <p className="promo-card-desc">{serv.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* =============================================
           3. OUR PROMOTION PROCESS SECTION
           ============================================= */}
        <section className="promo-process-section">
          <div className="promo-section-header">
            <h2 className="promo-section-title">Our Promotion Process</h2>
            <p className="promo-section-subtitle">
              A proven process that turns your content into a conversation.
            </p>
          </div>

          <div className="promo-process-timeline">
            {processSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="promo-step-arrow">
                    <ArrowRight size={22} />
                  </div>
                )}
                <div className="promo-process-step">
                  <div className="promo-process-icon-wrap">
                    {step.icon}
                  </div>
                  <h4 className="promo-step-title">{step.num}. {step.title}</h4>
                  <p className="promo-step-desc">{step.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* =============================================
           4. PROMOTION CHANNELS WE LEVERAGE SECTION
           ============================================= */}
        <section className="promo-channels-section">
          <div className="promo-section-header" style={{ marginBottom: "36px" }}>
            <h2 className="promo-section-title" style={{ fontSize: "28px" }}>Promotion Channels We Leverage</h2>
          </div>

          <div className="promo-channels-grid">
            {channels.map((chan, idx) => (
              <div className={`promo-channel-badge ${chan.className}`} key={idx}>
                {chan.icon}
                <span>{chan.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =============================================
           5. CAMPAIGNS THAT CREATED BUZZ SECTION
           ============================================= */}
          <section className="promo-campaigns-section" id="work">
            <div className="promo-section-header">
              <h2 className="promo-section-title">Campaigns That Created Buzz</h2>
              <p className="promo-section-subtitle">
                Real projects. Real impact.
              </p>
            </div>

            {/* ── DESKTOP CAROUSEL (hidden on mobile via CSS) ── */}
            <div className="promo-carousel-container promo-carousel-desktop">
              <Button className="promo-carousel-btn prev-btn" onClick={handlePrev}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Button>

              <div className="promo-campaigns-grid-wrapper">
                <div className="promo-campaigns-grid" style={{ '--promo-slide-index': String(startIndex) }}>
                  {campaigns.map((camp, idx) => (
                    <Card className="promo-campaign-card" key={idx}>
                      <div className="promo-campaign-img-wrap">
                        <img src={camp.img} alt={camp.title} />
                      </div>
                      <div className="promo-campaign-body">
                        <h3 className="promo-campaign-title">{camp.subtitle}</h3>
                        <span className="promo-campaign-subtitle">{camp.campaignType}</span>
                        <div className="promo-campaign-stats">
                          {camp.stats.map((st, sIdx) => (
                            <div className="promo-campaign-stat-col" key={sIdx}>
                              <span className="promo-campaign-stat-val">{st.val}</span>
                              <span className="promo-campaign-stat-lbl">{st.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button className="promo-carousel-btn next-btn" onClick={handleNext}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Button>
            </div>

            {/* ── MOBILE CAROUSEL — one card at a time (hidden on desktop via CSS) ── */}
            <div className="promo-carousel-mobile-container">
              <Button className="promo-mobile-side-btn prev-btn" onClick={handleMobilePrev}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Button>
              
              <div 
                className="promo-mobile-card-wrap"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {(() => {
                  const camp = campaigns[mobileIndex];
                  return (
                    <Card className="promo-campaign-card promo-mobile-card">
                      <div className="promo-campaign-img-wrap">
                        <img src={camp.img} alt={camp.title} />
                      </div>
                      <div className="promo-campaign-body">
                        <h3 className="promo-campaign-title">{camp.subtitle}</h3>
                        <span className="promo-campaign-subtitle">{camp.campaignType}</span>
                        <div className="promo-campaign-stats">
                          {camp.stats.map((st, sIdx) => (
                            <div className="promo-campaign-stat-col" key={sIdx}>
                              <span className="promo-campaign-stat-val">{st.val}</span>
                              <span className="promo-campaign-stat-lbl">{st.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })()}
              </div>

              <Button className="promo-mobile-side-btn next-btn" onClick={handleMobileNext}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Button>

              <div className="promo-mobile-dots">
                {campaigns.map((_, idx) => (
                  <Button
                    key={idx}
                    className={`promo-mobile-dot ${idx === mobileIndex ? 'active' : ''}`}
                    onClick={() => setMobileIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="promo-more-btn-wrap">
              <a href="#more" className="btn-promo-work" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>View More Work</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </section>

        {/* =============================================
           6. STATS BAR SECTION
           ============================================= */}
        <section className="promo-stats-bar-section">
          <div className="promo-stats-bar-container">
            {statsData.map((st, idx) => (
              <div className="promo-stat-bar-item" key={idx}>
                <div className="promo-stat-bar-icon-wrap">
                  {st.icon}
                </div>
                <div className="promo-stat-bar-text">
                  <span className="promo-stat-bar-val">{st.val}</span>
                  <span className="promo-stat-bar-lbl">{st.lbl}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =============================================
           7. FOOTER CALL-TO-ACTION (CTA) SECTION
           ============================================= */}
        <section className="promo-footer-cta" id="connect">
          <div className="promo-cta-box">
            <div className="promo-cta-content-left">
              <div className="promo-cta-rocket-wrap">
                <Rocket size={28} className="rocket-icon" />
              </div>
              <div className="promo-cta-text-wrap">
                <h2 className="promo-cta-title">
                  Ready to create buzz around <span className="highlight">your project?</span>
                </h2>
                <p className="promo-cta-desc">
                  Let's build a promotion strategy that gets you noticed and loved.
                </p>
              </div>
            </div>
            <div className="promo-cta-right">
              <a href="#contact" className="btn-promo-connect-gradient">
                <span>Connect With Us</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

      </main>

      <FooterAgency />
    </div>
  );
}