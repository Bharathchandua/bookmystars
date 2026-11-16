import React, { useState } from "react";
import { Mail, X, CheckCircle } from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button.jsx";
import Card from "../../common/Card.jsx";
import heroImg from "../../../assets/media_hero.png";
import "./media-entertainment.css";

export default function MediaEntertainment() {
  // Modal State for Contact Us
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Film & TV Production",
    message: ""
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setIsContactModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        interest: "Film & TV Production",
        message: ""
      });
    }, 2000);
  };

  return (
    <div className="me-page-wrapper">
      <Navbar />

      <main className="me-page-content">

        {/* ── 1. HERO SECTION ── */}
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

              {/* Single Contact Us Button */}
              <div className="me-hero-buttons">
                <Button
                  className="btn-me-contact"
                  icon={<Mail size={18} />}
                  onClick={() => setIsContactModalOpen(true)}
                >
                  Contact Us
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

      </main>

      <FooterAgency />

      {/* ── 4. CONTACT US MODAL ── */}
      {isContactModalOpen && (
        <div className="me-modal-overlay">
          <div className="me-modal-card animate-zoomIn">
            <div className="modal-header">
              <h3>Contact Our Production Team</h3>
              <Button className="btn-close-modal" onClick={() => setIsContactModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>

            {contactSuccess ? (
              <div className="modal-success-screen">
                <CheckCircle size={52} className="success-icon" />
                <h4>Message Delivered!</h4>
                <p>Thank you for reaching out. Our media &amp; entertainment executive will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="modal-form">
                <div className="form-group-row">
                  <div className="form-item">
                    <label>Your Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Vikramaditya Roy" 
                      required 
                    />
                  </div>
                  <div className="form-item">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="e.g. vikram@studio.com" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-item">
                    <label>Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="e.g. +91 98765 43210" 
                      required 
                    />
                  </div>
                  <div className="form-item">
                    <label>Area of Interest</label>
                    <select 
                      name="interest" 
                      value={formData.interest} 
                      onChange={handleInputChange}
                    >
                      <option value="Film & TV Production">Film &amp; TV Production</option>
                      <option value="Music & Audio Production">Music &amp; Audio Production</option>
                      <option value="Digital & OTT Originals">Digital &amp; OTT Originals</option>
                      <option value="Marketing & Promotion Strategy">Marketing &amp; Promotion Strategy</option>
                      <option value="Talent Management & Casting">Talent Management &amp; Casting</option>
                      <option value="Live Events & Experiences">Live Events &amp; Experiences</option>
                    </select>
                  </div>
                </div>

                <div className="form-item">
                  <label>Project Details / Message *</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    placeholder="Tell us about your project concept, target release date, or specific production needs..." 
                    rows="4" 
                    required
                  ></textarea>
                </div>

                <div className="form-actions mt-4">
                  <Button type="button" className="btn-cancel" onClick={() => setIsContactModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-submit-form">
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
