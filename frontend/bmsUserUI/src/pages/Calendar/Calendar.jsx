import { useState, useEffect, useCallback, useMemo } from "react";
import AppLayout from "../Layout/AppLayout.jsx";
import "./calendar.css";
import "./calendar-mobile.css";
import { showSuccess, showError } from "../../shared/utils/alert";

// APIs
import { getMyAvailability, saveAvailabilitySlot } from "../../features/bms/api/availability/availabilityApi";
import { getIncomingBookingRequests, getSentBookingRequests } from "../../features/bms/api/bookings/bookingsApi";

// Components
import CalendarToolbar from "./CalendarToolbar.jsx";
import CalendarGrid from "./CalendarGrid.jsx";
import CalendarLegend from "./CalendarLegend.jsx";
import AgendaList from "./AgendaList.jsx";
import { WeekView, DayView, AgendaView } from "./CalendarViews.jsx";
import MiniCalendar from "./MiniCalendar.jsx";
import UpcomingEvents from "./UpcomingEvents.jsx";
import CalendarSync from "./CalendarSync.jsx";
import AddEventModal from "./AddEventModal.jsx";

function formatTime(val) {
  if (!val) return "";
  if (typeof val === "string") {
    if (val.includes("AM") || val.includes("PM")) return val;
    const parts = val.split(":");
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1].padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12;
      h = h ? h : 12;
      return `${h}:${m} ${ampm}`;
    }
  } else if (Array.isArray(val) && val.length >= 2) {
    let h = val[0];
    const m = String(val[1]).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  }
  return String(val);
}

function formatDateKey(val) {
  if (!val) return "";
  if (typeof val === "string") {
    return val.split("T")[0];
  }
  if (Array.isArray(val) && val.length >= 3) {
    const y = val[0];
    const m = String(val[1]).padStart(2, "0");
    const d = String(val[2]).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val);
}

export default function Calendar() {
  const [currentDate,  setCurrentDate]  = useState(new Date());
  const [viewMode,     setViewMode]     = useState("Month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [rawAvailability, setRawAvailability] = useState([]);
  const [rawBookings, setRawBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live availability slots and confirmed bookings from database
  const loadCalendarData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availData, incBookings, sentBookings] = await Promise.all([
        getMyAvailability(),
        getIncomingBookingRequests(),
        getSentBookingRequests()
      ]);

      setRawAvailability(Array.isArray(availData) ? availData : []);

      // Filter only confirmed/accepted bookings for the calendar
      const allConfirmed = [...(incBookings || []), ...(sentBookings || [])].filter(
        (b) => b && b.status === "ACCEPTED" && b.bookingDate
      );
      setRawBookings(allConfirmed);
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Combine availability slots and confirmed bookings into unified calendar events
  const events = useMemo(() => {
    const availEvents = (rawAvailability || []).map((slot) => {
      let title = "Available Slot";
      let category = slot.status === "BOOKED" ? "shooting" : "personal";
      let location = "";

      if (slot.description) {
        try {
          const parsed = JSON.parse(slot.description);
          if (parsed && typeof parsed === "object") {
            title = parsed.title || title;
            category = parsed.category || category;
            location = parsed.location || "";
          } else {
            title = slot.description;
          }
        } catch {
          title = slot.description;
        }
      }

      return {
        id: `avail-${slot.id}`,
        dbId: slot.id,
        date: formatDateKey(slot.availabilityDate),
        title,
        category: (category || "personal").toLowerCase(),
        time: formatTime(slot.startTime) || "09:00 AM",
        endTime: formatTime(slot.endTime) || "06:00 PM",
        location: location || "Studio",
        isAvailability: true,
        rawSlot: slot,
      };
    });

    const bookingEvents = (rawBookings || []).map((req) => {
      const category = (req.projectType || "Shooting").toLowerCase().includes("audition")
        ? "audition"
        : (req.projectType || "Shooting").toLowerCase().includes("meet")
        ? "meeting"
        : "shooting";

      return {
        id: `booking-${req.id}`,
        dbId: req.id,
        date: formatDateKey(req.bookingDate),
        title: req.projectTitle || "Shoot Booking",
        category,
        time: "09:00 AM",
        endTime: "06:00 PM",
        location: req.location || "Mumbai, India",
        sub: `${req.projectType || "Shoot"} – ${req.professionalCompany || req.professionalName || req.talentName || "Confirmed"}`,
        isBooking: true,
        rawBooking: req,
      };
    });

    return [...availEvents, ...bookingEvents];
  }, [rawAvailability, rawBookings]);

  // Handle scheduling a new event into the database
  const handleAddEventSubmit = async (evt) => {
    try {
      const payload = {
        availabilityDate: evt.date,
        status: evt.category?.toLowerCase() === "shooting" ? "BOOKED" : "AVAILABLE",
        description: JSON.stringify({
          title: evt.title,
          category: evt.category?.toLowerCase() || "shooting",
          location: evt.location || "",
          notes: evt.notes || "",
        }),
        startTime: evt.startTime ? (evt.startTime.length === 5 ? `${evt.startTime}:00` : evt.startTime) : null,
        endTime: evt.endTime ? (evt.endTime.length === 5 ? `${evt.endTime}:00` : evt.endTime) : null,
      };

      await saveAvailabilitySlot(payload);
      showSuccess("Event Scheduled! 📅", `"${evt.title}" has been saved to your schedule in the database.`);
      setShowAddModal(false);
      await loadCalendarData();
    } catch (err) {
      showError("Schedule Failed", err.message || "Failed to save event to database.");
    }
  };

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

  const handleDayClick   = (cell) => setCurrentDate(new Date(cell.year, cell.month, cell.day));
  const handleMiniDate   = (date) => setCurrentDate(date);
  const handlePickerDate = (date) => setCurrentDate(date);

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
                events={events}
              />
              <CalendarLegend />
              <AgendaList 
                selectedCategory={selectedCategory} 
                events={events} 
              />
            </>
          )}

          {viewMode === "Week" && (
            <WeekView
              currentDate={currentDate}
              onAddEvent={() => setShowAddModal(true)}
              selectedCategory={selectedCategory}
              events={events}
            />
          )}

          {viewMode === "Day" && (
            <DayView 
              currentDate={currentDate} 
              selectedCategory={selectedCategory} 
              events={events} 
            />
          )}

          {viewMode === "Agenda" && (
            <AgendaView 
              currentDate={currentDate} 
              selectedCategory={selectedCategory} 
              events={events} 
            />
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="cal-sidebar">
          <MiniCalendar 
            syncDate={currentDate} 
            onDateClick={handleMiniDate} 
            events={events} 
          />
          <UpcomingEvents events={events} />
          <CalendarSync />
        </div>
      </div>

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEventSubmit}
        />
      )}
    </AppLayout>
  );
}
