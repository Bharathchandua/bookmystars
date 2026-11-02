import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { X } from "lucide-react";

const CATEGORIES = ["Audition","Shooting","Meeting","Training","Casting","Personal","Other"];

export default function AddEventModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    category: "Meeting",
    location: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    onAdd && onAdd(form);
    onClose();
  };

  return (
    <div className="cal-modal-backdrop" onClick={onClose}>
      <div className="cal-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="cal-modal-header">
          <h2 className="cal-modal-title">Add New Event</h2>
          <PagesButton className="cal-modal-close" onClick={onClose}>
            <X size={15} />
          </PagesButton>
        </div>

        {/* Modal Body */}
        <form className="cal-modal-body" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="cal-form-group">
            <label className="cal-form-label">Event Title *</label>
            <input
              className="cal-form-input"
              type="text"
              placeholder="e.g. Brand Photoshoot"
              value={form.title}
              onChange={e => handleChange("title", e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <div className="cal-form-group">
            <label className="cal-form-label">Date *</label>
            <input
              className="cal-form-input"
              type="date"
              value={form.date}
              onChange={e => handleChange("date", e.target.value)}
              required
            />
          </div>

          {/* Time Row */}
          <div className="cal-form-row">
            <div className="cal-form-group">
              <label className="cal-form-label">Start Time</label>
              <input
                className="cal-form-input"
                type="time"
                value={form.startTime}
                onChange={e => handleChange("startTime", e.target.value)}
              />
            </div>
            <div className="cal-form-group">
              <label className="cal-form-label">End Time</label>
              <input
                className="cal-form-input"
                type="time"
                value={form.endTime}
                onChange={e => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="cal-form-group">
            <label className="cal-form-label">Category</label>
            <select
              className="cal-form-select"
              value={form.category}
              onChange={e => handleChange("category", e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="cal-form-group">
            <label className="cal-form-label">Location</label>
            <input
              className="cal-form-input"
              type="text"
              placeholder="e.g. Studio 7, Bandra"
              value={form.location}
              onChange={e => handleChange("location", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="cal-form-group">
            <label className="cal-form-label">Notes</label>
            <textarea
              className="cal-form-textarea"
              rows={3}
              placeholder="Additional notes..."
              value={form.notes}
              onChange={e => handleChange("notes", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          <PagesButton type="submit" className="cal-form-submit">
            Add Event
          </PagesButton>
        </form>
      </div>
    </div>
  );
}
