import React, { useState } from "react";
import { CheckCircle, Clock, Award, Headphones, Lock, Zap } from "lucide-react";
import Card from "../../common/Card";
import Button from "../../common/Button";

export default function ClientWhyChooseUs() {
  const [activeCategory, setActiveCategory] = useState("All");

  const benefits = [
    {
      icon: <CheckCircle size={22} />,
      title: "Verified & Trusted Talent",
      description: "Every talent and agency is verified for quality and professionalism.",
    },
    {
      icon: <Clock size={22} />,
      title: "Fast & Easy Booking",
      description: "Browse, shortlist and book talent in minutes with zero hassle.",
    },
    {
      icon: <Award size={22} />,
      title: "Premium Quality Results",
      description: "Work with India's most rated artists, agencies and professionals.",
    },
    {
      icon: <Headphones size={22} />,
      title: "Dedicated Client Support",
      description: "Our team is available end-to-end to ensure your projects succeed.",
    },
    {
      icon: <Lock size={22} />,
      title: "Secure & Transparent",
      description: "Safe payments, clear contracts and full project transparency.",
    },
  ];

  const categories = [
    "All",
    "Actors",
    "Singers",
    "Dancers",
    "Models",
    "Photographers",
    "Videographers",
    "Influencers",
    "Directors",
    "Makeup Artists",
    "Fashion Stylists",
    "Anchors & Hosts",
    "Creative Agencies",
    "Production Houses",
    "Event Managers",
    "Voice Artists",
    "Astrologers",
    "Fitness Trainers",
    "Digital Marketers",
  ];

  return (
    <section className="agency-split-wrapper agency-section-padding">
      <div className="split-container">
        {/* Left Column: Why Choose Us */}
        <div className="choose-us-col">
          <h2 className="choose-title">Why Clients Choose BookMyStars?</h2>
          <div className="choose-list">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                variant="benefit"
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
          <div className="choose-cta-box">
            <Button
              variant="list-agency"
              icon={<Zap size={20} />}
              iconPosition="left"
            >
              Start Hiring Today
            </Button>
            <span className="btn-subtext">Free to join. No hidden charges.</span>
          </div>
        </div>

        {/* Right Column: Top Categories */}
        <div className="categories-col">
          <h2 className="categories-title">Talent Categories</h2>
          <div className="tags-container">
            {categories.map((category) => (
              <Button
                key={category}
                className={`category-tag ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
