import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Pure vector ArrowRight used in bottom services cards
const SVGArrowRight = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="#DB0095"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      display: "inline-block",
      verticalAlign: "middle",
      marginLeft: "4px",
      flexShrink: 0,
    }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function Card({
  variant, // "opportunity", "grow", "benefit", "service"
  id,
  image,
  imageClassName = "",
  icon,
  title,
  description,
  link,
  linkText,
  className = "",
  children,
  ...props
}) {
  const combinedClassName = className.trim();

  switch (variant) {
    case "opportunity":
      return (
        <div className={`big-card ${combinedClassName}`} {...props}>
          {icon && <div className="float-icon">{icon}</div>}
          {image && (
            <div className="card-img-wrap">
              <img src={image} alt={title} className={imageClassName} />
            </div>
          )}
          <div className="card-body-custom">
            <h3>{title}</h3>
            <p>{description}</p>
            {(link || linkText) && (
              link && link.startsWith("/") ? (
                <Link to={link}>
                  {linkText} <ArrowRight size={16} />
                </Link>
              ) : (
                <a href={link || "#"}>
                  {linkText} <ArrowRight size={16} />
                </a>
              )
            )}
          </div>
        </div>
      );

    case "grow":
      return (
        <div className={`strip-card ${combinedClassName}`} {...props}>
          {icon && <div className="strip-card-icon-wrapper">{icon}</div>}
          <h3 className="strip-card-title">{title}</h3>
          <p className="strip-card-description">{description}</p>
        </div>
      );

    case "benefit":
      return (
        <div className={`choose-item ${combinedClassName}`} {...props}>
          {icon && <div className="choose-item-icon-wrapper">{icon}</div>}
          <div className="choose-item-content">
            <h3 className="choose-item-title">{title}</h3>
            <p className="choose-item-description">{description}</p>
          </div>
        </div>
      );

    case "service":
      return (
        <div id={id} className={`bottom-card ${combinedClassName}`} {...props}>
          {icon}
          <div className="card-content">
            <h3>{title}</h3>
            <p>{description}</p>
            {(link || linkText) && (
              link.startsWith("/") ? (
                <Link to={link} className="explore-btn">
                  {linkText} <SVGArrowRight />
                </Link>
              ) : (
                <a href={link || "#"} className="explore-btn">
                  {linkText} <SVGArrowRight />
                </a>
              )
            )}
          </div>
        </div>
      );

    default:
      // Fallback container card if no variant or unrecognized variant is supplied
      return (
        <div className={combinedClassName || "card"} {...props}>
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
          {children}
        </div>
      );
  }
}
