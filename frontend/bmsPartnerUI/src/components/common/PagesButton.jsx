import React from "react";
import { Link } from "react-router-dom";

export default function PagesButton({
  children,
  variant, // e.g. "auth-btn", "social-login-btn", etc.
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

  // Resolve variants if any specific dashboard styles are mapped in the future
  let variantClass = "";
  switch (variant) {
    case "auth-btn":
      variantClass = "auth-btn";
      break;
    case "social-login-btn":
      variantClass = "social-login-btn";
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
