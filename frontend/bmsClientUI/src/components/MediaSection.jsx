import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiRightArrowAlt, BiMoviePlay } from "react-icons/bi";
import { media } from "../data/siteData.js";
import Button from "./common/Button.jsx";
import Card from "./common/Card.jsx";

export default function MediaSection() {
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
      if (window.location.hash === "#media-entertainment") {
        setIsOpen(true);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    if (window.location.hash === "#media-entertainment") {
      setIsOpen(true);
    }
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <section id="media-entertainment" className="container two-col media-section">
      <div className="left-title">
        <span>OUR SERVICES</span>
        <h2 style={{ display: 'block', margin: '10px 0 0 0', lineHeight: 1.25 }}>
          MEDIA &<br />
          ENTERTAINMENT
          <BiMoviePlay style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
        </h2>
        
        {/* Premium divider line */}
        <div className="mini-line"></div>

        <p>
          End-to-end production and creative solutions for a world-class
          entertainment experience.
        </p>
        <Button onClick={() => navigate("/services/media-entertainment")}>
          Explore Services <BiRightArrowAlt size={16} />
        </Button>
      </div>

      <div className={`media-grid ${isOpen ? "is-open" : ""}`}>
        {media.map(([t, d, img]) => (
          <Card
            className="media-card"
            key={t}
            style={{
              backgroundImage: `url(${img})`,
            }}
          />
        ))}
      </div>
    </section>
  );
}