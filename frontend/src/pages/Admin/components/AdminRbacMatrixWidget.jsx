import React from "react";
import { Lock, ShieldCheck, Key, Settings, ExternalLink, Check } from "lucide-react";

export default function AdminRbacMatrixWidget({ onOpenModal }) {
  const modules = [
    { name: "Talents & Portfolios", access: "Full Master Access", status: "Active", color: "emerald" },
    { name: "Casting Approvals", access: "Screen & Publish", status: "Active", color: "emerald" },
    { name: "Escrow Disbursements", access: "Financial Signoff", status: "Locked", color: "purple" },
    { name: "Disputes & Moderation", access: "Resolution Authority", status: "Active", color: "emerald" },
    { name: "Audit Trail & Logs", access: "Immutable Read", status: "Active", color: "blue" },
    { name: "Staff Roles (RBAC)", access: "Create / Revoke", status: "Active", color: "pink" },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] border border-slate-200 flex flex-col justify-between space-y-4">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <Lock size={15} />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a] m-0">
              RBAC Governance Matrix
            </h3>
          </div>
          <span className="text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
            11 Modules Active
          </span>
        </div>

        {/* Module Subsystem List */}
        <div className="space-y-2.5 pt-3">
          {modules.map((m) => (
            <div 
              key={m.name}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800">{m.name}</span>
              </div>
              <span className="text-[10.5px] font-extrabold text-[#ee008f] bg-[#fff1f8] border border-[#fbcfe8] px-2 py-0.5 rounded-md">
                {m.access}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onOpenModal}
        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
      >
        <Key size={13} />
        <span>Manage RBAC Staff Permissions</span>
      </button>

    </div>
  );
}
