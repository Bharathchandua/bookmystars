import React from "react";
import { AlertTriangle, Trash2, CheckCircle2, HelpCircle } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action? This cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "warning" | "primary"
  loading = false,
  children
}) {
  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 size={24} className="text-red-600" />,
    warning: <AlertTriangle size={24} className="text-amber-600" />,
    primary: <HelpCircle size={24} className="text-pink-600" />
  };

  const bgColors = {
    danger: "bg-red-50 border-red-100",
    warning: "bg-amber-50 border-amber-100",
    primary: "bg-pink-50 border-pink-100"
  };

  const buttonVariants = {
    danger: "danger",
    warning: "primary-pink",
    primary: "primary-pink"
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${bgColors[variant] || bgColors.danger}`}>
            {icons[variant] || icons.danger}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">
              {title}
            </h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {children && <div className="pt-2">{children}</div>}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant] || "danger"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
