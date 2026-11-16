import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowRight } from "lucide-react";
import hero from "../assets/hero.png";
import { stats } from "../data/siteData.js";
import Button from "./common/Button";
import { CLIENT_PORTAL_URL, USER_PORTAL_URL } from "../services/apiConfig";

export default function Hero() {
  const [activeBtn, setActiveBtn] = useState("profile");
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const targets = stats.map(([n]) => {
      const num = parseInt(n);
      return isNaN(num) ? 0 : num;
    });

    const duration = 1600;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCounts(targets.map((target) => Math.floor(progress * target)));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const createProfileHref = USER_PORTAL_URL ? `${USER_PORTAL_URL}/join` : "/join";
  const postCastingHref = CLIENT_PORTAL_URL || "/become-client";

  return (
    <section className="container hero-section">
      <div className="row align-items-center">
        <div className="col-md-6 hero-text-col">
          <div className="hero-badge">
            <span>INDIA'S TRUSTED TALENT &amp; PRODUCTION NETWORK</span>
          </div>

          <h1 className="hero-title">
            Smarter <span>Talent.</span>
            <br />
            Faster <span>Opportunities.</span>
          </h1>

          <p className="hero-subtitle">
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

            <a href={postCastingHref} style={{ textDecoration: "none" }}>
              <Button
                variant="secondary-hero"
                icon={<Camera size={17} />}
                iconPosition="left"
                className="outline"
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
              <img
                src={hero}
                alt="Director Chair & Studio Lighting"
                className="hero-main-img"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row hero-stats justify-content-center">
        {stats.map(([_, label, iconName], i) => (
          <div className="col-6 col-md-3 stat-item" key={i}>
            <div className="stat-icon-wrapper">
              <i className={`bi ${iconName}`} />
            </div>
            <div className="stat-text">
              <h3>
                {counts[i]}
                {stats[i][0].replace(/^[0-9]+/, "")}
              </h3>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
