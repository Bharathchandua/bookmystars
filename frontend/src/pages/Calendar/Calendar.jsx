import { useState } from "react";
import AppLayout from "../Layout/AppLayout.jsx";
import "./calendar.css";
import "./calendar-mobile.css";


// Components
import CalendarToolbar          from "./CalendarToolbar.jsx";
import CalendarGrid             from "./CalendarGrid.jsx";
import CalendarLegend           from "./CalendarLegend.jsx";
import AgendaList               from "./AgendaList.jsx";
import { WeekView, DayView, AgendaView } from "./CalendarViews.jsx";
import MiniCalendar             from "./MiniCalendar.jsx";
import UpcomingEvents           from "./UpcomingEvents.jsx";
import CalendarSync             from "./CalendarSync.jsx";
import AddEventModal            from "./AddEventModal.jsx";

export default function Calendar() {
  const [currentDate,  setCurrentDate]  = useState(new Date(2024, 4, 20)); // May 2024
  const [viewMode,     setViewMode]     = useState("Month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  /* Navigation — step depends on current view */
  const goToPrev = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if      (viewMode === "Month")  d.setMonth(d.getMonth() - 1);
      else if (viewMode === "Week")   d.setDate(d.getDate() - 7);
      else                            d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const goToNext = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if      (viewMode === "Month")  d.setMonth(d.getMonth() + 1);
      else if (viewMode === "Week")   d.setDate(d.getDate() + 7);
      else                            d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick    = (cell) => setCurrentDate(new Date(cell.year, cell.month, cell.day));
  const handleMiniDate    = (date) => setCurrentDate(date);
  const handlePickerDate  = (date) => setCurrentDate(date);

  return (
    <AppLayout
      pageTitle="Calendar"
      subTitle="Manage your schedule, bookings, and events."
      searchPlaceholder="Search events..."
      showMessages={true}
    >
      <div className="cal-page">

        {/* ── Left Main Column ── */}
        <div className="cal-main">
          <CalendarToolbar
            viewMode={viewMode}
            setViewMode={setViewMode}
            currentDate={currentDate}
            onPrev={goToPrev}
            onNext={goToNext}
            onToday={goToToday}
            onAddEvent={() => setShowAddModal(true)}
            onDateChange={handlePickerDate}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* ── View switcher ── */}
          {viewMode === "Month" && (
            <>
              <CalendarGrid
                currentDate={currentDate}
                onDayClick={handleDayClick}
                selectedCategory={selectedCategory}
              />
              <CalendarLegend />
              <AgendaList selectedCategory={selectedCategory} />
            </>
          )}

          {viewMode === "Week" && (
            <WeekView
              currentDate={currentDate}
              onAddEvent={() => setShowAddModal(true)}
              selectedCategory={selectedCategory}
            />
          )}

          {viewMode === "Day" && (
            <DayView currentDate={currentDate} selectedCategory={selectedCategory} />
          )}

          {viewMode === "Agenda" && (
            <AgendaView currentDate={currentDate} selectedCategory={selectedCategory} />
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="cal-sidebar">
          <MiniCalendar syncDate={currentDate} onDateClick={handleMiniDate} />
          <UpcomingEvents />
          <CalendarSync />
        </div>
      </div>

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onAdd={(evt) => { console.log("New event:", evt); setShowAddModal(false); }}
        />
      )}
    </AppLayout>
  );
}
