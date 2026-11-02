import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Sliders,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Save,
  RotateCcw,
  Globe,
  Building2
} from "lucide-react";
import { showSuccess, showWarning, confirmDelete } from "../../../shared/utils/alert";
import {
  getClientCustomFields,
  saveClientCustomFields,
  resetEntityClientCustomFields,
  getPartnerCustomFields,
  savePartnerCustomFields,
  resetEntityPartnerCustomFields,
  DEFAULT_CLIENT_CUSTOM_FIELDS,
  DEFAULT_PARTNER_CUSTOM_FIELDS
} from "../../../shared/utils/customFieldsConfig";

export default function RequirementFormBuilderDesk({
  moduleType = "CLIENT",
  entityId = "global",
  entityName = "Global Platform Baseline"
}) {
  const isClient = moduleType === "CLIENT";
  const isGlobal = !entityId || entityId === "global";
  const themeColor = isClient ? "pink" : "purple";

  // Load custom fields based on module and selected entity
  const [fields, setFields] = useState(() => {
    return isClient ? getClientCustomFields(entityId) : getPartnerCustomFields(entityId);
  });

  const [editingField, setEditingField] = useState(null); // null when not editing, object when editing/adding
  const [isNewField, setIsNewField] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form states for add/edit modal
  const [fieldForm, setFieldForm] = useState({
    id: "",
    key: "",
    label: "",
    type: "text", // text | number | select | checkbox | date | textarea
    optionsString: "",
    required: false,
    placeholder: "",
    defaultValue: "",
    helpText: "",
    enabled: true
  });

  // Re-fetch when entityId or moduleType changes
  useEffect(() => {
    setFields(isClient ? getClientCustomFields(entityId) : getPartnerCustomFields(entityId));
  }, [moduleType, entityId, isClient]);

  useEffect(() => {
    const handleSync = (e) => {
      const syncEntity = e.detail?.entityId || "global";
      if (syncEntity === entityId || syncEntity === "global") {
        setFields(isClient ? getClientCustomFields(entityId) : getPartnerCustomFields(entityId));
      }
    };
    const eventName = isClient ? "bms_client_fields_updated" : "bms_partner_fields_updated";
    window.addEventListener(eventName, handleSync);
    return () => window.removeEventListener(eventName, handleSync);
  }, [isClient, entityId]);

  const persistFields = (updatedFields) => {
    setFields(updatedFields);
    if (isClient) {
      saveClientCustomFields(updatedFields, entityId);
    } else {
      savePartnerCustomFields(updatedFields, entityId);
    }
  };

  const handleResetDefaults = () => {
    if (isGlobal) {
      const standard = isClient ? DEFAULT_CLIENT_CUSTOM_FIELDS : DEFAULT_PARTNER_CUSTOM_FIELDS;
      persistFields(standard);
      showSuccess("Schema Reset", "Global requirement form fields reset to standard platform baseline.");
    } else {
      const fallback = isClient
        ? resetEntityClientCustomFields(entityId)
        : resetEntityPartnerCustomFields(entityId);
      setFields(fallback);
      showSuccess(
        "Schema Restored to Baseline",
        `Custom field overrides for "${entityName}" removed. It now inherits Global Baseline fields.`
      );
    }
  };

  const handleOpenAdd = () => {
    const newId = `cf_${isClient ? "client" : "partner"}_${Date.now()}`;
    setFieldForm({
      id: newId,
      key: "",
      label: "",
      type: "text",
      optionsString: "Option 1, Option 2, Option 3",
      required: false,
      placeholder: "",
      defaultValue: "",
      helpText: "",
      enabled: true
    });
    setIsNewField(true);
    setEditingField(true);
  };

  const handleOpenEdit = (field) => {
    setFieldForm({
      ...field,
      optionsString: Array.isArray(field.options) ? field.options.join(", ") : ""
    });
    setIsNewField(false);
    setEditingField(true);
  };

  const handleToggleEnable = (id) => {
    const updated = fields.map(f => {
      if (f.id === id) {
        return { ...f, enabled: !f.enabled };
      }
      return f;
    });
    persistFields(updated);
    showSuccess("Field Updated", "Field visibility has been toggled.");
  };

  const handleDeleteField = async (id, label) => {
    const confirmed = await confirmDelete(
      `"${label}"`,
      `Are you sure you want to remove the custom field "${label}"? This will hide it from the requirement form.`
    );
    if (!confirmed) return;

    const updated = fields.filter(f => f.id !== id);
    persistFields(updated);
    showSuccess("Field Deleted", `Field "${label}" removed from post requirement schema.`);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const copy = [...fields];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    persistFields(copy);
  };

  const handleSaveField = (e) => {
    e.preventDefault();
    if (!fieldForm.label.trim()) {
      showWarning("Label Required", "Please specify a field label.");
      return;
    }

    const autoKey = fieldForm.key.trim() || fieldForm.label.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

    let parsedOptions = [];
    if (fieldForm.type === "select") {
      parsedOptions = fieldForm.optionsString
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
      if (parsedOptions.length === 0) {
        showWarning("Options Required", "Please provide at least 2 comma-separated options for select dropdown.");
        return;
      }
    }

    const compiledField = {
      id: fieldForm.id,
      key: autoKey,
      label: fieldForm.label.trim(),
      type: fieldForm.type,
      options: parsedOptions,
      required: fieldForm.required,
      placeholder: fieldForm.placeholder.trim(),
      defaultValue: fieldForm.type === "checkbox" ? Boolean(fieldForm.defaultValue) : fieldForm.defaultValue,
      helpText: fieldForm.helpText.trim(),
      enabled: fieldForm.enabled
    };

    let updatedList;
    if (isNewField) {
      updatedList = [...fields, compiledField];
    } else {
      updatedList = fields.map(f => (f.id === compiledField.id ? compiledField : f));
    }

    persistFields(updatedList);
    setEditingField(null);
    showSuccess(
      isNewField ? "Custom Field Added" : "Field Updated",
      `"${compiledField.label}" will now appear in the ${isClient ? "Client Post Shoot Requirement" : "Partner Post Audition"} modal!`
    );
  };

  // Fixed Core System Fields that are mandatory for the application
  const coreFields = isClient ? [
    { label: "Shoot / Campaign Title", type: "Text (Single Line)", required: true, desc: "Primary title of the commercial campaign or ad shoot." },
    { label: "Industry / Brand Sector", type: "Dropdown Select", required: true, desc: "Jewelry & Luxury, Fashion, Cosmetics, Film & OTT, etc." },
    { label: "Artist Craft / Role Needed", type: "Text Input", required: true, desc: "e.g. Female Bridal Jewelry Model, Lead Character Actor." },
    { label: "Shoot Duration", type: "Dropdown Select", required: true, desc: "1 Day Shoot, 2 Days Shoot, 1 Week Campaign, etc." },
    { label: "Target Shoot Date", type: "Date Picker", required: true, desc: "Scheduled shoot calendar date." },
    { label: "Daily Budget / Artist Pay", type: "Currency Input", required: false, desc: "Day rate or project compensation offered." },
    { label: "Shoot Location / Studio", type: "Text Input", required: true, desc: "Studio address, city, or on-location shoot destination." },
    { label: "Campaign Poster Photo", type: "File / Photo Upload", required: false, desc: "Reference image, ad visual, or moodboard visual." },
    { label: "Creative Brief Specifications", type: "Textarea (Multi-Line)", required: true, desc: "Detailed styling, wardrobe, and physical trait specifications." }
  ] : [
    { label: "Requirement / Audition Title", type: "Text (Single Line)", required: true, desc: "Primary title of the audition call or batch intake." },
    { label: "Academy Category", type: "Dropdown Select", required: true, desc: "Dance Academy, Acting School, Modeling Institute, Music Studio." },
    { label: "Batch / Production Name", type: "Text Input", required: false, desc: "e.g. Festive Stage Production & Ad Troupe Batch." },
    { label: "Seats / Positions Needed", type: "Number Input", required: false, desc: "Capacity or headcount open for recruitment." },
    { label: "Audition Date", type: "Date Picker", required: true, desc: "Deadline date for auditions or live callback date." },
    { label: "Audition City / Studio", type: "Text Input", required: true, desc: "Academy branch address or audition studio hall." },
    { label: "Audition Poster Photo", type: "File / Photo Upload", required: false, desc: "Audition poster visual or troupe photo." },
    { label: "Description & Audition Criteria", type: "Textarea (Multi-Line)", required: true, desc: "Prerequisites, physical traits, repertoire requirements." }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Multi-Tenant Entity Scope Badge */}
      <div className={`p-6 rounded-3xl bg-gradient-to-r ${isClient ? "from-pink-50 via-purple-50 to-white border-pink-100" : "from-purple-50 via-pink-50 to-white border-purple-100"} border flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`p-2 rounded-xl ${isClient ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"} font-bold`}>
              <Sliders size={18} />
            </span>
            <h2 className="text-xl font-black text-slate-900 m-0">
              {isClient ? "Client Shoot Requirement Form Builder" : "Partner Audition Requirement Form Builder"}
            </h2>
            <div className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isGlobal 
                ? "bg-slate-900 text-white shadow-xs" 
                : isClient
                ? "bg-pink-600 text-white shadow-xs shadow-pink-500/20"
                : "bg-purple-600 text-white shadow-xs shadow-purple-500/20"
            }`}>
              {isGlobal ? <Globe size={13} /> : <Building2 size={13} />}
              <span>Scope: {entityName}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 m-0 max-w-2xl">
            {isGlobal
              ? `Configuring Global Platform Baseline. These default fields appear across all ${isClient ? "corporate brands" : "accredited academies"} unless a company has custom schema overrides.`
              : `Configuring Tenant-Specific Schema for "${entityName}". Fields added or edited here apply specifically to this brand without affecting other companies.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Restore standard platform defaults"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className={`px-4 py-2.5 rounded-2xl bg-gradient-to-r ${isClient ? "from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-pink-500/20" : "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/20"} text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer`}
          >
            <Plus size={16} />
            <span>+ Add Custom Field</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Custom Fields Table (Left) + Core Reference & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: Custom Fields Configuration Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className={isClient ? "text-pink-600" : "text-purple-600"} />
                <h3 className="text-base font-extrabold text-slate-900 m-0">
                  Active Custom Fields ({fields.filter(f => f.enabled).length} Enabled / {fields.length} Total)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Drag or order fields
              </span>
            </div>

            {fields.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Sliders size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600 m-0">No custom fields created yet</p>
                <p className="text-[11px] text-slate-400 m-0">Click "+ Add Custom Field" above to add tailored questions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      field.enabled
                        ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                        : "bg-slate-50/80 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">
                          {field.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          field.type === "select" ? "bg-purple-100 text-purple-800" :
                          field.type === "checkbox" ? "bg-emerald-100 text-emerald-800" :
                          field.type === "date" ? "bg-blue-100 text-blue-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Required *
                          </span>
                        )}
                        {!field.enabled && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                            Disabled
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1 m-0">
                        {field.helpText || field.placeholder || `Key: ${field.key}`}
                      </p>

                      {field.type === "select" && Array.isArray(field.options) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {field.options.slice(0, 3).map((opt, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {opt}
                            </span>
                          ))}
                          {field.options.length > 3 && (
                            <span className="text-[10px] text-slate-400">
                              +{field.options.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === fields.length - 1}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Enable / Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleEnable(field.id)}
                        className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          field.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-200"
                        }`}
                        title={field.enabled ? "Disable this field" : "Enable this field"}
                      >
                        {field.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(field)}
                        className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                        title="Edit Field Configuration"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field.id, field.label)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                        title="Delete Field"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: Core System Fields + Live Form Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Core System Fields Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-900 m-0">
                  Standard System Fields (Protected)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                Always Active
              </span>
            </div>

            <div className="space-y-2.5">
              {coreFields.map((cf, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{cf.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{cf.type}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 m-0">{cf.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Callout */}
          <div className={`p-5 rounded-3xl ${isClient ? "bg-pink-50/70 border-pink-200" : "bg-purple-50/70 border-purple-200"} border space-y-2`}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className={isClient ? "text-pink-600" : "text-purple-600"} />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 m-0">
                Instant Live Sync
              </h4>
            </div>
            <p className="text-xs text-slate-600 m-0 leading-relaxed">
              Any custom fields added, toggled, or edited here will immediately appear in the {isClient ? "Client Studio Desk" : "Partner Academy Hub"} when users click <strong>"+ Post Requirement"</strong> without requiring code deployments.
            </p>
          </div>

        </div>

      </div>

      {/* ================================================================ */}
      {/* ADD / EDIT CUSTOM FIELD MODAL                                    */}
      {/* ================================================================ */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl ${isClient ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"} font-bold`}>
                  <Edit3 size={18} />
                </span>
                <h3 className="text-lg font-black text-slate-900 m-0">
                  {isNewField ? "Add Custom Requirement Field" : "Edit Custom Field"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Field Form */}
            <form onSubmit={handleSaveField} className="space-y-4">
              
              {/* Field Label */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Field Label / Question Title *
                </label>
                <input
                  type="text"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Wardrobe Styling Policy, Fitting Date, Audition Rounds"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none font-medium"
                  required
                />
              </div>

              {/* Field Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Field Input Type *
                </label>
                <select
                  value={fieldForm.type}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none bg-white font-medium"
                >
                  <option value="text">Text Input (Single Line)</option>
                  <option value="select">Dropdown Select Menu</option>
                  <option value="checkbox">Checkbox (Yes / No Toggle)</option>
                  <option value="date">Date Picker</option>
                  <option value="number">Number Input</option>
                  <option value="textarea">Multi-line Text Area</option>
                </select>
              </div>

              {/* Dropdown Options (Visible only when type === 'select') */}
              {fieldForm.type === "select" && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Dropdown Options (Comma-Separated) *
                  </label>
                  <input
                    type="text"
                    value={fieldForm.optionsString}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, optionsString: e.target.value }))}
                    placeholder="e.g. Full Wardrobe Provided, Talent to Bring Own, Partial"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none font-medium"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Separate multiple choices with commas (e.g. "Option A, Option B, Option C").
                  </span>
                </div>
              )}

              {/* Placeholder & Help Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={fieldForm.placeholder}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="e.g. Select policy..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Help / Subtitle Note
                  </label>
                  <input
                    type="text"
                    value={fieldForm.helpText}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, helpText: e.target.value }))}
                    placeholder="e.g. Mandatory for all models"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-pink-600 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Required & Enabled Toggles */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={fieldForm.required}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Mandatory Field (Client / Partner must fill before posting)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={fieldForm.enabled}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Active & Visible in Modal</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${isClient ? "from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-pink-500/20" : "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/20"} text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer`}
                >
                  <Save size={14} />
                  <span>{isNewField ? "Create Field" : "Save Changes"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
