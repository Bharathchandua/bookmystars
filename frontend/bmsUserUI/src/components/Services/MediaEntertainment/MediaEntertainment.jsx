import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ChevronLeft, ChevronRight, Film, Music, Tv, Smartphone,
  Mic, Star, Globe, Users, Award, Zap, TrendingUp, Shield, Handshake
} from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button.jsx";
import Card from "../../common/Card.jsx";
import heroImg from "../../../assets/media_hero.png";
import beyondSpotlightImg from "../../../assets/beyond_the_spotlight_poster.png";
import rhythmUnpluggedImg from "../../../assets/rhythm_unplugged_poster.png";
import cityLightsImg from "../../../assets/city_lights_poster.png";
import dreamsLiveImg from "../../../assets/dreams_live_poster.png";
import legendsRiseImg from "../../../assets/legends_rise_poster.png";
import brokenSilenceImg from "../../../assets/broken_silence_poster.png";
import theJourneyImg from "../../../assets/the_journey_poster.png";

// Partner Logos
import netflixLogoImg from "../../../assets/Netflix.png";
import amazonPrimeLogoImg from "../../../assets/AmazonPrime.png";
import zee5LogoImg from "../../../assets/Zee5.png";
import sonyLogoImg from "../../../assets/Sony.png";
import mtvLogoImg from "../../../assets/MTv.png";
import disneyHotstarLogoImg from "../../../assets/DisneyHotstar.png";
import hungamaLogoImg from "../../../assets/Hangama.png";

import "./media-entertainment.css";

