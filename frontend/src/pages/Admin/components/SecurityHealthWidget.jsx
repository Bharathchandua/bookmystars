import React from "react";

export default function SecurityHealthWidget({ 
  percent = 83, 
  onAuditSecurity 
}) {
  return (
    <div className="bg-white border border-[#eef2f6] rounded-[20px] p-5 md:p-6 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex flex-col justify-between h-full space-y-4">
      <div>
        
        {/* Header */}
        <div className="pb-3 border-b border-[#f1f5f9]">
          <h3 className="text-sm font-bold text-[#0f172a] m-0">
            Security & Role Compliance
          </h3>
        </div>

        {/* Radial Gauge & Checklist (Matching Reference Exactly) */}
        <div className="flex items-center justify-between gap-4 pt-3">
          
          {/* Radial Gauge Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f1f5f9"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#adminPurplePinkGradient)"
                strokeWidth="9"
                strokeDasharray="251.2"
                strokeDashoffset="42"
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="adminPurplePinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#db2777" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-[#0f172a] leading-tight">
                {percent}%
              </span>
              <span className="text-[8px] font-extrabold text-slate-400 tracking-wider uppercase">
                COMPLETED
              </span>
            </div>
          </div>

          {/* Checklist with Green Checkmark Badges */}
          <div className="space-y-1.5 text-xs text-slate-700 font-semibold flex-1">
            <div className="flex items-center justify-between">
              <span>Basic Information</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>About Me / Policy</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Role Experience</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Skills & Matrix</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Media Controls</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Social Links</span>
              <span className="text-slate-400 font-bold">-</span>
            </div>
          </div>

        </div>

      </div>

      {/* Pink Outline Button matching "Complete Profile" in reference */}
      <button
        type="button"
        onClick={() => onAuditSecurity && onAuditSecurity()}
        className="w-full py-2.5 rounded-xl border border-[#db2777] text-[#db2777] font-bold text-xs hover:bg-pink-50 transition cursor-pointer"
      >
        Complete Profile
      </button>

    </div>
  );
}
