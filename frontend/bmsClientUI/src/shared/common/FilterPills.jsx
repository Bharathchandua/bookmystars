import React from "react";

export default function FilterPills({
  label,
  items = [],
  activeItem,
  onSelect,
  theme = "pink", // "pink" | "purple" | "slate"
  size = "md",
  className = ""
}) {
  const activeStyles = {
    pink: "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs border-transparent",
    purple: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs border-transparent",
    slate: "bg-slate-900 text-white shadow-xs border-transparent"
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px] rounded-lg",
    md: "px-3 py-1.5 text-xs rounded-xl",
    lg: "px-4 py-2 text-sm rounded-xl"
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          {label}
        </span>
      )}
      {items.map((item) => {
        const id = typeof item === "object" ? item.id ?? item.value : item;
        const displayLabel = typeof item === "object" ? item.label ?? item.name : item;
        const count = typeof item === "object" ? item.count : undefined;
        const isActive = activeItem === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`font-bold transition cursor-pointer border flex items-center gap-1.5 ${sizeClasses[size] || sizeClasses.md} ${
              isActive
                ? activeStyles[theme] || activeStyles.pink
                : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
            }`}
          >
            <span>{displayLabel}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
