import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  size = "2xl",
  theme = "pink",
  children,
  footerActions,
  closeOnBackdrop = true,
  className = ""
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
    "2xl": "max-w-3xl",
    "3xl": "max-w-4xl",
    "4xl": "max-w-5xl",
    full: "max-w-6xl"
  };

  const iconGradientClasses = {
    pink: "bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-md",
    purple: "bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md",
    slate: "bg-slate-100 text-slate-700"
  };

  const badgeThemeClasses = {
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeOnBackdrop ? (e) => { if (e.target === e.currentTarget) onClose?.(); } : undefined}
    >
      <div
        className={`bg-white rounded-3xl w-full ${sizeClasses[size] || "max-w-2xl"} max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6 ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || icon) && (
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconGradientClasses[theme] || iconGradientClasses.pink}`}>
                  {icon}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {title && (
                    <h2 className="text-xl font-black text-slate-900 m-0 tracking-tight">
                      {title}
                    </h2>
                  )}
                  {badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${badgeThemeClasses[theme] || badgeThemeClasses.pink}`}>
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition shrink-0"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div>{children}</div>

        {/* Optional Footer Actions */}
        {footerActions && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
