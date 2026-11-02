import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  Clapperboard,
  Music,
  Footprints,
  Shirt,
  Megaphone,
  Gift,
} from "lucide-react";
import { opportunityCats, features } from "../data/siteData.js";
import Button from "./common/Button.jsx";

const icons = [
  BriefcaseBusiness,
  Camera,
  Clapperboard,
  Music,
  Footprints,
  Shirt,
  Megaphone,
  Gift,
];

export default function OpportunitiesSection() {
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
      if (window.location.hash === "#opportunities") {
        setIsOpen(true);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    if (window.location.hash === "#opportunities") {
      setIsOpen(true);
    }
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    /* Added opportunities-section class to target the bottom divider line */
    <section id="opportunities" className="container two-col opportunities-section">
      <div className="left-title">
        <span>OUR SERVICES</span>
        <h2>
          OPPORTUNITIES <BriefcaseBusiness size={28} style={{ flexShrink: 0 }} />
        </h2>
        
        {/* Premium divider line */}
        <div className="mini-line"></div>

        <p>
          Find, apply and grow with thousands of verified opportunities suited
          to your talent and skills.
        </p>
        <Button onClick={() => navigate("/services/opportunities")}>
          Explore Opportunities <ArrowRight size={15} />
        </Button>
      </div>

      <div className={`right-content ${isOpen ? "is-open" : ""}`}>
        {/* Restored the separate Categories Row */}
        <div className="cat-row">
          {opportunityCats.map((c, i) => {
            let I = icons[i];
            return (
              <div className="cat" key={c}>
                <I size={26} />
                <small>{c}</small>
              </div>
            );
          })}
        </div>

        {/* Restored the separate Features Row with its clean gap */}
        <div className="feature-row">
          {features.map(([t, d, Icon]) => (
            <div className="feature" key={t}>
              <Icon size={25} />
              <div>
                <b>{t}</b>
                <small>{d}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}