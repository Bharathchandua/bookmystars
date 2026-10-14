import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mic } from "lucide-react";
import Button from "./common/Button.jsx";
import Card from "./common/Card.jsx";

const podcast = [
  {
    title: "Podcast Recording",
    desc: "High-quality audio & video recording in premium studios.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="9" y1="21" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    title: "Editing & Post Production",
    desc: "Professional editing, sound design, mixing & mastering.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <line x1="4.5" y1="11" x2="4.5" y2="13" />
        <line x1="7" y1="9.5" x2="7" y2="14.5" />
        <line x1="9.5" y1="7.5" x2="9.5" y2="16.5" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="14.5" y1="7.5" x2="14.5" y2="16.5" />
        <line x1="17" y1="9.5" x2="17" y2="14.5" />
        <line x1="19.5" y1="11" x2="19.5" y2="13" />
      </svg>
    ),
  },
  {
    title: "Show Branding",
    desc: "Custom intros, logo, thumbnails & visual identity.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    title: "Distribution Support",
    desc: "Publish and promote on all major podcast platforms.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      </svg>
    ),
  },
];

export default function PodcastSection() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#podcast") {
        setIsOpen(true);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    if (window.location.hash === "#podcast") {
      setIsOpen(true);
    }
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <>
      {/* Defined with absolute units so the gradient is 100% full and smooth */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient 
            id="mic-gradient" 
            x1="0" 
            y1="0" 
            x2="0" 
            y2="24" 
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#DA87EC" />
            <stop offset="100%" stopColor="#6823C7" />
          </linearGradient>
        </defs>
      </svg>

      <section id="podcast" className={`container-fluid service-strip px-5 ${isOpen ? "is-open" : ""}`}>
        <div className="intro">
          <span>OUR SERVICES</span>

          <h2>
            PODCAST
            <Mic 
              style={{ 
                stroke: "url(#mic-gradient)", 
                strokeWidth: 2.3, 
                width: '32px', 
                height: '32px'
              }} 
            />
          </h2>
          
          <div className="mini-line"></div>

          <p>
            From powerful conversations to professional production, we help you
            create podcasts that connect and inspire.
          </p>

          <Button onClick={() => navigate("/podcast")}>
            Explore Podcast Services <ArrowRight size={15} />
          </Button>
        </div>

        {podcast.map((item) => (
          <Card className="pod-card podcast-custom-card" key={item.title}>
            <div className="circle custom-podcast-icon">{item.icon}</div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </Card>
        ))}
      </section>
    </>
  );
}