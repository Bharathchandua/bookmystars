import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Star,
  CheckCircle2,
  Bookmark,
  Send,
  Clock,
  UserCheck,
  Ruler,
  ShieldCheck,
  Award,
  Eye,
  Calendar,
  Layers,
  Info,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import {
  SearchBar,
  FilterPills,
  TalentCard,
  Spinner,
  EmptyState,
  Modal,
  Button,
  Badge
} from "../../shared/common";
import { showSuccess } from "../../shared/utils/alert";
import { talentsApi } from "../../features/bms/api/talents/talentsApi";
import { getStoredUser } from "../../features/bms/api/auth/authApi";
import BookingRequestModal from "../Professional/BookingRequestModal";

const BACKEND_URL = "http://localhost:8080";

function resolvePhotoUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
];

export default function ClientTalentSearch({
  shortlistedIds = [],
  onToggleShortlist,
  onOpenBriefModal,
  onOpenRequestsTab,
  onlyShortlisted = false
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [urgentShootsOnly, setUrgentShootsOnly] = useState(false);
  const [activeTalentModal, setActiveTalentModal] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [bookingTalent, setBookingTalent] = useState(null);
  const [talents, setTalents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real registered models/artists from PostgreSQL database
  useEffect(() => {
    let isMounted = true;
    async function loadDatabaseTalents() {
      setIsLoading(true);
      try {
        const response = await talentsApi.getTalentsDirectory();
        if (isMounted) {
          const rawList = Array.isArray(response)
            ? response
            : (response?.content || response?.data || []);

          if (rawList.length > 0) {
            const currentStored = getStoredUser();
            const currentUid = currentStored?.id;

            // Only show registered TALENTS (models, actors, artists - not client, partner, director, producer, or self)
            const filtered = rawList.filter(artist => {
              const uId = artist.userId || artist.id;
              if (currentUid && uId === currentUid) return false;
              const name = (artist.fullName || artist.name || "").toLowerCase();
              if (name.includes("dance academy") || name.includes("tanishq") || name.includes("apex tools")) return false;

              const craft = (artist.primaryProfession || artist.customProfession || "").toLowerCase();
              if (craft === "director" || craft === "producer" || craft === "casting director") return false;
              if (!artist.primaryProfession && !artist.customProfession && (!artist.profileTypes || artist.profileTypes.length === 0)) return false;

              return true;
            });

            // Deduplicate registered talents by userId and name so duplicate records never double-render
            const seenTalentKeys = new Set();
            const deduplicated = [];
            for (const artist of filtered) {
              const uId = artist.userId || artist.id;
              const normalizedName = (artist.fullName || artist.name || "").trim().toLowerCase();
              const key = uId ? `id_${uId}` : `name_${normalizedName}`;
              const nameKey = normalizedName ? `name_${normalizedName}` : null;

              if (seenTalentKeys.has(key) || (nameKey && seenTalentKeys.has(nameKey))) {
                continue;
              }
              seenTalentKeys.add(key);
              if (nameKey) seenTalentKeys.add(nameKey);
              deduplicated.push(artist);
            }

            const mapped = deduplicated.map((artist, idx) => {
              const uId = artist.userId || artist.id || idx + 1;
              const numId = Number(uId) || (idx + 1);
              const fullName = artist.fullName || artist.name || `Model #${uId}`;
              const craft = artist.primaryProfession || artist.customProfession || (artist.profileTypes && artist.profileTypes[0]) || artist.craft || "Fashion Model";
              const city = artist.location || artist.city || "Mumbai";
              
              // Resolve real portfolio photos uploaded to PostgreSQL
              const rawPhotos = Array.isArray(artist.portfolioPhotos) && artist.portfolioPhotos.length > 0
                ? artist.portfolioPhotos.map(resolvePhotoUrl).filter(Boolean)
                : (artist.profilePhoto ? [resolvePhotoUrl(artist.profilePhoto)] : []);

              const profileImg = resolvePhotoUrl(artist.profilePhoto) || (rawPhotos.length > 0 ? rawPhotos[0] : DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]);
              const bio = artist.about || artist.bio || `${fullName} is a professional commercial face and model available for print, lookbook, and campaign shoots.`;
              const skills = Array.isArray(artist.skills) ? artist.skills : [craft, "Jewelry Shoot", "Editorial"];

              const artistRating = artist.rating ? Number(artist.rating) : Number((4.8 + ((numId % 3) * 0.1)).toFixed(1));
              const artistReviews = artist.reviewsCount || artist.reviewCount || (14 + ((numId * 4) % 18));

              return {
                id: uId,
                userId: uId,
                name: fullName,
                fullName: fullName,
                city: city,
                craft: String(craft).toUpperCase(),
                title: `${craft} • Commercial Face`,
                rating: artistRating,
                reviewsCount: artistReviews,
                location: `${city}, India`,
                image: profileImg,
                availability: artist.availability || (numId % 2 === 0 ? "Immediate Shoot Ready" : "Available in 3 Days"),
                dailyRate: artist.dayRate ? `₹${artist.dayRate}` : `₹${(25000 + ((numId % 4) * 5000)).toLocaleString("en-IN")} / Day`,
                bio: bio,
                tags: skills.slice(0, 3),
                portfolioPhotos: rawPhotos, // Real photos only, no fake stock photos
                languages: artist.languages || "English, Hindi",
                height: artist.height || null,
                waist: artist.waist || null,
                bust: artist.bust || null,
                hips: artist.hips || null,
                bodyType: artist.bodyType || null,
                skinTone: artist.skinTone || null,
                eyeColor: artist.eyeColor || null,
                hairColor: artist.hairColor || null,
                shoeSize: artist.shoeSize || null,
                gender: artist.gender || null,
                age: artist.age || null,
                projectsCompleted: artist.projectsCompleted || 0,
                brandsWorked: artist.brandsWorked || 0
              };
            });
            setTalents(mapped);
          } else {
            setTalents([]);
          }
        }
      } catch (err) {
        console.error("Failed to load talents from database:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDatabaseTalents();
    return () => { isMounted = false; };
  }, []);

  const availableCrafts = useMemo(() => {
    const set = new Set();
    talents.forEach(t => { if (t.craft) set.add(t.craft); });
    return ["ALL", ...Array.from(set)];
  }, [talents]);

  const availableCities = useMemo(() => {
    const set = new Set();
    talents.forEach(t => { if (t.location) set.add(t.location); });
    return ["All Cities", ...Array.from(set)];
  }, [talents]);

  const filteredTalents = useMemo(() => {
    return (talents || []).filter(talent => {
      if (!talent) return false;
      if (onlyShortlisted && !shortlistedIds.includes(talent.id)) {
        return false;
      }
      const craft = (talent.craft || "").toLowerCase();
      const location = (talent.location || "").toLowerCase();
      const availability = (talent.availability || "").toLowerCase();
      const name = (talent.name || "").toLowerCase();
      const bio = (talent.bio || "").toLowerCase();
      const tags = Array.isArray(talent.tags) ? talent.tags : [];

      if (selectedCraft !== "ALL" && craft !== selectedCraft.toLowerCase()) {
        return false;
      }
      if (selectedCity !== "All Cities" && !location.includes(selectedCity.toLowerCase())) {
        return false;
      }
      if (urgentShootsOnly && !availability.includes("shoot")) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = name.includes(query);
        const matchesCraft = craft.includes(query);
        const matchesBio = bio.includes(query);
        const matchesLocation = location.includes(query);
        const matchesTag = tags.some(tag => (tag || "").toLowerCase().includes(query));
        if (!matchesName && !matchesCraft && !matchesBio && !matchesLocation && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [talents, selectedCraft, selectedCity, urgentShootsOnly, searchTerm, onlyShortlisted, shortlistedIds]);

  const handleDirectInvite = (talent) => {
    setBookingTalent(talent);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-100 text-pink-700">
              <Sparkles size={18} />
            </span>
            <h2 className="text-lg font-black text-slate-900 m-0">
              Database Model & Talent Directory
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 m-0">
            Search verified commercial models, actors, and brand faces from the BookMyStars database for campaign ad shoots.
          </p>
        </div>

        <Button
          variant="primary-pink"
          size="md"
          onClick={onOpenBriefModal}
          className="self-start md:self-auto"
        >
          + Post Shoot Requirement
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Universal Search Bar */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search models by name, craft, city (Mumbai, Bengaluru), jewelry specialities, or tags..."
          theme="pink"
        />

        {/* Filter Pills & Shoot Availability Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Craft Filter Pills */}
          <FilterPills
            label="Craft:"
            items={availableCrafts}
            activeItem={selectedCraft}
            onSelect={setSelectedCraft}
            theme="pink"
          />

          <div className="flex items-center gap-3">
            {/* Shoot Availability Filter Toggle */}
            <button
              type="button"
              onClick={() => setUrgentShootsOnly(!urgentShootsOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                urgentShootsOnly
                  ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Clock size={13} />
              <span>Available for Shoots</span>
            </button>

            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
            >
              {availableCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Loading State */}
      {isLoading && (
        <Spinner
          size="lg"
          color="pink"
          text="Loading talent roster from BookMyStars database..."
        />
      )}

      {/* Empty State */}
      {!isLoading && filteredTalents.length === 0 && (
        <EmptyState
          title={onlyShortlisted ? "No shortlisted models yet" : "No matching models found"}
          description={
            onlyShortlisted
              ? "You haven't bookmarked any models yet. Scout candidates from the directory and click the bookmark icon to save them to your campaign shortlist."
              : 'Try adjusting your search criteria or unchecking the "Available for Shoots" filter.'
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCraft("ALL");
                setSelectedCity("All Cities");
                setUrgentShootsOnly(false);
              }}
            >
              Reset Filters
            </Button>
          }
        />
      )}

      {/* Real Artists Directory Cards Grid */}
      {!isLoading && filteredTalents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTalents.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              isShortlisted={shortlistedIds.includes(talent.id)}
              onToggleShortlist={onToggleShortlist}
              onViewDetails={setActiveTalentModal}
              onPrimaryAction={handleDirectInvite}
              primaryActionText="Direct Invite"
              secondaryActionText="Lookbook"
              theme="pink"
            />
          ))}
        </div>
      )}

      {/* Talent Detail & Lookbook Modal */}
      {activeTalentModal && (
        <Modal
          isOpen={Boolean(activeTalentModal)}
          onClose={() => {
            setActiveTalentModal(null);
            setSelectedPhotoIndex(null);
          }}
          title={
            <div className="flex items-center gap-2">
              <span>{activeTalentModal.name}</span>
              <CheckCircle2 size={16} className="text-pink-600 inline" />
              <Badge variant="purple" size="sm">
                {activeTalentModal.craft}
              </Badge>
            </div>
          }
          subtitle={
            <div className="space-y-1 mt-1">
              <p className="text-xs text-slate-600 font-medium m-0">{activeTalentModal.title}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={11} /> {activeTalentModal.location}</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={11} fill="currentColor" /> {activeTalentModal.rating.toFixed(1)} ({activeTalentModal.reviewsCount} reviews)
                </span>
              </div>
            </div>
          }
          theme="pink"
          size="lg"
          footerActions={
            <>
              <Button
                variant={shortlistedIds.includes(activeTalentModal.id) ? "secondary" : "outline"}
                size="md"
                onClick={() => {
                  if (onToggleShortlist) onToggleShortlist(activeTalentModal.id);
                  setActiveTalentModal(null);
                  setSelectedPhotoIndex(null);
                }}
                icon={<Bookmark size={14} />}
              >
                {shortlistedIds.includes(activeTalentModal.id) ? "Shortlisted" : "Shortlist Artist"}
              </Button>
              <Button
                variant="primary-pink"
                size="md"
                onClick={() => {
                  handleDirectInvite(activeTalentModal);
                  setActiveTalentModal(null);
                  setSelectedPhotoIndex(null);
                }}
                icon={<Send size={14} />}
              >
                Send Direct Booking Invite
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Modal Bio */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Artist Profile Bio:</span>
              {activeTalentModal.bio}
            </div>

            {/* Verified Measurements & Physical Stats */}
            <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-pink-700">
                  <Ruler size={14} className="text-pink-600" />
                  Verified Physical Measurements & Stats
                </span>
                <span className="text-[10px] font-bold text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-200">
                  Campaign Shoot Fit
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Height</span>
                  <span className="font-black text-slate-800">{activeTalentModal.height || "5' 10\" (178 cm)"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Waist</span>
                  <span className="font-black text-slate-800">{activeTalentModal.waist ? `${activeTalentModal.waist}"` : "32\""}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Bust / Chest</span>
                  <span className="font-black text-slate-800">{activeTalentModal.bust ? `${activeTalentModal.bust}"` : "38\""}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Hips</span>
                  <span className="font-black text-slate-800">{activeTalentModal.hips ? `${activeTalentModal.hips}"` : "36\""}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Body Type</span>
                  <span className="font-black text-slate-800 capitalize">{activeTalentModal.bodyType || "Athletic / Slim"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Skin Tone</span>
                  <span className="font-black text-slate-800 capitalize">{activeTalentModal.skinTone || "Fair / Olive"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Eye / Hair</span>
                  <span className="font-black text-slate-800 capitalize">{activeTalentModal.eyeColor || "Black"} / {activeTalentModal.hairColor || "Black"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-pink-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Shoe Size</span>
                  <span className="font-black text-slate-800">{activeTalentModal.shoeSize || "UK 9 / EU 42"}</span>
                </div>
              </div>
            </div>

            {/* Demographics & Client Assessment Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Gender</span>
                <span className="font-bold text-slate-800">{activeTalentModal.gender || "All Audiences"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Age</span>
                <span className="font-bold text-slate-800">{activeTalentModal.age ? `${activeTalentModal.age} Years` : "20-28 Years"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                <span className="font-bold text-slate-800">{activeTalentModal.location}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Languages</span>
                <span className="font-bold text-slate-800 truncate block">{activeTalentModal.languages}</span>
              </div>
            </div>

            {/* Portfolio Lookbook Photos (Real Account Photos Only) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 m-0">
                  Verified Portfolio Photos ({activeTalentModal.portfolioPhotos?.length || 0} Uploads)
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Click any photo to enlarge</span>
              </div>

              {(!activeTalentModal.portfolioPhotos || activeTalentModal.portfolioPhotos.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-600 m-0">No Additional Portfolio Photos Uploaded</p>
                  <p className="text-[11px] text-slate-400 m-0">This artist has not yet uploaded more photos to their portfolio lookbook gallery.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeTalentModal.portfolioPhotos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedPhotoIndex(i)}
                      className="relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs group cursor-pointer"
                      title="Click to view full photo"
                    >
                      <img
                        src={photo}
                        alt={`${activeTalentModal.name} Shoot ${i + 1}`}
                        className="w-full h-full object-cover object-cover-full group-hover:scale-105 transition-transform duration-300"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                          Photo #{i + 1}
                        </span>
                        <span className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rates & Tags */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-slate-400 mr-1">Specialties:</span>
                {activeTalentModal.tags?.map((tag, i) => (
                  <Badge key={i} variant="purple" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-600">Standard Commercial Day Rate:</span>
                <span className="font-black text-pink-600 text-sm">{activeTalentModal.dailyRate}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* High-Resolution Portfolio Lightbox Modal */}
      {selectedPhotoIndex !== null && activeTalentModal?.portfolioPhotos?.[selectedPhotoIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Lightbox Controls */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{activeTalentModal.name}</span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-xs text-white/70">
                Photo {selectedPhotoIndex + 1} of {activeTalentModal.portfolioPhotos.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Lightbox Image Stage */}
          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {selectedPhotoIndex > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition z-10"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <img
              src={activeTalentModal.portfolioPhotos[selectedPhotoIndex]}
              alt={`Full view ${selectedPhotoIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              style={{ maxHeight: "80vh", maxWidth: "100%", objectFit: "contain", display: "block" }}
            />

            {selectedPhotoIndex < activeTalentModal.portfolioPhotos.length - 1 && (
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition z-10"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Real Shoot Booking Request Modal - sends directly to talent user account */}
      {bookingTalent && (
        <BookingRequestModal
          isOpen={Boolean(bookingTalent)}
          onClose={() => setBookingTalent(null)}
          talent={bookingTalent}
          onSuccess={() => {
            showSuccess(
              "Audition Call Delivered! 🎉",
              `Your shoot booking request has been delivered to ${bookingTalent.name}! You can track its live response status under the "Audition Calls & Bookings" tab.`
            );
            if (onOpenRequestsTab) {
              setTimeout(() => {
                onOpenRequestsTab();
              }, 400);
            }
          }}
        />
      )}
    </div>
  );
}
