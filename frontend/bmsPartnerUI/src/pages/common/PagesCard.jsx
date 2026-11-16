import React from "react";

export default function PagesCard({
  className = "",
  title,
  description,
  children,
  ...props
}) {
  const combinedClassName = className.trim();

  // Clean, isolated container card for dashboard elements
  return (
    <div className={combinedClassName || "card"} {...props}>
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
