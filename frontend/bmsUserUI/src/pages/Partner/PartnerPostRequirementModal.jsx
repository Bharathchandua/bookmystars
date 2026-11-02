import React, { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  Camera,
  Video,
  Upload,
  Trash2,
  CheckCircle2
} from "lucide-react";
import {
  Modal,
  InputField,
  SelectField,
  TextArea,
  Checkbox,
  Button
} from "../../shared/common";
import { showSuccess, showWarning, showError } from "../../shared/utils/alert";
import { uploadOpportunityMedia } from "../../features/bms/api/opportunities/opportunitiesApi";
import { BACKEND_SERVER_URL } from "../../shared/services/BaseUrl";
import { getPartnerCustomFields } from "../../shared/utils/customFieldsConfig";
import { getStoredUser } from "../../features/bms/api/auth/authApi";

const PARTNER_CATEGORY_DEFAULTS = {
  "Dance Academy": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
  "Acting School": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
  "Modeling Institute": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
  "Music Academy": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
};

const CATEGORY_OPTIONS = [
  "Dance Academy",
  "Acting School",
  "Modeling Institute",
  "Music Academy"
];

export default function PartnerPostRequirementModal({
  isOpen,
  onClose,
  onSubmitRequirement,
  onUpdateRequirement,
  editRequirement = null
}) {
  const fileInputRef = useRef(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic custom fields configured by Partner Admin (scoped to current academy or global)
  const currentEntityId = getStoredUser()?.id || "global";
  const [customFields, setCustomFields] = useState(() => getPartnerCustomFields(currentEntityId).filter(f => f.enabled));
  const [customFieldValues, setCustomFieldValues] = useState(() => {
    const init = {};
    getPartnerCustomFields(currentEntityId).forEach(f => {
      init[f.key] = f.defaultValue !== undefined ? f.defaultValue : "";
    });
    return init;
  });

  const [formData, setFormData] = useState({
    title: "Diwali Dance Troupe Auditions • Festive Classical & Contemporary",
    category: "Dance Academy",
    batch: "Festive Stage Production & Ad Troupe Batch",
    positionsNeeded: 12,
    auditionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "Bengaluru (Rajajinagar Main Studio)",
    description: "Calling trained dancers with minimum 2 years of classical or contemporary experience. Selected artists will train under Guru Radhika and perform on upcoming television festival shoots and live theatre productions. Full costume and performance stipend provided."
  });

  // Sync form when editing or resetting
  useEffect(() => {
    if (editRequirement) {
      setFormData({
        title: editRequirement.title || "",
        category: editRequirement.category || "Dance Academy",
        batch: editRequirement.batch || "Immediate Audition Requirement",
        positionsNeeded: editRequirement.positionsNeeded || 1,
        auditionDate: editRequirement.auditionDate || (editRequirement.deadline ? editRequirement.deadline.replace("Applications open till ", "") : new Date().toISOString().split("T")[0]),
        location: editRequirement.location || "Bengaluru",
        description: editRequirement.description || ""
      });
      setMediaPreview(editRequirement.image || editRequirement.mediaUrl || "");
      setMediaType(editRequirement.mediaType || "image");
      if (editRequirement.customFields) {
        setCustomFieldValues(editRequirement.customFields);
      }
    } else {
      setFormData({
        title: "Diwali Dance Troupe Auditions • Festive Classical & Contemporary",
        category: "Dance Academy",
        batch: "Festive Stage Production & Ad Troupe Batch",
        positionsNeeded: 12,
        auditionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        location: "Bengaluru (Rajajinagar Main Studio)",
        description: "Calling trained dancers with minimum 2 years of classical or contemporary experience. Selected artists will train under Guru Radhika and perform on upcoming television festival shoots and live theatre productions. Full costume and performance stipend provided."
      });
      setMediaPreview("");
      setMediaType("image");
    }
    setMediaFile(null);
  }, [isOpen, editRequirement]);

  useEffect(() => {
    const syncFields = (e) => {
      const targetEntity = e?.detail?.entityId || "global";
      if (targetEntity === currentEntityId || targetEntity === "global") {
        const active = getPartnerCustomFields(currentEntityId).filter(f => f.enabled);
        setCustomFields(active);
      }
    };
    window.addEventListener("bms_partner_fields_updated", syncFields);
    return () => window.removeEventListener("bms_partner_fields_updated", syncFields);
  }, [currentEntityId]);

  const handleCustomChange = (key, value) => {
    setCustomFieldValues(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo ? 60 * 1024 * 1024 : 15 * 1024 * 1024;
      if (file.size > maxSize) {
        showWarning("File Too Large", isVideo ? "Video file must be smaller than 60MB." : "Image must be smaller than 15MB.");
        return;
      }
      setMediaFile(file);
      setMediaType(isVideo ? "video" : "image");
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMediaPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview("");
    setMediaType("image");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsUploading(true);
    let finalMediaUrl = mediaPreview;

    if (mediaFile) {
      try {
        const uploadRes = await uploadOpportunityMedia(mediaFile);
        if (uploadRes && uploadRes.fileUrl) {
          finalMediaUrl = uploadRes.fileUrl.startsWith("http")
            ? uploadRes.fileUrl
            : `${BACKEND_SERVER_URL}${uploadRes.fileUrl.startsWith("/") ? "" : "/"}${uploadRes.fileUrl}`;
        }
      } catch (err) {
        console.warn("Backend media upload failed, retaining preview:", err);
      }
    }

    if (!finalMediaUrl) {
      finalMediaUrl = PARTNER_CATEGORY_DEFAULTS[formData.category] || PARTNER_CATEGORY_DEFAULTS["Dance Academy"];
    }

    const newReq = {
      id: Date.now(),
      title: formData.title.trim(),
      category: formData.category,
      batch: formData.batch.trim() || "Immediate Audition Requirement",
      positionsNeeded: Number(formData.positionsNeeded) || 1,
      description: formData.description.trim(),
      auditionDate: formData.auditionDate,
      deadline: `Applications open till ${formData.auditionDate}`,
      location: formData.location,
      status: "Active & Promoted",
      image: finalMediaUrl,
      mediaUrl: finalMediaUrl,
      mediaType: mediaType,
      videoUrl: mediaType === "video" ? finalMediaUrl : null,
      customFields: customFieldValues,
      impressions: 0,
      clicks: 0,
      applicationsCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setIsUploading(false);

    if (editRequirement && onUpdateRequirement) {
      onUpdateRequirement(editRequirement.id, {
        ...editRequirement,
        ...newReq,
        id: editRequirement.id
      });
      showSuccess(
        "Audition Requirement Updated",
        `Your audition requirement for "${formData.title}" has been updated successfully.`
      );
    } else if (onSubmitRequirement) {
      onSubmitRequirement(newReq);
      showSuccess(
        "Audition Requirement Published",
        `Your audition requirement for "${formData.title}" has been published and queued for BookMyStars talent promotion!`
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editRequirement ? "Edit Audition Requirement" : "Post Academy Talent / Audition Requirement"}
      badge={editRequirement ? "Edit Requirement" : "Partner Audition"}
      subtitle={editRequirement ? "Update details, requirements, audition dates, or media for this batch." : "Broadcast new batch auditions, student scouting calls, or stage productions."}
      icon={<GraduationCap size={22} />}
      theme="purple"
      size="xl"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Requirement Title */}
        <InputField
          label="Requirement / Audition Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          theme="purple"
        />

        {/* Category & Batch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={CATEGORY_OPTIONS}
            required
            theme="purple"
          />

          <InputField
            label="Batch / Production Name"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            placeholder="e.g. Autumn Film Acting Batch"
            required
            theme="purple"
          />
        </div>

        {/* Positions, Date, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField
            type="number"
            min="1"
            max="100"
            label="Seats / Positions Needed"
            name="positionsNeeded"
            value={formData.positionsNeeded}
            onChange={handleChange}
            theme="purple"
          />

          <InputField
            type="date"
            label="Audition / Intake Date"
            name="auditionDate"
            value={formData.auditionDate}
            onChange={handleChange}
            required
            theme="purple"
          />

          <InputField
            label="Studio Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Mumbai (Andheri West Studio)"
            required
            theme="purple"
          />
        </div>

        {/* Campaign Visual Reference: Photo or Video Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {mediaType === "video" ? (
                <Video size={14} className="text-purple-600" />
              ) : (
                <Camera size={14} className="text-purple-600" />
              )}
              <span>Audition Poster / Routine Video (Photo or Video)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Upload image (JPG, PNG) or routine video (MP4, WebM)
            </span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaSelect}
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
          />

          {mediaPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-52 group">
              {mediaType === "video" ? (
                <video
                  src={mediaPreview}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Audition poster preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-white/95 text-slate-900 text-[11px] font-bold hover:bg-white flex items-center gap-1 shadow-md cursor-pointer transition backdrop-blur-xs"
                >
                  <Upload size={12} /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 flex items-center gap-1 shadow-md cursor-pointer transition"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
              <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-10">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>{mediaType === "video" ? "🎥 Routine Video Attached" : "📷 Audition Poster Attached"}</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-5 text-center cursor-pointer hover:bg-purple-50/20 transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={18} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video size={18} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 m-0">
                  Click to upload audition poster or choreography / routine video
                </p>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                  Supports high-res Photo (up to 15MB) or Video MP4 / WebM (up to 60MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Admin-Configured Academy Specifications */}
        {customFields.length > 0 && (
          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-700">
              <Sparkles size={13} />
              <span>Audition Specifications (Configured by Partner Desk)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {customFields.map((field) => (
                <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  {field.type === "select" ? (
                    <SelectField
                      label={field.label}
                      value={customFieldValues[field.key] || ""}
                      onChange={(e) => handleCustomChange(field.key, e.target.value)}
                      options={field.options || []}
                      placeholder={field.placeholder || "Select option..."}
                      required={field.required}
                      helperText={field.helpText}
                      theme="purple"
                    />
                  ) : field.type === "checkbox" ? (
                    <Checkbox
                      checked={Boolean(customFieldValues[field.key])}
                      onChange={(e) => handleCustomChange(field.key, e.target.checked)}
                      label={field.label}
                      description={field.helpText}
                      theme="purple"
                    />
                  ) : field.type === "textarea" ? (
                    <TextArea
                      rows={2}
                      label={field.label}
                      value={customFieldValues[field.key] || ""}
                      onChange={(e) => handleCustomChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      helperText={field.helpText}
                      theme="purple"
                    />
                  ) : (
                    <InputField
                      type={field.type}
                      label={field.label}
                      value={customFieldValues[field.key] || ""}
                      onChange={(e) => handleCustomChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      helperText={field.helpText}
                      theme="purple"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description & Audition Criteria */}
        <TextArea
          rows={4}
          label="Description & Audition Criteria"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          theme="purple"
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary-purple"
            size="md"
            loading={isUploading}
            icon={<Sparkles size={14} />}
          >
            {editRequirement ? "Save Changes" : "Publish Requirement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
