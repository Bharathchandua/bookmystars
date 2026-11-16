import React from "react";

export default function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 4,
  placeholder = "",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  showCount = false,
  maxLength = null,
  theme = "pink", // "pink" | "purple"
  className = "",
  textareaClassName = "",
  ...props
}) {
  const focusBorderColor = theme === "purple" ? "focus:border-purple-600 focus:ring-purple-500/20" : "focus:border-pink-600 focus:ring-pink-500/20";
  const currentLength = (value || "").length;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-bold text-slate-800">
            <span>{label}</span>
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        {showCount && maxLength && (
          <span className="text-[10px] text-slate-400 font-medium">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>

      <textarea
        name={name}
        rows={rows}
        value={value !== undefined ? value : ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className={`
          w-full px-3.5 py-2.5 text-xs rounded-xl border transition-all duration-150 outline-none font-medium leading-relaxed resize-y
          ${error ? "border-rose-400 bg-rose-50/20 text-rose-900" : "border-slate-300 bg-white text-slate-800 focus:bg-white"}
          ${focusBorderColor} focus:ring-2
          ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : ""}
          ${textareaClassName}
        `.trim()}
        {...props}
      />

      {error ? (
        <p className="text-[11px] font-semibold text-rose-600 m-0 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 m-0 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
