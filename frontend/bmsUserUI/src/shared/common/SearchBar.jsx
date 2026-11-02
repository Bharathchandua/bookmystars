import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  theme = "pink", // "pink" | "purple" | "slate"
  className = "",
  size = "md",
  disabled = false,
  autoFocus = false
}) {
  const themeRing = {
    pink: "focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500",
    purple: "focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
    slate: "focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
  };

  const sizeClasses = {
    sm: "py-2 text-xs pl-9 pr-8 rounded-xl",
    md: "py-3 text-xs sm:text-sm pl-11 pr-10 rounded-2xl",
    lg: "py-3.5 text-sm sm:text-base pl-12 pr-11 rounded-2xl"
  };

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 20
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={iconSizes[size] || 18}
        className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={`w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-xs transition ${sizeClasses[size] || sizeClasses.md} ${themeRing[theme] || themeRing.pink} ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 transition"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
