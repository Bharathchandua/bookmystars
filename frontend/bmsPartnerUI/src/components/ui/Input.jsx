import React from "react";

/**
 * Reusable Input Component following BookMyStars standard architecture
 * Props:
 * - label: string
 * - type: string
 * - value: any
 * - onChange: func
 * - placeholder: string
 * - error: string
 * - disabled: boolean
 * - required: boolean
 * - helperText: string
 */
export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error,
  disabled = false,
  required = false,
  helperText,
  className = "",
  id,
  name,
  style = {},
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "12.5px",
            fontWeight: "700",
            color: "#cbd5e1",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {label}
          {required && <span style={{ color: "#ec008c" }}>*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: "13.5px",
          borderRadius: "10px",
          background: "#0f172a",
          border: error ? "1.5px solid #ef4444" : "1.5px solid #334155",
          color: "#f8fafc",
          outline: "none",
          transition: "border-color 0.2s ease",
          boxSizing: "border-box",
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        {...props}
      />

      {error && (
        <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "600" }}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
