import React, { useState } from "react";
import { ArrowRight, Mail, X, CheckCircle } from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Card from "../../common/Card.jsx";

// Import Hero Image
import postProductionHero from "../../../assets/Post production_Hero.png";

import "./postproduction.css";

// Custom outline SVG icons for stats bar matching design


// Custom editing app SVGs
const PremiereIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#00005c" />
    <text x="5" y="16.5" fill="#1478ff" fontSize="10.5" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">Pr</text>
  </svg>
);

const AfterEffectsIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#1b002c" />
    <text x="5" y="16.5" fill="#d19aff" fontSize="10.5" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">Ae</text>
  </svg>
);

const PhotoshopIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#001e36" />
    <text x="5" y="16.5" fill="#31a8ff" fontSize="10.5" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">Ps</text>
  </svg>
);

const ResolveIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#111111" />
    <circle cx="12" cy="8.2" r="4.2" fill="#ff3366" opacity="0.9" style={{ mixBlendMode: "screen" }} />
    <circle cx="8.7" cy="13.8" r="4.2" fill="#33cc66" opacity="0.9" style={{ mixBlendMode: "screen" }} />
    <circle cx="15.3" cy="13.8" r="4.2" fill="#3399ff" opacity="0.9" style={{ mixBlendMode: "screen" }} />
  </svg>
);

const BlenderIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }} fill="none">
    <circle cx="12" cy="12" r="12" fill="#0f172a" />
    <circle cx="12" cy="13" r="4.5" fill="#ea580c" />
    <circle cx="12" cy="13" r="2.2" fill="#0284c7" />
    <path d="M12 8.5l3.5-3.5M14.5 11l4.5-1.5M15.5 14l3.5 2.2" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Mockup benefit icons
const ExpertIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polygon points="12 11 13.5 14 16.5 14 14 15.5 15 18.5 12 17 9 18.5 10 15.5 7.5 14 10.5 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const QualityIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 11 11 13 15 9" />
  </svg>
);

const DeliveryIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Custom outline SVGs for "What We Do" section
const VideoEditingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <rect x="12" y="6" width="28" height="40" rx="3" />
    <line x1="12" y1="18" x2="40" y2="18" />
    <line x1="12" y1="34" x2="40" y2="34" />
    <rect x="15" y="10" width="3" height="4" rx="0.5" />
    <rect x="15" y="22" width="3" height="4" rx="0.5" />
    <rect x="15" y="38" width="3" height="4" rx="0.5" />
    <rect x="34" y="10" width="3" height="4" rx="0.5" />
    <rect x="34" y="22" width="3" height="4" rx="0.5" />
    <rect x="34" y="38" width="3" height="4" rx="0.5" />
    <circle cx="44" cy="50" r="4" />
    <circle cx="54" cy="44" r="4" />
    <path d="M42.5 46.5L34 34" />
    <path d="M50.5 42L34 34" />
  </svg>
);

const ColorGradingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <circle cx="32" cy="22" r="12" />
    <circle cx="22" cy="38" r="12" />
    <circle cx="42" cy="38" r="12" />
  </svg>
);

const SoundDesignIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <line x1="32" y1="14" x2="32" y2="50" strokeWidth="3.5" />
    <line x1="24" y1="20" x2="24" y2="44" strokeWidth="3" />
    <line x1="40" y1="20" x2="40" y2="44" strokeWidth="3" />
    <line x1="16" y1="25" x2="16" y2="39" strokeWidth="3" />
    <line x1="48" y1="25" x2="48" y2="39" strokeWidth="3" />
    <line x1="8" y1="30" x2="8" y2="34" strokeWidth="2.5" />
    <line x1="56" y1="30" x2="56" y2="34" strokeWidth="2.5" />
  </svg>
);

const VfxIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <path d="M14 50l26-26" strokeWidth="3.5" />
    <path d="M40 24l6-6" strokeWidth="3.5" stroke="var(--post-pink)" />
    <path d="M46 6c0 3 2 5 5 5c-3 0-5 2-5 5c0-3-2-5-5-5c3 0 5-2 5-5z" fill="currentColor" stroke="none" />
    <path d="M56 16c0 2 1.5 3 3 3c-1.5 0-3 1-3 3c0-2-1-3-3-3c2 0 3-1 3-3z" fill="currentColor" stroke="none" />
    <path d="M36 14c0 2 1 3 3 3c-2 0-3 1-3 3c0-2-1-3-3-3c2 0 3-1 3-3z" fill="currentColor" stroke="none" />
  </svg>
);

const MotionGraphicsIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <rect x="12" y="12" width="40" height="40" rx="2" strokeDasharray="5 4" />
    <rect x="9" y="9" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <rect x="49" y="9" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <rect x="9" y="49" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <rect x="49" y="49" width="6" height="6" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
    <path d="M22 22h20" strokeWidth="3" />
    <path d="M32 22v20" strokeWidth="3" />
    <path d="M28 42h8" strokeWidth="2.5" />
  </svg>
);

const FinishingDeliveryIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--post-purple)" }}>
    <rect x="10" y="22" width="44" height="30" rx="3" />
    <line x1="10" y1="32" x2="54" y2="32" />
    <g transform="rotate(-8 10 22)">
      <rect x="10" y="14" width="44" height="8" rx="1.5" />
      <line x1="18" y1="14" x2="24" y2="22" />
      <line x1="30" y1="14" x2="36" y2="22" />
      <line x1="42" y1="14" x2="48" y2="22" />
    </g>
  </svg>
);

// Custom outline SVGs for "Our Post Production Workflow" section
const ReceiveReviewIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9 15 12 12 15 15" />
  </svg>
);

const EditCreateIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <rect x="5" y="6" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="13" y="6" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="5" y="11" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const RefineEnhanceIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <circle cx="12" cy="8" r="5" />
    <circle cx="8" cy="15" r="5" />
    <circle cx="16" cy="15" r="5" />
  </svg>
);

const ReviewApproveIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="8 10 11 13 16 8" />
  </svg>
);

