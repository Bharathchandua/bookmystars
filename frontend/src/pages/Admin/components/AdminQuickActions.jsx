import React from "react";
import { Plus, Video, Calendar, FolderPlus, Share2, Shield, DollarSign } from "lucide-react";

export default function AdminQuickActions({ 
  onNewRole, 
  onScreenCastings, 
  onVerifyKyc, 
  onDisburseEscrow, 
  onViewAudit 
}) {
  return (
    <div className="bg-white border border-[#eef2f6] rounded-[20px] p-4 space-y-3 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
      <h3 className="text-xs font-bold text-[#0f172a] m-0">Quick Actions</h3>

      <div className="flex flex-wrap gap-2.5">
        
        {/* Action 1: New Staff Role */}
        <button
          type="button"
          onClick={onNewRole}
          className="bg-white border border-[#f1f5f9] hover:border-[#ffd6ec] hover:bg-[#fffdfd] rounded-xl px-3.5 py-2 inline-flex items-center gap-2 text-xs font-bold text-[#1e293b] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition"
        >
          <div className="w-5 h-5 rounded-full bg-pink-100 text-[#db2777] flex items-center justify-center text-xs shrink-0 font-extrabold">
            +
          </div>
          <span>New Staff Role</span>
        </button>

        {/* Action 2: Screen Castings */}
        <button
          type="button"
          onClick={onScreenCastings}
          className="bg-white border border-[#f1f5f9] hover:border-[#ffd6ec] hover:bg-[#fffdfd] rounded-xl px-3.5 py-2 inline-flex items-center gap-2 text-xs font-bold text-[#1e293b] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition"
        >
          <Video size={15} className="text-[#7c3aed]" />
          <span>Screen Castings</span>
        </button>

        {/* Action 3: Verify KYC IDs */}
        <button
          type="button"
          onClick={onVerifyKyc}
          className="bg-white border border-[#f1f5f9] hover:border-[#ffd6ec] hover:bg-[#fffdfd] rounded-xl px-3.5 py-2 inline-flex items-center gap-2 text-xs font-bold text-[#1e293b] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition"
        >
          <Shield size={15} className="text-[#7c3aed]" />
          <span>Verify KYC IDs</span>
        </button>

        {/* Action 4: Disburse Escrow */}
        <button
          type="button"
          onClick={onDisburseEscrow}
          className="bg-white border border-[#f1f5f9] hover:border-[#ffd6ec] hover:bg-[#fffdfd] rounded-xl px-3.5 py-2 inline-flex items-center gap-2 text-xs font-bold text-[#1e293b] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition"
        >
          <DollarSign size={15} className="text-[#7c3aed]" />
          <span>Disburse Escrow</span>
        </button>

        {/* Action 5: Audit Trail */}
        <button
          type="button"
          onClick={onViewAudit}
          className="bg-white border border-[#f1f5f9] hover:border-[#ffd6ec] hover:bg-[#fffdfd] rounded-xl px-3.5 py-2 inline-flex items-center gap-2 text-xs font-bold text-[#1e293b] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition"
        >
          <Share2 size={15} className="text-[#7c3aed]" />
          <span>Audit Trail</span>
        </button>

      </div>
    </div>
  );
}
