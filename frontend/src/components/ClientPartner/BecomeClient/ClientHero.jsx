import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UsersRound, ShieldCheck } from "lucide-react";
import CountUpModule from "react-countup";
import heroImg from "../../../assets/client-hero.png";

const CountUp = typeof CountUpModule === "function" ? CountUpModule : (CountUpModule.default || CountUpModule);

export default function ClientHero() {
  const [hoverKeys, setHoverKeys] = useState([0, 0, 0]);

  const handleMouseEnter = (index) => {
    setHoverKeys((prev) => {
      const next = [...prev];
      next[index] = next[index] + 1;
      return next;
    });
  };

  return (
    <section className="bc-hero">
      <div className="bc-hero-inner">
        {/* LEFT: Text Content */}
        <div className="bc-hero-copy">
          {/* Breadcrumb */}
          <nav className="bc-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/become-client">Agencies</Link>
            <span>/</span>
            <span>Branding / Requirements</span>
          </nav>

          {/* Heading */}
          <h1 className="bc-title">
            Branding /<br />
            <span className="bc-title-pink">Requirements</span>
          </h1>

          {/* Description */}
          <p className="bc-description">
            Post your requirements and connect with verified talents, agencies,
            brands, and professionals for branding, production, promotion,
            and business growth.
          </p>

          {/* Stats row */}
          <div className="bc-stats-row">
            <div 
              className="bc-stat"
              onMouseEnter={() => handleMouseEnter(0)}
            >
              <UsersRound size={34} className="bc-stat-icon" />
              <div>
                <strong>
                  <CountUp
                    key={hoverKeys[0]}
                    start={0}
                    end={50}
                    duration={2.5}
                    suffix="K+"
                  />
                </strong>
                <small>Verified Talents</small>
              </div>
            </div>
            <div 
              className="bc-stat"
              onMouseEnter={() => handleMouseEnter(1)}
            >
              <ShieldCheck size={34} className="bc-stat-icon" />
              <div>
                <strong>
                  <CountUp
                    key={hoverKeys[1]}
                    start={0}
                    end={5}
                    duration={2.5}
                    suffix="K+"
                  />
                </strong>
                <small>Agencies & Brands</small>
              </div>
            </div>
            <div 
              className="bc-stat"
              onMouseEnter={() => handleMouseEnter(2)}
            >
              {/* Briefcase icon */}
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bc-stat-icon">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              <div>
                <strong>
                  <CountUp
                    key={hoverKeys[2]}
                    start={0}
                    end={10}
                    duration={2.5}
                    suffix="K+"
                  />
                </strong>
                <small>Projects Completed</small>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Hero Image */}
        <div className="bc-hero-img-col">
          <img
            src={heroImg}
            alt="Book My Stars Branding Requirements"
            className="bc-hero-img"
          />
        </div>
      </div>
    </section>
  );
}
