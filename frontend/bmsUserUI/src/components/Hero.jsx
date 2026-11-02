import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowRight } from "lucide-react";
import hero from "../assets/hero.png";
import { stats } from "../data/siteData.js";
import Button from "./common/Button";

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
            <Link to="/join" style={{ textDecoration: "none" }}>
              <Button
                variant="primary-hero"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Create Your Profile
              </Button>
            </Link>

            <Link to="/become-client" style={{ textDecoration: "none" }}>
              <Button
                variant="secondary-hero"
                icon={<Camera size={17} />}
                iconPosition="left"
              >
                Post a Casting Call
              </Button>
            </Link>
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

      <div className="hero-stats-bar">
        {stats.map(([n, t, Icon], i) => {
          const isTextLabel = isNaN(parseInt(n));

          return (
            <div className="stat" key={t}>
              <Icon size={30} strokeWidth={1.8} />
              <div>
                <b className="stat-number">
                  {isTextLabel ? (
                    n
                  ) : (
                    <>
                      {counts[i]}
                      {n.includes("K") ? "K+" : "+"}
                    </>
                  )}
                </b>
                <small>{t}</small>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}