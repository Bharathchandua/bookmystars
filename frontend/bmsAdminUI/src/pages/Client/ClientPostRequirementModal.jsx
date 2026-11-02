import React, { useState, useRef, useEffect } from "react";
import {
  Megaphone,
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
import { getClientCustomFields } from "../../shared/utils/customFieldsConfig";
import { getStoredUser } from "../../features/bms/api/auth/authApi";

const INDUSTRY_DEFAULTS = {
  "Jewelry & Luxury": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
  "Fashion & Apparel": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
  "Cosmetics & Beauty": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
  "Film & OTT Production": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
  "Commercial Advertising": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
  "Corporate & Tech": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
};

const INDUSTRY_OPTIONS = [
  "Jewelry & Luxury",
  "Fashion & Apparel",
  "Cosmetics & Beauty",
  "Film & OTT Production",
  "Commercial Advertising",
  "Corporate & Tech"
];

const DURATION_OPTIONS = [
  "1 Day Shoot",
  "2 Days Shoot",
  "3 Days Shoot",
  "4-5 Days Shoot",
  "1 Week Campaign",
  "Multi-Week Project"
];

export default function ClientPostRequirementModal({
  isOpen,
  onClose,
  onSubmitBrief,
  onUpdateBrief,
  editBrief = null
}) {
  const fileInputRef = useRef(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic custom fields configured by Client Admin (scoped to current company or global)
  const currentEntityId = getStoredUser()?.id || "global";
  const [customFields, setCustomFields] = useState(() => getClientCustomFields(currentEntityId).filter(f => f.enabled));
  const [customFieldValues, setCustomFieldValues] = useState(() => {
    const init = {};
    getClientCustomFields(currentEntityId).forEach(f => {
      init[f.key] = f.defaultValue !== undefined ? f.defaultValue : "";
    });
    return init;
  });

  const [formData, setFormData] = useState({
    title: "",
    industry: "Jewelry & Luxury",
    artistRole: "",
    shootDuration: "2 Days Shoot",
    isUrgent: false,
    shootDate: "",
    location: "Mumbai",
    positionsNeeded: 1,
    budgetPerDay: "",
    description: ""
  });

  // Sync form with editBrief when editing or resetting
  useEffect(() => {
    if (editBrief) {
      setFormData({
        title: editBrief.title || "",
        industry: editBrief.industry || "Jewelry & Luxury",
        artistRole: editBrief.artistRole || (editBrief.category ? editBrief.category.split(" • ")[0] : ""),
        shootDuration: editBrief.shootDuration || "2 Days Shoot",
        isUrgent: Boolean(editBrief.isUrgent),
        shootDate: editBrief.shootDate || (editBrief.deadline ? editBrief.deadline.replace("Shoot Date: ", "") : ""),
        location: editBrief.location || "Mumbai",
        positionsNeeded: editBrief.positionsNeeded || 1,
        budgetPerDay: editBrief.budget || "",
        description: editBrief.description || ""
      });
      setMediaPreview(editBrief.image || editBrief.mediaUrl || "");
      setMediaType(editBrief.mediaType || "image");
      if (editBrief.customFields) {
        setCustomFieldValues(editBrief.customFields);
      }
    } else {
      setFormData({
        title: "",
        industry: "Jewelry & Luxury",
        artistRole: "",
        shootDuration: "2 Days Shoot",
        isUrgent: false,
        shootDate: "",
        location: "Mumbai",
        positionsNeeded: 1,
        budgetPerDay: "",
        description: ""
      });
      setMediaPreview("");
      setMediaType("image");
    }
    setMediaFile(null);
  }, [isOpen, editBrief]);

  useEffect(() => {
    const syncFields = (e) => {
      const targetEntity = e?.detail?.entityId || "global";
      if (targetEntity === currentEntityId || targetEntity === "global") {
        const active = getClientCustomFields(currentEntityId).filter(f => f.enabled);
        setCustomFields(active);
      }
    };
    window.addEventListener("bms_client_fields_updated", syncFields);
    return () => window.removeEventListener("bms_client_fields_updated", syncFields);
  }, [currentEntityId]);

  const handleCustomChange = (key, value) => {
    setCustomFieldValues(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
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
      finalMediaUrl = INDUSTRY_DEFAULTS[formData.industry] || INDUSTRY_DEFAULTS["Jewelry & Luxury"];
    }

    const newCampaign = {
      id: Date.now(),
      title: formData.title.trim(),
      industry: formData.industry,
      category: `${formData.artistRole} • ${formData.shootDuration}`,
      positionsNeeded: Number(formData.positionsNeeded) || 1,
      budget: formData.budgetPerDay,
      urgency: formData.isUrgent ? "Urgent Casting" : `${formData.shootDuration}`,
      status: formData.isUrgent ? "Active & Urgent" : "Active Campaign",
      deadline: `Shoot Date: ${formData.shootDate}`,
      location: formData.location,
      applicationsCount: 0,
      shortlistedCount: 0,
      image: finalMediaUrl,
      mediaUrl: finalMediaUrl,
      mediaType: mediaType,
      videoUrl: mediaType === "video" ? finalMediaUrl : null,
      description: formData.description.trim(),
      shootDuration: formData.shootDuration,
      isUrgent: formData.isUrgent,
      customFields: customFieldValues,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setIsUploading(false);

    if (editBrief && onUpdateBrief) {
      onUpdateBrief(editBrief.id, {
        ...editBrief,
        ...newCampaign,
        id: editBrief.id
      });
      showSuccess(
        "Shoot Requirement Updated",
        `Your shoot requirement for "${formData.title}" has been updated successfully.`
      );
    } else if (onSubmitBrief) {
      onSubmitBrief(newCampaign);
      showSuccess(
        "Shoot Requirement Published",
        `Your shoot requirement for "${formData.title}" has been published to the BookMyStars talent network!`
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editBrief ? "Edit Shoot Requirement" : "Post Shoot Requirement"}
      badge={editBrief ? "Edit Campaign" : "Client Brief"}
      subtitle={editBrief ? "Update details, lookbook notes, budget, or media for this requirement." : "Broadcast your commercial shoot requirement to verified models, actors, and performers with custom shoot duration."}
      icon={<Megaphone size={22} />}
      theme="pink"
      size="xl"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campaign Title */}
        <InputField
          label="Shoot / Campaign Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Festive Gold Jewelry TV Commercial Shoot"
          required
          theme="pink"
        />

        {/* Industry & Target Craft Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Industry / Brand Sector"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            options={INDUSTRY_OPTIONS}
            required
            theme="pink"
          />

          <InputField
            label="Artist Craft / Role Needed"
            name="artistRole"
            value={formData.artistRole}
            onChange={handleChange}
            placeholder="e.g. Female Bridal Jewelry Model, Character Actor"
            required
            theme="pink"
          />
        </div>

        {/* Shoot Duration, Target Date, & Daily Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Shoot Duration"
            name="shootDuration"
            value={formData.shootDuration}
            onChange={handleChange}
            options={DURATION_OPTIONS}
            required
            theme="pink"
          />

          <InputField
            type="date"
            label="Target Shoot Date"
            name="shootDate"
            value={formData.shootDate}
            onChange={handleChange}
            required
            theme="pink"
          />

          <InputField
            label="Daily Budget / Artist Pay"
            name="budgetPerDay"
            value={formData.budgetPerDay}
            onChange={handleChange}
            placeholder="e.g. ₹45,000 / Day"
            theme="pink"
          />
        </div>

        {/* Location & Positions Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Shoot Location / Studio"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Mumbai (Bandra West Studio) or Bengaluru"
            required
            theme="pink"
          />

          <InputField
            type="number"
            min="1"
            max="30"
            label="Number of Artists Required"
            name="positionsNeeded"
            value={formData.positionsNeeded}
            onChange={handleChange}
            theme="pink"
          />
        </div>

        {/* Campaign Visual Reference: Photo or Video Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {mediaType === "video" ? (
                <Video size={14} className="text-pink-600" />
              ) : (
                <Camera size={14} className="text-pink-600" />
              )}
              <span>Campaign Visual Reference (Photo or Video)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Upload image (JPG, PNG) or video (MP4, WebM)
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
                  alt="Shoot poster preview"
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
                <span>{mediaType === "video" ? "🎥 Video Reel Attached" : "📷 Photo Attached"}</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-2xl p-5 text-center cursor-pointer hover:bg-pink-50/20 transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={18} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video size={18} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 m-0">
                  Click to upload campaign poster photo or reference video reel
                </p>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                  Supports high-res Photo (up to 15MB) or Video MP4 / WebM (up to 60MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Urgent Shoot Checkbox */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
          <Checkbox
            name="isUrgent"
            checked={formData.isUrgent}
            onChange={handleChange}
            label="Mark as Urgent Shoot (Immediate Fast-Track Casting)"
            theme="pink"
          />
        </div>

        {/* Dynamic Admin-Configured Commercial Specifications */}
        {customFields.length > 0 && (
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-pink-700">
              <Sparkles size={13} />
              <span>Commercial Specifications (Configured by Client Desk)</span>
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
                      theme="pink"
                    />
                  ) : field.type === "checkbox" ? (
                    <Checkbox
                      checked={Boolean(customFieldValues[field.key])}
                      onChange={(e) => handleCustomChange(field.key, e.target.checked)}
                      label={field.label}
                      description={field.helpText}
                      theme="pink"
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
                      theme="pink"
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
                      theme="pink"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creative Brief */}
        <TextArea
          rows={4}
          label="Creative Brief & Look Specifications"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe styling requirements, lookbook notes, jewelry specifications, wardrobe details..."
          required
          theme="pink"
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
            variant="primary-pink"
            size="md"
            loading={isUploading}
            icon={<Sparkles size={14} />}
          >
            {editBrief ? "Save Changes" : "Publish Shoot Requirement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
