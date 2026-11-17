import { Link } from "react-router-dom";
import { Camera, ArrowRight } from "lucide-react";
import hero from "../assets/hero.png";
import Button from "./common/Button";
import { CLIENT_PORTAL_URL, USER_PORTAL_URL } from "../services/apiConfig";

/* ==========================================================================
   CUSTOM SVG ICONS FOR HOME FEATURE PILL BANNER
   ========================================================================== */
const AiMatchingIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16" y1="4" x2="16" y2="28" strokeDasharray="1 1" />
    <path d="M16 6a6 6 0 0 0-6 6 6 6 0 0 0-2 4 6 6 0 0 0 4 6 6 6 0 0 0 4 4" />
    <path d="M16 6a6 6 0 0 1 6 6 6 6 0 0 1 2 4 6 6 0 0 1-4 6 6 6 0 0 1-4 4" />
    <circle cx="6" cy="16" r="1.8" fill="currentColor" />
    <circle cx="26" cy="16" r="1.8" fill="currentColor" />
    <circle cx="16" cy="4" r="1.5" fill="currentColor" />
    <circle cx="16" cy="28" r="1.5" fill="currentColor" />
  </svg>
);

const OpportunityNetworkIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="11" r="4" />
    <path d="M10 24c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="8" cy="13" r="3" />
    <path d="M3 24c0-2.5 2-4.5 4.5-4.5" />
    <circle cx="24" cy="13" r="3" />
    <path d="M24.5 19.5c2.5 0 4.5 2 4.5 4.5" />
  </svg>
);

const SkillLearningIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="16 6, 29 13, 16 20, 3 13" />
    <path d="M8 15.5v7c0 2.5 3.5 4.5 8 4.5s8-2 8-4.5v-7" />
    <path d="M26 15v8" />
    <circle cx="26" cy="24" r="1.5" fill="currentColor" />
  </svg>
);

const ProductionSupportIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="16" height="14" rx="3.5" />
    <polygon points="20 13, 28 8.5, 28 23.5, 20 19" />
  </svg>
);

const MakeoverBridgingIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="14" width="7" height="12" rx="2" />
    <path d="M8 14v-4h3v4" />
    <line x1="9.5" y1="6" x2="9.5" y2="10" />
    <path d="M19 26v-9" />
    <path d="M17 17h4l1-6a2 2 0 0 0-2-2 2 2 0 0 0-2 2l-1 6z" fill="currentColor" opacity="0.2" />
    <path d="M17 17h4l1-6a2 2 0 0 0-2-2 2 2 0 0 0-2 2l-1 6z" />
  </svg>
);

const BusinessGrowthIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="21" width="4" height="6" rx="1" fill="currentColor" />
    <rect x="12" y="16" width="4" height="11" rx="1" fill="currentColor" />
    <rect x="19" y="10" width="4" height="17" rx="1" fill="currentColor" />
    <path d="M6 14l8-6 5 4 7-7" strokeWidth="2.4" />
    <polyline points="21 5 26 5 26 10" strokeWidth="2.4" />
  </svg>
);

const homeFeatures = [
  {
    icon: <AiMatchingIcon />,
    line1: "AI-Powered",
    line2: "Talent Matching",
    accent: false
  },
  {
    icon: <OpportunityNetworkIcon />,
    line1: "Wide Opportunity",
    line2: "Network",
    accent: false
  },
  {
    icon: <SkillLearningIcon />,
    line1: "Skill Development",
    line2: "& Learning (LMS)",
    accent: false
  },
  {
    icon: <ProductionSupportIcon />,
    line1: "Casting &",
    line2: "Production Support",
    accent: false
  },
  {
    icon: <MakeoverBridgingIcon />,
    line1: "Makeover Artist",
    line2: "Bridging",
    accent: true
  },
  {
    icon: <BusinessGrowthIcon />,
    line1: "Career & Business",
    line2: "Growth",
    accent: false
  }
];

export default function Hero() {
  const createProfileHref = USER_PORTAL_URL ? `${USER_PORTAL_URL}/join` : "/join";
  const postCastingHref = CLIENT_PORTAL_URL || "/become-client";

  return (
    <section className="hero container-fluid px-0">
      <div className="row g-0 align-items-center">
        <div className="col-md-6 hero-copy">
          <div className="pill">
            INDIA&apos;S TRUSTED TALENT &amp; PRODUCTION NETWORK
          </div>

          <h1>
            Smarter <span>Talent.</span>
            <br />
            <span
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
              }}
            >
              <span className="hero-faster">Faster</span> <em>Opportunities.</em>
            </span>
          </h1>

          <p>
            Connecting talent with real opportunities across film, music,
            entertainment, digital and beyond — powered by trust, technology and
            creativity.
          </p>

          <div className="hero-buttons">
            {USER_PORTAL_URL ? (
              <a href={createProfileHref} style={{ textDecoration: "none" }}>
                <Button
                  variant="primary-hero"
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  Create Your Profile
                </Button>
              </a>
            ) : (
              <Link to="/join" style={{ textDecoration: "none" }}>
                <Button
                  variant="primary-hero"
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  Create Your Profile
                </Button>
              </Link>
            )}

            <a href={CLIENT_PORTAL_URL || "/become-client"} style={{ textDecoration: "none" }}>
              <Button
                variant="secondary-hero"
                icon={<Camera size={17} />}
                iconPosition="left"
              >
                Post a Casting Call
              </Button>
            </a>
          </div>
        </div>

        <div className="col-md-6 hero-art-col">
          <div className="hero-art">
            <div className="hero-art-inner">
              <div className="hero-blob" />
              <div className="hero-dots" />
              <img src={hero} alt="Book My Stars" />
            </div>
          </div>
        </div>
      </div>

      {/* 6-Feature Pill Banner (matching design) */}
      <div className="home-features-pill-wrap">
        <div className="home-features-pill">
          {homeFeatures.map((item, idx) => (
            <div 
              key={idx} 
              className={`home-feature-item ${item.accent ? 'accent-pink' : ''}`}
            >
              <div className="home-feature-icon-wrap">
                {item.icon}
              </div>
              <div className="home-feature-text">
                <span className="home-feature-text-line1">{item.line1}</span>
                <span className="home-feature-text-line2">{item.line2}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
