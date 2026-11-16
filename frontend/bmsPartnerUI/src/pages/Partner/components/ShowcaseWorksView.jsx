import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Image,
  Video,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Upload,
  X,
  ExternalLink,
  Film,
  Camera,
  RefreshCw
} from "lucide-react";
import {
  getMyShowcaseItems,
  uploadShowcaseMedia,
  createShowcaseItem,
  deleteMyShowcaseItem
} from "../../../features/bms/api/showcase/showcaseApi";
import { showSuccess, showError, confirmDelete } from "../../../shared/utils/alert";
import { onLiveSync, emitLiveSync } from "../../../utils/liveSync";

export default function ShowcaseWorksView({ entityType = "CLIENT" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState("ALL"); // ALL | APPROVED | PENDING | REJECTED
  const [activeTypeFilter, setActiveTypeFilter] = useState("ALL"); // ALL | PHOTO | VIDEO

  // Modal State for Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadMediaType, setUploadMediaType] = useState("PHOTO"); // PHOTO | VIDEO
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox / Video Player Modal State
  const [activeMediaItem, setActiveMediaItem] = useState(null);

  // Fetch showcase items
  const loadShowcaseItems = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }
    try {
      const data = await getMyShowcaseItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load showcase items:", err);
      if (showSpinner) {
        setItems([]);
      }
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadShowcaseItems(true);

    const unsub = onLiveSync(
      ["showcase_reviewed", "showcase_updated", "showcase_created", "bms_live_sync"],
      () => {
        loadShowcaseItems(false);
      },
      { pollIntervalMs: 5000, triggerOnFocus: true }
    );

    return () => unsub();
  }, []);

  // Handle File selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect media type automatically
    if (file.type.startsWith("video/")) {
      setUploadMediaType("VIDEO");
    } else if (file.type.startsWith("image/")) {
      setUploadMediaType("PHOTO");
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadTitle("");
    setUploadDesc("");
    setUploadMediaType("PHOTO");
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  // Submit showcase work
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showError("File Required", "Please select a photo or video to upload.");
      return;
    }
    if (!uploadTitle.trim()) {
      showError("Title Required", "Please enter a descriptive title for this showcase work.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload physical file to backend
      const uploadRes = await uploadShowcaseMedia(selectedFile, uploadMediaType);
      const mediaUrl = uploadRes?.url;

      if (!mediaUrl) {
        throw new Error("Server did not return a valid media URL.");
      }

      // 2. Submit showcase metadata (enters PENDING)
      const created = await createShowcaseItem({
        title: uploadTitle.trim(),
        description: uploadDesc.trim(),
        mediaType: uploadMediaType,
        mediaUrl: mediaUrl,
        thumbnailUrl: uploadMediaType === "PHOTO" ? mediaUrl : null
      });

      emitLiveSync("showcase_created", { id: created?.id, entityType: "PARTNER" });

      showSuccess(
        "Submission Received!",
        "Your showcase work has been uploaded and queued for BMS Admin approval. It will go live once verified."
      );

      handleCloseModal();
      loadShowcaseItems();
    } catch (err) {
      console.error("Showcase upload failed:", err);
      showError("Upload Failed", err.response?.data?.message || err.message || "Failed to submit showcase work.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete own showcase work
  const handleDeleteItem = async (e, item) => {
    e.stopPropagation();
    const confirmed = await confirmDelete(
      "Delete Showcase Work?",
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteMyShowcaseItem(item.id);
      showSuccess("Deleted", `"${item.title}" has been removed.`);
      emitLiveSync("showcase_updated", { id: item.id, action: "DELETED", entityType: "PARTNER" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      showError("Delete Failed", err.message || "Could not delete showcase item.");
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesStatus =
      activeStatusFilter === "ALL" ||
      (activeStatusFilter === "APPROVED" && item.status === "APPROVED") ||
      (activeStatusFilter === "PENDING" && (item.status === "PENDING" || !item.status)) ||
      (activeStatusFilter === "REJECTED" && item.status === "REJECTED");

    const matchesType =
      activeTypeFilter === "ALL" || item.mediaType === activeTypeFilter;

    return matchesStatus && matchesType;
  });

  const approvedCount = items.filter((i) => i.status === "APPROVED").length;
  const pendingCount = items.filter((i) => i.status === "PENDING" || !i.status).length;
  const rejectedCount = items.filter((i) => i.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold tracking-wide">
              <Sparkles size={14} className="text-pink-400" />
              <span>Production Portfolio & Works</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Showcase Works & Commercials
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload your brand's editorial photo campaigns, commercial TV ads, and academy showreels.
              Once vetted and approved by BookMyStars Admin, they appear on your public company dossier
              for auditioning artists and talent scouts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadShowcaseItems}
              title="Refresh Portfolio"
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={18} />
              <span>Upload New Work</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Status Filters & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "All Works", count: items.length },
            { id: "APPROVED", label: "Live on Profile", count: approvedCount, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { id: "PENDING", label: "Under Admin Review", count: pendingCount, color: "text-amber-700 bg-amber-50 border-amber-200" },
            { id: "REJECTED", label: "Needs Revision", count: rejectedCount, color: "text-rose-700 bg-rose-50 border-rose-200" }
          ].map((tab) => {
            const isActive = activeStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : tab.color || "bg-slate-100 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Media Type Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          {[
            { id: "ALL", label: "All" },
            { id: "PHOTO", label: "Photos", icon: Image },
            { id: "VIDEO", label: "Videos", icon: Video }
          ].map((t) => {
            const Icon = t.icon;
            const isSel = activeTypeFilter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTypeFilter(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {Icon && <Icon size={13} />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Media Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw size={28} className="animate-spin text-pink-500" />
          <p className="text-sm font-semibold">Loading your showcase works...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">
            {activeStatusFilter === "ALL"
              ? "No Showcase Works Uploaded Yet"
              : `No Showcase Works with status "${activeStatusFilter}"`}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Upload your high-res photos, advertisements, and video reels to display your
            brand portfolio to talents and artists scouting your opportunities.
          </p>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>Upload First Work</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isVideo = item.mediaType === "VIDEO";
            const isApproved = item.status === "APPROVED";
            const isRejected = item.status === "REJECTED";
            const isPending = !isApproved && !isRejected;

            return (
              <div
                key={item.id}
                onClick={() => setActiveMediaItem(item)}
                className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Media Preview Container */}
                <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <video
                        src={item.mediaUrl}
                        preload="metadata"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={22} className="ml-1 fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    {/* Media Type Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                      {isVideo ? <Film size={11} className="text-pink-400" /> : <Camera size={11} className="text-purple-400" />}
                      <span>{isVideo ? "Video Reel" : "Photo"}</span>
                    </span>

                    {/* Status Badge */}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 size={11} />
                        <span>Live on Profile</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500 text-white shadow-xs animate-pulse">
                        <Clock size={11} />
                        <span>Under Review</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-600 text-white shadow-xs">
                        <XCircle size={11} />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay (Delete) */}
                  <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(e, item)}
                      title="Delete showcase work"
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-pink-600 transition-colors">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Rejection Feedback Box if Rejected */}
                  {isRejected && item.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-rose-800">
                      <div className="font-bold flex items-center gap-1 text-rose-900 mb-0.5">
                        <AlertCircle size={12} />
                        <span>Admin Feedback:</span>
                      </div>
                      <p className="line-clamp-2">{item.rejectionReason}</p>
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {item.createdAt ? String(item.createdAt).split("T")[0] : "Recently"}
                    </span>
                    <span className="font-semibold text-slate-600 group-hover:text-pink-600 flex items-center gap-1">
                      <Eye size={12} />
                      <span>Preview</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base">Upload Showcase Work</h3>
                  <p className="text-xs text-slate-300">Share your campaigns and commercial reels</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Media Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Media Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMediaType("PHOTO")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      uploadMediaType === "PHOTO"
                        ? "bg-pink-50 border-pink-500 text-pink-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Camera size={15} />
                    <span>Photo Campaign</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMediaType("VIDEO")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      uploadMediaType === "VIDEO"
                        ? "bg-purple-50 border-purple-500 text-purple-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Film size={15} />
                    <span>Commercial / Reel</span>
                  </button>
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select {uploadMediaType === "PHOTO" ? "Image (JPG, PNG, WEBP)" : "Video File (MP4, WEBM, MOV)"}
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-pink-500 rounded-2xl p-5 text-center transition-colors cursor-pointer bg-slate-50/50 relative">
                  <input
                    type="file"
                    accept={uploadMediaType === "PHOTO" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime"}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {previewUrl ? (
                    <div className="space-y-2">
                      {uploadMediaType === "VIDEO" ? (
                        <video src={previewUrl} controls className="max-h-48 rounded-xl mx-auto" />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="max-h-48 rounded-xl mx-auto object-cover" />
                      )}
                      <p className="text-xs font-bold text-slate-700">{selectedFile?.name}</p>
                      <span className="text-[11px] text-pink-600 font-semibold underline">Click to change file</span>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        Drag and drop or <span className="text-pink-600 underline">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {uploadMediaType === "PHOTO" ? "High resolution images up to 50MB" : "Crisp video reels up to 100MB"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Title <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Wedding Jewelry Ad 2026 or Contemporary Dance Recital"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campaign Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context, directors, credits, or production scale..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Moderation Notice Callout */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2.5">
                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Admin Quality Review:</strong> To safeguard brand authenticity, your work will be reviewed by the BookMyStars Admin desk before going live on your public company dossier.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Uploading to Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Submit for Approval</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Lightbox / Fullscreen Media Player Modal */}
      {activeMediaItem && (
        <div
          onClick={() => setActiveMediaItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveMediaItem(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-pink-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Media Content */}
            <div className="flex items-center justify-center bg-black min-h-[300px] max-h-[75vh]">
              {activeMediaItem.mediaType === "VIDEO" ? (
                <video
                  src={activeMediaItem.mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[75vh] object-contain"
                />
              ) : (
                <img
                  src={activeMediaItem.mediaUrl}
                  alt={activeMediaItem.title}
                  className="w-full max-h-[75vh] object-contain"
                />
              )}
            </div>

            {/* Info Footer */}
            <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-pink-400">
                    {activeMediaItem.mediaType === "VIDEO" ? "Video Reel" : "Photography"}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeMediaItem.status === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : activeMediaItem.status === "REJECTED"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {activeMediaItem.status === "APPROVED"
                      ? "Live on Profile"
                      : activeMediaItem.status === "REJECTED"
                      ? "Rejected"
                      : "Under Admin Review"}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{activeMediaItem.title}</h3>
                {activeMediaItem.description && (
                  <p className="text-xs text-slate-400">{activeMediaItem.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    handleDeleteItem(e, activeMediaItem);
                    setActiveMediaItem(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Work</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
