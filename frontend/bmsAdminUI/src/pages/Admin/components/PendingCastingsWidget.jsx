import React from "react";
import PagesButton from "../../common/PagesButton";

export default function PendingCastingsWidget({ 
  items = [], 
  onApproveNotice, 
  onViewAll 
}) {
  const defaultList = [
    {
      id: "OPP-9402",
      title: "Web Series - Lead Role",
      productionHouse: "DreamWorks & Dharma Productions",
      budget: "₹4,50,000",
      date: "24",
      month: "MAY",
      location: "Mumbai",
      status: "Confirmed",
      statusClass: "bg-[#ECFDF5] text-[#059669]"
    },
    {
      id: "OPP-9403",
      title: "Feature Film - Supporting Role",
      productionHouse: "Silver Screen Entertainment",
      budget: "₹1,80,000",
      date: "28",
      month: "MAY",
      location: "Hyderabad",
      status: "Pending",
      statusClass: "bg-[#FFFBEB] text-[#D97706]"
    },
    {
      id: "OPP-9404",
      title: "TV Commercial - Lead",
      productionHouse: "Bright Ads & Red Chillies",
      budget: "₹2,40,000",
      date: "02",
      month: "JUN",
      location: "Mumbai",
      status: "Shortlisted",
      statusClass: "bg-[#F5F3FF] text-[#7c3aed]"
    }
  ];

  const displayList = items.length > 0 ? items : defaultList;

  return (
    <div className="bg-white border border-[#eef2f6] rounded-[20px] p-5 md:p-6 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex flex-col justify-between h-full space-y-4">
      <div>
        
        {/* Header with Pink "View All" */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
          <h3 className="text-sm font-bold text-[#0f172a] m-0">
            Pending Casting Approvals
          </h3>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-[#db2777] hover:underline bg-transparent border-none cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* List Items matching 24 MAY date boxes */}
        <div className="space-y-3.5 pt-3">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                {/* Date Badge */}
                <div className="w-11 h-11 rounded-xl bg-pink-50 border border-pink-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[12px] font-black text-[#db2777] leading-none">
                    {item.date}
                  </span>
                  <span className="text-[8px] font-extrabold text-[#db2777] uppercase">
                    {item.month}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0f172a] m-0 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 m-0">
                    {item.productionHouse} &bull; {item.budget}
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                  item.statusClass || "bg-[#ECFDF5] text-[#059669]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* One-Click Approve Queue Button */}
      <button
        type="button"
        onClick={() => onApproveNotice && onApproveNotice("All Queued Calls")}
        className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
      >
        ✓ One-Click Approve Queue
      </button>

    </div>
  );
}
