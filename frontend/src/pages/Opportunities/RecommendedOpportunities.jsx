import PagesButton from "../common/PagesButton";
import { Bookmark } from "lucide-react";
import { useState } from "react";

// Data matching client screenshot (3 items)
const RECOMMENDED = [
  {
    id: 1,
    type: "Feature Film",
    typeClass: "badge-feature-film",
    title: "Rang Safar",
    role: "Lead Role",
    location: "Mumbai",
    budget: "Budget: ₹ 3 – 6 Lakh",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=260&fit=crop&q=80",
  },
  {
    id: 2,
    type: "Web Series",
    typeClass: "badge-web-series",
    title: "Corporate Chronicles",
    role: "Supporting Role",
    location: "Delhi",
    budget: "Budget: ₹ 60K – 1 Lakh",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=260&fit=crop&q=80",
  },
  {
    id: 3,
    type: "Commercial",
    typeClass: "badge-commercial",
    title: "Tech Brand TVC",
    role: "Main Lead",
    location: "Mumbai",
    budget: "Budget: ₹ 75K – 1.2 Lakh",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=260&fit=crop&q=80",
  },
];

export default function RecommendedOpportunities() {
  const [saved, setSaved] = useState({});

  return (
    <div className="opp-widget">
      <div className="opp-widget-head">
        <span className="opp-widget-head-title">Recommended for You</span>
        <PagesButton className="opp-widget-view-all">View All</PagesButton>
      </div>

      <div className="opp-rec-list">
        {RECOMMENDED.map((item) => (
          <div
            key={item.id}
            className={`opp-rec-item opp-rec-item--${item.type.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <img className="opp-rec-img" src={item.image} alt={item.title} />
            <div className="opp-rec-info">
              <span className={`opp-rec-type ${item.typeClass}`}>{item.type}</span>
              <p className="opp-rec-title">{item.title}</p>
              <p className="opp-rec-sub">
                {item.role} &bull; {item.location}
              </p>
              <p className="opp-rec-sub">{item.budget}</p>
            </div>
            <PagesButton
              className="opp-rec-bookmark"
              onClick={() => setSaved((s) => ({ ...s, [item.id]: !s[item.id] }))}
              aria-label="Save"
            >
              <Bookmark size={14} fill={saved[item.id] ? "currentColor" : "none"} color={saved[item.id] ? "#ee008f" : "#94a3b8"} />
            </PagesButton>
          </div>
        ))}
      </div>
    </div>
  );
}
