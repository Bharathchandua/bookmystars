import React from "react";
import { ArrowRight } from "lucide-react";
import Card from "../../common/Card.jsx";
import spotlight from "../../../assets/card-spotlight-client.jpg";
import branding from "../../../assets/card-branding-client.png";
import agencies from "../../../assets/card-agencies-client.png";

const provides = [
  {
    image: spotlight,
    category: "POST PRODUCTION",
    description:
      "Professional editing, color grading, sound design, VFX and final polish to bring your story to life.",
    link: "/services/post-production",
    linkText: "Explore Post Production",
  },
  {
    image: branding,
    category: "PROMOTION",
    description:
      "Strategic campaign promotion, engaging content teasers, trailers, and social media campaigns that create buzz.",
    link: "/services/promotion",
    linkText: "Explore Promotion",
  },
  {
    image: agencies,
    category: "DIGITAL MARKETING",
    description:
      "Targeted digital marketing campaigns, influencer outreach, and high-converting ads that grow your audience.",
    link: "/services/digital-marketing",
    linkText: "Explore Digital Marketing",
  },
];

export default function ClientProvidesSection() {
  return (
    <section className="bc-provides">
      <div className="bc-provides-inner">
        {/* Section Header */}
        <div className="bc-provides-header">
          <div className="bc-provides-line"></div>
          <h2 className="bc-provides-title">BookMyStars Provides</h2>
          <div className="bc-provides-line"></div>
        </div>

        {/* 3 Big Cards */}
        <div className="bc-provides-grid">
          {provides.map((item, i) => (
            <Card key={i} className="bc-provide-card">
              <div className="bc-provide-img-wrap">
                <img src={item.image} alt={item.category} />
              </div>
              <div className="bc-provide-body">
                <span className="bc-provide-category">{item.category}</span>
                <p className="bc-provide-desc">{item.description}</p>
                <a href={item.link} className="bc-provide-link">
                  {item.linkText} <ArrowRight size={14} />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
