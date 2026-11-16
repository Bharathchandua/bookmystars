import React from "react";
import { Link } from "react-router-dom";
import { Users, Search } from "lucide-react";
import heroImg from "../../../assets/become-client-hero.jpg";
import Button from "../../common/Button";

export default function AgencyHero() {
  const scrollToRegistration = () => {
    const el = document.getElementById("partner-registration-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="agency-hero-wrapper">
      <div className="agency-hero-container">
        <div className="agency-hero-left">
          {/* Breadcrumb */}
          <nav className="agency-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/become-partner">Agencies</Link>
            <span>/</span>
            <span>Become Partner</span>
          </nav>

          <div className="agency-badge">Agencies & Academies</div>
          <h1 className="agency-title">
            Empowering <span className="highlight-pink">Agencies & Academies.</span> Creating <span className="highlight-purple">Impact.</span>
          </h1>
          <div className="agency-divider"></div>
          <p className="agency-description">
            <strong>BookMyStars</strong> is the dedicated platform for academies, studios, and agencies to collaborate with
            verified talent, launch audition campaigns, publish custom casting requirements, and scale your brand.
          </p>
          <div className="agency-buttons">
            <Button
              variant="join-agency"
              icon={<Users size={18} />}
              iconPosition="left"
              onClick={scrollToRegistration}
            >
              Join as Partner / Agency
            </Button>
            <Button
              variant="explore-opps"
              icon={<Search size={18} />}
              iconPosition="left"
              onClick={scrollToRegistration}
            >
              Register Business Requirements
            </Button>
          </div>
        </div>

        <div className="agency-hero-right">
          <img src={heroImg} alt="Book My Stars Agency Hero" className="hero-image-raw" />
        </div>
      </div>
    </section>
  );
}
