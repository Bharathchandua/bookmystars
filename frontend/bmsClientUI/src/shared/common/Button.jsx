import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary-pink", // "primary-pink" | "primary-purple" | "secondary" | "outline" | "danger" | "ghost" + legacy variants
  size = "md", // "xs" | "sm" | "md" | "lg"
  icon,
  iconPosition = "left",
  to,
  href,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const isLink = !!to && !disabled;
  const isExternal = !!href && !disabled;
  const isDisabled = disabled || loading;

  // Modern Portal Variants
  let variantClass = "";
  switch (variant) {
    case "primary-pink":
      variantClass =
        "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-md shadow-pink-500/20 border-none";
      break;
    case "primary-purple":
      variantClass =
        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-500/20 border-none";
      break;
    case "secondary":
      variantClass =
        "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs";
      break;
    case "outline":
      variantClass =
        "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs hover:border-slate-300";
      break;
    case "danger":
      variantClass =
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm border-none shadow-rose-500/20";
      break;
    case "ghost":
      variantClass =
        "bg-transparent hover:bg-slate-100 text-slate-600 border-none shadow-none";
      break;

    // Backward-Compatibility with Landing Page Legacy Variants
    case "primary-hero":
      variantClass = "btn-primary-hero";
      break;
    case "secondary-hero":
      variantClass = "btn-secondary-hero";
      break;
    case "create-profile":
      variantClass = "btn-create-profile";
      break;
    case "post-casting":
      variantClass = "outline btn-post-casting";
      break;
    case "signin":
      variantClass = "signin";
      break;
    case "join":
      variantClass = "join";
      break;
    case "list-agency":
      variantClass = "btn-list-agency";
      break;
    case "join-agency":
      variantClass = "btn-join-agency";
      break;
    case "explore-opps":
      variantClass = "btn-explore-opps";
      break;
    default:
      variantClass = variant || "";
  }

  // Size variations
  let sizeClass = "";
  if (!variant.includes("-hero") && !["signin", "join"].includes(variant)) {
    switch (size) {
      case "xs":
        sizeClass = "px-2 py-1 text-[11px] rounded-lg font-bold";
        break;
      case "sm":
        sizeClass = "px-3 py-1.5 text-xs rounded-xl font-bold";
        break;
      case "lg":
        sizeClass = "px-5 py-2.5 text-sm rounded-2xl font-black";
        break;
      case "md":
      default:
        sizeClass = "px-4 py-2 text-xs rounded-xl font-bold";
    }
  }

  const baseClasses =
    "inline-flex items-center justify-center gap-2 transition-all duration-200 select-none cursor-pointer focus:outline-none";
  const stateClasses = isDisabled
    ? "opacity-60 cursor-not-allowed pointer-events-none"
    : "hover:scale-[1.02] active:scale-[0.98]";

  const combinedClassName = `${baseClasses} ${variantClass} ${sizeClass} ${stateClasses} ${className}`.trim();

  const renderContent = () => (
    <>
      {loading ? (
        <Loader2 size={size === "xs" || size === "sm" ? 14 : 16} className="animate-spin" />
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </>
  );

  if (isLink) {
    return (
      <Link to={to} className={combinedClassName} onClick={onClick} {...props}>
        {renderContent()}
      </Link>
    );
  }

  if (isExternal) {
    return (
      <a href={href} className={combinedClassName} onClick={onClick} {...props}>
        {renderContent()}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
}
