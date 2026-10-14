import React, { useState } from "react";
import { UsersRound, ShieldCheck, LayoutGrid } from "lucide-react";
import CountUpModule from "react-countup";

const CountUp = typeof CountUpModule === "function" ? CountUpModule : (CountUpModule.default || CountUpModule);

const statsData = [
  {
    icon: <UsersRound size={30} />,
    endVal: 50,
    suffix: "K+",
    label: "Verified Talents",
  },
  {
    icon: <ShieldCheck size={30} />,
    endVal: 5,
    suffix: "K+",
    label: "Agencies & Brands",
  },
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    endVal: 10,
    suffix: "K+",
    label: "Projects Completed",
  },
  {
    icon: <LayoutGrid size={30} />,
    endVal: 100,
    suffix: "+",
    label: "Categories Covered",
  },
];

export default function ClientStatsBanner() {
  const [hoverKeys, setHoverKeys] = useState([0, 0, 0, 0]);

  const handleMouseEnter = (index) => {
    setHoverKeys((prev) => {
      const next = [...prev];
      next[index] = next[index] + 1;
      return next;
    });
  };

  return (
    <section className="bc-stats-banner">
      <div className="bc-stats-banner-inner">
        {statsData.map((s, i) => (
          <React.Fragment key={i}>
            <div 
              className="bc-stats-banner-item"
              onMouseEnter={() => handleMouseEnter(i)}
            >
              <div className="bc-stats-banner-icon">{s.icon}</div>
              <div className="bc-stats-banner-text">
                <strong>
                  <CountUp
                    key={hoverKeys[i]}
                    start={0}
                    end={s.endVal}
                    duration={2.5}
                    suffix={s.suffix}
                  />
                </strong>
                <small>{s.label}</small>
              </div>
            </div>
            {i < statsData.length - 1 && (
              <div className="bc-stats-banner-divider"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
