import React from "react";
import { Film, Music, Megaphone, Calendar, Users, Star } from "lucide-react";
import Card from "../../common/Card.jsx";

export default function ClientOpportunities() {
  const opportunities = [
    {
      icon: <Film size={20} />,
      title: "Film & Ad Shoots",
      description: "Book talent for film productions, TV ads and commercial projects.",
    },
    {
      icon: <Music size={20} />,
      title: "Live Performances",
      description: "Hire musicians, dancers and performers for live shows and events.",
    },
    {
      icon: <Megaphone size={20} />,
      title: "Brand Campaigns",
      description: "Partner with influencers and creators for powerful brand campaigns.",
    },
    {
      icon: <Calendar size={20} />,
      title: "Corporate Events",
      description: "Plan corporate events with premium anchors, artists and crews.",
    },
    {
      icon: <Users size={20} />,
      title: "Agency Partnerships",
      description: "Collaborate with creative agencies for long-term project delivery.",
    },
    {
      icon: <Star size={20} />,
      title: "Celebrity Bookings",
      description: "Book celebrity appearances, endorsements and exclusive collaborations.",
    },
  ];

  return (
    <section className="opps-banner-wrapper">
      <div className="opps-banner-container">
        <div className="opps-banner-card-panel">
          <h2 className="opps-banner-title">Opportunities for Clients</h2>
          <div className="opps-banner-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {opportunities.map((opp, index) => (
              <Card key={index} className="opps-banner-card">
                <div className="opps-banner-icon-wrapper">
                  {opp.icon}
                </div>
                <div className="opps-banner-content">
                  <h3 className="opps-banner-card-title">{opp.title}</h3>
                  <p className="opps-banner-card-desc">{opp.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
