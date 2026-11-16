import React from "react";

/**
 * Reusable Badge Component following BookMyStars standard architecture
 * Props:
 * - variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
 * - children: ReactNode
 * - className: string
 */
export default function Badge({
  variant = "default",
  children,
  className = "",
  style = {},
  ...props
}) {
  const variantStyles = {
    success: {
      background: "rgba(16, 185, 129, 0.15)",
      color: "#10b981",
      border: "1px solid rgba(16, 185, 129, 0.3)",
    },
    warning: {
      background: "rgba(245, 158, 11, 0.15)",
      color: "#f59e0b",
      border: "1px solid rgba(245, 158, 11, 0.3)",
    },
    danger: {
      background: "rgba(239, 68, 68, 0.15)",
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    info: {
      background: "rgba(59, 130, 246, 0.15)",
      color: "#60a5fa",
      border: "1px solid rgba(59, 130, 246, 0.3)",
    },
    default: {
      background: "#334155",
      color: "#cbd5e1",
      border: "1px solid #475569",
    },
  };

  return (
    <span
      className={`bms-ui-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "11.5px",
        fontWeight: "700",
        letterSpacing: "0.3px",
        ...(variantStyles[variant] || variantStyles.default),
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
