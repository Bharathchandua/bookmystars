import React from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { showWarning } from "../../shared/utils/alert";

export default function MediaModerationBadge({ status, rejectionReason }) {
  const normStatus = (status || "APPROVED").toUpperCase();

  if (normStatus === "PENDING") {
    return (
      <span
        title="Under Admin review. Once approved, this media will be visible on your public profile and in client searches."
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "rgba(245, 158, 11, 0.95)",
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700",
          padding: "3px 8px",
          borderRadius: "20px",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
          cursor: "help"
        }}
      >
        <Clock size={11} /> In Review
      </span>
    );
  }

  if (normStatus === "REJECTED") {
    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          showWarning(
            "Curation Feedback Note",
            rejectionReason || "This media item did not meet platform guidelines. Please upload a replacement."
          );
        }}
        title={`Rejected by curation desk: ${rejectionReason || "Click to inspect feedback"}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "rgba(239, 68, 68, 0.95)",
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700",
          padding: "3px 8px",
          borderRadius: "20px",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
          cursor: "pointer"
        }}
      >
        <AlertCircle size={11} /> Changes Needed
      </span>
    );
  }

  return (
    <span
      title="Live and verified on your public profile"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "rgba(16, 185, 129, 0.95)",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "20px",
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
      }}
    >
      <CheckCircle size={11} /> Live
    </span>
  );
}
