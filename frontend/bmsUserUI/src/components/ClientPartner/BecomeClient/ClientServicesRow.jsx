import React from "react";
import { Users, Building2, Handshake, TrendingUp } from "lucide-react";
import Card from "../../common/Card.jsx";

const services = [
  {
    icon: <Users size={26} />,
    title: "Find the Right Talent",
    description:
      "Connect with verified artists, creators, designers, technicians and more.",
  },
  {
    icon: <Building2 size={26} />,
    title: "Work with Top Agencies",
    description:
      "Collaborate with trusted agencies for your projects and campaigns.",
  },
  {
    icon: <Handshake size={26} />,
    title: "Partner with Brands",
    description:
      "Get your projects noticed by leading brands and businesses.",
  },
  {
    icon: <TrendingUp size={26} />,
    title: "Grow Your Business",
    description:
      "Build your brand, reach engaged audiences and unlock new opportunities.",
  },
];

export default function ClientServicesRow() {
  return (
    <section className="bc-services-row">
      <div className="bc-services-inner">
        {services.map((s, i) => (
          <Card key={i} className="bc-service-card">
            <div className="bc-service-icon">{s.icon}</div>
            <div className="bc-service-text">
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
