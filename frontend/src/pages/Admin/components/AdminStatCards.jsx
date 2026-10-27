import React from "react";
import { Users, Star, CalendarDays, Trophy } from "lucide-react";

export default function AdminStatCards({ 
  metrics = {
    pendingCastings: 14,
    mediaQueueCount: 42,
    escrowLockedAmount: "₹14.5L",
    kycBadgesPending: 8
  },
  onSelectDesk
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      
      {/* Stat 1: Pending Castings (Matches Blue Views card) */}
      <div 
        onClick={() => onSelectDesk && onSelectDesk("castings")}
        className="bg-white border border-[#eef2f6] rounded-[20px] p-3.5 space-y-1 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.05)] transition cursor-pointer"
        title="Click to view pending casting submissions"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs shrink-0">
            <Users size={16} />
          </div>
          <div>
            <div className="text-base font-extrabold text-[#0f172a] leading-tight">
              {metrics.pendingCastings}
            </div>
            <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Pending Castings
            </div>
          </div>
        </div>
        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 pt-1">
          <span>&uarr; 3</span> <span className="text-slate-600 font-medium">urgent today</span>
        </div>
      </div>

      {/* Stat 2: Media Queue (Matches Pink Auditions card) */}
      <div 
        onClick={() => onSelectDesk && onSelectDesk("media")}
        className="bg-white border border-[#eef2f6] rounded-[20px] p-3.5 space-y-1 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.05)] transition cursor-pointer"
        title="Click to review media files"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-50 text-[#db2777] flex items-center justify-center text-xs shrink-0">
            <Star size={16} />
          </div>
          <div>
            <div className="text-base font-extrabold text-[#0f172a] leading-tight">
              {metrics.mediaQueueCount}
            </div>
            <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Media Queue
            </div>
          </div>
        </div>
        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 pt-1">
          <span>&uarr; 12</span> <span className="text-slate-600 font-medium">this hour</span>
        </div>
      </div>

      {/* Stat 3: Escrow Locked (Matches Purple Bookings card) */}
      <div 
        onClick={() => onSelectDesk && onSelectDesk("escrow")}
        className="bg-white border border-[#eef2f6] rounded-[20px] p-3.5 space-y-1 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.05)] transition cursor-pointer"
        title="Click to inspect locked escrow funds"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs shrink-0">
            <CalendarDays size={16} />
          </div>
          <div>
            <div className="text-base font-extrabold text-[#0f172a] leading-tight">
              {metrics.escrowLockedAmount || "₹14.5L"}
            </div>
            <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Escrow Locked
            </div>
          </div>
        </div>
        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 pt-1">
          <span>&uarr; 14</span> <span className="text-slate-600 font-medium">active shoots</span>
        </div>
      </div>

      {/* Stat 4: KYC Badges (Matches Amber Awards card) */}
      <div 
        onClick={() => onSelectDesk && onSelectDesk("media")}
        className="bg-white border border-[#eef2f6] rounded-[20px] p-3.5 space-y-1 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.05)] transition cursor-pointer"
        title="Click to view KYC identity queue"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs shrink-0">
            <Trophy size={16} />
          </div>
          <div>
            <div className="text-base font-extrabold text-[#0f172a] leading-tight">
              {metrics.kycBadgesPending}
            </div>
            <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              KYC Badges
            </div>
          </div>
        </div>
        <div className="text-[10px] text-purple-600 font-bold pt-1 cursor-pointer hover:underline">
          View all
        </div>
      </div>

    </div>
  );
}
