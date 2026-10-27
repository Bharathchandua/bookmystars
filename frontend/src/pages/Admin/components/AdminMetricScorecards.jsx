import React from "react";
import { 
  ShoppingBag, 
  Users, 
  Film, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  TrendingUp,
  CheckCircle2
} from "lucide-react";

export default function AdminMetricScorecards({ 
  metrics = {},
  activeTab = "castings",
  onTabChange
}) {
  const cards = [
    {
      id: "escrow",
      title: "Vault Escrow",
      value: metrics.escrowLockedAmount || "₹14,50,000",
      trend: "+12.5% vs last week",
      icon: ShoppingBag,
      iconColor: "#ee008f",
      iconBg: "#fff1f8",
      strokeColor: "#ee008f",
      sparkline: "M0,24 C30,22 50,26 70,18 C90,12 110,22 130,14 C150,8 170,16 190,6",
      hasSparkline: true
    },
    {
      id: "talents",
      title: "Active Talents",
      value: "3,420",
      trend: "+8.1% vs last week",
      icon: Users,
      iconColor: "#0284c7",
      iconBg: "#f0f9ff",
      strokeColor: "#0284c7",
      sparkline: "M0,24 C30,20 60,25 80,14 C100,8 120,20 140,16 C160,10 175,16 190,6",
      hasSparkline: true
    },
    {
      id: "castings",
      title: "Live Castings",
      value: `${metrics.pendingCastings ? metrics.pendingCastings + 134 : 148}`,
      trend: "+22.4% vs last week",
      icon: Film,
      iconColor: "#f43f5e",
      iconBg: "#fff1f2",
      strokeColor: "#f43f5e",
      sparkline: "M0,26 C25,24 55,20 75,22 C95,24 115,10 135,14 C155,16 170,8 190,4",
      hasSparkline: true
    },
    {
      id: "security",
      title: "Security Matrix",
      value: "11",
      subLabel: "Modules Guarded",
      hasVerifiedCheck: true,
      icon: ShieldCheck,
      iconColor: "#7c3aed",
      iconBg: "#f5f3ff",
      hasSparkline: false
    }
  ];

  return (
    <div 
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            onClick={() => onTabChange && onTabChange(card.id)}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              boxSizing: "border-box"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(15, 23, 42, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.04)";
            }}
          >
            {/* Top Row: Icon + Title + Info + Chevron */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div 
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    backgroundColor: card.iconBg,
                    color: card.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} />
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                  <span>{card.title}</span>
                  {card.hasVerifiedCheck && (
                    <CheckCircle2 size={13} style={{ color: "#10b981" }} />
                  )}
                  <HelpCircle size={13} style={{ color: "#94a3b8" }} />
                </div>
              </div>

              <ChevronRight size={15} style={{ color: "#cbd5e1" }} />
            </div>

            {/* Middle Row: Main Large Value */}
            <div style={{ marginTop: "16px" }}>
              <span style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
                {card.value}
              </span>
            </div>

            {/* Bottom Row: Trend + Sparkline graph or Sublabel */}
            <div 
              style={{ 
                marginTop: "12px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                minHeight: "32px"
              }}
            >
              {card.hasSparkline ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "#059669" }}>
                    <TrendingUp size={14} />
                    <span>{card.trend}</span>
                  </div>

                  {/* SVG Wavy Sparkline */}
                  <div style={{ width: "95px", height: "30px", overflow: "hidden" }}>
                    <svg viewBox="0 0 190 32" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
                      <path
                        d={card.sparkline}
                        fill="none"
                        stroke={card.strokeColor}
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                  {card.subLabel}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
