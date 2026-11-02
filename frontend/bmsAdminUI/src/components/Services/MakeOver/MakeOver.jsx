import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, ArrowRight, Play, CheckCircle, Star, MapPin,
  Film, Activity, Video, Music, Users, Award, Shield, Sparkles, Building,
  Briefcase, Clock, Phone, ShieldCheck, Heart, UserCheck, Camera, Headphones,
  Palette, User, Map
} from "lucide-react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import Button from "../../common/Button.jsx";
import Card from "../../common/Card.jsx";

import makeoverImg from "../../../assets/makeover.png";
import makeoverCtaGirl from "../../../assets/makeover_cta_girl.png";
import "./makeover.css";

// Import makeover brand logos
import logo01 from "../../../assets/makeoverlogos/01_mac.png";
import logo02 from "../../../assets/makeoverlogos/02_lakme.png";
import logo03 from "../../../assets/makeoverlogos/03_loreal_paris.png";
import logo04 from "../../../assets/makeoverlogos/04_nykaa.png";
import logo05 from "../../../assets/makeoverlogos/05_faces_canada.png";
import logo06 from "../../../assets/makeoverlogos/06_kryolan.png";
import logo07 from "../../../assets/makeoverlogos/07_colorgar.png";
import logo08 from "../../../assets/makeoverlogos/08_estee_lauder.png";
import logo09 from "../../../assets/makeoverlogos/09_chanel.png";
import logo10 from "../../../assets/makeoverlogos/10_dior.png";
import logo11 from "../../../assets/makeoverlogos/11_nars.png";
import logo12 from "../../../assets/makeoverlogos/12_clinique.png";
import logo13 from "../../../assets/makeoverlogos/13_bareminerals.png";
import logo14 from "../../../assets/makeoverlogos/14_shiseido.png";
import logo15 from "../../../assets/makeoverlogos/15_maybelline.png";
import logo16 from "../../../assets/makeoverlogos/16_revlon.png";
import logo17 from "../../../assets/makeoverlogos/17_benefit.png";
import logo18 from "../../../assets/makeoverlogos/18_bobbi_brown.png";
import logo19 from "../../../assets/makeoverlogos/19_huda_beauty.png";
import logo20 from "../../../assets/makeoverlogos/20_lancome.png";
import logo21 from "../../../assets/makeoverlogos/21_givenchy.png";
import logo22 from "../../../assets/makeoverlogos/22_yves_saint_laurent.png";
import logo23 from "../../../assets/makeoverlogos/23_tom_ford.png";
import logo24 from "../../../assets/makeoverlogos/24_giorgio_armani.png";
import logo25 from "../../../assets/makeoverlogos/25_make_up_for_ever.png";
import logo26 from "../../../assets/makeoverlogos/26_charlotte_tilbury.png";
import logo27 from "../../../assets/makeoverlogos/27_laura_mercier.png";
import logo28 from "../../../assets/makeoverlogos/28_kiko_milano.png";
import logo29 from "../../../assets/makeoverlogos/29_morphe.png";
import logo30 from "../../../assets/makeoverlogos/30_colourpop.png";
import logo31 from "../../../assets/makeoverlogos/31_milk_makeup.png";
import logo32 from "../../../assets/makeoverlogos/32_fenty_beauty.png";
import logo33 from "../../../assets/makeoverlogos/33_elf.png";
import logo34 from "../../../assets/makeoverlogos/34_tarte.png";
import logo35 from "../../../assets/makeoverlogos/35_too_faced.png";
import logo36 from "../../../assets/makeoverlogos/36_smashbox.png";
import logo37 from "../../../assets/makeoverlogos/37_urban_decay.png";
import logo38 from "../../../assets/makeoverlogos/38_becca.png";
import logo39 from "../../../assets/makeoverlogos/39_dolce_gabbana.png";
import logo40 from "../../../assets/makeoverlogos/40_avon.png";
import logo41 from "../../../assets/makeoverlogos/41_covergirl.png";
import logo42 from "../../../assets/makeoverlogos/42_rimmel.png";
import logo43 from "../../../assets/makeoverlogos/43_sugar.png";
import logo44 from "../../../assets/makeoverlogos/44_innisfree.png";
import logo45 from "../../../assets/makeoverlogos/45_laneige.png";
import logo46 from "../../../assets/makeoverlogos/46_sulwhasoo.png";
import logo47 from "../../../assets/makeoverlogos/47_iope.png";
import logo48 from "../../../assets/makeoverlogos/48_the_face_shop.png";
import logo49 from "../../../assets/makeoverlogos/49_tony_moly.png";
import logo50 from "../../../assets/makeoverlogos/50_bioderma.png";
import logo51 from "../../../assets/makeoverlogos/51_la_roche_posay.png";
import logo52 from "../../../assets/makeoverlogos/52_vichy.png";
import logo53 from "../../../assets/makeoverlogos/53_caudalie.png";
import logo54 from "../../../assets/makeoverlogos/54_ole_henriksen.png";
import logo55 from "../../../assets/makeoverlogos/55_kiehls.png";
import logo56 from "../../../assets/makeoverlogos/56_neutrogena.png";

