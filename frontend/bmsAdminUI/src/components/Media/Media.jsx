import React, { useState, useEffect } from "react";
import Navbar from "../Navbar.jsx";
import Footer from "../Footer.jsx";
import "./media-page.css";

/* ── Shared common components ── */
import Button from "../common/Button.jsx";
import Card   from "../common/Card.jsx";

import {
  Tv, BookOpen, Star, FileText, Calendar, Users,
  Play, ChevronLeft, ChevronRight, ArrowRight,
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

/* ── Stats ── */
const stats = [
  { icon: <Eye size={32} />,      value: "100K+", label: "Monthly Viewers" },
  { icon: <BookOpen size={32} />, value: "50K+",  label: "Magazine Readers" },
  { icon: <Star size={32} />,     value: "5000+", label: "Featured Talents" },
  { icon: <FileText size={32} />, value: "1000+", label: "Published Stories" },
  { icon: <Calendar size={32} />, value: "500+",  label: "Events Covered" },
  { icon: <Users size={32} />,    value: "100+",  label: "Industry Experts" },
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

/* ── TV Episodes ── */
const tvEpisodes = [
  { thumb: clientHero,       title: "Exclusive Interview with Popular Actor", duration: "12:48", sub: "Episode 12" },
  { thumb: legendsRise,      title: "Behind The Scenes Movie Making",         duration: "09:15", sub: "Episode 08" },
  { thumb: cityLights,       title: "Dance Champions Grand Finale",           duration: "11:20", sub: "Episode 15" },
  { thumb: beyondSpotlight,  title: "Astrology Special 2024 Predictions",     duration: "14:05", sub: "Episode 10" },
  { thumb: rhythmUnplugged,  title: "Fashion Week Exclusive Coverage",        duration: "08:30", sub: "Episode 22" },
  { thumb: dreamsLive,       title: "Business Leaders Roundtable",            duration: "16:45", sub: "Episode 05" },
];

/* ── Magazines ── */
const magazines = [
  { bg: magMediaFinal,    label: "MEDIA & ENTERTAINMENT" },
  { bg: magFashionFinal,  label: "FASHION & BEAUTY" },
  { bg: magBusinessFinal, label: "BUSINESS LEADERS" },
];

/* ── Events ── */
const events = [
  { thumb: dreamsLive,      title: "Award Night Excellence 2024", duration: "10:30" },
  { thumb: cardFashion,     title: "Fashion Week Highlights",     duration: "08:45" },
  { thumb: rhythmUnplugged, title: "Music Concert Live 2024",     duration: "09:50" },
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
  const [tvIdx,  setTvIdx]  = useState(0);
  const [magIdx, setMagIdx] = useState(0);
  const [evtIdx, setEvtIdx] = useState(0);

  const [activeCtaMag, setActiveCtaMag] = useState(0);
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const mobile = w <= 576;
      const tablet = w > 576 && w <= 1100;
      setIsMobile(mobile);
      setIsTablet(tablet);

      const newVisible = mobile ? 1 : (tablet ? 2 : 3);
      setTvIdx((prev) => Math.min(prev, Math.max(0, tvEpisodes.length - newVisible)));
      setMagIdx((prev) => Math.min(prev, Math.max(0, magazines.length - newVisible)));
      setEvtIdx((prev) => Math.min(prev, Math.max(0, events.length - newVisible)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isCtaHovered) return;
    const interval = setInterval(() => {
      setActiveCtaMag((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [isCtaHovered]);

  const tvVisible  = isMobile ? 1 : (isTablet ? 2 : 3);
  const magVisible = isMobile ? 1 : (isTablet ? 2 : 3);
  const evtVisible = isMobile ? 1 : (isTablet ? 2 : 3);

  const tvNext  = () => setTvIdx(i  => Math.min(i+1, tvEpisodes.length - tvVisible));
  const tvPrev  = () => setTvIdx(i  => Math.max(i-1, 0));
  const magNext = () => setMagIdx(i => Math.min(i+1, magazines.length - magVisible));
  const magPrev = () => setMagIdx(i => Math.max(i-1, 0));
  const evtNext = () => setEvtIdx(i => Math.min(i+1, events.length - evtVisible));
  const evtPrev = () => setEvtIdx(i => Math.max(i-1, 0));

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
          STATS STRIP
      ══════════════════════════════════════ */}
      <div className="mp-stats-strip">
        <div className="mp-stats-inner">
          {stats.map((s, i) => (
            <div className="mp-stat-item" key={i}>
              <div className="mp-stat-icon-wrap">{s.icon}</div>
              <div className="mp-stat-info">
                <strong>{s.value}</strong>
                <small>{s.label}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          EXPLORE CATEGORIES
      ══════════════════════════════════════ */}
      <section style={{ background:"#fff", paddingTop:"20px", paddingBottom:"0px" }}>
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
          THREE-COLUMN: TV | MAGAZINES | EVENTS
      ══════════════════════════════════════ */}
      <section className="mp-three-col">
        <div className="mp-three-col-inner">

          {/* TV Channel */}
          <div className="mp-col-container tv-container">
            <div className="mp-col-header">
              <h3>LATEST FROM OUR TV CHANNEL</h3>
              <Button className="mp-view-all desktop-only-btn">
                View All Episodes <ArrowRight size={12}/>
              </Button>
            </div>
            <div className="mp-carousel-wrap">
              <Button className="mp-carousel-arrow prev" onClick={tvPrev} disabled={tvIdx===0} style={{opacity:tvIdx===0?0.35:1}}>
                <ChevronLeft size={14}/>
              </Button>
              <div className="mp-tv-episodes">
                {tvEpisodes.slice(tvIdx, tvIdx+tvVisible).map((ep,i)=>(
                  <Card className="mp-ep-card" key={i}>
                    <div className="mp-card-thumb-wrap">
                      <img src={ep.thumb} alt={ep.title} className="mp-ep-thumb"/>
                      <div className="mp-card-play-btn">
                        <Play size={10} fill="var(--mp-purple)" color="var(--mp-purple)"/>
                      </div>
                      <span className="mp-card-duration">{ep.duration}</span>
                    </div>
                    <div className="mp-card-info">
                      <p className="mp-card-title">{ep.title}</p>
                      <span className="mp-card-sub">{ep.sub}</span>
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="mp-carousel-arrow next" onClick={tvNext} disabled={tvIdx>=tvEpisodes.length-tvVisible} style={{opacity:tvIdx>=tvEpisodes.length-tvVisible?0.35:1}}>
                <ChevronRight size={14}/>
              </Button>
            </div>
            <div className="mp-col-footer-btn mobile-only-btn">
              <Button className="mp-view-all-centered">
                View All Episodes <ArrowRight size={12}/>
              </Button>
            </div>
          </div>

          {/* Magazine Covers */}
          <div className="mp-col-container magazines-container">
            <div className="mp-col-header">
              <h3>FEATURED MAGAZINE COVERS</h3>
              <Button className="mp-view-all desktop-only-btn">
                View All Magazines <ArrowRight size={12}/>
              </Button>
            </div>
            <div className="mp-carousel-wrap">
              <Button className="mp-carousel-arrow prev" onClick={magPrev} disabled={magIdx===0} style={{opacity:magIdx===0?0.35:1}}>
                <ChevronLeft size={14}/>
              </Button>
              <div className="mp-magazines-row">
                {magazines.slice(magIdx,magIdx+magVisible).map((mag,i)=>(
                  <Card className="mp-mag-card" key={i}>
                    <div className="mp-mag-cover">
                      <img src={mag.bg} alt={mag.label} className="mp-mag-bg-img" />
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="mp-carousel-arrow next" onClick={magNext} disabled={magIdx>=magazines.length-magVisible} style={{opacity:magIdx>=magazines.length-magVisible?0.35:1}}>
                <ChevronRight size={14}/>
              </Button>
            </div>
            <div className="mp-col-footer-btn mobile-only-btn">
              <Button className="mp-view-all-centered">
                View All Magazines <ArrowRight size={12}/>
              </Button>
            </div>
          </div>

          {/* Events */}
          <div className="mp-col-container events-container">
            <div className="mp-col-header">
              <h3>EVENT HIGHLIGHTS</h3>
              <Button className="mp-view-all desktop-only-btn">
                View All Events <ArrowRight size={12}/>
              </Button>
            </div>
            <div className="mp-carousel-wrap">
              <Button className="mp-carousel-arrow prev" onClick={evtPrev} disabled={evtIdx===0} style={{opacity:evtIdx===0?0.35:1}}>
                <ChevronLeft size={14}/>
              </Button>
              <div className="mp-events-grid">
                {events.slice(evtIdx,evtIdx+evtVisible).map((ev,i)=>(
                  <Card className="mp-event-card" key={i}>
                    <div className="mp-card-thumb-wrap">
                      <img src={ev.thumb} alt={ev.title} className="mp-event-thumb"/>
                      <div className="mp-card-play-btn">
                        <Play size={10} fill="var(--mp-purple)" color="var(--mp-purple)"/>
                      </div>
                      <span className="mp-card-duration">{ev.duration}</span>
                    </div>
                    <div className="mp-card-info">
                      <p className="mp-card-title">{ev.title}</p>
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="mp-carousel-arrow next" onClick={evtNext} disabled={evtIdx>=events.length-evtVisible} style={{opacity:evtIdx>=events.length-evtVisible?0.35:1}}>
                <ChevronRight size={14}/>
              </Button>
            </div>
            <div className="mp-col-footer-btn mobile-only-btn">
              <Button className="mp-view-all-centered">
                View All Events <ArrowRight size={12}/>
              </Button>
            </div>
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
