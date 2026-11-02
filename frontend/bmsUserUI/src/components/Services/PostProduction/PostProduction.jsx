import React from "react";
import { Play, Trophy, ArrowRight, ShieldCheck, Users, Settings } from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button.jsx";
import Card from "../../common/Card.jsx";

// Import Hero Image and Posters
import postProductionHero from "../../../assets/Post production_Hero.png";
import legendsPoster from "../../../assets/legends_rise_poster.png";
import cityPoster from "../../../assets/city_lights_poster.png";
import rhythmPoster from "../../../assets/rhythm_unplugged_poster.png";
import dreamPoster from "../../../assets/dreams_live_poster.png";
import journeyPoster from "../../../assets/the_journey_poster.png";
import silencePoster from "../../../assets/broken_silence_poster.png";
import beyondPoster from "../../../assets/beyond_the_spotlight_poster.png";

import "./postproduction.css";

// Custom outline SVG icons for stats bar matching design


// Custom editing app SVGs
const PremiereIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#00005c" />
    <text x="5" y="16.5" fill="#1478ff" fontSize="10.5" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">Pr</text>
  </svg>
);

const AfterEffectsIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#1b002c" />
    <text x="5" y="16.5" fill="#d19aff" fontSize="10.5" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">Ae</text>
  </svg>
);

const PhotoshopIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#001e36" />
    <text x="5" y="16.5" fill="#31a8ff" fontSize="10.5" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">Ps</text>
  </svg>
);

const ResolveIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#111111" />
    <circle cx="12" cy="8.2" r="4.2" fill="#ff3366" opacity="0.9" style={{ mixBlendMode: "screen" }} />
    <circle cx="8.7" cy="13.8" r="4.2" fill="#33cc66" opacity="0.9" style={{ mixBlendMode: "screen" }} />
    <circle cx="15.3" cy="13.8" r="4.2" fill="#3399ff" opacity="0.9" style={{ mixBlendMode: "screen" }} />
  </svg>
);

const BlenderIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }} fill="none">
    <circle cx="12" cy="12" r="12" fill="#0f172a" />
    <circle cx="12" cy="13" r="4.5" fill="#ea580c" />
    <circle cx="12" cy="13" r="2.2" fill="#0284c7" />
    <path d="M12 8.5l3.5-3.5M14.5 11l4.5-1.5M15.5 14l3.5 2.2" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Mockup benefit icons
const ExpertIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polygon points="12 11 13.5 14 16.5 14 14 15.5 15 18.5 12 17 9 18.5 10 15.5 7.5 14 10.5 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const QualityIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 11 11 13 15 9" />
  </svg>
);

const DeliveryIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Custom outline SVGs for "What We Do" section
const VideoEditingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <rect x="12" y="6" width="28" height="40" rx="3" />
    <line x1="12" y1="18" x2="40" y2="18" />
    <line x1="12" y1="34" x2="40" y2="34" />
    <rect x="15" y="10" width="3" height="4" rx="0.5" />
    <rect x="15" y="22" width="3" height="4" rx="0.5" />
    <rect x="15" y="38" width="3" height="4" rx="0.5" />
    <rect x="34" y="10" width="3" height="4" rx="0.5" />
    <rect x="34" y="22" width="3" height="4" rx="0.5" />
    <rect x="34" y="38" width="3" height="4" rx="0.5" />
    <circle cx="44" cy="50" r="4" />
    <circle cx="54" cy="44" r="4" />
    <path d="M42.5 46.5L34 34" />
    <path d="M50.5 42L34 34" />
  </svg>
);

const ColorGradingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <circle cx="32" cy="22" r="12" />
    <circle cx="22" cy="38" r="12" />
    <circle cx="42" cy="38" r="12" />
  </svg>
);

const SoundDesignIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <line x1="32" y1="14" x2="32" y2="50" strokeWidth="3.5" />
    <line x1="24" y1="20" x2="24" y2="44" strokeWidth="3" />
    <line x1="40" y1="20" x2="40" y2="44" strokeWidth="3" />
    <line x1="16" y1="25" x2="16" y2="39" strokeWidth="3" />
    <line x1="48" y1="25" x2="48" y2="39" strokeWidth="3" />
    <line x1="8" y1="30" x2="8" y2="34" strokeWidth="2.5" />
    <line x1="56" y1="30" x2="56" y2="34" strokeWidth="2.5" />
  </svg>
);

const VfxIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <path d="M14 50l26-26" strokeWidth="3.5" />
    <path d="M40 24l6-6" strokeWidth="3.5" stroke="var(--post-pink)" />
    <path d="M46 6c0 3 2 5 5 5c-3 0-5 2-5 5c0-3-2-5-5-5c3 0 5-2 5-5z" fill="currentColor" stroke="none" />
    <path d="M56 16c0 2 1.5 3 3 3c-1.5 0-3 1-3 3c0-2-1-3-3-3c2 0 3-1 3-3z" fill="currentColor" stroke="none" />
    <path d="M36 14c0 2 1 3 3 3c-2 0-3 1-3 3c0-2-1-3-3-3c2 0 3-1 3-3z" fill="currentColor" stroke="none" />
  </svg>
);

const MotionGraphicsIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <rect x="12" y="12" width="40" height="40" rx="2" strokeDasharray="5 4" />
    <rect x="9" y="9" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <rect x="49" y="9" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <rect x="9" y="49" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <rect x="49" y="49" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <path d="M22 22h20" strokeWidth="3" />
    <path d="M32 22v20" strokeWidth="3" />
    <path d="M28 42h8" strokeWidth="2.5" />
  </svg>
);

const FinishingDeliveryIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <rect x="10" y="22" width="44" height="30" rx="3" />
    <line x1="10" y1="32" x2="54" y2="32" />
    <g transform="rotate(-8 10 22)">
      <rect x="10" y="14" width="44" height="8" rx="1.5" />
      <line x1="18" y1="14" x2="24" y2="22" />
      <line x1="30" y1="14" x2="36" y2="22" />
      <line x1="42" y1="14" x2="48" y2="22" />
    </g>
  </svg>
);

// Custom outline SVGs for "Our Post Production Workflow" section
const ReceiveReviewIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9 15 12 12 15 15" />
  </svg>
);

const EditCreateIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <rect x="5" y="6" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="13" y="6" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="5" y="11" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const RefineEnhanceIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <circle cx="12" cy="8" r="5" />
    <circle cx="8" cy="15" r="5" />
    <circle cx="16" cy="15" r="5" />
  </svg>
);

const ReviewApproveIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="8 10 11 13 16 8" />
  </svg>
);

const DeliverIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    <polyline points="7 11 12 16 17 11" />
    <line x1="12" y1="4" x2="12" y2="16" />
  </svg>
);

