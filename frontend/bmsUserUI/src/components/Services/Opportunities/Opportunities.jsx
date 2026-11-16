import React, { useState } from "react";
import { 
  ArrowRight, Search, Mail, X, CheckCircle, 
  Grid, Clapperboard, Briefcase, Users, GraduationCap, 
  HandHeart, Trophy, Star, User
} from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button";
import heroImg from "../../../assets/opp-hero-chair.png";
import "./opportunities.css";

export default function OpportunitiesService() {
  // Filter Tabs State
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All Categories");

  // Modal State for "Enquire About"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Casting Calls",
    message: ""
  });

  // Categories Header Data
  const categoriesList = [
    { name: "All Categories", icon: <Grid size={48} /> },
    { name: "Casting Calls", icon: <Clapperboard size={48} /> },
    { name: "Job Openings", icon: <Briefcase size={48} /> },
    { name: "Collaboration", icon: <Users size={48} /> },
    { name: "Internships", icon: <GraduationCap size={48} /> },
    { name: "Volunteer", icon: <HandHeart size={48} /> },
    { name: "Competitions", icon: <Trophy size={48} /> }
  ];

  // Form Submission
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "Casting Calls",
        message: ""
      });
    }, 2000);
  };

  return (
    <div className="opps-page-wrapper">
      <Navbar />

      <main className="opps-page-content">
        {/* =============================================
           1. HERO SECTION
           ============================================= */}
        <section className="opps-hero-section">
          <div className="opps-hero-container">
            <div className="opps-hero-left">
              <div className="opps-badge-wrap">
                <span className="opps-badge-pink">OPPORTUNITIES</span>
              </div>

              <h1 className="opps-main-title">
                Find <span className="text-pink">Opportunities.</span><br />
                Build the <span className="text-purple">Future.</span>
              </h1>

              <p className="opps-hero-desc">
                Explore casting calls, job openings, collaborations and more across the entertainment industry.
              </p>

              {/* Single "Enquire About" Button */}
              <div className="opps-hero-buttons">
                <Button 
                  className="btn-enquire" 
                  icon={<Mail size={18} />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Enquire About
                </Button>
              </div>
            </div>

            <div className="opps-hero-right">
              <img src={heroImg} alt="Book My Stars Opportunities Hero" className="opps-hero-image" />
            </div>
          </div>
        </section>

        {/* =============================================
           2. INTERACTIVE CATEGORIES BAR
           ============================================= */}
        <section className="opps-categories-bar-section">
          <div className="opps-categories-bar-container">
            <div className="opps-categories-list">
              {categoriesList.map((cat, idx) => (
                <Button
                  key={idx}
                  className={`opps-category-tab ${selectedCategoryTab === cat.name ? "active" : ""}`}
                  onClick={() => setSelectedCategoryTab(cat.name)}
                >
                  <span className="tab-icon-wrap">{cat.icon}</span>
                  <span className="tab-text-label">{cat.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
           3. HOW IT WORKS SECTION (Direct Flow)
           ============================================= */}
        <section className="opps-how-it-works-section">
          <div className="how-it-works-container">
            <div className="how-it-works-card">
              <h2 className="how-heading">How It Works</h2>
              
              <div className="how-steps-timeline">
                <div className="how-step-node">
                  <div className="node-icon-circle">
                    <User size={26} style={{ color: '#9400B9' }} />
                  </div>
                  <div className="node-text-block">
                    <span className="node-step-number">1</span>
                    <h3 className="node-step-title">Create Your Profile</h3>
                    <p className="node-step-desc">Sign up and build your profile to showcase your talent or needs.</p>
                  </div>
                </div>

                <div className="how-step-connector">
                  <ArrowRight size={20} />
                </div>

                <div className="how-step-node">
                  <div className="node-icon-circle">
                    <Search size={26} style={{ color: '#9400B9' }} />
                  </div>
                  <div className="node-text-block">
                    <span className="node-step-number">2</span>
                    <h3 className="node-step-title">Find or Post</h3>
                    <p className="node-step-desc">Browse opportunities or post your own in just a few clicks.</p>
                  </div>
                </div>

                <div className="how-step-connector">
                  <ArrowRight size={20} />
                </div>

                <div className="how-step-node">
                  <div className="node-icon-circle">
                    <Users size={26} style={{ color: '#9400B9' }} />
                  </div>
                  <div className="node-text-block">
                    <span className="node-step-number">3</span>
                    <h3 className="node-step-title">Connect</h3>
                    <p className="node-step-desc">Connect with the right people and start meaningful conversations.</p>
                  </div>
                </div>

                <div className="how-step-connector">
                  <ArrowRight size={20} />
                </div>

                <div className="how-step-node">
                  <div className="node-icon-circle">
                    <Star size={26} style={{ color: '#9400B9' }} />
                  </div>
                  <div className="node-text-block">
                    <span className="node-step-number">4</span>
                    <h3 className="node-step-title">Grow Together</h3>
                    <p className="node-step-desc">Collaborate, create and build the future of entertainment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterAgency />

      {/* =============================================
         4. ENQUIRE ABOUT OPPORTUNITIES MODAL
         ============================================= */}
      {isModalOpen && (
        <div className="opps-modal-overlay">
          <div className="opps-modal-card animate-zoomIn">
            <div className="modal-header">
              <h3>Enquire About Opportunities</h3>
              <Button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>

            {postSuccess ? (
              <div className="modal-success-screen">
                <CheckCircle size={52} className="success-icon" />
                <h4>Enquiry Submitted!</h4>
                <p>Thank you for reaching out. Our opportunities team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="modal-form">
                <div className="form-group-row">
                  <div className="form-item">
                    <label>Your Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Rahul Sharma" 
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
                      placeholder="e.g. rahul@example.com" 
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
                    <label>Category *</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange}
                    >
                      <option value="Casting Calls">Casting Calls</option>
                      <option value="Job Openings">Job Openings</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Internships">Internships</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Competitions">Competitions</option>
                      <option value="Production Talent Enquiry">Production Talent Enquiry</option>
                    </select>
                  </div>
                </div>

                <div className="form-item">
                  <label>Enquiry Details / Message *</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    placeholder="Provide details about role requirements, experience, or collaboration needs..." 
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
