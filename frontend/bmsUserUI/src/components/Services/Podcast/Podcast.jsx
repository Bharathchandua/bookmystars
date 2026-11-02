import React from "react";
import { Link } from "react-router-dom";
import { Play, Bell, ArrowRight, MoreVertical, MessageSquare, Award, TrendingUp, Calendar, Headphones } from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button";
import Card from "../../common/Card";
import heroImg from "../../../assets/podcast-hero-right.jpg";
import journeyPoster from "../../../assets/the_journey_poster.png";
import cityLightsPoster from "../../../assets/city_lights_poster.png";
import "./podcast.css";

export default function Podcast() {
  const episodes = [
    {
      title: "The Creator's Journey with Raghav Malhotra",
      date: "May 12, 2024",
      episodeNum: 32,
      duration: "45:32",
      desc: "Raghav Malhotra opens up about his journey, choices, failures, and what keeps him grounded.",
      showName: "THE CREATOR'S JOURNEY",
      guest: "FT. RAGHAV MALHOTRA",
      bgColor: "linear-gradient(135deg, #3b0066 0%, #1a0033 100%)",
      image: journeyPoster,
    },
    {
      title: "Beyond the Spotlight with Ananya Sharma",
      date: "Apr 28, 2024",
      episodeNum: 31,
      duration: "38:18",
      desc: "Ananya Sharma shares her musical journey, challenges, and the power of staying true to your art.",
      showName: "BEYOND THE SPOTLIGHT",
      guest: "FT. ANANYA SHARMA",
      bgColor: "linear-gradient(135deg, #66004c 0%, #330026 100%)",
      image: cityLightsPoster,
    },
  ];

  const features = [
    { text: "Real conversations", icon: <MessageSquare size={16} /> },
    { text: "Industry insights", icon: <Award size={16} /> },
    { text: "Inspiration & growth", icon: <TrendingUp size={16} /> },
    { text: "New episodes every week", icon: <Calendar size={16} /> },
  ];

  const categories = [
    { name: "Entertainment", active: true },
    { name: "Music", active: false },
    { name: "Film", active: false },
    { name: "OTT", active: false },
    { name: "Digital", active: false },
    { name: "Career", active: false },
    { name: "Inspiration", active: false },
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

              <div className="podcast-hero-buttons">
                <Button variant="btn-play-latest" icon={<Play size={16} fill="currentColor" />}>
                  Play Latest Episode
                </Button>
                <Button variant="btn-subscribe" icon={<Bell size={16} />}>
                  Subscribe Now
                </Button>
              </div>

              {/* Platforms */}
              <div className="podcast-platforms-container">
                <span className="platforms-label">Available On:</span>
                <div className="platforms-list">
                  <div className="platform-item">
                    <svg className="spotify-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.785-8.893-.983-.335.076-.67-.135-.746-.47-.077-.337.135-.67.472-.748 3.853-.88 7.15-.502 9.82.133.295.18.387.565.207.861zm1.226-2.724c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.665-1.11 8.233-.572 11.35 1.347.368.226.488.707.26 1.07zm.106-2.833C14.73 8.878 9.473 8.703 6.438 9.624a1.002 1.002 0 0 1-1.22-.716.997.997 0 0 1 .714-1.22c3.488-1.057 9.29-.858 13.012 1.353a.998.998 0 0 1 .357 1.364.996.996 0 0 1-1.385.362z" fill="#1DB954"/>
                    </svg>
                    <span>Spotify</span>
                  </div>
                  <div className="platform-item">
                    <svg className="apple-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1 4h-2v1.2c-.6.2-1 .8-1 1.5V13h4V8.7c0-.7-.4-1.3-1-1.5V6zm-3.5 8.5c0 .83.67 1.5 1.5 1.5h2c.83 0 1.5-.67 1.5-1.5V14h-5v.5z" fill="#9933ff" />
                    </svg>
                    <span>Apple Podcasts</span>
                  </div>
                  <div className="platform-item">
                    <svg className="google-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-4 6c0-.55-.45-1-1-1s-1 .45-1 1v8c0 .55.45 1 1 1s1-.45 1-1V8zm4-3c0-.55-.45-1-1-1s-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V5zm4 3c0-.55-.45-1-1-1s-1 .45-1 1v8c0 .55.45 1 1 1s1-.45 1-1V8zm4 3c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2z" fill="#f4b400" />
                    </svg>
                    <span>Google Podcasts</span>
                  </div>
                  <div className="platform-item">
                    <svg className="youtube-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.555a3.002 3.002 0 0 0-2.11 2.108C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
                    </svg>
                    <span>YouTube</span>
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
           2. BODY LAYOUT (Featured Episodes & Sidebar)
           ============================================= */}
        <section className="podcast-body-section">
          <div className="podcast-body-container">
            {/* Left Column: Featured Episodes */}
            <div className="podcast-body-left">
              <div className="featured-episodes-container">
                <h2 className="podcast-section-heading">Featured Episodes</h2>
                
                <div className="episode-list">
                  {episodes.map((ep, idx) => (
                    <Card className="episode-card" key={idx}>
                      {/* Thumbnail Card */}
                      <div className="episode-thumbnail-wrap">
                        {ep.image && (
                          <img src={ep.image} alt={ep.title} className="episode-thumbnail-image" />
                        )}
                        <span className="episode-duration">{ep.duration}</span>
                      </div>

                      {/* Metadata & Description */}
                      <div className="episode-details">
                        <h3 className="episode-title">{ep.title}</h3>
                        <div className="episode-meta-header">
                          <span className="episode-date">{ep.date}</span>
                          <span className="episode-divider-dot"></span>
                          <span className="episode-number">Episode {ep.episodeNum}</span>
                        </div>
                        <p className="episode-desc">{ep.desc}</p>
                        
                        <div className="episode-actions">
                          <Button variant="btn-play-episode" icon={<Play size={12} fill="currentColor" />}>
                            Play Episode
                          </Button>
                          <Button variant="btn-spotify-link" icon={
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.785-8.893-.983-.335.076-.67-.135-.746-.47-.077-.337.135-.67.472-.748 3.853-.88 7.15-.502 9.82.133.295.18.387.565.207.861zm1.226-2.724c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.665-1.11 8.233-.572 11.35 1.347.368.226.488.707.26 1.07zm.106-2.833C14.73 8.878 9.473 8.703 6.438 9.624a1.002 1.002 0 0 1-1.22-.716.997.997 0 0 1 .714-1.22c3.488-1.057 9.29-.858 13.012 1.353a.998.998 0 0 1 .357 1.364.996.996 0 0 1-1.385.362z" fill="#1DB954"/>
                            </svg>
                          }>
                            Spotify
                          </Button>
                          <Button variant="btn-menu-dots">
                            <MoreVertical size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="view-all-episodes-wrap">
                  <Button variant="btn-view-all-episodes" icon={<ArrowRight size={16} />} iconPosition="right">
                    View All Episodes
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="podcast-body-right">
              {/* About Widget */}
              <div className="podcast-sidebar-widget widget-about">
                <h3>About the Podcast</h3>
                <p>
                  The BookMyStars Podcast is your backstage pass to the world of entertainment, creativity, and opportunities.
                </p>
                <div className="about-features-grid">
                  {features.map((feat, i) => (
                    <div className="about-feature-item" key={i}>
                      <span className="feature-icon-circle">{feat.icon}</span>
                      <span>{feat.text}</span>
                    </div>
                  ))}
                </div>

                {/* Sidebar Stats Panel */}
                <div className="podcast-sidebar-stats-box">
                  <div className="sidebar-stat-item">
                    <strong>50+</strong>
                    <span>Episodes</span>
                  </div>
                  <div className="sidebar-stat-item">
                    <strong>25K+</strong>
                    <span>Listeners</span>
                  </div>
                  <div className="sidebar-stat-item">
                    <strong>100+</strong>
                    <span>Guests</span>
                  </div>
                </div>
              </div>

              {/* Categories Widget */}
              <div className="podcast-sidebar-widget widget-categories">
                <h3>Top Categories</h3>
                <div className="categories-tags-wrap">
                  {categories.map((cat, i) => (
                    <span className={`category-badge-tag ${cat.active ? "active" : ""}`} key={i}>
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
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
