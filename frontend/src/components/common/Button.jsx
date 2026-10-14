import React from "react";
import { Link } from "react-router-dom";

export default function Button({
  children,
  variant, // e.g., "primary-hero", "secondary-hero", "create-profile", "post-casting", "signin", "join", "list-agency", "join-agency", "explore-opps"
  icon,
  iconPosition = "left",
  to,
  href,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const isLink = !!to;
  const isExternal = !!href;

  // Map variant name to the exact class names used in the website's CSS files
  let variantClass = "";
  switch (variant) {
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

  const combinedClassName = `${variantClass} ${className}`.trim();

  const renderContent = () => (
    <>
      {icon && iconPosition === "left" && <>{icon}{" "}</>}
      {children}
      {icon && iconPosition === "right" && <>{" "}{icon}</>}
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
    <button type={type} className={combinedClassName} onClick={onClick} {...props}>
      {renderContent()}
    </button>
  );
}
