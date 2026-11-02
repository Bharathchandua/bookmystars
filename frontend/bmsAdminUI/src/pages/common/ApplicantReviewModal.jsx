import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  Calendar,
  IndianRupee,
  MessageSquare,
  Sparkles,
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { Modal, Button, Badge, Spinner, EmptyState } from "../../shared/common";
import { applicationsApi } from "../../features/bms/api/applications/applicationsApi";
import { showSuccess, showError } from "../../shared/utils/alert";

const BACKEND_URL = "http://localhost:8080";

function resolvePhoto(url) {
  if (!url) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BACKEND_URL}${url}`;
  return `${BACKEND_URL}/${url}`;
}

export default function ApplicantReviewModal({
  isOpen,
  onClose,
  briefId,
  briefTitle,
  theme = "pink"
}) {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !briefId) return;
    let isMounted = true;

    async function fetchApplicants() {
      setIsLoading(true);
      try {
        const data = await applicationsApi.getApplicantsForBrief(briefId);
        if (isMounted) {
          setApplicants(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load applicants for brief:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchApplicants();
    return () => { isMounted = false; };
  }, [isOpen, briefId]);

  const handleStatusChange = async (appId, newStatus, applicantName) => {
    setUpdatingId(appId);
    try {
      await applicationsApi.updateApplicationStatus(appId, newStatus);
      setApplicants(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      );
      showSuccess(
        "Candidate Status Updated",
        `${applicantName || "Candidate"} has been marked as ${newStatus}.`
      );
    } catch (err) {
      console.error("Failed to update applicant status:", err);
      showError("Status Update Failed", err.message || "Failed to update candidate status on server.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  const isPink = theme === "pink";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users size={18} className={isPink ? "text-pink-600" : "text-purple-600"} />
          <span>Candidate Applicants ({applicants.length})</span>
        </div>
      }
      subtitle={
        <p className="text-xs text-slate-500 m-0 mt-0.5">
          Audition responses and proposed quotes for: <strong className="text-slate-800">{briefTitle}</strong>
        </p>
      }
      size="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {isLoading && (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" color={isPink ? "pink" : "purple"} text="Loading candidate profiles from database..." />
          </div>
        )}

        {!isLoading && applicants.length === 0 && (
          <EmptyState
            title="No Applicants Yet"
            description="No talents or models have applied to this requirement yet. Responses will appear here in real-time as talents submit their lookbooks and rate proposals."
            action={
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            }
          />
        )}

        {!isLoading && applicants.length > 0 && (
          <div className="space-y-3">
            {applicants.map((app) => {
              const statusStr = (app.status || "APPLIED").toUpperCase();
              const isShortlisted = statusStr === "SHORTLISTED";
              const isSelected = statusStr === "SELECTED";
              const isRejected = statusStr === "REJECTED";

              return (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-slate-200 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolvePhoto(app.applicantPhoto)}
                        alt={app.applicantName || "Applicant"}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 m-0">
                            {app.applicantName || `Candidate #${app.applicantId}`}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isShortlisted
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : isRejected
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {statusStr}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          {app.applicantLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-slate-400" />
                              {app.applicantLocation}
                            </span>
                          )}
                          {app.applicantDayRate && (
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <IndianRupee size={11} className="text-slate-400" />
                              Rate: {app.applicantDayRate}
                            </span>
                          )}
                          {app.proposedRate && (
                            <span className="font-bold text-pink-600">
                              Quote: ₹{Number(app.proposedRate).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        disabled={updatingId === app.id || isShortlisted}
                        onClick={() => handleStatusChange(app.id, "SHORTLISTED", app.applicantName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isShortlisted
                            ? "bg-purple-100 text-purple-800 border border-purple-300"
                            : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                        }`}
                      >
                        Shortlist
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === app.id || isSelected}
                        onClick={() => handleStatusChange(app.id, "SELECTED", app.applicantName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        Select
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === app.id || isRejected}
                        onClick={() => handleStatusChange(app.id, "REJECTED", app.applicantName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isRejected
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        }`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  {app.coverNote && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                      "{app.coverNote}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
        <Button variant="secondary" size="md" onClick={onClose}>
          Done Reviewing
        </Button>
      </div>
    </Modal>
  );
}