const DeliverIcon = ({ size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    <polyline points="7 11 12 16 17 11" />
    <line x1="12" y1="4" x2="12" y2="16" />
  </svg>
);

export default function PostProduction() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "All Services (Full Pipeline)",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("post-modal-overlay")) {
      setIsContactModalOpen(false);
    }
  };

  const services = [
    {
      title: "Video Editing",
      desc: "Seamless cuts, storytelling flow and precise editing that engages your audience.",
      icon: <VideoEditingIcon size={48} />
    },
    {
      title: "Color Grading",
      desc: "Cinematic color correction and grading to set the perfect mood.",
      icon: <ColorGradingIcon size={48} />
    },
    {
      title: "Sound Design",
      desc: "Immersive sound design, mixing and audio mastering for a powerful impact.",
      icon: <SoundDesignIcon size={48} />
    },
    {
      title: "Visual Effects (VFX)",
      desc: "High-end VFX, compositing and CGI that bring imagination to reality.",
      icon: <VfxIcon size={48} />
    },
    {
      title: "Motion Graphics",
      desc: "Engaging motion graphics, titles, transitions and animated elements.",
      icon: <MotionGraphicsIcon size={48} />
    },
    {
      title: "Finishing & Delivery",
      desc: "Final polish, quality check and delivery in all formats you need.",
      icon: <FinishingDeliveryIcon size={48} />
    }
  ];

  const processSteps = [
    {
      num: "01",
      title: "Receive & Review",
      desc: "We receive your files and understand your vision, goals and requirements.",
      icon: <ReceiveReviewIcon size={40} />
    },
    {
      num: "02",
      title: "Edit & Create",
      desc: "Our experts edit, enhance and create with attention to every detail.",
      icon: <EditCreateIcon size={40} />
    },
    {
      num: "03",
      title: "Refine & Enhance",
      desc: "Color, sound, effects and graphics are refined to perfection.",
      icon: <RefineEnhanceIcon size={40} />
    },
    {
      num: "04",
      title: "Review & Approve",
      desc: "You review the output and we make revisions until it's perfect.",
      icon: <ReviewApproveIcon size={40} />
    },
    {
      num: "05",
      title: "Deliver",
      desc: "Final master delivered in your required format, on time, every time.",
      icon: <DeliverIcon size={40} />
    }
  ];

  return (
    <div className="post-prod-page-wrapper">
      <Navbar />

      <main className="post-prod-page-content">
        
        {/* =============================================
           1. HERO SECTION & BREADCRUMBS
           ============================================= */}
        <section className="post-prod-hero-section">
          <div className="post-prod-hero-container">
            <div className="post-prod-hero-left">
              <div className="post-prod-badge-wrap">
                <span className="post-prod-badge">Post Production</span>
              </div>

              <h1 className="post-prod-main-title">
                <span className="post-prod-title-line-1">Polish Every <span className="text-pink">Frame.</span></span>
                <span className="post-prod-title-line-2">Perfect Every <span className="text-pink">Story.</span></span>
              </h1>

              <div className="post-prod-title-divider"></div>

              <p className="post-prod-hero-desc">
                From raw footage to a masterful final cut — we provide end-to-end post production services that bring your vision to life with precision, creativity and cinematic excellence.
              </p>

              {/* Benefit features */}
              <div className="post-prod-hero-benefits">
                <div className="post-prod-benefit-item">
                  <div className="post-prod-benefit-icon">
                    <ExpertIcon />
                  </div>
                  <div className="post-prod-benefit-text">
                    <span className="post-prod-benefit-title">Expert Professionals</span>
                    <span className="post-prod-benefit-desc">Skilled editors, colorists, sound designers & artists</span>
                  </div>
                </div>
                <div className="post-prod-benefit-item">
                  <div className="post-prod-benefit-icon">
                    <QualityIcon />
                  </div>
                  <div className="post-prod-benefit-text">
                    <span className="post-prod-benefit-title">High Quality Output</span>
                    <span className="post-prod-benefit-desc">Industry-standard tools and high-end workflow</span>
                  </div>
                </div>
                <div className="post-prod-benefit-item">
                  <div className="post-prod-benefit-icon">
                    <DeliveryIcon />
                  </div>
                  <div className="post-prod-benefit-text">
                    <span className="post-prod-benefit-title">Timely Delivery</span>
                    <span className="post-prod-benefit-desc">On-time delivery without compromising quality</span>
                  </div>
                </div>
              </div>

              <div className="post-prod-hero-buttons">
                <button
                  type="button"
                  className="btn-post-contact-gradient"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  <Mail size={18} />
                  <span>Contact Us</span>
                </button>
              </div>
            </div>

            <div className="post-prod-hero-right">
              <div className="post-prod-hero-image-wrapper">
                <img src={postProductionHero} alt="Polish Every Frame. Perfect Every Story" className="post-prod-hero-image" />
              </div>
              
              {/* Floating Editing App Logos */}
              <div className="floating-logo float-premiere">
                <PremiereIcon />
              </div>
              <div className="floating-logo float-ae">
                <AfterEffectsIcon />
              </div>
              <div className="floating-logo float-resolve">
                <ResolveIcon />
              </div>
              <div className="floating-logo float-photoshop">
                <PhotoshopIcon />
              </div>
              <div className="floating-logo float-blender">
                <BlenderIcon />
              </div>

            </div>
          </div>
        </section>

        {/* =============================================
           2. WHAT WE DO SECTION
           ============================================= */}
        <section className="post-prod-what-we-do">
          <div className="post-prod-section-header">
            <h2 className="post-prod-section-title">What We Do</h2>
            <p className="post-prod-section-subtitle">
              Professional post production suites dedicated to making your content stand out.
            </p>
          </div>

          <div className="post-prod-services-grid">
            {services.map((serv, idx) => (
              <Card className="post-prod-service-card" key={idx}>
                <div className="post-prod-card-icon-wrap">
                  {serv.icon}
                </div>
                <h3 className="post-prod-card-title">{serv.title}</h3>
                <p className="post-prod-card-desc">{serv.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* =============================================
           3. OUR POST PRODUCTION WORKFLOW SECTION
           ============================================= */}
        <section className="post-prod-process-section">
          <div className="post-prod-section-header">
            <h2 className="post-prod-section-title">Our Post Production Workflow</h2>
            <p className="post-prod-section-subtitle">
              A smooth and collaborative process from start to finish.
            </p>
          </div>

          <div className="post-prod-process-timeline">
            {processSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="post-prod-step-arrow">
                    <ArrowRight size={22} />
                  </div>
                )}
                <div className="post-prod-process-step">
                  <div className="post-prod-process-icon-wrap">
                    {step.icon}
                  </div>
                  <h4 className="post-prod-step-title">{step.num}. {step.title}</h4>
                  <p className="post-prod-step-desc">{step.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

      </main>

      {/* Direct Contact Modal */}
      {isContactModalOpen && (
        <div className="post-modal-overlay" onClick={handleBackdropClick}>
          <div className="post-modal-content">
            <button
              type="button"
              className="post-modal-close"
              onClick={() => setIsContactModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {!isSubmitted ? (
              <>
                <div className="post-modal-header">
                  <span className="post-modal-badge">Direct Inquiry</span>
                  <h3 className="post-modal-title">Contact Post Production Team</h3>
                  <p className="post-modal-subtitle">
                    Share your project details with our post supervisors. We will get back to you promptly.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="post-modal-form">
                  <div className="post-form-group">
                    <label htmlFor="post-name">Full Name *</label>
                    <input
                      id="post-name"
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="post-form-row">
                    <div className="post-form-group">
                      <label htmlFor="post-email">Email Address *</label>
                      <input
                        id="post-email"
                        type="email"
                        name="email"
                        required
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="post-form-group">
                      <label htmlFor="post-phone">Phone Number *</label>
                      <input
                        id="post-phone"
                        type="tel"
                        name="phone"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="post-form-group">
                    <label htmlFor="post-service">Required Service *</label>
                    <select
                      id="post-service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                    >
                      <option value="All Services (Full Pipeline)">All Services (Full Pipeline)</option>
                      <option value="Video Editing">Video Editing</option>
                      <option value="Color Grading (DaVinci Resolve)">Color Grading (DaVinci Resolve)</option>
                      <option value="Sound Design & Dolby Audio">Sound Design & Dolby Audio</option>
                      <option value="Visual Effects (VFX)">Visual Effects (VFX)</option>
                      <option value="Motion Graphics & Titles">Motion Graphics & Titles</option>
                      <option value="Finishing & Mastering">Finishing & Mastering</option>
                    </select>
                  </div>

                  <div className="post-form-group">
                    <label htmlFor="post-message">Project Specifications</label>
                    <textarea
                      id="post-message"
                      name="message"
                      rows={3}
                      placeholder="Tell us about the footage format, expected runtime, and target delivery dates..."
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="post-modal-submit-btn">
                    <span>Submit Inquiry</span>
                    <Mail size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="post-modal-success">
                <CheckCircle size={56} className="post-success-icon" />
                <h3>Inquiry Submitted!</h3>
                <p>
                  Thank you, <strong>{formData.name}</strong>. Our post production team has received your inquiry and will contact you promptly.
                </p>
                <button
                  type="button"
                  className="post-modal-close-action"
                  onClick={() => {
                    setIsContactModalOpen(false);
                    setIsSubmitted(false);
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <FooterAgency />
    </div>
  );
}
