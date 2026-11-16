import React from "react";

/**
 * Reusable Button Component following BookMyStars standard architecture
 * Props:
 * - variant: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
 * - size: 'sm' | 'md' | 'lg'
 * - loading: boolean
 * - disabled: boolean
 * - onClick: func
 * - type: 'button' | 'submit' | 'reset'
 * - children: ReactNode
 * - className: string
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  children,
  className = "",
  style = {},
  ...props
}) {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    borderRadius: "10px",
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease-in-out",
    fontFamily: "inherit",
    gap: "8px",
    ...style,
  };

  const sizeStyles = {
    sm: { padding: "6px 14px", fontSize: "12px", height: "32px" },
    md: { padding: "9px 20px", fontSize: "13.5px", height: "40px" },
    lg: { padding: "12px 28px", fontSize: "15px", height: "48px" },
  };

  const variantStyles = {
    primary: {
      background: "linear-gradient(135deg, #ec008c, #7c3aed)",
      color: "#ffffff",
      boxShadow: "0 4px 14px rgba(236, 0, 140, 0.25)",
    },
    secondary: {
      background: "#334155",
      color: "#ffffff",
    },
    danger: {
      background: "#ef4444",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
    },
    outline: {
      background: "transparent",
      color: "#e2e8f0",
      border: "1px solid #475569",
    },
    ghost: {
      background: "transparent",
      color: "#94a3b8",
    },
  };

  const finalStyle = {
    ...baseStyles,
    ...(sizeStyles[size] || sizeStyles.md),
    ...(variantStyles[variant] || variantStyles.primary),
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={finalStyle}
      className={`bms-ui-btn bms-ui-btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: 14, height: 14 }} />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
