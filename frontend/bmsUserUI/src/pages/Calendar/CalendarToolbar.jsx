import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect } from "react";
import { Filter, Plus, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import { LEGEND_ITEMS } from "./calendarData.js";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const VIEW_MODES = ["Month", "Week", "Day", "Agenda"];

export default function CalendarToolbar({ viewMode, setViewMode, currentDate, onPrev, onNext, onToday, onAddEvent, onDateChange, selectedCategory, onCategoryChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
  const pickerRef   = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef   = useRef(null);

  // Close picker/filter when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync picker year when currentDate changes externally
  useEffect(() => {
    setPickerYear(currentDate.getFullYear());
  }, [currentDate]);

  const handleMonthPick = (monthIdx) => {
    onDateChange && onDateChange(new Date(pickerYear, monthIdx, 1));
    setShowPicker(false);
  };

  return (
    <div className="cal-toolbar">
      {/* ── Left ── */}
      <div className="cal-toolbar-left">

        {/* View Mode Tabs */}
        <div className="cal-view-tabs">
          {VIEW_MODES.map(mode => (
            <PagesButton
              key={mode}
              className={`cal-view-tab ${viewMode === mode ? "active" : ""}`}
              onClick={() => setViewMode(mode)}
            >
              {mode}
            </PagesButton>
          ))}
        </div>

        {/* Today */}
        <PagesButton className="cal-today-btn" onClick={onToday}>Today</PagesButton>

        {/* Prev / Next */}
        <div className="cal-nav-arrows">
          <PagesButton className="cal-nav-btn" onClick={onPrev} aria-label="Previous">
            <ChevronLeft size={14} />
          </PagesButton>
          <PagesButton className="cal-nav-btn" onClick={onNext} aria-label="Next">
            <ChevronRight size={14} />
          </PagesButton>
        </div>

        {/* Month + Year — with dropdown picker */}
        <div className="cal-month-picker-wrap" ref={pickerRef}>
          <PagesButton
            className="cal-month-label"
            onClick={() => setShowPicker(v => !v)}
          >
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            <ChevronDown size={14} style={{ transform: showPicker ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </PagesButton>

          {showPicker && (
            <div className="cal-month-picker-dropdown">
              {/* Year navigation */}
              <div className="cal-picker-year-row">
                <PagesButton className="cal-picker-yr-btn" onClick={() => setPickerYear(y => y - 1)}>
                  <ChevronLeft size={14} />
                </PagesButton>
                <span className="cal-picker-year">{pickerYear}</span>
                <PagesButton className="cal-picker-yr-btn" onClick={() => setPickerYear(y => y + 1)}>
                  <ChevronRight size={14} />
                </PagesButton>
              </div>

              {/* Month grid */}
              <div className="cal-picker-months">
                {MONTH_NAMES.map((name, idx) => {
                  const isActive =
                    idx === currentDate.getMonth() && pickerYear === currentDate.getFullYear();
                  return (
                    <PagesButton
                      key={name}
                      className={`cal-picker-month-btn ${isActive ? "active" : ""}`}
                      onClick={() => handleMonthPick(idx)}
                    >
                      {name.slice(0, 3)}
                    </PagesButton>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right ── */}
      <div className="cal-toolbar-right">
        <div className="cal-filter-wrap" ref={filterRef}>
          <PagesButton className="cal-filter-btn" onClick={() => setShowFilter(v => !v)}>
            <Filter size={14} />
            <span>Filter</span>
            <ChevronDown size={13} style={{ transform: showFilter ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </PagesButton>

          {showFilter && (
            <div className="cal-filter-dropdown">
              <PagesButton
                className={`cal-filter-item-btn ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => {
                  onCategoryChange && onCategoryChange("all");
                  setShowFilter(false);
                }}
              >
                <span className="cal-filter-dot all" />
                All Categories
              </PagesButton>
              {LEGEND_ITEMS.map(item => (
                <PagesButton
                  key={item.category}
                  className={`cal-filter-item-btn ${selectedCategory === item.category ? "active" : ""}`}
                  onClick={() => {
                    onCategoryChange && onCategoryChange(item.category);
                    setShowFilter(false);
                  }}
                >
                  <span className={`cal-filter-dot ${item.category}`} />
                  {item.label}
                </PagesButton>
              ))}
            </div>
          )}
        </div>

        <PagesButton className="cal-add-btn" onClick={onAddEvent}>
          <Plus size={15} />
          <span>Add Event</span>
        </PagesButton>
      </div>
    </div>
  );
}
