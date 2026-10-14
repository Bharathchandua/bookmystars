import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import MiniDatePicker from "./MiniDatePicker.jsx";

// Custom Dropdown for Filter Buttons (Status & Type)
function CustomFilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOpt = options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      className={`bookings-filter-button ${open ? "active-open" : ""}`}
      ref={ref}
      onClick={() => setOpen((o) => !o)}
    >
      <span className="bookings-filter-btn-label">{label}</span>
      <div className="bookings-filter-btn-val-wrap">
        <span className="bookings-filter-btn-val">{selectedOpt.label}</span>
        <ChevronDown size={14} className={`bookings-filter-btn-chevron ${open ? "rotated" : ""}`} />
      </div>

      {open && (
        <div className="bookings-filter-dropdown-menu">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className={`bookings-filter-dropdown-item ${isSelected ? "selected" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <div className="bookings-filter-item-left">
                  {opt.dotColor && (
                    <span
                      className="bookings-filter-dot"
                      style={{ backgroundColor: opt.dotColor }}
                    />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} className="bookings-filter-check" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Custom Dropdown for Sort Selector
function CustomSortDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOpt = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="bookings-sort-container" ref={ref}>
      <PagesButton
        className={`bookings-sort-btn-custom ${open ? "active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span>{selectedOpt.label}</span>
        <ChevronDown size={14} className={`bookings-sort-chevron ${open ? "rotated" : ""}`} />
      </PagesButton>

      {open && (
        <div className="bookings-sort-dropdown-menu">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className={`bookings-sort-dropdown-item ${isSelected ? "selected" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} className="bookings-sort-check" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BookingsFilters({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  sortBy,
  setSortBy,
}) {
  const statuses = [
    { value: "All Status", label: "All Status", dotColor: "#64748b" },
    { value: "Confirmed",  label: "Confirmed", dotColor: "#16a34a" },
    { value: "Pending",    label: "Pending", dotColor: "#d97706" },
    { value: "Completed",  label: "Completed", dotColor: "#7c3aed" },
    { value: "Cancelled",  label: "Cancelled", dotColor: "#dc2626" },
  ];

  const types = [
    { value: "All Types",    label: "All Types", dotColor: "#64748b" },
    { value: "Web Series",   label: "Web Series", dotColor: "#6d28d9" },
    { value: "Feature Film", label: "Feature Film", dotColor: "#be185d" },
    { value: "Web Film",     label: "Web Film", dotColor: "#0f766e" },
    { value: "TV Serial",    label: "TV Serial", dotColor: "#0369a1" },
    { value: "Commercial",   label: "Commercial", dotColor: "#b45309" },
    { value: "Brand Shoot",  label: "Brand Shoot", dotColor: "#be123c" },
  ];

  const sortOptions = [
    { value: "Newest First",     label: "Newest First" },
    { value: "Oldest First",     label: "Oldest First" },
    { value: "Payment High-Low", label: "Payment: High to Low" },
  ];

  return (
    <div className="bookings-filter-row">
      {/* Left side: Filter selectors */}
      <div className="bookings-filter-dd-group">

        {/* Status Dropdown */}
        <CustomFilterDropdown
          label="Status"
          value={statusFilter}
          options={statuses}
          onChange={setStatusFilter}
        />

        {/* Type Dropdown */}
        <CustomFilterDropdown
          label="Type"
          value={typeFilter}
          options={types}
          onChange={setTypeFilter}
        />

        {/* From Date – custom mini picker */}
        <div className="bookings-filter-button bookings-filter-button--date">
          <span className="bookings-filter-btn-label">From Date</span>
          <MiniDatePicker
            value={fromDate}
            onChange={setFromDate}
            placeholder="Select Date"
          />
        </div>

        {/* To Date – custom mini picker */}
        <div className="bookings-filter-button bookings-filter-button--date">
          <span className="bookings-filter-btn-label">To Date</span>
          <MiniDatePicker
            value={toDate}
            onChange={setToDate}
            placeholder="Select Date"
          />
        </div>
      </div>

      {/* Right side: Sort option */}
      <div className="bookings-sort-wrap" style={{ alignSelf: "center" }}>
        <span>Sort by:</span>
        <CustomSortDropdown
          value={sortBy}
          options={sortOptions}
          onChange={setSortBy}
        />
      </div>
    </div>
  );
}
