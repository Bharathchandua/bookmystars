import React, { useState, useEffect } from "react";
import Navbar from "../Navbar.jsx";
import Footer from "../Footer.jsx";
import "./media-page.css";

/* ── Shared common components ── */
import Button from "../common/Button.jsx";
import Card   from "../common/Card.jsx";

import {
  Tv, BookOpen, Star, FileText, Calendar, Users,
  Play, ArrowRight,
  Tv2, Film, Music2, Sparkles, ShirtIcon, Globe2,
  Palette, PartyPopper, TrendingUp, Award,
  Wifi, ShieldCheck, Zap, MonitorPlay,
  Eye, CheckCircle, Heart, Globe
} from "lucide-react";

/* ── Images ── */
import bmsMagazine    from "../../assets/magazine_cover.png";
import ctaCamera      from "../../assets/cta_camera.png";
import ctaMagLeft     from "../../assets/cta_mag_left.png";
import ctaMagMid      from "../../assets/cta_mag_mid.png";
import ctaMagRight    from "../../assets/cta_mag_right.png";
import legendsRise    from "../../assets/legends_rise_poster.png";
import cityLights     from "../../assets/city_lights_poster.png";
import rhythmUnplugged from "../../assets/rhythm_unplugged_poster.png";
import beyondSpotlight from "../../assets/beyond_spotlight.png";
import dreamsLive     from "../../assets/dreams_live_poster.png";
import makeover       from "../../assets/makeover.png";
import clientHero     from "../../assets/client-hero.png";
import cardMedia      from "../../assets/card_media.png";
import signupBg       from "../../assets/signup_left_bg.png";
import signinBg       from "../../assets/signin_left_bg.png";
import promotionHero  from "../../assets/promotion_Hero.png";
// AI-generated card photos
import cardFilm       from "../../assets/card_film.png";
import cardDance      from "../../assets/card_dance.png";
import cardMakeover2  from "../../assets/card_makeover2.png";
import cardFashion    from "../../assets/card_fashion.png";
import cardAstrology  from "../../assets/card_astrology.png";
import cardArt        from "../../assets/card_art.png";
import cardEvents     from "../../assets/card_events.png";
import cardBusiness   from "../../assets/card_business.png";
import cardTalent     from "../../assets/card_talent.png";

// High-fidelity baked magazine covers
import magMediaFinal   from "../../assets/mag_media_final.png";
import magFashionFinal from "../../assets/mag_fashion_final.png";
import magBusinessFinal from "../../assets/mag_business_final.png";


/* ── Hero grid – 10 portrait cards ── */
const heroCategories = [
  { label: "MEDIA &\nENTERTAINMENT",         bg: cardMedia },
  { label: "FILM\nPROMOTIONS",               bg: cardFilm },
  { label: "DANCE &\nPERFORMING ARTS",       bg: cardDance },
  { label: "MAKEOVER &\nGLAMOUR",            bg: cardMakeover2 },
  { label: "FASHION &\nBEAUTY",              bg: cardFashion },
  { label: "ASTROLOGY &\nSPIRITUALITY",     bg: cardAstrology },
  { label: "ART &\nCULTURE",                bg: cardArt },
  { label: "EVENTS &\nEXPERIENCES",         bg: cardEvents },
  { label: "BUSINESS &\nENTREPRENEURSHIP",  bg: cardBusiness },
  { label: "TALENT\nSPOTLIGHT",             bg: cardTalent },
];

