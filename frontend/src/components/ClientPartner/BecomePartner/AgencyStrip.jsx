import React from "react";
import { Users, Target, Star, Megaphone, Handshake, TrendingUp } from "lucide-react";
import Card from "../../common/Card";

export default function AgencyStrip() {
  const cards = [
    {
      icon: <Users size={24} />,
      title: "Find Top Talent",
      description: "Access verified artists, creators and professionals for every project.",
    },
    {
      icon: <Target size={24} />,
      title: "Reach Audiences",
      description: "Tap into a wide and engaged audience across India.",
    },
    {
      icon: <Star size={24} />,
      title: "Partner with Brands",
      description: "Collaborate with brands looking for trusted agency partners.",
    },
    {
      icon: <Megaphone size={24} />,
      title: "Promotions & Campaigns",
      description: "Run promotions, marketing campaigns and boost your agency visibility.",
    },
    {
      icon: <Handshake size={24} />,
      title: "Business Collaborations",
      description: "Discover new opportunities, tender calls, events and joint ventures.",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Grow Your Business",
      description: "Tools, analytics and support to help you scale and succeed.",
    },
  ];

  return (
    <section className="agency-strip-wrapper agency-section-padding">
      <div className="strip-container">
        <div className="strip-card-panel">
          <h2 className="strip-header-title">
            Everything You Need to Grow Your Agency
          </h2>
          <div className="strip-grid">
            {cards.map((card, index) => (
              <Card
                key={index}
                variant="grow"
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
