import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle, Star, MapPin, Film, Activity, Video, Music,
  Users, Award, Sparkles, Building, ShieldCheck, Heart, UserCheck, Camera,
  Headphones, Palette, User, Map, Mail, X
} from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button.jsx";
import Card from "../../common/Card.jsx";

import makeoverImg from "../../../assets/makeover.png";
import makeoverCtaGirl from "../../../assets/makeover_cta_girl.png";
import "./makeover.css";

export default function Makeover() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Modal State for Makeover Enquiry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Film & TV Makeover",
    message: ""
  });

  const [muasCount, setMuasCount] = useState(0);
  const [agenciesCount, setAgenciesCount] = useState(0);
  const [brandsCount, setBrandsCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setMuasCount(Math.round(progress * 500));
      setAgenciesCount(Math.round(progress * 200));
      setBrandsCount(Math.round(progress * 100));
      
      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    {
      title: "Film & TV Makeover",
      desc: <>On-screen look for<br />movies, web series,<br />ads &amp; more.</>,
      linkText: "Explore Film & TV Makeover",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80",
      icon: <Film size={42} />
    },
    {
      title: "Event Makeover",
      desc: <>Glamorous looks for<br />events, red carpet,<br />award nights.</>,
      linkText: "Explore Event Makeover",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
      icon: <Star size={42} />
    },
    {
      title: "Dance Makeover",
      desc: <>Stage-ready looks for<br />performances, reality<br />shows &amp; competitions.</>,
      linkText: "Explore Dance Makeover",
      image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&q=80",
      icon: <Activity size={42} />
    },
    {
      title: "Ad Shoot Makeover",
      desc: <>Camera-ready looks for<br />commercials, print &amp;<br />brand shoots.</>,
      linkText: "Explore Ad Shoot Makeover",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
      icon: <Video size={42} />
    },
    {
      title: "Music Video Makeover",
      desc: <>Trendy &amp; creative looks<br />for music videos &amp; artist<br />promotions.</>,
      linkText: "Explore Music Video Makeover",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
      icon: <Music size={42} />
    },
    {
      title: "Influencer Makeover",
      desc: <>Stylish &amp; impactful looks<br />for digital creators &amp;<br />brand collaborations.</>,
      linkText: "Explore Influencer Makeover",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      icon: <Users size={42} />
    }
  ];

  const benefits = [
    {
      title: "Verified MUAs & Stylists",
      icon: <UserCheck size={40} />
    },
    {
      title: "Trusted Agencies & Beauty Brands",
      icon: <Building size={40} />
    },
    {
      title: "Custom Looks for Every Need",
      icon: <Palette size={40} />
    },
    {
      title: "On-Location & Studio Services",
      icon: <Users size={40} />
    },
    {
      title: "HD & Camera Ready Results",
      icon: <Camera size={40} />
    },
    {
      title: "Professional & Timely Support",
      icon: <Headphones size={40} />
    }
  ];

  const steps = [
    {
      num: "1.",
      step: "Search",
      desc: "Browse services, artists or agencies.",
      icon: <Users size={24} />
    },
    {
      num: "2.",
      step: "Connect",
      desc: "Shortlist and connect with professionals.",
      icon: <Heart size={24} />
    },
    {
      num: "3.",
      step: "Discuss",
      desc: "Share your requirements and get a plan.",
      icon: <Sparkles size={24} />
    },
    {
      num: "4.",
      step: "Book",
      desc: "Confirm the booking securely.",
      icon: <ShieldCheck size={24} />
    },
    {
      num: "5.",
      step: "Shine",
      desc: "Get your perfect look and own the spotlight!",
      icon: <Award size={24} />
    }
  ];

  const trustBadges = [
    { text: "100% Secure Bookings", icon: <ShieldCheck size={24} /> },
    { text: "Transparent Pricing", icon: <User size={24} /> },
    { text: "Dedicated Support", icon: <Headphones size={24} /> },
    { text: "Nationwide Network", icon: <Map size={24} /> }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "Film & TV Makeover",
        message: ""
      });
    }, 2000);
  };

  return (
    <div className="mo-page-wrapper">
      <Navbar />

      <main className="mo-page-content">
        
        {/* ── 1. HERO SECTION ── */}
        <section className="mo-hero-section">
          <div className="mo-hero-container">
            
            {/* Left Hero Content */}
            <div className="mo-hero-left">
              <div className="mo-badge-wrap">
                <span className="mo-badge">Makeover Services</span>
              </div>

              <h1 className="mo-main-title">
                Look Your Best<br />
                for Every <span className="text-mo-pink">Frame,</span><br />
                Stage &amp; <span className="text-mo-pink">Spotlight.</span>
              </h1>

              <p className="mo-hero-desc">
                BookMyStars partners with top makeover brands, beauty agencies,
                professional MUAs, hairstylists and styling experts to deliver
                exceptional looks for every occasion.
              </p>

              {/* Benefits checklist */}
              <div className="mo-hero-benefits">
                <div className="mo-benefit-item">
                  <div className="mo-benefit-icon-wrap">
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <h5>Verified Professionals</h5>
                    <p>Only trusted &amp; verified<br />makeup artists &amp; stylists</p>
                  </div>
                </div>

                <div className="mo-benefit-item">
                  <div className="mo-benefit-icon-wrap">
                    <Star size={36} />
                  </div>
                  <div>
                    <h5>Top Brands &amp; Agencies</h5>
                    <p>Tie-ups with leading beauty<br />brands &amp; agencies</p>
                  </div>
                </div>

                <div className="mo-benefit-item">
                  <div className="mo-benefit-icon-wrap">
                    <MapPin size={36} />
                  </div>
                  <div>
                    <h5>Pan India Network</h5>
                    <p>On-location &amp; studio services<br />across India</p>
                  </div>
                </div>
              </div>

              {/* Single "Enquire" Button */}
              <div className="mo-hero-buttons">
                <Button 
                  className="btn-mo-enquire"
                  icon={<Mail size={18} />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Enquire
                </Button>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="mo-hero-right">
              <img src={makeoverImg} alt="Makeover Services" className="mo-hero-image" />
              <div className="mo-hero-image-overlay"></div>

              {/* Square Stat Boxes — Top Right Corner */}
              <div className="mo-stat-boxes">
                <Card className="mo-stat-box">
                  <div className="mo-stat-box-icon"><Users size={26} /></div>
                  <div className="mo-stat-box-text">
                    <span className="mo-stat-box-value">{muasCount}+</span>
                    <span className="mo-stat-box-label">Makeup Artists</span>
                  </div>
                </Card>
                <Card className="mo-stat-box">
                  <div className="mo-stat-box-icon"><Building size={26} /></div>
                  <div className="mo-stat-box-text">
                    <span className="mo-stat-box-value">{agenciesCount}+</span>
                    <span className="mo-stat-box-label">Beauty Agencies</span>
                  </div>
                </Card>
                <Card className="mo-stat-box">
                  <div className="mo-stat-box-icon"><Award size={26} /></div>
                  <div className="mo-stat-box-text">
                    <span className="mo-stat-box-value">{brandsCount}+</span>
                    <span className="mo-stat-box-label">Beauty Brands</span>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </section>

        {/* ── 2. MAKEOVER CATEGORIES ── */}
        <section className="mo-categories-section">
          <div className="mo-categories-container">
            <div className="mo-section-header">
              <h2 className="mo-section-title">
                <span className="mo-title-line"></span>
                Our Makeover Categories
                <span className="mo-title-line"></span>
              </h2>
              <p className="mo-section-subtitle">
                Choose the perfect makeover service for your project or occasion
              </p>
            </div>

            <div className="mo-categories-grid">
              {categories.map((c, i) => {
                const titleParts = c.title.split(" Makeover");
                const mainTitle = titleParts[0];
                return (
                  <Card className="mo-category-card" key={i}>
                    <div className="mo-category-card-left">
                      <div>
                        <div className="mo-category-title-row">
                          <div className="mo-category-icon-wrap">{c.icon}</div>
                          <h3 className="mo-category-title">
                            {mainTitle}{" "}<br />Makeover
                          </h3>
                        </div>
                        <p className="mo-category-desc">{c.desc}</p>
                      </div>
                      <Link to="#" className="mo-category-link">
                        {c.linkText}
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className="mo-category-card-right">
                      <img src={c.image} alt={c.title} className="mo-category-img" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. HOW IT WORKS ── */}
        <section className="mo-works-section">
          <div className="mo-works-container">
            <div className="mo-section-header" style={{ marginBottom: "20px" }}>
              <h2 className="mo-section-title">
                <span className="mo-title-line"></span>
                How It Works
                <span className="mo-title-line"></span>
              </h2>
            </div>

            <div className="mo-works-timeline">
              <div className="mo-timeline-line" />
              {steps.map((s, i) => (
                <div className="mo-timeline-node" key={i}>
                  <div className="mo-node-circle">{s.icon}</div>
                  <div className="mo-node-text-block">
                    <h4 className="mo-node-title">
                      <span className="mo-node-number">{s.num}</span>{" "}
                      <span className="mo-node-text">{s.step}</span>
                    </h4>
                    <p className="mo-node-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. WHY CHOOSE ── */}
        <section className="mo-why-section">
          <div className="mo-why-container">
            <div className="mo-section-header">
              <h2 className="mo-section-title">
                Why Choose BookMyStars for Makeover Services?
              </h2>
            </div>

            <div className="mo-why-row">
              {benefits.map((b, i) => (
                <Card className="mo-why-card" key={i}>
                  <div className="mo-why-icon">{b.icon}</div>
                  <h4 className="mo-why-title">{b.title}</h4>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. FOOTER CTA ── */}
        <section className="mo-cta-section">
          <div className="mo-cta-container">
            <div className="mo-cta-left-img">
              <img src={makeoverCtaGirl} alt="MUA Model" />
            </div>
            <div className="mo-cta-right-content">
              <div className="mo-cta-center-text">
                <h2 className="mo-cta-title">Ready for Your Perfect Look?</h2>
                <p className="mo-cta-desc">
                  Find the right makeup artist or agency for your project<br />
                  and step into the spotlight with confidence.
                </p>
              </div>
              <div className="mo-cta-right-btn">
                <Button className="btn-mo-cta-find" onClick={() => setIsModalOpen(true)}>
                  Enquire Now
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. TRUST BADGES ── */}
        <section className="mo-trust-section">
          <div className="mo-trust-container">
            {trustBadges.map((b, i) => (
              <div className="mo-trust-badge" key={i}>
                <div className="mo-trust-icon-circle">
                  {b.icon}
                </div>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      <FooterAgency />

      {/* ── 7. MAKEOVER ENQUIRY MODAL ── */}
      {isModalOpen && (
        <div className="mo-modal-overlay">
          <div className="mo-modal-card animate-zoomIn">
            <div className="modal-header">
              <h3>Enquire About Makeover Services</h3>
              <Button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>

            {enquirySuccess ? (
              <div className="modal-success-screen">
                <CheckCircle size={52} className="success-icon" />
                <h4>Enquiry Submitted!</h4>
                <p>Thank you for reaching out. Our makeover coordinator will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="modal-form">
                <div className="form-group-row">
                  <div className="form-item">
                    <label>Your Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Priya Kapoor" 
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
                      placeholder="e.g. priya@example.com" 
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
                    <label>Makeover Category</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange}
                    >
                      <option value="Film & TV Makeover">Film &amp; TV Makeover</option>
                      <option value="Event Makeover">Event Makeover</option>
                      <option value="Dance Makeover">Dance Makeover</option>
                      <option value="Ad Shoot Makeover">Ad Shoot Makeover</option>
                      <option value="Music Video Makeover">Music Video Makeover</option>
                      <option value="Influencer Makeover">Influencer Makeover</option>
                      <option value="Bridal & Occasion Makeover">Bridal &amp; Occasion Makeover</option>
                    </select>
                  </div>
                </div>

                <div className="form-item">
                  <label>Shoot / Event Details &amp; Location *</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    placeholder="Date of event, on-location or studio requirement, number of artists needed..." 
                    rows="4" 
                    required
                  ></textarea>
                </div>

                <div className="form-actions mt-4">
                  <Button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-submit-form">
                    Submit Enquiry
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