export default function PostProduction() {


  const services = [
    {
      title: "Video Editing",
      desc: "Seamless cuts, storytelling flow and precise editing that engages your audience.",
      icon: <VideoEditingIcon size={48} />
    },
    {
      title: "Color Grading",
      desc: "Cinematic color correction and grading to set the perfect mood.",
      icon: <ColorGradingIcon size={48} />
    },
    {
      title: "Sound Design",
      desc: "Immersive sound design, mixing and audio mastering for a powerful impact.",
      icon: <SoundDesignIcon size={48} />
    },
    {
      title: "Visual Effects (VFX)",
      desc: "High-end VFX, compositing and CGI that bring imagination to reality.",
      icon: <VfxIcon size={48} />
    },
    {
      title: "Motion Graphics",
      desc: "Engaging motion graphics, titles, transitions and animated elements.",
      icon: <MotionGraphicsIcon size={48} />
    },
    {
      title: "Finishing & Delivery",
      desc: "Final polish, quality check and delivery in all formats you need.",
      icon: <FinishingDeliveryIcon size={48} />
    }
  ];

  const processSteps = [
    {
      num: "01",
      title: "Receive & Review",
      desc: "We receive your files and understand your vision, goals and requirements.",
      icon: <ReceiveReviewIcon size={40} />
    },
    {
      num: "02",
      title: "Edit & Create",
      desc: "Our experts edit, enhance and create with attention to every detail.",
      icon: <EditCreateIcon size={40} />
    },
    {
      num: "03",
      title: "Refine & Enhance",
      desc: "Color, sound, effects and graphics are refined to perfection.",
      icon: <RefineEnhanceIcon size={40} />
    },
    {
      num: "04",
      title: "Review & Approve",
      desc: "You review the output and we make revisions until it's perfect.",
      icon: <ReviewApproveIcon size={40} />
    },
    {
      num: "05",
      title: "Deliver",
      desc: "Final master delivered in your required format, on time, every time.",
      icon: <DeliverIcon size={40} />
    }
  ];

  const recentWorks = [
    {
      title: "Action Short Film",
      subtitle: "Editing, VFX, Sound Design",
      img: legendsPoster
    },
    {
      title: "Commercial Ad",
      subtitle: "Editing, Color Grading",
      img: cityPoster
    },
    {
      title: "Music Video",
      subtitle: "Editing, Color Grading, VFX",
      img: rhythmPoster
    },
    {
      title: "Brand Film",
      subtitle: "Editing, Motion Graphics",
      img: dreamPoster
    },
    {
      title: "Documentary",
      subtitle: "Editing, Sound Design",
      img: beyondPoster
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
    setStartIndex((prev) => (prev > 0 ? prev - 1 : recentWorks.length - visibleCards));
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
    setStartIndex((prev) => (prev < recentWorks.length - visibleCards ? prev + 1 : 0));
  };

  const handleMobilePrev = () => {
    setMobileIndex((prev) => (prev > 0 ? prev - 1 : recentWorks.length - 1));
  };

  const handleMobileNext = () => {
    setMobileIndex((prev) => (prev < recentWorks.length - 1 ? prev + 1 : 0));
  };

  // Touch event hooks for swipe gesture on mobile
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

  return (
    <div className="post-prod-page-wrapper">
      <Navbar />

      <main className="post-prod-page-content">
        
        {/* =============================================
           1. HERO SECTION & BREADCRUMBS
           ============================================= */}
        <section className="post-prod-hero-section">
          <div className="post-prod-hero-container">
            <div className="post-prod-hero-left">
              <div className="post-prod-badge-wrap">
                <span className="post-prod-badge">Post Production</span>
              </div>

              <h1 className="post-prod-main-title">
                <span className="post-prod-title-line-1">Polish Every <span className="text-pink">Frame.</span></span>
                <span className="post-prod-title-line-2">Perfect Every <span className="text-pink">Story.</span></span>
              </h1>

              <div className="post-prod-title-divider"></div>

              <p className="post-prod-hero-desc">
                From raw footage to a masterful final cut — we provide end-to-end post production services that bring your vision to life with precision, creativity and cinematic excellence.
              </p>

              {/* Benefit features */}
              <div className="post-prod-hero-benefits">
                <div className="post-prod-benefit-item">
                  <div className="post-prod-benefit-icon">
                    <ExpertIcon />
                  </div>
                  <div className="post-prod-benefit-text">
                    <span className="post-prod-benefit-title">Expert Professionals</span>
                    <span className="post-prod-benefit-desc">Skilled editors, colorists, sound designers & artists</span>
                  </div>
                </div>
                <div className="post-prod-benefit-item">
                  <div className="post-prod-benefit-icon">
                    <QualityIcon />
                  </div>
                  <div className="post-prod-benefit-text">
                    <span className="post-prod-benefit-title">High Quality Output</span>
                    <span className="post-prod-benefit-desc">Industry-standard tools and high-end workflow</span>
                  </div>
                </div>
                <div className="post-prod-benefit-item">
                  <div className="post-prod-benefit-icon">
                    <DeliveryIcon />
                  </div>
                  <div className="post-prod-benefit-text">
                    <span className="post-prod-benefit-title">Timely Delivery</span>
                    <span className="post-prod-benefit-desc">On-time delivery without compromising quality</span>
                  </div>
                </div>
              </div>

              <div className="post-prod-hero-buttons">
                <a href="#connect" className="btn-post-connect-gradient">
                  <Users size={18} />
                  <span>Connect Now</span>
                </a>
                <a href="#work" className="btn-post-work">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="play-icon-purple" style={{ color: "var(--post-purple)" }}>
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" fill="none" />
                  </svg>
                  <span>View Our Work</span>
                </a>
              </div>
            </div>

            <div className="post-prod-hero-right">
              <div className="post-prod-hero-image-wrapper">
                <img src={postProductionHero} alt="Polish Every Frame. Perfect Every Story" className="post-prod-hero-image" />
              </div>
              
              {/* Floating Editing App Logos */}
              <div className="floating-logo float-premiere">
                <PremiereIcon />
              </div>
              <div className="floating-logo float-ae">
                <AfterEffectsIcon />
              </div>
              <div className="floating-logo float-resolve">
                <ResolveIcon />
              </div>
              <div className="floating-logo float-photoshop">
                <PhotoshopIcon />
              </div>
              <div className="floating-logo float-blender">
                <BlenderIcon />
              </div>

            </div>
          </div>
        </section>

        {/* =============================================
           2. WHAT WE DO SECTION
           ============================================= */}
        <section className="post-prod-what-we-do">
          <div className="post-prod-section-header">
            <h2 className="post-prod-section-title">What We Do</h2>
            <p className="post-prod-section-subtitle">
              Professional post production suites dedicated to making your content stand out.
            </p>
          </div>

          <div className="post-prod-services-grid">
            {services.map((serv, idx) => (
              <Card className="post-prod-service-card" key={idx}>
                <div className="post-prod-card-icon-wrap">
                  {serv.icon}
                </div>
                <h3 className="post-prod-card-title">{serv.title}</h3>
                <p className="post-prod-card-desc">{serv.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* =============================================
           3. OUR POST PRODUCTION WORKFLOW SECTION
           ============================================= */}
        <section className="post-prod-process-section">
          <div className="post-prod-section-header">
            <h2 className="post-prod-section-title">Our Post Production Workflow</h2>
            <p className="post-prod-section-subtitle">
              A smooth and collaborative process from start to finish.
            </p>
          </div>

          <div className="post-prod-process-timeline">
            {processSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="post-prod-step-arrow">
                    <ArrowRight size={22} />
                  </div>
                )}
                <div className="post-prod-process-step">
                  <div className="post-prod-process-icon-wrap">
                    {step.icon}
                  </div>
                  <h4 className="post-prod-step-title">{step.num}. {step.title}</h4>
                  <p className="post-prod-step-desc">{step.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* =============================================
           4. WHY CHOOSE SECTION
           ============================================= */}
        <section className="post-prod-choose-section">
          <div className="post-prod-choose-container">
            <h2 className="post-prod-choose-title">Why Choose BookMyStars for Post Production?</h2>
            
            <div className="post-prod-choose-grid">
              <div className="post-prod-choose-item">
                <div className="post-prod-choose-icon-wrap">
                  <Trophy size={30} />
                </div>
                <div className="post-prod-choose-text">
                  <span className="post-prod-choose-lbl">Industry Expertise</span>
                  <span className="post-prod-choose-desc">Experienced professionals with years of industry expertise.</span>
                </div>
              </div>

              <div className="post-prod-choose-item">
                <div className="post-prod-choose-icon-wrap">
                  <Settings size={30} />
                </div>
                <div className="post-prod-choose-text">
                  <span className="post-prod-choose-lbl">Advanced Technology</span>
                  <span className="post-prod-choose-desc">We use the latest tools and software for world-class results.</span>
                </div>
              </div>

              <div className="post-prod-choose-item">
                <div className="post-prod-choose-icon-wrap">
                  <Users size={30} />
                </div>
                <div className="post-prod-choose-text">
                  <span className="post-prod-choose-lbl">Creative Excellence</span>
                  <span className="post-prod-choose-desc">Creative approach that enhances your story and connects with audiences.</span>
                </div>
              </div>

              <div className="post-prod-choose-item">
                <div className="post-prod-choose-icon-wrap">
                  <ShieldCheck size={30} />
                </div>
                <div className="post-prod-choose-text">
                  <span className="post-prod-choose-lbl">Confidential & Secure</span>
                  <span className="post-prod-choose-desc">Your content is safe with us. We value your privacy and trust.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================
           5. OUR RECENT WORK SECTION (Grid / Slider)
           ============================================= */}
        <section className="post-prod-work-section" id="work">
          <div className="post-prod-section-header">
            <h2 className="post-prod-section-title">Our Recent Work</h2>
            <p className="post-prod-section-subtitle">
              A glimpse of stories we've brought to life.
            </p>
          </div>

          {/* ── DESKTOP CAROUSEL (hidden on mobile via CSS) ── */}
          <div className="post-prod-carousel-container post-prod-carousel-desktop">
            <Button className="post-prod-carousel-btn prev-btn" onClick={handlePrev}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>

            <div className="post-prod-work-grid-wrapper">
              <div className="post-prod-work-grid" style={{ "--promo-slide-index": String(startIndex) }}>
                {recentWorks.map((work, idx) => (
                  <Card className="post-prod-work-card" key={idx}>
                    <div className="post-prod-work-img-wrap">
                      <img src={work.img} alt={work.title} />
                      <div className="play-button-overlay">
                        <Play size={20} fill="currentColor" style={{ marginLeft: "2px" }} />
                      </div>
                    </div>
                    <div className="post-prod-work-body">
                      <h3 className="post-prod-work-title">{work.title}</h3>
                      <span className="post-prod-work-subtitle">{work.subtitle}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Button className="post-prod-carousel-btn next-btn" onClick={handleNext}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>

          {/* ── MOBILE CAROUSEL — one card at a time (hidden on desktop via CSS) ── */}
          <div className="post-prod-carousel-mobile-container">
            <Button className="post-prod-mobile-side-btn prev-btn" onClick={handleMobilePrev}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>
            
            <div 
              className="post-prod-mobile-card-wrap"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {(() => {
                const work = recentWorks[mobileIndex];
                return (
                  <Card className="post-prod-work-card post-prod-mobile-card">
                    <div className="post-prod-work-img-wrap">
                      <img src={work.img} alt={work.title} />
                      <div className="play-button-overlay">
                        <Play size={20} fill="currentColor" style={{ marginLeft: "2px" }} />
                      </div>
                    </div>
                    <div className="post-prod-work-body">
                      <h3 className="post-prod-work-title">{work.title}</h3>
                      <span className="post-prod-work-subtitle">{work.subtitle}</span>
                    </div>
                  </Card>
                );
              })()}
            </div>

            <Button className="post-prod-mobile-side-btn next-btn" onClick={handleMobileNext}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>

            <div className="post-prod-mobile-dots">
              {recentWorks.map((_, idx) => (
                <Button
                  key={idx}
                  className={`post-prod-mobile-dot ${idx === mobileIndex ? 'active' : ''}`}
                  onClick={() => setMobileIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="post-prod-more-btn-wrap">
            <a href="#more" className="btn-post-work" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>View More Work</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </section>



      </main>

      <FooterAgency />
    </div>
  );
}