export default function MediaEntertainment() {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const services = [
    {
      title: "Film & TV Production",
      desc: "From development to production, we bring stories to life.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
      ),
    },
    {
      title: "Music & Audio",
      desc: "Producing, recording and promoting music that resonates worldwide.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      title: "Digital & OTT",
      desc: "Creating content for digital platforms and OTT audiences.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      title: "Marketing & Promotion",
      desc: "Strategic marketing and promotion that amplifies reach and impact.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      title: "Talent Management",
      desc: "Discovering, nurturing and managing talent across industries.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Events & Experiences",
      desc: "Curating unforgettable events and live experiences.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  const industries = [
    {
      name: "Film",
      desc: "Feature films, short films, documentaries and independent cinema.",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80",
    },
    {
      name: "Music",
      desc: "From independent artists to music labels, we help you create and grow.",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
    },
    {
      name: "Television",
      desc: "TV shows, reality series and entertainment formats for every audience.",
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80",
    },
    {
      name: "OTT & Digital",
      desc: "Originals and web series that engage the digital-first generation.",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
    },
    {
      name: "Live Events",
      desc: "Concerts, award shows, festivals and brand activations.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    },
    {
      name: "Gaming & Animation",
      desc: "Animation, VFX and gaming content for global entertainment.",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80",
    },
  ];

  const whyChoose = [
    {
      title: "Extensive Network",
      desc: "Access to a wide network of talent, creators and partners.",
      icon: <Globe size={22} style={{ color: "#ec008c" }} />,
    },
    {
      title: "Industry Expertise",
      desc: "Years of experience in delivering successful projects.",
      icon: <Award size={22} style={{ color: "#ec008c" }} />,
    },
    {
      title: "End-to-End Support",
      desc: "From ideation to distribution, we've got you covered.",
      icon: <Shield size={22} style={{ color: "#ec008c" }} />,
    },
    {
      title: "Global Reach",
      desc: "Connecting stories and talent to audiences worldwide.",
      icon: <TrendingUp size={22} style={{ color: "#ec008c" }} />,
    },
  ];

  const works = [
    { image: beyondSpotlightImg, type: "Web Series" },
    { image: rhythmUnpluggedImg, type: "Music Album" },
    { image: cityLightsImg, type: "Short Film" },
    { image: dreamsLiveImg, type: "Concert Tour" },
    { image: legendsRiseImg, type: "Documentary" },
    { image: brokenSilenceImg, type: "Short Film" },
    { image: theJourneyImg, type: "Documentary" },
  ];

  const stats = [
    { value: "10K+", label: "Projects Delivered", icon: <Film size={28} /> },
    { value: "500+", label: "Happy Clients", icon: <Users size={28} /> },
    { value: "5K+", label: "Talent Onboarded", icon: <Star size={28} /> },
    { value: "50+", label: "Countries Reached", icon: <Globe size={28} /> },
  ];

  const partners = [
    { img: netflixLogoImg, alt: "Netflix" },
    { img: amazonPrimeLogoImg, alt: "Amazon Prime" },
    { img: zee5LogoImg, alt: "Zee5" },
    { img: sonyLogoImg, alt: "Sony LIV" },
    { img: mtvLogoImg, alt: "MTV" },
    { img: disneyHotstarLogoImg, alt: "Disney+ Hotstar" },
    { img: hungamaLogoImg, alt: "Hungama" },
  ];

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let visibleCards = 5;
  if (windowWidth <= 480) {
    visibleCards = 1;
  } else if (windowWidth <= 768) {
    visibleCards = 2;
  } else if (windowWidth <= 1200) {
    visibleCards = 3;
  }

  const maxIndex = Math.max(0, works.length - visibleCards);

  const prevSlide = () => setCarouselIndex((i) => Math.max(0, i - 1));
  const nextSlide = () => setCarouselIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <div className="me-page-wrapper">
      <Navbar />

      <main className="me-page-content">

        {/* ── 1. HERO ── */}
        <section className="me-hero-section">
          <div className="me-hero-container">
            {/* Left */}
            <div className="me-hero-left">
              <div className="me-badge-wrap">
                <span className="me-badge">MEDIA &amp; ENTERTAINMENT</span>
              </div>

              <h1 className="me-main-title">
                Powering <span className="text-pink">Stories.</span><br />
                Connecting <span className="text-purple">Worlds.</span>
              </h1>

              <p className="me-hero-desc">
                From concept to screen and beyond — we empower creators,
                brands and talent to bring impactful stories to life.
              </p>

              <div className="me-hero-buttons">
                <Button
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 36px rgba(236,0,140,0.55)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(236,0,140,0.35)';
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #ec008c 0%, #5b00d7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px 28px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    boxShadow: '0 4px 24px rgba(236,0,140,0.35)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Explore Our Services
                  <ArrowRight size={16} />
                </Button>

                <Button
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#5b00d7';
                    e.currentTarget.style.borderColor = '#5b00d7';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,0,215,0.45)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#05072d';
                    e.currentTarget.style.borderColor = '#05072d';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(5,7,45,0.25)';
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#05072d',
                    color: '#fff',
                    border: '2px solid #05072d',
                    borderRadius: '10px',
                    padding: '13px 28px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    boxShadow: '0 4px 20px rgba(5,7,45,0.25)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Handshake size={16} />
                  Partner With Us
                </Button>
              </div>
            </div>

            {/* Right — hero image */}
            <div className="me-hero-right">
              <img src={heroImg} alt="Media & Entertainment" className="me-hero-image" />
            </div>
          </div>
        </section>

        {/* ── 2. END-TO-END SOLUTIONS ── */}
        <section className="me-solutions-section">
          <div className="me-solutions-container">
            <h2 className="me-solutions-heading">
              End-to-End <span className="text-pink">Solutions</span> for the Entertainment Industry
            </h2>
            <div className="me-solutions-grid">
              {services.map((s, i) => (
                <Card className="me-solution-card" key={i}>
                  <div className="me-solution-icon">{s.icon}</div>
                  <h3 className="me-solution-title">{s.title}</h3>
                  <p className="me-solution-desc">{s.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. INDUSTRIES WE WORK WITH ── */}
        <section className="me-industries-section">
          <div className="me-industries-container">
            <h2 className="me-section-heading" style={{ textAlign: "center" }}>
              Industries We <span style={{ color: "#ec008c" }}>Work With</span>
            </h2>
            <div className="me-industries-grid">
              {industries.map((ind, i) => (
                <Card
                  className="me-industry-card"
                  key={i}
                  style={{ backgroundImage: `url(${ind.image})` }}
                >
                  <div className="me-industry-overlay" />
                  <div className="me-industry-content">
                    <h3 className="me-industry-name">{ind.name}</h3>
                    <p className="me-industry-desc">{ind.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. WHY CHOOSE + OUR WORK (SIDE-BY-SIDE) ── */}
        <section className="me-why-work-section">
          <div className="me-why-work-container">

            {/* Left Column - Why Choose */}
            <div className="me-why-col">
              <h2 className="me-section-heading">Why Choose BookMyStars?</h2>
              <div className="me-why-list">
                {whyChoose.map((w, i) => (
                  <div className="me-why-item" key={i}>
                    <div className="me-why-icon">{w.icon}</div>
                    <div>
                      <h4 className="me-why-title">{w.title}</h4>
                      <p className="me-why-desc">{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="me-why-btn-container">
                <Button
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#ec008c";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(236,0,140,0.2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.color = "#ec008c";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#ffffff",
                    color: "#ec008c",
                    border: "1.5px solid #ec008c",
                    borderRadius: "10px",
                    padding: "11px 24px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                    outline: "none",
                  }}
                >
                  Learn More About Us
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>

            {/* Right Column - Our Work Carousel */}
            <div className="me-work-col">
              <h2 className="me-section-heading">Our Work in Action</h2>

              <div className="me-work-carousel-wrapper">
                <Button
                  className="me-carousel-btn me-carousel-prev"
                  onClick={prevSlide}
                  disabled={carouselIndex === 0}
                >
                  <ChevronLeft size={20} />
                </Button>

                <div className="me-work-track-outer">
                  <div
                    className="me-work-track"
                    style={{
                      transform: `translateX(calc(-${carouselIndex} * (100% + 14px) / ${visibleCards}))`,
                    }}
                  >
                    {works.map((w, i) => (
                      <Card
                        className="me-work-card"
                        key={i}
                        style={{
                          flex: `0 0 calc(100% / ${visibleCards} - ${(14 * (visibleCards - 1)) / visibleCards}px)`,
                        }}
                      >
                        <img src={w.image} alt="Work Poster" className="me-work-card-img" />
                        <div className="me-work-card-overlay" />
                        <div className="me-work-card-content">
                          <span className="me-work-card-type">{w.type}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button
                  className="me-carousel-btn me-carousel-next"
                  onClick={nextSlide}
                  disabled={carouselIndex >= maxIndex}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>

              {maxIndex > 0 && (
                <div className="me-carousel-dots" style={{ marginTop: "24px" }}>
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <Button
                      key={i}
                      className={`me-carousel-dot ${i === carouselIndex ? "active" : ""}`}
                      onClick={() => setCarouselIndex(i)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ── 5. STATS BAR ── */}
        <section className="me-stats-section">
          <div className="me-stats-container">
            {stats.map((s, i) => (
              <div className="me-stat-item" key={i}>
                <div className="me-stat-icon">{s.icon}</div>
                <div className="me-stat-text">
                  <span className="me-stat-value">{s.value}</span>
                  <span className="me-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. TRUSTED PARTNERS ── */}
        <section className="me-partners-section">
          <div className="me-partners-container">
            <h2 className="me-section-heading">Trusted by Leading Brands &amp; Partners</h2>
            <div className="me-partners-logos">
              {partners.map((p, i) => (
                <div className="me-partner-logo-item" key={i}>
                  <img src={p.img} alt={p.alt} className="me-partner-logo-img" />
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <FooterAgency />
    </div>
  );
}