export default function Makeover() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const partnerLogos = [
    logo01, logo02, logo03, logo04, logo05, logo06, logo07, logo08, logo09, logo10,
    logo11, logo12, logo13, logo14, logo15, logo16, logo17, logo18, logo19, logo20,
    logo21, logo22, logo23, logo24, logo25, logo26, logo27, logo28, logo29, logo30,
    logo31, logo32, logo33, logo34, logo35, logo36, logo37, logo38, logo39, logo40,
    logo41, logo42, logo43, logo44, logo45, logo46, logo47, logo48, logo49, logo50,
    logo51, logo52, logo53, logo54, logo55, logo56
  ];

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

  const stats = [
    { value: "500+", label: "Makeup Artists", icon: <Users size={24} /> },
    { value: "200+", label: "Beauty Agencies", icon: <Building size={24} /> },
    { value: "100+", label: "Beauty Brands", icon: <Award size={24} /> },
    { value: "50K+", label: "Projects Completed", icon: <Briefcase size={24} /> },
    { value: "20+", label: "Cities Covered", icon: <MapPin size={24} /> }
  ];

  const trustBadges = [
    { text: "100% Secure Bookings", icon: <ShieldCheck size={24} /> },
    { text: "Transparent Pricing", icon: <User size={24} /> },
    { text: "Dedicated Support", icon: <Headphones size={24} /> },
    { text: "Nationwide Network", icon: <Map size={24} /> }
  ];

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

              {/* Buttons */}
              <div className="mo-hero-buttons">
                <Button className="btn-mo-find">
                  Find Your Makeover Expert
                  <ArrowRight size={16} />
                </Button>

                <Button className="btn-mo-works">
                  <div className="mo-play-icon-circle">
                    <Play size={10} fill="currentColor" />
                  </div>
                  How It Works
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

        {/* ── 3. OUR PARTNER NETWORK ── */}
        <section className="mo-partner-section">
          <div className="mo-partner-container">
            <h2 className="mo-partner-title">
              Our Partner Network
            </h2>
            <p className="mo-partner-subtitle">
              We tie up with the best beauty brands, agencies &amp; professionals
            </p>

            <div className="mo-logos-marquee">
              <div className="mo-logos-track">
                {partnerLogos.map((logo, index) => (
                  <div key={index} className="mo-logo-item">
                    <img src={logo} alt={`Partner Logo ${index + 1}`} />
                  </div>
                ))}
                {/* Duplicate for infinite loop */}
                {partnerLogos.map((logo, index) => (
                  <div key={`dup-${index}`} className="mo-logo-item">
                    <img src={logo} alt={`Partner Logo Duplicate ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. HOW IT WORKS ── */}
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

        {/* ── 5. WHY CHOOSE ── */}
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

        {/* ── 6. STATS BAR ── */}
        <section className="mo-stats-section">
          <div className="mo-stats-container">
            {stats.map((s, i) => (
              <div className="mo-stat-item" key={i}>
                <div className="mo-stat-icon">{s.icon}</div>
                <div className="mo-stat-text">
                  <span className="mo-stat-value">{s.value}</span>
                  <span className="mo-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. FOOTER CTA ── */}
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
                <Button className="btn-mo-cta-find">
                  Find Your Makeover Expert
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. TRUST BADGES ── */}
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
    </div>
  );
}
