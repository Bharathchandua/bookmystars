import React from "react";

export default function Badge({
  children,
  variant = "neutral", // "approved" | "pending" | "rejected" | "urgent" | "purple" | "video" | "info" | "neutral"
  size = "sm", // "xs" | "sm" | "md"
  icon = null,
  dot = false,
  className = "",
  ...props
}) {
  let styleClasses = "";
  let dotColor = "";

  switch (variant) {
    case "approved":
    case "success":
      styleClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
      break;
    case "pending":
    case "warning":
      styleClasses = "bg-amber-50 text-amber-700 border-amber-200";
      dotColor = "bg-amber-500";
      break;
    case "rejected":
    case "danger":
      styleClasses = "bg-rose-50 text-rose-700 border-rose-200";
      dotColor = "bg-rose-500";
      break;
    case "urgent":
    case "pink":
      styleClasses = "bg-pink-50 text-pink-700 border-pink-200";
      dotColor = "bg-pink-500";
      break;
    case "purple":
    case "academy":
      styleClasses = "bg-purple-50 text-purple-700 border-purple-200";
      dotColor = "bg-purple-500";
      break;
    case "video":
      styleClasses = "bg-slate-900 text-pink-300 border-slate-700";
      dotColor = "bg-pink-400";
      break;
    case "info":
      styleClasses = "bg-blue-50 text-blue-700 border-blue-200";
      dotColor = "bg-blue-500";
      break;
    case "neutral":
    default:
      styleClasses = "bg-slate-100 text-slate-700 border-slate-200";
      dotColor = "bg-slate-400";
      break;
  }

  let sizeClasses = "";
  switch (size) {
    case "xs":
      sizeClasses = "px-1.5 py-0.5 text-[9px]";
      break;
    case "md":
      sizeClasses = "px-3 py-1 text-xs font-extrabold";
      break;
    case "sm":
    default:
      sizeClasses = "px-2 py-0.5 text-[10px] font-bold";
      break;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider border select-none
        ${styleClasses}
        ${sizeClasses}
        ${className}
      `.trim()}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
