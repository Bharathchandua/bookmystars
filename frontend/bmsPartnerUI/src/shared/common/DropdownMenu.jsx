import React, { useState, useRef, useEffect } from "react";

export default function DropdownMenu({
  trigger,
  children,
  align = "right", // "left" | "right"
  className = "",
  menuClassName = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const alignClass = align === "left" ? "left-0" : "right-0";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {typeof trigger === "function" ? trigger({ isOpen, setIsOpen }) : trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignClass} mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
          role="menu"
          aria-orientation="vertical"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
