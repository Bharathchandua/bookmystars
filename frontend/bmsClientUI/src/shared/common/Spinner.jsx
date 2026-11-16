import React from "react";
import { Loader2 } from "lucide-react";

export default function Spinner({
  size = "md",
  color = "pink", // "pink" | "purple" | "white" | "slate"
  text = "",
  center = true,
  className = ""
}) {
  const sizeMap = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 44
  };

  const colorClasses = {
    pink: "text-pink-600",
    purple: "text-purple-600",
    white: "text-white",
    slate: "text-slate-500"
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <Loader2
        size={sizeMap[size] || 24}
        className={`animate-spin ${colorClasses[color] || colorClasses.pink}`}
      />
      {text && (
        <p className="text-xs font-semibold text-slate-500 tracking-wide m-0">
          {text}
        </p>
      )}
    </div>
  );

  if (center) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
