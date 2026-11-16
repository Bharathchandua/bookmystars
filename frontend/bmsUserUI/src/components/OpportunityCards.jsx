import React from "react";
import { Link } from "react-router-dom";
import {
  Clapperboard,
  Camera,
  PlaySquare,
  Sparkles,
  Briefcase,
  GraduationCap,
  UserPlus,
  Search,
  Cpu,
  Users,
  Trophy,
  ArrowRight,
} from "lucide-react";
import "./opportunity-cards.css";

import cardTalent from "../assets/card_talent.png";
import cardFilm from "../assets/card_film.png";
import cardMedia from "../assets/card_media.png";
import cardMakeover2 from "../assets/card_makeover2.png";
import cardBusiness from "../assets/card_business.png";
import cardFashion from "../assets/card_fashion.png";

const platformCards = [
  {
    id: "talent",
    title: "Talent & Artists",
    description: "Actors, models, singers, dancers, anchors and more.",
    image: cardTalent,
    icon: Clapperboard,
    link: "/services/opportunities",
  },
  {
    id: "production",
    title: "Casting & Production",
    description: "Casting calls, projects, crew and production teams.",
    image: cardFilm,
    icon: Camera,
    link: "/services/opportunities",
  },
  {
    id: "creators",
    title: "Digital & Creators",
    description: "Content creators, influencers and digital media professionals.",
    image: cardMedia,
    icon: PlaySquare,
    link: "/services/media-entertainment",
  },
  {
    id: "makeover",
    title: "Makeover & Artists",
    description: "Makeup artists, hair stylists, costume & styling professionals for film, TV, events and brands.",
    image: cardMakeover2,
    icon: Sparkles,
    link: "/services/makeover",
    featured: true,
  },
  {
    id: "business",
    title: "Brands & Businesses",
    description: "Brands, agencies and companies looking for creative talent.",
    image: cardBusiness,
    icon: Briefcase,
    link: "/become-client",
  },
  {
    id: "learning",
    title: "Learning & Development",
    description: "Training, skill building, mock interviews and career growth.",
    image: cardFashion,
    icon: GraduationCap,
    link: "/join",
  },
];

const howItWorksSteps = [
  {
    step: "1. Create Your Profile",
    desc: "Join and showcase your talent, skills, makeover expertise or business.",
    icon: UserPlus,
    gradClass: "step-grad-1",
  },
  {
    step: "2. Discover Opportunities",
    desc: "Explore casting calls, shoot projects, event requirements and professional openings.",
    icon: Search,
    gradClass: "step-grad-2",
  },
  {
    step: "3. AI Smart Matching",
    desc: "Get personalized opportunity recommendations with AI, based on your skills and profile.",
    icon: Cpu,
    gradClass: "step-grad-3",
  },
  {
    step: "4. Connect & Collaborate",
    desc: "Connect with clients, production teams, brands and makeover artists.",
    icon: Users,
    gradClass: "step-grad-4",
  },
  {
    step: "5. Grow Your Career",
    desc: "Turn your talent and expertise into bigger projects, long-term collaborations and business growth.",
    icon: Trophy,
    gradClass: "step-grad-5",
  },
];

export default function OpportunityCards() {
  return (
    <section className="one-platform-wrapper">
      {/* 1. ONE PLATFORM. ENDLESS OPPORTUNITIES */}
      <div className="one-platform-header">
        <span className="one-platform-badge">— DISCOVER • CONNECT • COLLABORATE —</span>
        <h2 className="one-platform-title">
          One Platform. <span className="text-pink">Endless Opportunities.</span>
        </h2>
        <p className="one-platform-subtitle">
          Connect with the right people, discover exciting opportunities and turn your talent into success.
        </p>
      </div>

      <div className="one-platform-grid">
        {platformCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              to={card.link}
              className={`platform-grid-card ${card.featured ? "featured-makeover-card" : ""}`}
            >
              <img
                src={card.image}
                alt={card.title}
                className="platform-card-bg-img"
                loading="lazy"
              />
              <div className="platform-card-dark-overlay" />
              <div className="platform-card-body">
                <div className="platform-card-icon-pill">
                  <Icon size={19} strokeWidth={2.2} />
                </div>
                <h3 className="platform-card-heading">{card.title}</h3>
                <p className="platform-card-text">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. HOW BOOK MY STARS WORKS? */}
      <div className="how-it-works-box">
        <h2 className="how-it-works-title">
          How <span className="how-brand-text">Book My Stars</span> Works?
        </h2>
        <p className="how-it-works-subtitle">
          A simple, intelligent and effective way to connect talent, makeover artists and opportunities.
        </p>

        <div className="how-it-works-timeline">
          {howItWorksSteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.step}>
                <div className="how-it-works-step">
                  <div className={`how-step-icon-bubble ${item.gradClass}`}>
                    <Icon size={26} strokeWidth={2.2} />
                  </div>
                  <h4 className="how-step-headline">{item.step}</h4>
                  <p className="how-step-caption">{item.desc}</p>
                </div>

                {index < howItWorksSteps.length - 1 && (
                  <div className="how-step-connector-arrow" aria-hidden="true">
                    <ArrowRight size={22} strokeWidth={2.4} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
