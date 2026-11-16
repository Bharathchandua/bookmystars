import React from "react";
import { Headphones, Mic, Video, Radio, Mail } from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button";
import Card from "../../common/Card";
import heroImg from "../../../assets/podcast-hero-right.jpg";
import "./podcast.css";

export default function Podcast() {
  const studioSpecs = [
    {
      title: "Shure SM7B Vocal Mics",
      desc: "Industry-gold-standard dynamic vocal warmth with Cloudlifter preamplifiers for pristine speech clarity.",
      icon: <Mic size={24} />,
      colorClass: "icon-pink",
    },
    {
      title: "Sony 4K Cinema Line",
      desc: "Multi-camera cinematic shallow depth-of-field with real-time switching and 4K ProRes capture.",
      icon: <Video size={24} />,
      colorClass: "icon-purple",
    },
    {
      title: "Aputure RGB Lighting",
      desc: "Fully customizable studio mood lighting schemes tailored to your podcast brand palette and backdrop.",
      icon: <Radio size={24} />,
      colorClass: "icon-pink",
    },
    {
      title: "Acoustic Sound Isolation",
      desc: "Double-wall acoustic dampening rated at -45dB for zero outside bleed and crystal-clear sound isolation.",
      icon: <Headphones size={24} />,
      colorClass: "icon-purple",
    },
  ];

  const bottomServices = [
    {
      title: "Podcast Recording",
      desc: "High-quality audio & video recording in premium studios.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2.5">
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
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2.5">
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
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2.5">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      title: "Distribution Support",
      desc: "Publish and promote on all major podcast platforms.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2.5">
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="podcast-page-wrapper">
      <Navbar />

      <main className="podcast-page-content">
        {/* =============================================
           1. HERO SECTION
           ============================================= */}
        <section className="podcast-hero-section">
          <div className="podcast-hero-container">
            <div className="podcast-hero-left">
              <div className="podcast-badge-wrap">
                <span className="podcast-badge-pink">PODCAST</span>
              </div>

              <h1 className="podcast-main-title">
                Voices That <span className="text-pink">Inspire.</span><br />
                Stories That <span className="text-purple">Connect.</span>
              </h1>

              <p className="podcast-hero-desc">
                The BookMyStars Podcast brings you conversations with creators, industry leaders, and changemakers shaping the future of entertainment and beyond.
              </p>

              {/* Contact Us Button */}
              <div className="podcast-hero-buttons">
                <Button variant="btn-play-latest" icon={<Mail size={16} />}>
                  Contact Us
                </Button>
              </div>

              {/* All Platforms & Social Media Handles */}
              <div className="podcast-platforms-container">
                <span className="platforms-label">Available On:</span>

                {/* 1. Podcast Streaming Platforms */}
                <div className="platforms-list">
                  {/* Spotify */}
                  <div className="platform-item">
                    <svg className="spotify-icon" viewBox="0 0 24 24" fill="#1DB954" width="18" height="18">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.785-8.893-.983-.335.076-.67-.135-.746-.47-.077-.337.135-.67.472-.748 3.853-.88 7.15-.502 9.82.133.295.18.387.565.207.861zm1.226-2.724c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.665-1.11 8.233-.572 11.35 1.347.368.226.488.707.26 1.07zm.106-2.833C14.73 8.878 9.473 8.703 6.438 9.624a1.002 1.002 0 0 1-1.22-.716.997.997 0 0 1 .714-1.22c3.488-1.057 9.29-.858 13.012 1.353a.998.998 0 0 1 .357 1.364.996.996 0 0 1-1.385.362z" />
                    </svg>
                    <span>Spotify</span>
                  </div>

                  {/* Apple Podcasts */}
                  <div className="platform-item">
                    <svg className="apple-icon" viewBox="0 0 24 24" fill="#9933ff" width="18" height="18">
                      <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1 4h-2v1.2c-.6.2-1 .8-1 1.5V13h4V8.7c0-.7-.4-1.3-1-1.5V6zm-3.5 8.5c0 .83.67 1.5 1.5 1.5h2c.83 0 1.5-.67 1.5-1.5V14h-5v.5z" />
                    </svg>
                    <span>Apple Podcasts</span>
                  </div>

                  {/* Google Podcasts */}
                  <div className="platform-item">
                    <svg className="google-icon" viewBox="0 0 24 24" fill="#f4b400" width="18" height="18">
                      <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-4 6c0-.55-.45-1-1-1s-1 .45-1 1v8c0 .55.45 1 1 1s1-.45 1-1V8zm4-3c0-.55-.45-1-1-1s-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V5zm4 3c0-.55-.45-1-1-1s-1 .45-1 1v8c0 .55.45 1 1 1s1-.45 1-1V8zm4 3c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2z" />
                    </svg>
                    <span>Google Podcasts</span>
                  </div>

                  {/* YouTube */}
                  <div className="platform-item">
                    <svg className="youtube-icon" viewBox="0 0 24 24" fill="#FF0000" width="18" height="18">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.555a3.002 3.002 0 0 0-2.11 2.108C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>YouTube</span>
                  </div>

                  {/* Amazon Music */}
                  <div className="platform-item">
                    <svg viewBox="0 0 24 24" fill="#00A8E1" width="18" height="18">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
                    </svg>
                    <span>Amazon Music</span>
                  </div>

                  {/* JioSaavn */}
                  <div className="platform-item">
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#2bc5b4", display: "inline-block" }}></span>
                    <span>JioSaavn</span>
                  </div>

                  {/* Gaana */}
                  <div className="platform-item">
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#e72c30", display: "inline-block" }}></span>
                    <span>Gaana</span>
                  </div>

                  {/* Wynk Music */}
                  <div className="platform-item">
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#1b4396", display: "inline-block" }}></span>
                    <span>Wynk Music</span>
                  </div>
                </div>

                {/* 2. Social Media Handles */}
                <div className="platforms-social-row">
                  <span className="social-label">Social Handles:</span>

                  <div className="social-item">
                    <svg viewBox="0 0 24 24" fill="#E1306C" width="16" height="16">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                    </svg>
                    <span>Instagram</span>
                  </div>

                  <div className="social-item">
                    <svg viewBox="0 0 24 24" fill="#1877F2" width="16" height="16">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </div>

                  <div className="social-item">
                    <svg viewBox="0 0 24 24" fill="#0A66C2" width="16" height="16">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </div>

                  <div className="social-item">
                    <svg viewBox="0 0 24 24" fill="#000000" width="14" height="14">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X (Twitter)</span>
                  </div>

                  <div className="social-item">
                    <span style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "1px 4px", fontSize: "11px", fontWeight: "900" }}>@</span>
                    <span>Threads</span>
                  </div>

                  <div className="social-item">
                    <svg viewBox="0 0 24 24" fill="#25D366" width="16" height="16">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="podcast-hero-right">
              <img src={heroImg} alt="Book My Stars Podcast Hero" className="podcast-hero-image" />
            </div>
          </div>
        </section>

        {/* =============================================
           2. STUDIO INFRASTRUCTURE & SPECIFICATIONS (OPTION 2)
           ============================================= */}
        <section className="podcast-specs-section">
          <div className="podcast-specs-container">
            <div className="podcast-specs-header">
              <span className="specs-badge">STUDIO INFRASTRUCTURE</span>
              <h2 className="specs-title">
                Broadcast-Grade Facilities &amp; Acoustic Architecture
              </h2>
              <p className="specs-desc">
                BookMyStars studios are acoustically treated to eliminate room resonance, background HVAC noise, and echo—giving your voice rich, punchy radio presence.
              </p>
            </div>

            <div className="podcast-specs-grid">
              {studioSpecs.map((spec, i) => (
                <div className="podcast-spec-card" key={i}>
                  <div className={`spec-card-icon-wrap ${spec.colorClass}`}>
                    {spec.icon}
                  </div>
                  <h3>{spec.title}</h3>
                  <p>{spec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
           3. BOTTOM SERVICES SECTION (OUR SERVICES PODCAST)
           ============================================= */}
        <section className="podcast-bottom-services-section">
          <div className="bottom-services-container">
            <div className="bottom-services-panel">
              <div className="bottom-services-left">
                <span className="services-subtitle">OUR SERVICES</span>
                <h2 className="services-title-inline">
                  PODCAST <Headphones size={28} style={{ stroke: "url(#mic-gradient)", strokeWidth: 2.3 }} />
                </h2>
                <div className="services-divider-line"></div>
                <p className="services-description-inline">
                  From powerful conversations to professional production, we help you create podcasts that connect and inspire.
                </p>
              </div>

              <div className="bottom-services-cards-grid">
                {bottomServices.map((serv, idx) => (
                  <Card className="services-card-item" key={idx}>
                    <div className="services-card-icon-wrapper">{serv.icon}</div>
                    <h4>{serv.title}</h4>
                    <p>{serv.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterAgency />
    </div>
  );
}