/* ── Categories section cards ── */
const categories = [
  { icon: <Tv2 size={18}/>,        iconBg:"#ec008c", title:"Media & Entertainment",  desc:"Celebrity interviews, OTT features, artist spotlights, entertainment news and industry insights.", img: clientHero },
  { icon: <Film size={18}/>,       iconBg:"#5b00d7", title:"Film Promotions",          desc:"Movie launches, trailers, press meets, cast interviews, reviews and exclusive film coverage.",    img: legendsRise },
  { icon: <Music2 size={18}/>,     iconBg:"#00a8e0", title:"Dance & Performing Arts",  desc:"Dance shows, choreographers, interviews, competitions, workshops and dancer success stories.",    img: cityLights },
  { icon: <Sparkles size={18}/>,   iconBg:"#e85d04", title:"Makeover & Glamour",       desc:"Makeover transformations, beauty tips, hairstyling, bridal looks and celebrity glamour stories.", img: makeover },
  { icon: <ShirtIcon size={18}/>,  iconBg:"#ec008c", title:"Fashion & Beauty",         desc:"Fashion trends, designers, model features, styling inspiration and beauty industry updates.",      img: cardFashion },
  { icon: <Globe2 size={18}/>,     iconBg:"#5b00d7", title:"Astrology & Spirituality", desc:"Astrology insights, horoscope, numerology, spiritual guidance, wellness tips and expert interviews.", img: dreamsLive },
  { icon: <Palette size={18}/>,    iconBg:"#00a8e0", title:"Art & Culture",            desc:"Paintings, sculptures, cultural events, artist profiles, gallery features and creative exhibitions.", img: cardArt },
  { icon: <PartyPopper size={18}/>,iconBg:"#e85d04", title:"Events & Experiences",     desc:"Award shows, fashion weeks, product launches, concerts, exhibitions and brand event coverage.", img: cardEvents },
  { icon: <TrendingUp size={18}/>, iconBg:"#ec008c", title:"Business & Entrepreneurship", desc:"Startup stories, entrepreneur interviews, investment insights, brand building and industry trends.", img: cardBusiness },
  { icon: <Award size={18}/>,      iconBg:"#5b00d7", title:"Talent Spotlight",         desc:"Rising stars, emerging talents, success stories, achievement profiles and talent recognition.", img: cardTalent },
];

/* ── Why Choose ── */
const whyItems = [
  { icon: <Wifi size={24}/>,        title: "Wide Reach",              desc: "Connect with diverse audiences across TV, digital & print platforms." },
  { icon: <Users size={24}/>,       title: "Expert Team",             desc: "Professionals with industry experience & media expertise." },
  { icon: <ShieldCheck size={24}/>, title: "Quality Content",         desc: "High-quality production, editorial & storytelling standards." },
  { icon: <MonitorPlay size={24}/>, title: "Multi Platform Exposure", desc: "Get featured on TV, digital platforms & magazines." },
  { icon: <Zap size={24}/>,         title: "Brand Value",             desc: "Enhance your visibility, credibility & brand positioning." },
  { icon: <Heart size={24}/>,       title: "End-to-End Support",      desc: "From concept to coverage, we support you every step of the way." },
];

/* ── Trust ── */
const trustItems = [
  { icon: <ShieldCheck size={36}/>, label: "Trusted Platform\nby Professionals" },
  { icon: <CheckCircle size={36}/>, label: "Verified Talents\n& Experts" },
  { icon: <Sparkles size={36}/>,    label: "Creative & Impactful\nContent" },
  { icon: <Globe size={36}/>,       label: "Global Audience\nReach" },
  { icon: <TrendingUp size={36}/>,  label: "Grow Your Brand\nwith Us" },
];

