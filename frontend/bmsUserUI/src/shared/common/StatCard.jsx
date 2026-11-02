import React, { useId } from "react";
import { TrendingUp } from "lucide-react";

export default function StatCard({
  icon,
  title,
  value,
  trend,
  trendIcon,
  color = "pink", // "pink" | "purple" | "amber" | "blue" | "emerald" | "slate"
  showSparkline = true,
  layout = "vertical", // "vertical" | "horizontal"
  className = ""
}) {
  const reactId = useId().replace(/:/g, "_");
  const gradientId = `statGrad_${color}_${reactId}`;

  const colorConfig = {
    pink: {
      bg: "bg-pink-50",
      text: "text-pink-600",
      hex: "#ec4899",
      trendText: "text-pink-600"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      hex: "#8b5cf6",
      trendText: "text-purple-600"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      hex: "#f59e0b",
      trendText: "text-amber-600"
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      hex: "#3b82f6",
      trendText: "text-blue-600"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      hex: "#10b981",
      trendText: "text-emerald-600"
    },
    slate: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      hex: "#64748b",
      trendText: "text-slate-600"
    }
  };

  const currentTheme = colorConfig[color] || colorConfig.pink;

  return (
    <div className={`p-5 rounded-3xl bg-white border border-slate-100 shadow-xs flex ${layout === "horizontal" ? "items-center justify-between" : "flex-col justify-between"} ${className}`}>
      {layout === "horizontal" ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {icon && (
                <span className={`p-2 rounded-xl ${currentTheme.bg} ${currentTheme.text}`}>
                  {icon}
                </span>
              )}
              <span className="text-2xl font-black text-slate-900 leading-none">
                {value}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 m-0">{title}</p>
              {trend && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${currentTheme.trendText} mt-0.5`}>
                  {trendIcon || <TrendingUp size={12} />} {trend}
                </span>
              )}
            </div>
          </div>
          {showSparkline && (
            <svg className="w-24 h-9 shrink-0" viewBox="0 0 100 35" fill="none">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentTheme.hex} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={currentTheme.hex} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 28 Q 25 12, 45 20 T 75 10 T 100 14 L 100 35 L 0 35 Z"
                fill={`url(#${gradientId})`}
              />
              <path
                d="M0 28 Q 25 12, 45 20 T 75 10 T 100 14"
                stroke={currentTheme.hex}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            {icon && (
              <span className={`p-2.5 rounded-2xl ${currentTheme.bg} ${currentTheme.text}`}>
                {icon}
              </span>
            )}
            <span className="text-2xl font-black text-slate-900 leading-none">
              {value}
            </span>
          </div>
          <div className="space-y-1 mt-4">
            <p className="text-xs font-bold text-slate-600 m-0">{title}</p>
            {trend && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${currentTheme.trendText}`}>
                {trendIcon || <TrendingUp size={12} />} {trend}
              </span>
            )}
          </div>
          {showSparkline && (
            <div className="pt-2 flex justify-end">
              <svg className="w-24 h-9" viewBox="0 0 100 35" fill="none">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentTheme.hex} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={currentTheme.hex} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 28 Q 25 12, 45 20 T 75 10 T 100 14 L 100 35 L 0 35 Z"
                  fill={`url(#${gradientId})`}
                />
                <path
                  d="M0 28 Q 25 12, 45 20 T 75 10 T 100 14"
                  stroke={currentTheme.hex}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
}
