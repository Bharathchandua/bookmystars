import PagesButton from "../common/PagesButton";
import PagesCard from "../common/PagesCard";
import { useState } from "react";
import { MapPin, CalendarDays, IndianRupee, Bookmark, ChevronDown } from "lucide-react";

// ─── Opportunity Data (matching client's screenshot) ───
export const OPPORTUNITIES = [
  {
    id: 1,
    type: "Feature Film",
    badgeClass: "badge-feature-film",
    title: "Shadows of Truth",
    description: "Looking for a lead actor (Male) in a thrilling suspense drama.",
    location: "Mumbai",
    auditionDate: "20 May 2024",
    budget: "₹ 5 – 8 Lakh",
    postedAgo: "Posted 2 hours ago",
    banner: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=80",
    fullDesc: "An intense suspense drama requiring a lead male actor aged 25–35. The character is a detective navigating a complex web of corruption and personal loss.",
    requirements: [
      "Prepare a 2-minute dramatic monologue",
      "Method acting experience preferred",
      "Available for shoot: June–October 2024",
      "Mumbai-based or willing to relocate",
    ],
  },
  {
    id: 2,
    type: "Web Series",
    badgeClass: "badge-web-series",
    title: "Dil Ki Baat – Season 2",
    description: "Supporting role (Male) in a romantic comedy web series.",
    location: "Delhi",
    auditionDate: "25 May 2024",
    budget: "₹ 80K – 1.5 Lakh",
    postedAgo: "Posted 5 hours ago",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80",
    fullDesc: "Season 2 of the hit romantic comedy web series on OTT. Supporting male role — charming, witty best friend of the lead.",
    requirements: [
      "Comedy timing and improvisational skills",
      "Age group: 22–30 years",
      "Previous web series experience a plus",
      "Fluent in Hindi",
    ],
  },
  {
    id: 3,
    type: "Commercial",
    badgeClass: "badge-commercial",
    title: "Premium Fragrance – TVC",
    description: "Looking for a confident and expressive male actor.",
    location: "Mumbai",
    auditionDate: "18 May 2024",
    budget: "₹ 50K – 1 Lakh",
    postedAgo: "Posted 1 day ago",
    banner: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&auto=format&fit=crop&q=80",
    fullDesc: "Premium fragrance TVC shoot for a global brand entering the Indian market. Looking for a confident, stylish male lead aged 28–38.",
    requirements: [
      "Professional headshots and portfolio required",
      "Tall (5'10\" and above), well-groomed",
      "No conflicting brand contracts",
      "2-day shoot: May 22–23, Mumbai",
    ],
  },
  {
    id: 4,
    type: "Short Film",
    badgeClass: "badge-short-film",
    title: "The Last Stand",
    description: "Lead role in an intense action short film.",
    location: "Bangalore",
    auditionDate: "22 May 2024",
    budget: "₹ 20K – 40K",
    postedAgo: "Posted 2 days ago",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
    fullDesc: "A 20-minute action short film for international film festival submission. Lead role — a retired soldier facing one final confrontation.",
    requirements: [
      "Physical fitness essential — action sequences",
      "Age 30–45 preferred",
      "Short film/theatre background welcome",
      "Shoot: Bangalore, 3 days in late May",
    ],
  },
];

// ─── Single List Card ──────────────────────
function OpportunityListCard({ opp, onOpen }) {
  const [saved, setSaved] = useState(false);

  return (
    <PagesCard className="opp-list-card" onClick={() => onOpen(opp)}>
      {/* Thumbnail */}
      <div className="opp-list-thumb">
        <img src={opp.banner} alt={opp.title} />
      </div>

      {/* Body */}
      <div className="opp-list-body">
        <span className={`opp-type-badge ${opp.badgeClass}`}>{opp.type}</span>
        <h3 className="opp-list-title">{opp.title}</h3>
        <p className="opp-list-desc">{opp.description}</p>

        <div className="opp-list-meta">
          {/* Location */}
          <div className="opp-list-meta-item">
            <MapPin size={14} color="#ee008f" />
            <span className="meta-val">{opp.location}</span>
          </div>

          {/* Audition Date */}
          <div className="opp-list-meta-item">
            <CalendarDays size={14} color="#ee008f" />
            <div>
              <span className="meta-label">Audition Date</span>
              <span className="meta-val">{opp.auditionDate}</span>
            </div>
          </div>

          {/* Budget */}
          <div className="opp-list-meta-item">
            <IndianRupee size={14} color="#ee008f" />
            <div>
              <span className="meta-label">Budget</span>
              <span className="meta-val">{opp.budget}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="opp-list-right">
        <div className="opp-list-right-top" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="opp-posted-time">{opp.postedAgo}</span>
          <PagesButton
            className={`opp-bookmark-btn ${saved ? "saved" : ""}`}
            onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
            aria-label="Bookmark"
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          </PagesButton>
        </div>
        <PagesButton
          className="opp-view-details-btn"
          onClick={(e) => { e.stopPropagation(); onOpen(opp); }}
        >
          View Details
        </PagesButton>
      </div>
    </PagesCard>
  );
}

// ─── Exported Cards List ───────────────────
export default function OpportunityCards({ onOpenDetail }) {
  return (
    <div className="opp-cards-container">
      {OPPORTUNITIES.map((opp) => (
        <OpportunityListCard key={opp.id} opp={opp} onOpen={onOpenDetail} />
      ))}
    </div>
  );
}
