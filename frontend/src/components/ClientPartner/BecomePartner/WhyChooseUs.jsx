import React, { useState } from "react";
import { UserCheck, Tv, Sparkles, Megaphone, Shield, Building2 } from "lucide-react";
import Card from "../../common/Card";
import Button from "../../common/Button";

export default function WhyChooseUs() {
  const [activeCategory, setActiveCategory] = useState("All Categories");

  const benefits = [
    {
      icon: <UserCheck size={22} />,
      title: "Verified Talents & Professionals",
      description: "Hire from a curated network of skilled artists and experts.",
    },
    {
      icon: <Tv size={22} />,
      title: "Access to Engaged Audiences",
      description: "Promote your services and reach the right audience.",
    },
    {
      icon: <Sparkles size={22} />,
      title: "Brand Collaborations",
      description: "Partner with brands for campaigns, events and long-term projects.",
    },
    {
      icon: <Megaphone size={22} />,
      title: "Digital Marketing Support",
      description: "Get featured, run ads and grow your online presence.",
    },
    {
      icon: <Shield size={22} />,
      title: "End-to-End Support",
      description: "From discovery to delivery, our team is here to help you succeed.",
    },
  ];

  const categories = [
    "All Categories",
    "Fashion",
    "Makeover",
    "Dance",
    "Photography",
    "Event",
    "Production",
    "Digital Marketing",
    "PR",
    "Influencer Marketing",
    "Media & Entertainment",
    "Talent Management",
    "Branding",
    "Film Promotions",
    "Modeling",
    "Astrology",
    "Art & Culture",
    "Business",
    "Technology",
    "Lifestyle & Wellness",
  ];

  return (
    <section className="agency-split-wrapper agency-section-padding">
      <div className="split-container">
        {/* Left Column: Why Choose Us */}
        <div className="choose-us-col">
          <h2 className="choose-title">Why Agencies Choose BookMyStars?</h2>
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
              icon={<Building2 size={20} />}
              iconPosition="left"
            >
              List Your Agency
            </Button>
            <span className="btn-subtext">It's free and takes less than 5 minutes!</span>
          </div>
        </div>

        {/* Right Column: Top Categories */}
        <div className="categories-col">
          <h2 className="categories-title">Top Categories</h2>
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
