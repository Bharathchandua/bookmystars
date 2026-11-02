import React, { useState, useEffect } from "react";
import { 
  ArrowRight, Search, Upload, MapPin, Briefcase, Calendar, 
  Target, Award, ListChecks, Globe, Sparkles, X, ChevronDown, 
  CheckCircle, RefreshCw, Grid, Clapperboard, Users, GraduationCap, 
  Heart, HandHeart, Trophy, Music, Star, User
} from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button";
import Card from "../../common/Card";
import heroImg from "../../../assets/opp-hero-chair.png";
import "./opportunities.css";

export default function OpportunitiesService() {
  // Master Opportunities Data
  const initialOpportunities = [
    {
      title: "Lead Actor for Web Series",
      company: "Nexus Studios",
      category: "Casting Calls",
      experience: "2-5 Years",
      location: "Mumbai, India",
      date: "May 25, 2025",
      status: "FEATURED",
      timeLeft: "2 Days Left",
      desc: "Looking for a male actor (22-30 years) for a lead role in an upcoming psychological thriller web series.",
      logoType: "nexus"
    },
    {
      title: "Video Editor",
      company: "Frame Works",
      category: "Job Openings",
      experience: "1-3 Years",
      location: "Bengaluru, India",
      date: "May 28, 2025",
      status: "FEATURED",
      timeLeft: "5 Days Left",
      desc: "We are looking for a skilled video editor with experience in documentaries and storytelling content.",
      logoType: "frameworks"
    },
    {
      title: "Music Collaboration",
      company: "Indie Beats",
      category: "Collaboration",
      experience: "Open to All",
      location: "Remote",
      date: "May 30, 2025",
      status: "FEATURED",
      timeLeft: "7 Days Left",
      desc: "Independent music producer looking to collaborate with singers and lyricists for a new project.",
      logoType: "music"
    },
    {
      title: "Social Media Intern",
      company: "Vista Media",
      category: "Internships",
      experience: "Students",
      location: "Delhi, India",
      date: "June 5, 2025",
      status: "NEW",
      timeLeft: "12 Days Left",
      desc: "Join our dynamic team and gain hands-on experience in social media management and content creation.",
      logoType: "vista"
    }
  ];

  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [displayedOpps, setDisplayedOpps] = useState(initialOpportunities);

  // Filter States
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All Categories");
  const [sidebarCategory, setSidebarCategory] = useState("All Categories");
  const [sidebarLocation, setSidebarLocation] = useState("All Locations");
  const [sidebarExperience, setSidebarExperience] = useState("All Experience Levels");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    category: "Casting Calls",
    experience: "Open to All",
    location: "Mumbai, India",
    date: "",
    desc: ""
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

  // Why List With Us Points
  const benefits = [
    {
      title: "Reach the Right Talent",
      desc: "Connect with verified professionals and emerging talent.",
      icon: <Target size={20} />
    },
    {
      title: "Trusted by the Industry",
      desc: "Used by leading studios, creators and companies.",
      icon: <Award size={20} />
    },
    {
      title: "Easy & Effective",
      desc: "Post opportunities in minutes and get quality responses.",
      icon: <ListChecks size={20} />
    },
    {
      title: "Wide Visibility",
      desc: "Get discovered by thousands of active members.",
      icon: <Globe size={20} />
    }
  ];

  // Apply filters logic
  const handleApplyFilters = () => {
    let result = [...opportunities];

    // Filter by Tab (if not "All Categories")
    if (selectedCategoryTab !== "All Categories") {
      result = result.filter(opp => opp.category === selectedCategoryTab);
    }

    // Filter by Sidebar Category
    if (sidebarCategory !== "All Categories") {
      result = result.filter(opp => opp.category === sidebarCategory);
    }

    // Filter by Sidebar Location
    if (sidebarLocation !== "All Locations") {
      const loc = sidebarLocation.split(",")[0].toLowerCase();
      result = result.filter(opp => opp.location.toLowerCase().includes(loc));
    }

    // Filter by Sidebar Experience
    if (sidebarExperience !== "All Experience Levels") {
      result = result.filter(opp => opp.experience === sidebarExperience);
    }

    setDisplayedOpps(result);
  };

  // Synchronize top tabs with sidebar filter triggers
  useEffect(() => {
    handleApplyFilters();
  }, [selectedCategoryTab, opportunities]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategoryTab("All Categories");
    setSidebarCategory("All Categories");
    setSidebarLocation("All Locations");
    setSidebarExperience("All Experience Levels");
    setDisplayedOpps(opportunities);
  };

  // Form Submission
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.desc) return;

    // Create a new opportunity item
    const newOpp = {
      ...formData,
      date: formData.date ? new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "June 20, 2025",
      status: "NEW",
      timeLeft: "30 Days Left",
      logoType: formData.company.toLowerCase().includes("nexus") ? "nexus" :
                formData.company.toLowerCase().includes("frame") ? "frameworks" :
                formData.company.toLowerCase().includes("vista") ? "vista" : "music"
    };

    const updatedOpps = [newOpp, ...opportunities];
    setOpportunities(updatedOpps);
    
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        title: "",
        company: "",
        category: "Casting Calls",
        experience: "Open to All",
        location: "Mumbai, India",
        date: "",
        desc: ""
      });
    }, 1800);
  };

  // Scroll to featured list
  const scrollToFeatured = () => {
    const element = document.getElementById("featured-opportunities-head");
    if (element) {
      const navbarHeight = 95;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: "smooth"
      });
    }
  };

  // Custom Logo badge renderer
  const renderLogo = (logoType, company) => {
    switch (logoType) {
      case "nexus":
        return (
          <div className="company-logo-box nexus-logo">
            <span className="logo-letter">N</span>
            <span className="logo-sub">NEXUS</span>
          </div>
        );
      case "frameworks":
        return (
          <div className="company-logo-box frameworks-logo">
            <span className="logo-word-top">FRAME</span>
            <span className="logo-word-bot">WORKS</span>
          </div>
        );
      case "vista":
        return (
          <div className="company-logo-box vista-logo">
            <span className="logo-word-top">VISTA</span>
            <span className="logo-word-bot">MEDIA</span>
          </div>
        );
      default:
        return (
          <div className="company-logo-box music-logo">
            <Music size={26} />
          </div>
        );
    }
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

              <div className="opps-hero-buttons">
                <Button 
                  variant="btn-play-latest" 
                  icon={<Search size={16} />}
                  onClick={scrollToFeatured}
                >
                  Find Opportunities
                </Button>
                <Button 
                  variant="btn-subscribe" 
                  icon={<Upload size={16} />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Post an Opportunity
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
           3. BODY CONTENT (Split Layout)
           ============================================= */}
        <section className="opps-body-section">
          <div className="opps-body-container">
            
            {/* Left Column: Featured Opportunities List */}
            <div className="opps-body-left">
              <div className="opps-featured-container">
                <div className="opps-featured-header" id="featured-opportunities-head">
                  <h2 className="opps-section-heading">Featured Opportunities</h2>
                  <Button className="btn-view-all-link" onClick={handleResetFilters}>
                    View All <span className="opps-hide-mobile">Opportunities</span> <ArrowRight size={14} />
                  </Button>
                </div>

                <div className="opps-list">
                  {displayedOpps.length > 0 ? (
                    displayedOpps.map((opp, idx) => (
                      <Card className="opps-card-item" key={idx}>
                        {/* Logo Wrapper */}
                        <div className="opps-logo-wrapper">
                          {renderLogo(opp.logoType, opp.company)}
                        </div>

                        {/* Info & Meta */}
                        <div className="opps-details-wrapper">
                          <div className="opps-badge-row">
                            <span className="opps-type-badge">{opp.category}</span>
                          </div>
                          <h3 className="opps-title">{opp.title}</h3>
                          <p className="opps-desc">{opp.desc}</p>
                          
                          <div className="opps-meta-row">
                            <span className="meta-item">
                              <MapPin size={13} /> {opp.location}
                            </span>
                            <span className="meta-item">
                              <Briefcase size={13} /> {opp.experience}
                            </span>
                            <span className="meta-item">
                              <Calendar size={13} /> {opp.date}
                            </span>
                          </div>
                        </div>

                        {/* Right Status */}
                        <div className="opps-status-wrapper">
                          <span className={`status-badge-tag ${opp.status === "FEATURED" ? "status-featured" : "status-new"}`}>
                            {opp.status}
                          </span>
                          <span className="status-time-left">{opp.timeLeft}</span>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="no-opps-message">
                      <p>No opportunities match your filter selections.</p>
                      <Button className="btn-reset-light" onClick={handleResetFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Widgets */}
            <div className="opps-body-right">
              {/* Why List With Us Card */}
              <div className="opps-sidebar-widget widget-benefits">
                <h3>Why list with us?</h3>
                <div className="benefits-list">
                  {benefits.map((b, idx) => (
                    <div className="benefit-item" key={idx}>
                      <div className="benefit-icon-wrapper">{b.icon}</div>
                      <div className="benefit-texts">
                        <h4>{b.title}</h4>
                        <p>{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="btn-play-latest" 
                  className="w-100 mt-4 sidebar-cta-btn" 
                  icon={<ArrowRight size={14} />} 
                  iconPosition="right"
                  onClick={() => setIsModalOpen(true)}
                >
                  Post an Opportunity
                </Button>
              </div>

              {/* Browse Opportunities Filter Card */}
              <div className="opps-sidebar-widget widget-browse">
                <h3>Browse Opportunities</h3>
                
                <div className="filter-form-group">
                  <div className="select-input-wrapper">
                    <select 
                      value={sidebarCategory} 
                      onChange={(e) => setSidebarCategory(e.target.value)}
                    >
                      <option value="All Categories">All Categories</option>
                      <option value="Casting Calls">Casting Calls</option>
                      <option value="Job Openings">Job Openings</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Internships">Internships</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Competitions">Competitions</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow-icon" />
                  </div>

                  <div className="select-input-wrapper">
                    <select 
                      value={sidebarLocation} 
                      onChange={(e) => setSidebarLocation(e.target.value)}
                    >
                      <option value="All Locations">All Locations</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Remote">Remote</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow-icon" />
                  </div>

                  <div className="select-input-wrapper">
                    <select 
                      value={sidebarExperience} 
                      onChange={(e) => setSidebarExperience(e.target.value)}
                    >
                      <option value="All Experience Levels">All Experience Levels</option>
                      <option value="Students">Students</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="2-5 Years">2-5 Years</option>
                      <option value="Open to All">Open to All</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow-icon" />
                  </div>

                  <Button 
                    variant="btn-play-latest" 
                    className="w-100 btn-apply-filters" 
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>

                  <Button className="btn-reset-filters-link" onClick={handleResetFilters}>
                    <RefreshCw size={12} /> Reset Filters
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =============================================
           4. HOW IT WORKS SECTION
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
         5. POST AN OPPORTUNITY MODAL
         ============================================= */}
      {isModalOpen && (
        <div className="opps-modal-overlay">
          <div className="opps-modal-card animate-zoomIn">
            <div className="modal-header">
              <h3>Post an Opportunity</h3>
              <Button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>

            {postSuccess ? (
              <div className="modal-success-screen">
                <CheckCircle size={52} className="success-icon" />
                <h4>Opportunity Shared!</h4>
                <p>Your opportunity has been successfully listed.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="modal-form">
                <div className="form-group-row">
                  <div className="form-item">
                    <label>Opportunity Title *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Lead Guitarist" 
                      required 
                    />
                  </div>
                  <div className="form-item">
                    <label>Company/Production *</label>
                    <input 
                      type="text" 
                      name="company" 
                      value={formData.company} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Nexus Studios" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group-row">
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
                    </select>
                  </div>
                  <div className="form-item">
                    <label>Experience Level *</label>
                    <select 
                      name="experience" 
                      value={formData.experience} 
                      onChange={handleInputChange}
                    >
                      <option value="Students">Students</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="2-5 Years">2-5 Years</option>
                      <option value="Open to All">Open to All</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-item">
                    <label>Location *</label>
                    <input 
                      type="text" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Mumbai, India" 
                      required 
                    />
                  </div>
                  <div className="form-item">
                    <label>Application Deadline</label>
                    <input 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div className="form-item">
                  <label>Description *</label>
                  <textarea 
                    name="desc" 
                    value={formData.desc} 
                    onChange={handleInputChange} 
                    placeholder="Provide details about role requirements, responsibilities, and benefits..." 
                    rows="4" 
                    required
                  ></textarea>
                </div>

                <div className="form-actions mt-4">
                  <Button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-submit-form">
                    Submit Opportunity
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
