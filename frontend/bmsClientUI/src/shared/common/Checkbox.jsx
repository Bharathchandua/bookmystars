import React from "react";

export default function Checkbox({
  label,
  description = "",
  name,
  checked = false,
  onChange,
  disabled = false,
  theme = "pink", // "pink" | "purple"
  className = "",
  ...props
}) {
  const accentColor = theme === "purple" ? "text-purple-600 focus:ring-purple-500" : "text-pink-600 focus:ring-pink-500";

  return (
    <label
      className={`
        flex items-start gap-2.5 select-none cursor-pointer group
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `.trim()}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`
          mt-0.5 w-4 h-4 rounded border-slate-300 ${accentColor} transition cursor-pointer
        `.trim()}
        {...props}
      />
      <div className="text-xs">
        {label && <span className="font-bold text-slate-800 block group-hover:text-slate-900">{label}</span>}
        {description && <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">{description}</span>}
      </div>
    </label>
  );
}
