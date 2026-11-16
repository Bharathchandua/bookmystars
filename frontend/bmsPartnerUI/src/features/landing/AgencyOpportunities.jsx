import React from "react";
import { Award, Calendar, Users, Mail, Megaphone } from "lucide-react";
import Card from "../../common/Card.jsx";

export default function AgencyOpportunities() {
  const opportunities = [
    {
      icon: <Award size={20} />,
      title: "Campaign Projects",
      description: "Work on brand campaigns and promotional activities.",
    },
    {
      icon: <Calendar size={20} />,
      title: "Event Partnerships",
      description: "Partner for events, shows and live experiences.",
    },
    {
      icon: <Users size={20} />,
      title: "Talent Management",
      description: "Manage and represent top talents.",
    },
    {
      icon: <Mail size={20} />,
      title: "Sponsorships",
      description: "Connect with sponsors and monetize opportunities.",
    },
    {
      icon: <Megaphone size={20} />,
      title: "Promotions",
      description: "Promote your agency and get featured.",
    },
  ];

  return (
    <section className="opps-banner-wrapper">
      <div className="opps-banner-container">
        <div className="opps-banner-card-panel">
          <h2 className="opps-banner-title">Opportunities for Agencies</h2>
          <div className="opps-banner-grid">
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
