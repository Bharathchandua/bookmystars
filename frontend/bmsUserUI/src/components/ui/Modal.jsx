import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable Modal Component following BookMyStars standard architecture
 * Props:
 * - open: boolean
 * - onClose: func
 * - title: string
 * - children: ReactNode
 * - size: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidths = {
    sm: "420px",
    md: "580px",
    lg: "820px",
    xl: "1100px",
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bms-ui-modal ${className}`}
        style={{
          width: "100%",
          maxWidth: maxWidths[size] || maxWidths.md,
          background: "#1e293b",
          borderRadius: "20px",
          border: "1px solid #334155",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeInModal 0.2s ease-out",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "20px",
              lineHeight: 1,
              padding: "4px 8px",
              borderRadius: "8px",
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1, color: "#e2e8f0" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
