import { useState, useEffect } from "react";
import PagesButton from "../common/PagesButton";
import { Bookmark } from "lucide-react";
import { getPublicCastingCalls } from "../../features/bms/api/opportunities/opportunitiesApi";
import { getFullImageUrl } from "../../features/bms/api/media/portfolioApi";

export default function RecommendedOpportunities({ opportunities: propOpps = null, onOpenDetail }) {
  const [items, setItems] = useState(propOpps || []);
  const [saved, setSaved] = useState({});

  useEffect(() => {
    if (propOpps !== null) {
      setItems(propOpps);
    } else {
      getPublicCastingCalls()
        .then((res) => {
          setItems(Array.isArray(res) ? res : []);
        })
        .catch(() => setItems([]));
    }
  }, [propOpps]);

  const recommendedList = items.slice(0, 3).map((item) => {
    const rawType = item.projectType || item.type || "Feature Film";
    let typeClass = "badge-feature-film";
    const lowerType = rawType.toLowerCase();
    if (lowerType.includes("series") || lowerType.includes("web")) {
      typeClass = "badge-web-series";
    } else if (lowerType.includes("commercial") || lowerType.includes("brand")) {
      typeClass = "badge-commercial";
    } else if (lowerType.includes("short")) {
      typeClass = "badge-short-film";
    }

    const imgUrl = item.posterUrl
      ? (item.posterUrl.startsWith("http") ? item.posterUrl : getFullImageUrl(item.posterUrl))
      : (item.banner ? (item.banner.startsWith("http") ? item.banner : getFullImageUrl(item.banner)) : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=260&fit=crop&q=80");

    const budgetStr = typeof item.budget === "number"
      ? `Budget: ₹ ${item.budget.toLocaleString("en-IN")}`
      : (item.budget ? `Budget: ${item.budget}` : "Budget: Negotiable");

    return {
      id: item.id,
      type: rawType,
      typeClass,
      title: item.title,
      role: item.customCraft || item.roleType || "Lead Role",
      location: item.location || "Mumbai",
      budget: budgetStr,
      image: imgUrl,
      rawItem: item,
    };
  });

  return (
    <div className="opp-widget">
      <div className="opp-widget-head">
        <span className="opp-widget-head-title">Recommended for You</span>
        <PagesButton className="opp-widget-view-all">View All</PagesButton>
      </div>

      <div className="opp-rec-list">
        {recommendedList.length > 0 ? (
          recommendedList.map((item) => (
            <div
              key={item.id}
              className={`opp-rec-item opp-rec-item--${item.type.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ cursor: onOpenDetail ? "pointer" : "default" }}
              onClick={() => onOpenDetail && onOpenDetail(item.rawItem)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSaved((s) => ({ ...s, [item.id]: !s[item.id] }));
                }}
                aria-label="Save"
              >
                <Bookmark
                  size={14}
                  fill={saved[item.id] ? "currentColor" : "none"}
                  color={saved[item.id] ? "#ee008f" : "#94a3b8"}
                />
              </PagesButton>
            </div>
          ))
        ) : (
          <p style={{ fontSize: "12.5px", color: "#94a3b8", padding: "12px 4px", textAlign: "center" }}>
            No recommendations currently available.
          </p>
        )}
      </div>
    </div>
  );
}
