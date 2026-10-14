import React from "react";
import { Film, Mic, Camera, Palette, Video, Globe } from "lucide-react";
import Card from "../../common/Card";

export default function ClientStrip() {
  const cards = [
    {
      icon: <Film size={24} />,
      title: "Film & Production",
      description: "Find directors, producers and full production crews for your next project.",
    },
    {
      icon: <Mic size={24} />,
      title: "Artists & Performers",
      description: "Book singers, dancers, actors and live performers for any event.",
    },
    {
      icon: <Camera size={24} />,
      title: "Photography & Media",
      description: "Hire professional photographers and videographers for campaigns.",
    },
    {
      icon: <Palette size={24} />,
      title: "Creative Agencies",
      description: "Partner with top-rated creative agencies for branding and campaigns.",
    },
    {
      icon: <Video size={24} />,
      title: "Digital Content",
      description: "Collaborate with influencers and content creators for digital reach.",
    },
    {
      icon: <Globe size={24} />,
      title: "Events & Live Shows",
      description: "Plan, manage and execute flawless live events with expert partners.",
    },
  ];

  return (
    <section className="agency-strip-wrapper agency-section-padding">
      <div className="strip-container">
        <div className="strip-card-panel">
          <h2 className="strip-header-title">
            Everything Clients Need to Create Great Work
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
