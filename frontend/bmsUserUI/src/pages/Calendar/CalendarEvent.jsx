export default function CalendarEvent({ event, compact = false }) {
  return (
    <div
      className={`cal-event-chip ${event.category}`}
      title={`${event.title} – ${event.time}`}
    >
      <span className={`cal-event-dot ${event.category}`} />
      <span className="cal-event-title">{event.title}</span>
      {event.time && !compact && (
        <span className="cal-event-time">{event.time}</span>
      )}
    </div>
  );
}
