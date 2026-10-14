import PagesButton from "../common/PagesButton";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, CalendarRange, Clock, MapPin, Sparkles, ChevronDown } from "lucide-react";

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function MiniCalendar({ isOpen, onClose, renderOnlyModal = false }) {
  const [events, setEvents] = useState({
    "2026-06-07": [
      { id: 1, type: "audition", time: "11:00 AM", title: "Web Series Lead Audition", production: "DreamWorks", location: "Studio 4, Andheri" }
    ],
    "2026-06-17": [
      { id: 2, type: "audition", time: "01:30 PM", title: "Commercial Casting Shoot", agency: "Bright Ads", location: "Famous Studios, Mahalaxmi" },
      { id: 3, type: "booking", time: "05:00 PM", title: "Brand Promo Photoshoot", client: "Zara India", location: "Studio Vista, Bandra" }
    ],
    "2026-06-20": [
      { id: 4, type: "audition", time: "02:00 PM", title: "Feature Film Supporting Audition", production: "Silver Screen", location: "Casting Bay, Juhu" }
    ],
    "2026-06-22": [
      { id: 5, type: "booking", time: "10:00 AM", title: "TV Commercial Shoot - Day 1", client: "Pepsi India", location: "Film City, Goregaon" }
    ],
    "2026-06-23": [
      { id: 6, type: "meeting", time: "04:00 PM", title: "Director's Briefing & Costume Fitting", production: "Dharma Productions", location: "Dharma Office, Khar" }
    ],
    "2026-06-25": [
      { id: 7, type: "audition", time: "11:30 AM", title: "Netflix Film Character Audition", production: "Excel Ent.", location: "Casting Bay, Juhu" }
    ],
    "2026-06-26": [
      { id: 8, type: "shoot", time: "09:00 AM", title: "Short Film Shoot", production: "Indie Films", location: "Versova Beach" }
    ]
  });

  const [selectedDay, setSelectedDay] = useState(24);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(5); // June (0-indexed)
  const [showModal, setShowModal] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const yearListRef = useRef(null);
  const monthListRef = useRef(null);

  useEffect(() => {
    if (isOpen !== undefined) {
      setShowModal(isOpen);
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  // Form states for adding a new event
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(24);
  const [newEventType, setNewEventType] = useState("audition");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventCompany, setNewEventCompany] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatDateKey = (year, monthIndex, day) => {
    const m = String(monthIndex + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const generateMonthDays = (year, monthIndex) => {
    const cells = [];
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const prevMonthDays = new Date(year, monthIndex, 0).getDate();
    
    // 1. Fill leading days from previous month
    for (let i = firstWeekday - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        month: monthIndex === 0 ? 11 : monthIndex - 1,
        year: monthIndex === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }
    
    // 2. Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        month: monthIndex,
        year: year,
        isCurrentMonth: true
      });
    }
    
    // 3. Fill trailing days
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const nextDaysCount = totalCells - cells.length;
    for (let i = 1; i <= nextDaysCount; i++) {
      cells.push({
        day: i,
        month: monthIndex === 11 ? 0 : monthIndex + 1,
        year: monthIndex === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }
    
    return cells;
  };

  const days = generateMonthDays(currentYear, currentMonthIndex);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    const maxDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [currentYear, currentMonthIndex]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setShowYearPicker(false); // close year picker when modal closes
      setShowMonthPicker(false); // close month picker when modal closes
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const getDotsForDay = (dayNum, isCurrentMonth) => {
    if (!isCurrentMonth) return [];
    const dateKey = formatDateKey(currentYear, currentMonthIndex, dayNum);
    const dayEvents = events[dateKey];
    if (!dayEvents || dayEvents.length === 0) return [];
    const colors = [];
    dayEvents.forEach(ev => {
      let color = "";
      if (ev.type === "audition") color = "#ec4899";       // pink
      else if (ev.type === "booking") color = "#10b981";   // emerald
      else if (ev.type === "meeting") color = "#f59e0b";   // amber
      else if (ev.type === "shoot") color = "#ef4444";     // red
      if (color && !colors.includes(color)) {
        colors.push(color);
      }
    });
    return colors;
  };

  const handleOpenAddEvent = () => {
    setNewEventDate(selectedDay);
    setNewEventTitle("");
    setNewEventType("audition");
    setNewEventTime("");
    setNewEventCompany("");
    setNewEventLocation("");
    setShowAddEvent(true);
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvent = {
      id: Date.now(),
      type: newEventType,
      time: newEventTime || "12:00 PM",
      title: newEventTitle,
      location: newEventLocation || "TBD",
    };

    if (newEventType === "audition") {
      newEvent.production = newEventCompany || "Independent";
    } else if (newEventType === "booking") {
      newEvent.client = newEventCompany || "Direct Client";
    } else if (newEventType === "meeting") {
      newEvent.production = newEventCompany || "Briefing Session";
    } else if (newEventType === "shoot") {
      newEvent.production = newEventCompany || "Production Unit";
    }

    const dateKey = formatDateKey(currentYear, currentMonthIndex, newEventDate);

    setEvents(prev => {
      const dayEvents = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: [...dayEvents, newEvent]
      };
    });

    setSelectedDay(Number(newEventDate));
    setShowAddEvent(false);
  };

    return (
    <div 
      className="card-widget flex flex-col justify-between h-full calendar-widget-card"
      style={renderOnlyModal ? { display: "none" } : {}}
    >
      
      {/* Header Row */}
      <div className="widget-header mb-4">
        <h3>Calendar</h3>
        <PagesButton className="btn-view-calendar" onClick={() => setShowModal(true)}>
          View Full Calendar
        </PagesButton>
      </div>

      {/* Month Navigator Row */}
      <div className="flex items-center justify-between mb-4 cal-month-nav">
        <span className="text-sm font-black text-slate-700">{monthsList[currentMonthIndex]} {currentYear}</span>
        <div className="flex items-center gap-1.5">
          <span 
            onClick={handlePrevMonth} 
            role="button" 
            tabIndex={0}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-150 flex items-center justify-center"
          >
            <ChevronLeft size={14} />
          </span>
          <span 
            onClick={handleNextMonth} 
            role="button" 
            tabIndex={0}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-150 flex items-center justify-center"
          >
            <ChevronRight size={14} />
          </span>
        </div>
      </div>

      {/* Weekday Titles */}
      <div className="cal-weekday-grid">
        {weekdays.map(d => (
          <span key={d} className="cal-weekday">{d}</span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="cal-dates-grid">
        {days.map((item, idx) => {
          const isSelected = item.isCurrentMonth && item.day === selectedDay;
          const dayDots = getDotsForDay(item.day, item.isCurrentMonth);
          return (
            <div
              key={`${item.day}-${idx}`}
              onClick={() => item.isCurrentMonth && setSelectedDay(item.day)}
              className={`cal-day-cell ${isSelected ? "selected" : ""} ${!item.isCurrentMonth ? "inactive" : ""}`}
            >
              {/* Day Circle */}
              <div className="cal-day-num">
                {item.day}
              </div>

              {/* Indicator Dots */}
              {dayDots.length > 0 && !isSelected && (
                <div className="cal-dot-container">
                  {dayDots.map((color, cIdx) => (
                    <span
                      key={cIdx}
                      className="cal-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Calendar Modal Overlay */}
      {showModal && createPortal(
        <div 
          className="cal-modal-overlay-fixed" 
          onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
        >
          {/* Backdrop BG */}
          <div className="cal-modal-backdrop-bg" />
          
          {/* Modal Container */}
          <div className="cal-modal-container" onClick={(e) => { e.stopPropagation(); }}>
            
            {/* Modal Header */}
            <div className="cal-modal-header">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <CalendarRange size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-[16px] font-black text-slate-800 leading-tight">Full Scheduling Calendar</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Track and manage your auditions, shoots, and bookings</span>
                </div>
              </div>
              <PagesButton 
                onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
                className="cal-modal-close-btn"
              >
                <X size={18} />
              </PagesButton>
            </div>

            {/* Modal Body */}
            <div className="cal-modal-body">
              
              {/* Left Column: Big Grid */}
              <div className="cal-modal-grid-side">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    {/* Custom Month Picker — stays inside modal */}
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <PagesButton
                        className="cal-header-select"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMonthPicker(prev => !prev);
                          setShowYearPicker(false);
                          setTimeout(() => {
                            if (monthListRef.current) {
                              const selected = monthListRef.current.querySelector('[data-selected="true"]');
                              if (selected) selected.scrollIntoView({ block: "center" });
                            }
                          }, 50);
                        }}
                      >
                        {monthsList[currentMonthIndex]}
                      </PagesButton>

                      {showMonthPicker && (
                        <div
                          ref={monthListRef}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            zIndex: 100,
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            maxHeight: "200px",
                            overflowY: "auto",
                            minWidth: "110px",
                          }}
                        >
                          {monthsList.map((m, idx) => (
                            <div
                              key={idx}
                              data-selected={idx === currentMonthIndex ? "true" : "false"}
                              onClick={() => {
                                setCurrentMonthIndex(idx);
                                setShowMonthPicker(false);
                              }}
                              style={{
                                padding: "7px 14px",
                                fontSize: "13px",
                                fontWeight: idx === currentMonthIndex ? 800 : 500,
                                color: idx === currentMonthIndex ? "#661AF1" : "#334155",
                                backgroundColor: idx === currentMonthIndex ? "#f3f0fe" : "transparent",
                                cursor: "pointer",
                              }}
                              onMouseEnter={e => { if (idx !== currentMonthIndex) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                              onMouseLeave={e => { if (idx !== currentMonthIndex) e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              {m}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Custom Year Picker — stays inside modal */}
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <PagesButton
                        className="cal-header-select"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowYearPicker(prev => !prev);
                          setShowMonthPicker(false);
                          // auto-scroll to selected year after render
                          setTimeout(() => {
                            if (yearListRef.current) {
                              const selected = yearListRef.current.querySelector('[data-selected="true"]');
                              if (selected) selected.scrollIntoView({ block: "center" });
                            }
                          }, 50);
                        }}
                      >
                        {currentYear}
                      </PagesButton>

                      {showYearPicker && (
                        <div
                          ref={yearListRef}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            zIndex: 100,
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            maxHeight: "200px",
                            overflowY: "auto",
                            minWidth: "80px",
                          }}
                        >
                          {Array.from({ length: 111 }, (_, i) => 1950 + i).map(yr => (
                            <div
                              key={yr}
                              data-selected={yr === currentYear ? "true" : "false"}
                              onClick={() => {
                                setCurrentYear(yr);
                                setShowYearPicker(false);
                              }}
                              style={{
                                padding: "7px 14px",
                                fontSize: "13px",
                                fontWeight: yr === currentYear ? 800 : 500,
                                color: yr === currentYear ? "#661AF1" : "#334155",
                                backgroundColor: yr === currentYear ? "#f3f0fe" : "transparent",
                                cursor: "pointer",
                              }}
                              onMouseEnter={e => { if (yr !== currentYear) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                              onMouseLeave={e => { if (yr !== currentYear) e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              {yr}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span 
                      onClick={handlePrevMonth} 
                      role="button" 
                      tabIndex={0}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-150 flex items-center justify-center"
                    >
                      <ChevronLeft size={14} />
                    </span>
                    <span 
                      onClick={handleNextMonth} 
                      role="button" 
                      tabIndex={0}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-150 flex items-center justify-center"
                    >
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>

                {/* Weekdays Row */}
                <div className="cal-modal-weekday-header">
                  {weekdays.map(d => (
                    <span key={d} className="cal-modal-weekday-label">{d}</span>
                  ))}
                </div>

                {/* Dates Grid */}
                <div className="cal-modal-dates-grid">
                  {days.map((item, idx) => {
                    const isSelected = item.isCurrentMonth && item.day === selectedDay;
                    const dateKey = formatDateKey(item.year, item.month, item.day);
                    const hasEvents = item.isCurrentMonth && events[dateKey];
                    const dayEvents = hasEvents ? events[dateKey] : [];

                    return (
                      <div
                        key={`${item.day}-${idx}`}
                        onClick={(e) => { e.stopPropagation(); item.isCurrentMonth && setSelectedDay(item.day); }}
                        className={`cal-modal-day-cell
                          ${isSelected ? "selected" : ""}
                          ${!item.isCurrentMonth ? "inactive" : ""}
                        `}
                      >
                        {/* Day Number */}
                        <span className="cal-modal-day-number">
                          {item.day}
                        </span>

                        {/* Events list in Date box */}
                        <div className="cal-modal-chip-list">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div 
                              key={ev.id}
                              className={`cal-modal-chip ${ev.type}`}
                            >
                              {ev.type === 'audition' ? 'Audition' : ev.type === 'booking' ? 'Booking' : ev.type === 'meeting' ? 'Briefing' : 'Shoot'}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Side Panel */}
              <div className="cal-modal-agenda-side">
                <h4 className="cal-agenda-header">
                  <Sparkles size={13} className="text-purple-600" />
                  Agenda for {selectedDay} {monthsList[currentMonthIndex]} {currentYear}
                </h4>

                {(() => {
                  const dateKey = formatDateKey(currentYear, currentMonthIndex, selectedDay);
                  const dayEvents = events[dateKey] || [];
                  if (dayEvents.length > 0) {
                    return (
                      <div className="cal-agenda-list">
                        {dayEvents.map((ev) => (
                          <div 
                            key={ev.id} 
                            className={`cal-agenda-card ${ev.type}`}
                          >
                            <div className="cal-agenda-card-meta">
                              <span className={`cal-agenda-badge ${ev.type}`}>
                                {ev.type}
                              </span>
                              <div className="cal-agenda-time">
                                <Clock size={11} />
                                {ev.time}
                              </div>
                            </div>
                            
                            <h5 className="cal-agenda-title">
                              {ev.title}
                            </h5>
                            
                            <div className="cal-agenda-details">
                              {ev.production && <span>Production: {ev.production}</span>}
                              {ev.agency && <span>Agency: {ev.agency}</span>}
                              {ev.client && <span>Client: {ev.client}</span>}
                              <span className="cal-agenda-location">
                                <MapPin size={10} />
                                {ev.location}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Event button */}
                        <PagesButton className="cal-agenda-add-btn" onClick={handleOpenAddEvent}>
                          <Sparkles size={11} />
                          Add New Event
                        </PagesButton>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="cal-agenda-empty">
                          <span className="cal-agenda-empty-icon">📅</span>
                          <h5 className="cal-agenda-empty-title">No events scheduled</h5>
                          <p className="cal-agenda-empty-desc">Enjoy your free day!</p>
                        </div>
                        
                        <PagesButton className="cal-agenda-add-btn" onClick={handleOpenAddEvent}>
                          <Sparkles size={11} />
                          Add New Event
                        </PagesButton>
                      </div>
                    );
                  }
                })()}
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Add Event Overlay Form Sub-Modal */}
      {showAddEvent && createPortal(
        <div 
          className="cal-add-event-overlay" 
          onClick={(e) => { e.stopPropagation(); setShowAddEvent(false); }}
        >
          <div className="cal-add-event-container" onClick={(e) => { e.stopPropagation(); }}>
            <div className="cal-add-event-header">
              <h4 className="text-[14px] font-black text-slate-800 m-0">Schedule New Event</h4>
              <PagesButton 
                type="button"
                className="cal-add-event-close-btn"
                onClick={() => setShowAddEvent(false)}
              >
                <X size={15} />
              </PagesButton>
            </div>
            
            <form onSubmit={handleAddEventSubmit} className="cal-add-event-form">
              {/* Event Title */}
              <div className="cal-form-group">
                <label className="cal-form-label">Event Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Lead Audition, Photoshoot"
                  className="cal-form-input"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
              </div>

              <div className="cal-form-row">
                {/* Event Date */}
                <div className="cal-form-group flex-1">
                  <label className="cal-form-label">Date</label>
                  <select 
                    className="cal-form-select"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(Number(e.target.value))}
                  >
                    {Array.from({ length: new Date(currentYear, currentMonthIndex + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day} {monthsList[currentMonthIndex]} {currentYear}</option>
                    ))}
                  </select>
                </div>

                {/* Event Type */}
                <div className="cal-form-group flex-1">
                  <label className="cal-form-label">Event Type</label>
                  <select 
                    className="cal-form-select"
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                  >
                    <option value="audition">Audition</option>
                    <option value="booking">Booking</option>
                    <option value="meeting">Briefing</option>
                    <option value="shoot">Shoot</option>
                  </select>
                </div>
              </div>

              <div className="cal-form-row">
                {/* Event Time */}
                <div className="cal-form-group flex-1">
                  <label className="cal-form-label">Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10:00 AM"
                    className="cal-form-input"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                  />
                </div>

                {/* Production/Client Company */}
                <div className="cal-form-group flex-1">
                  <label className="cal-form-label">
                    {newEventType === "audition" ? "Production House" : 
                     newEventType === "booking" ? "Client Name" : 
                     newEventType === "meeting" ? "Briefing Agency" : "Production Unit"}
                  </label>
                  <input 
                    type="text" 
                    placeholder={newEventType === "audition" ? "e.g. Dharma Productions" : "e.g. Zara India"}
                    className="cal-form-input"
                    value={newEventCompany}
                    onChange={(e) => setNewEventCompany(e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="cal-form-group">
                <label className="cal-form-label">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Studio 4, Versova, Mumbai"
                  className="cal-form-input"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="cal-form-actions">
                <PagesButton 
                  type="button" 
                  className="cal-form-btn-cancel"
                  onClick={() => setShowAddEvent(false)}
                >
                  Cancel
                </PagesButton>
                <PagesButton 
                  type="submit" 
                  className="cal-form-btn-submit"
                >
                  Add Event
                </PagesButton>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