export default function Media() {
  const [activeCtaMag, setActiveCtaMag] = useState(0);
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  useEffect(() => {
    if (isCtaHovered) return;
    const interval = setInterval(() => {
      setActiveCtaMag((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [isCtaHovered]);

  return (
    <div className="media-page">
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="mp-hero">
        <div className="mp-hero-inner">

          {/* ── Left copy ── */}
          <div className="mp-hero-left">
            <p className="mp-hero-badge">BOOKMYSTARS TV CHANNEL &amp; MAGAZINES</p>
            <h1 className="mp-hero-title">
              Where Stories,<br />
              <span>Talent &amp; Trends</span><br />
              Take Center Stage.
            </h1>
            <p className="mp-hero-desc">
              Discover exclusive content across Film Promotions, Dance,
              Fashion, Makeover, Astrology, Arts, Events, Business,
              Media &amp; Entertainment and more.
            </p>
            <div className="mp-hero-buttons">
              <Button className="mp-btn-primary">
                <Play size={13} fill="#fff" color="#fff" /> Watch TV Channel
              </Button>
              <Button className="mp-btn-outline">
                <BookOpen size={13} /> Read Magazine
              </Button>
              <Button className="mp-btn-outline">
                <Star size={13} /> Get Featured
              </Button>
            </div>
          </div>

          {/* ── 5 × 2 portrait card grid ── */}
          <div className="mp-hero-grid-wrap">
            {heroCategories.map((c, i) => (
              <div className="mp-hero-card" key={i}>
                <div className="mp-hero-card-face">
                  <img
                    src={c.bg}
                    alt={c.label.replace("\n", " ")}
                    className="mp-hero-card-img"
                  />
                  <div className="mp-hero-card-overlay" />
                  <div className="mp-hero-card-sheen" />
                  <div className="mp-hero-card-label">
                    {c.label.split("\n").map((line, j) => (
                      <span key={j}>{line}{j === 0 ? <br /> : ""}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Magazine cover ── */}
          <div className="mp-hero-magazine">
            <img
              src={bmsMagazine}
              alt="BookMyStars Magazine"
              className="mp-magazine-img"
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          EXPLORE CATEGORIES
      ══════════════════════════════════════ */}
      <section style={{ background:"#fff", paddingTop:"40px", paddingBottom:"0px" }}>
        <div className="mp-categories">
          <div className="mp-section-header">
            <h2>EXPLORE OUR CATEGORIES</h2>
          </div>
          <div className="mp-categories-grid">
            {categories.map((cat, i) => (
              <Card className="mp-cat-card" key={i}>
                <img src={cat.img} alt={cat.title} className="mp-cat-card-img" />
                <div className="mp-cat-card-body">
                  <div className="mp-cat-icon-wrap"
                    style={{ background:`${cat.iconBg}20`, color: cat.iconBg }}>
                    {cat.icon}
                  </div>
                  <h4 className="mp-cat-title">{cat.title}</h4>
                  <p className="mp-cat-desc">{cat.desc}</p>
                  <Button className="mp-cat-explore">
                    Explore <ArrowRight size={12} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY CHOOSE
      ══════════════════════════════════════ */}
      <section style={{background:"#fff"}}>
        <div className="mp-why">
          <div className="mp-section-header">
            <h2>WHY CHOOSE BOOKMYSTARS TV &amp; MAGAZINES?</h2>
          </div>
          <div className="mp-why-grid">
            {whyItems.map((w,i)=>(
              <Card className="mp-why-item" key={i}>
                <div className="mp-why-icon">{w.icon}</div>
                <div>
                  <h4 className="mp-why-title">{w.title}</h4>
                  <p className="mp-why-desc">{w.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="mp-cta">
        <div className="mp-cta-inner">
          <div className="mp-cta-left">
            <img src={ctaCamera} alt="Studio Camera" className="mp-cta-camera"/>
          </div>
          <div className="mp-cta-center">
            <h2 className="mp-cta-title">Ready to Share Your Story?</h2>
            <p className="mp-cta-desc">
              Feature your talent, brand, film, event, artwork, fashion collection,<br/>
              business or success story on BookMyStars TV Channel &amp; Magazines.
            </p>
            <div className="mp-cta-buttons">
              <Button className="mp-cta-btn-white">Get Featured Today <ArrowRight size={14}/></Button>
              <Button className="mp-cta-btn-outline-white">Advertise With Us <ArrowRight size={14}/></Button>
              <Button className="mp-cta-btn-outline-white">Promote Your Film <ArrowRight size={14}/></Button>
            </div>
          </div>
          <div className="mp-cta-right">
            <div className="mp-cta-magazines-group"
              onMouseEnter={() => setIsCtaHovered(true)}
              onMouseLeave={() => setIsCtaHovered(false)}
            >
              <div className={`mp-cta-mag-item left ${!isCtaHovered && activeCtaMag === 0 ? "active-loop" : ""}`}>
                <img src={ctaMagLeft} alt="BookMyStars Magazine Left" />
              </div>
              <div className={`mp-cta-mag-item middle ${!isCtaHovered && activeCtaMag === 1 ? "active-loop" : ""}`}>
                <img src={ctaMagMid} alt="BookMyStars Magazine Middle" />
              </div>
              <div className={`mp-cta-mag-item right ${!isCtaHovered && activeCtaMag === 2 ? "active-loop" : ""}`}>
                <img src={ctaMagRight} alt="BookMyStars Magazine Right" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════ */}
      <div className="mp-trust">
        <div className="mp-trust-inner">
          {trustItems.map((t,i)=>(
            <div className="mp-trust-item" key={i}>
              <span className="mp-trust-icon">{t.icon}</span>
              <span className="mp-trust-label">
                {t.label.split("\n").map((l,j)=><span key={j}>{l}{j===0?<br/>:""}</span>)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Footer/>
    </div>
  );
}
