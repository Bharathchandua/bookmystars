import React from "react";

export default function ModerationQueueWidget({ 
  items = [], 
  onVerifyQueue, 
  onViewAll 
}) {
  const defaultList = [
    {
      id: "MOD-101",
      title: "Rang De Zindagi",
      subtitle: "Feature Film • Lead Role",
      year: "2023 • Released",
      rating: "8.2",
      posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=120&h=120&q=80"
    },
    {
      id: "MOD-102",
      title: "Tere Bin",
      subtitle: "Web Series • Lead Role",
      year: "2022 • 10 Episodes",
      rating: "8.0",
      posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=120&h=120&q=80"
    },
    {
      id: "MOD-103",
      title: "Yeh Safar",
      subtitle: "TV Series • Lead Role",
      year: "2021 • 15 Episodes",
      rating: "7.6",
      posterUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80"
    }
  ];

  const displayList = items.length > 0 ? items : defaultList;

  return (
    <div className="bg-white border border-[#eef2f6] rounded-[20px] p-5 md:p-6 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex flex-col justify-between h-full space-y-4">
      <div>
        
        {/* Header with Pink "View All" */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
          <h3 className="text-sm font-bold text-[#0f172a] m-0">
            Recent Moderation & KYC
          </h3>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-[#db2777] hover:underline bg-transparent border-none cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* List Items with Square Poster Thumbnails */}
        <div className="space-y-3.5 pt-3">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#0f172a] m-0 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 m-0">
                    {item.subtitle}
                  </p>
                  <p className="text-[10px] text-slate-400 m-0">
                    {item.year}
                  </p>
                </div>
              </div>

              {/* Mint Green Rating Pill */}
              <span className="border border-[#A7F3D0] text-[#059669] rounded-full px-2.5 py-0.5 text-[11px] font-black whitespace-nowrap">
                ☆ {item.rating}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Verify Queue Button */}
      <button
        type="button"
        onClick={() => onVerifyQueue && onVerifyQueue()}
        className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
      >
        ✓ Verify Queue
      </button>

    </div>
  );
}
