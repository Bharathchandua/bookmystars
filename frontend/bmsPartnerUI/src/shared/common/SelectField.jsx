import React from "react";
import { ChevronDown } from "lucide-react";

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  theme = "pink", // "pink" | "purple"
  className = "",
  selectClassName = "",
  ...props
}) {
  const focusBorderColor = theme === "purple" ? "focus:border-purple-600 focus:ring-purple-500/20" : "focus:border-pink-600 focus:ring-pink-500/20";

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-800">
          <span>{label}</span>
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          name={name}
          value={value !== undefined ? value : ""}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3.5 py-2.5 pr-9 text-xs rounded-xl border transition-all duration-150 outline-none font-medium appearance-none bg-white cursor-pointer
            ${error ? "border-rose-400 bg-rose-50/20 text-rose-900" : "border-slate-300 text-slate-800"}
            ${focusBorderColor} focus:ring-2
            ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : ""}
            ${selectClassName}
          `.trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => {
            const isObject = typeof opt === "object" && opt !== null;
            const optVal = isObject ? opt.value : opt;
            const optLabel = isObject ? opt.label : opt;
            return (
              <option key={idx} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <span className="absolute right-3 pointer-events-none text-slate-400">
          <ChevronDown size={15} />
        </span>
      </div>

      {error ? (
        <p className="text-[11px] font-semibold text-rose-600 m-0 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 m-0 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
