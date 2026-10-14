import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Eye, Search, Users, Target, ChevronDown } from "lucide-react";

export default function PerformanceChart() {
  const [activeMetric, setActiveMetric] = useState("views");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const dates = [
    "1 May",
    "May 4",
    "8 May",
    "May 11",
    "15 May",
    "May 18",
    "22 May",
    "May 26",
    "29 May"
  ];

  const xCoords = [40, 95.6, 151.25, 206.9, 262.5, 318.1, 373.75, 429.4, 485];

  const metricConfigs = {
    views: {
      label: "Profile Views",
      value: "18,560",
      trend: "18.6%",
      icon: Eye,
      iconBg: "#F3F0FE",
      iconColor: "#7c3aed",
      labels: ["20K", "15K", "10K", "5K", "0"],
      maxVal: 20000,
      color: "#7c3aed",
      data: [5000, 10000, 8500, 10500, 13000, 13000, 16000, 18560, 14000]
    },
    searches: {
      label: "Search Appearances",
      value: "6,420",
      trend: "14.3%",
      icon: Search,
      iconBg: "#FFF0F6",
      iconColor: "#d946ef",
      labels: ["8K", "6K", "4K", "2K", "0"],
      maxVal: 8000,
      color: "#d946ef",
      data: [2000, 4500, 3200, 5000, 4800, 5800, 6100, 6420, 5500]
    },
    contacts: {
      label: "Contacts",
      value: "320",
      trend: "9.8%",
      icon: Users,
      iconBg: "#FFF8F0",
      iconColor: "#f59e0b",
      labels: ["400", "300", "200", "100", "0"],
      maxVal: 400,
      color: "#f59e0b",
      data: [100, 180, 150, 220, 260, 290, 310, 320, 280]
    },
    followers: {
      label: "Followers",
      value: "2,430",
      trend: "11.2%",
      icon: Target,
      iconBg: "#FFF0F2",
      iconColor: "#e11d48",
      labels: ["3K", "2.25K", "1.5K", "750", "0"],
      maxVal: 3000,
      color: "#e11d48",
      data: [800, 1200, 1100, 1600, 1900, 2100, 2300, 2430, 2200]
    }
  };

  const activeConfig = metricConfigs[activeMetric];

  // Convert raw values to data points with x and y coordinates
  const dataPoints = activeConfig.data.map((val, idx) => {
    const x = xCoords[idx];
    const y = 170 - (val / activeConfig.maxVal) * 160;
    return {
      label: dates[idx],
      value: val,
      x,
      y
    };
  });

  const chartWidth = 500;
  const chartHeight = 200;

  // Smoothing helper
  const getSymmetricControlPoints = (p0, p1, p2, p3, t = 0.15) => {
    const cp1x = p1[0] + (p2[0] - p0[0]) * t;
    const cp1y = p1[1] + (p2[1] - p0[1]) * t;
    const cp2x = p2[0] - (p3[0] - p1[0]) * t;
    const cp2y = p2[1] - (p3[1] - p1[1]) * t;
    return [cp1x, cp1y, cp2x, cp2y];
  };

  const makePath = (pts) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p0 = pts[i - 1] || p1;
      const p3 = pts[i + 2] || p2;
      const [cp1x, cp1y, cp2x, cp2y] = getSymmetricControlPoints(p0, p1, p2, p3);
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  };

  const linePoints = dataPoints.map(d => [d.x, d.y]);
  const linePath = makePath(linePoints);
  const areaPath = `${linePath} L 485 180 L 40 180 Z`;

  const activeIndex = hoveredIndex !== null ? hoveredIndex : 7; // May 26 is index 7 (the peak)
  const activePoint = dataPoints[activeIndex];

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * chartWidth;
    
    let closestIndex = 0;
    let minDistance = Math.abs(svgX - xCoords[0]);
    
    for (let i = 1; i < xCoords.length; i++) {
      const distance = Math.abs(svgX - xCoords[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    setHoveredIndex(closestIndex);
  };

  return (
    <div className="card-widget borderless-card flex flex-col justify-start">
      
      {/* Top Header Row */}
      <div className="widget-header mb-3.5">
        <h3>Performance Overview</h3>
        <div className="relative" style={{ width: "120px" }}>
          <select className="custom-select-db">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
          </select>
          <div 
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-black"
            style={{ right: "12px" }}
          >
            <ChevronDown size={13} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="perf-chart-grid grid grid-cols-12 gap-4 items-start">
        
        {/* Left: Chart Area */}
        <div className="perf-chart-left col-span-12 md:col-span-7 w-full flex flex-col">
          
          {/* Chart SVG wrapper for absolute tooltip positioning */}
          <div className="relative w-full h-[220px]">
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="none"
              style={{ overflow: 'visible' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {/* Under-curve shading gradient */}
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={activeConfig.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={activeConfig.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Labels (inside SVG for perfect alignment) */}
              {activeConfig.labels.map((lbl, idx) => {
                const yVal = 10 + idx * 40;
                return (
                  <text
                    key={lbl}
                    x="30"
                    y={yVal + 4}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="end"
                    className="select-none font-sans"
                  >
                    {lbl}
                  </text>
                );
              })}

              {/* Base line below grid */}
              <line x1="40" y1="170" x2="485" y2="170" stroke="#e2e8f0" strokeWidth="1" />

              {/* Gradient Area Fill */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Main Smooth Line Plot */}
              <path
                d={linePath}
                fill="none"
                stroke={activeConfig.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertical Marker Line on hover */}
              {hoveredIndex !== null && (
                <line
                  x1={activePoint.x}
                  y1="10"
                  x2={activePoint.x}
                  y2="170"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}

              {/* Active dots layer */}
              {dataPoints.map((d, index) => {
                const isActive = activeIndex === index;
                return (
                  <g key={index}>
                    {/* Outer Pulsing Aura */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={isActive ? 10 : 0}
                      fill={activeConfig.color}
                      fillOpacity="0.15"
                      className="transition-all duration-200"
                    />
                    {/* Core Solid Dot */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={isActive ? 5.5 : 4}
                      fill={activeConfig.color}
                      className="transition-all duration-200 cursor-pointer"
                    />
                    {/* Large invisible hover target */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                    />
                  </g>
                );
              })}

              {/* X-Axis Date Labels positioned inside SVG for perfect gaps and alignment */}
              <text x="40" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" className="select-none font-sans">1 May</text>
              <text x="151.25" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" className="select-none font-sans">8 May</text>
              <text x="262.5" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" className="select-none font-sans">15 May</text>
              <text x="373.75" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" className="select-none font-sans">22 May</text>
              <text x="485" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" className="select-none font-sans">29 May</text>
            </svg>

            {/* Interactive Tooltip Card */}
            <div
              className="absolute text-white font-extrabold text-[12px] px-2.5 py-1 rounded-lg shadow-md z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2.5 font-sans"
              style={{
                left: `${(activePoint.x / chartWidth) * 100}%`,
                top: `${(activePoint.y / chartHeight) * 100}%`,
                backgroundColor: activeConfig.color
              }}
            >
              <span>{activePoint.value.toLocaleString()}</span>
              {/* Down Arrow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-t-[4px] border-x-[4px] border-x-transparent"
                style={{ borderTopColor: activeConfig.color }}
              />
            </div>
          </div>

        </div>

        {/* Right: Metrics Selector List */}
        <div className="perf-metrics-list col-span-12 md:col-span-5 w-full md:max-w-[260px] grid grid-cols-2 md:flex md:flex-col gap-2 font-sans pt-1 md:ml-auto">
          {Object.entries(metricConfigs).map(([key, config]) => {
            const isActive = activeMetric === key;
            const IconComponent = config.icon;
            return (
              <PagesButton
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`w-full flex items-center perf-metric-button ${
                  isActive ? `active-${key}` : `hover-${key}`
                }`}
              >
                <div 
                  className="flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                  style={{ 
                    width: "36px", 
                    height: "36px", 
                    backgroundColor: isActive ? "#ffffff" : config.iconBg,
                    borderRadius: "10px"
                  }}
                >
                  <IconComponent size={15} style={{ color: config.iconColor }} />
                </div>
                <div className="perf-metric-info text-left flex-1">
                  <span className="perf-metric-label">{config.label}</span>
                  <div className="flex items-baseline justify-between w-full">
                    <span className="perf-metric-value">{config.value}</span>
                    <span className="perf-metric-trend flex items-center gap-0.5 pr-1">
                      <span>↑</span>
                      <span>{config.trend}</span>
                    </span>
                  </div>
                </div>
              </PagesButton>
            );
          })}
        </div>

      </div>
    </div>
  );
}
