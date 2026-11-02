import React from "react";
import { SearchX } from "lucide-react";

export default function EmptyState({
  icon,
  title = "No results found",
  description = "Try adjusting your filters or search keywords.",
  action,
  className = ""
}) {
  return (
    <div className={`text-center py-12 px-4 bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
        {icon || <SearchX size={32} strokeWidth={1.5} />}
      </div>
      <h3 className="text-base font-bold text-slate-800 m-0">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-0">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
