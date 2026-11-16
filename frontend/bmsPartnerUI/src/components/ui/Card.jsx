import React from "react";

/**
 * Reusable Card Component following BookMyStars standard architecture
 * Props:
 * - title: string | ReactNode
 * - subtitle: string
 * - action: ReactNode
 * - children: ReactNode
 * - className: string
 */
export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  style = {},
  ...props
}) {
  return (
    <div
      className={`bms-ui-card ${className}`}
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        ...style,
      }}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            borderBottom: "1px solid rgba(51, 65, 85, 0.4)",
            paddingBottom: "12px",
          }}
        >
          <div>
            {title && (
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
                {title}
              </h4>
            )}
            {subtitle && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
