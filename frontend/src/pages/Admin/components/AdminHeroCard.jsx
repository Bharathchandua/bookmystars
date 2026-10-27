import React from "react";
import { Key, Download, MapPin, ShieldCheck, Activity } from "lucide-react";

export default function AdminHeroCard({ onManageRoles, onExportLogs }) {
  return (
    <div className="bg-white border border-[#eef2f6] rounded-[24px] p-5 md:p-6 shadow-[0_4px_25px_rgba(15,23,42,0.04)] h-full flex flex-col justify-between">
      
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        
        {/* Left: Fixed Squircle Photo Frame matching User Reference */}
        <div 
          style={{
            position: "relative",
            flexShrink: 0,
            width: "140px",
            height: "185px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "2px solid #e2e8f0",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
            background: "#0f172a",
            margin: "0 auto"
          }}
          className="sm:mx-0"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=450&q=80"
            alt="Operations Command"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
              display: "block"
            }}
          />

          {/* Status Pill matching Available badge */}
          <div 
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              zIndex: 2,
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              padding: "3px 8px",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#ffffff", letterSpacing: "0.4px", textTransform: "uppercase" }}>
              Active
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="flex-1 space-y-3 w-full text-left">
          
          {/* Header & Rosette Verified Badge */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#0f172a] m-0 tracking-tight">
                Operations Command
              </h2>
              {/* Purple verified rosette identical to reference */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#7c3aed" style={{ flexShrink: 0 }}>
                <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#7c3aed"/>
                <path d="M10 14.17L7.41 11.59 6 13l4 4 9-9-1.41-1.41z" fill="#ffffff" />
              </svg>
            </div>

            {/* Badges */}
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              <span className="bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] px-2 py-0.5 rounded-md text-[10.5px] font-bold">
                👑 Super Admin
              </span>
              <span className="bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] px-2 py-0.5 rounded-md text-[10.5px] font-bold">
                Risk Controller
              </span>
            </div>
          </div>

          {/* Demographics Card matching reference style */}
          <div className="bg-[#f8fafc] rounded-xl p-2.5 space-y-1.5 text-xs text-[#64748b] font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-[#ee008f] font-bold">📍</span>
              <span>Central Operations Hub &bull; Mumbai, India</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7c3aed] font-bold">🛡️</span>
              <span>System Reliability: <strong className="text-emerald-600 font-extrabold">99.98% Normal</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#db2777] font-bold">⚡</span>
              <span>Active Back-Office Staff: <strong className="text-slate-800 font-extrabold">12 Duty Officers</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onManageRoles}
              className="bg-gradient-to-r from-[#db2777] to-[#9333ea] text-white font-bold rounded-xl px-4 py-2 text-xs inline-flex items-center gap-1.5 shadow-md shadow-pink-500/20 hover:opacity-95 transition cursor-pointer border-none"
            >
              <Key size={13} />
              <span>Manage Roles</span>
            </button>

            <button
              type="button"
              onClick={onExportLogs}
              className="bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#1e293b] font-bold rounded-xl px-4 py-2 text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download size={13} className="text-slate-500" />
              <span>Export Logs</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
