import React from "react";

export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  icon = null,
  required = false,
  disabled = false,
  theme = "pink", // "pink" | "purple"
  className = "",
  inputClassName = "",
  ...props
}) {
  const focusBorderColor = theme === "purple" ? "focus:border-purple-600 focus:ring-purple-500/20" : "focus:border-pink-600 focus:ring-pink-500/20";
  const iconColor = theme === "purple" ? "text-purple-600" : "text-pink-600";

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-800">
          <span>{label}</span>
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className={`absolute left-3.5 pointer-events-none ${iconColor} shrink-0`}>
            {icon}
          </span>
        )}

        <input
          name={name}
          type={type}
          value={value !== undefined ? value : ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full py-2.5 text-xs rounded-xl border transition-all duration-150 outline-none font-medium
            ${icon ? "pl-10 pr-3.5" : "px-3.5"}
            ${error ? "border-rose-400 bg-rose-50/20 text-rose-900" : "border-slate-300 bg-white text-slate-800 focus:bg-white"}
            ${focusBorderColor} focus:ring-2
            ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : ""}
            ${inputClassName}
          `.trim()}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-semibold text-rose-600 m-0 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 m-0 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
