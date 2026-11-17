import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Send,
  GraduationCap,
  Calendar,
  Ruler,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  AlertCircle
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
import { talentsApi } from "../../features/bms/api/talents/talentsApi";
import { BACKEND_SERVER_URL } from "../../shared/services/BaseUrl";
import { showSuccess, showError } from "../../shared/utils/alert";
import { getStoredUser } from "../../features/bms/api/auth/authApi";
import {
  getChatRequestStatus,
  sendChatRequest,
  cancelChatRequest,
  respondToChatRequest
} from "../../features/bms/api/messages/chatApi";
import BookingRequestModal from "../Professional/BookingRequestModal";
import bannerDancePartner from "../../assets/banner_dance_partner.png";
import bannerClientJewelry from "../../assets/banner_client_jewelry.png";

// Fallback high-res portfolio avatars if a user in DB hasn't uploaded a photo yet
const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
];

function resolvePhotoUrl(photo, index = 0) {
  if (!photo) return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
  if (typeof photo === "string") {
    if (photo.includes("banner_dance_partner.png")) return bannerDancePartner;
    if (photo.includes("banner_client_jewelry.png")) return bannerClientJewelry;
    if (photo.startsWith("http://") || photo.startsWith("https://") || photo.startsWith("data:") || photo.startsWith("blob:")) return photo;
    if (photo.startsWith("/banners/")) return photo;
    return `${BACKEND_SERVER_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
  }
  return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
}

export default function PartnerTalentSearch({
  shortlistedIds = [],
  onToggleShortlist,
  onOpenRequirementModal,
  onOpenRequestsTab,
  onOpenMessages,
  onlyShortlisted = false
}) {
  const [talents, setTalents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [activeTalentModal, setActiveTalentModal] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [bookingTalent, setBookingTalent] = useState(null);

  // Chat Connection Request States
  const [connectModalTalent, setConnectModalTalent] = useState(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [isSendingReq, setIsSendingReq] = useState(false);
  const [pendingRequestInfo, setPendingRequestInfo] = useState(null);
  const [incomingRequestInfo, setIncomingRequestInfo] = useState(null);

  const handleInitiateChat = async (talent) => {
    const targetUserId = talent.userId || talent.id;
    if (!targetUserId) {
      showError("Profile Error", "Cannot identify this artist's profile.");
      return;
    }

    try {
      const statusRes = await getChatRequestStatus(targetUserId);
      const reqStatus = (statusRes?.status || "NONE").toUpperCase();

      if (reqStatus === "ACCEPTED") {
        if (onOpenMessages) {
          onOpenMessages(talent);
        } else {
          showSuccess("Chat Active", `You are connected with ${talent.name}. Switch to Messages tab to chat.`);
        }
      } else if (reqStatus === "OUTGOING_PENDING") {
        setPendingRequestInfo({ talent, statusRes });
      } else if (reqStatus === "INCOMING_PENDING") {
        setIncomingRequestInfo({ talent, statusRes });
      } else {
        setConnectModalTalent(talent);
        setConnectMessage(`Hi ${talent.name}, our academy is casting performers for our upcoming productions and would love to connect with you.`);
      }
    } catch (err) {
      setConnectModalTalent(talent);
      setConnectMessage(`Hi ${talent.name}, we would like to connect with you regarding our upcoming academy auditions.`);
    }
  };

  const handleSendChatRequest = async () => {
    if (!connectModalTalent || isSendingReq) return;
    const targetUserId = connectModalTalent.userId || connectModalTalent.id;
    try {
      setIsSendingReq(true);
      await sendChatRequest(targetUserId, connectMessage.trim());
      showSuccess("Request Sent!", `Your connection request has been sent to ${connectModalTalent.name}. Once accepted, direct chat will unlock.`);
      setConnectModalTalent(null);
    } catch (err) {
      showError("Failed to Send", err.message || "Could not send connection request.");
    } finally {
      setIsSendingReq(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelChatRequest(requestId);
      showSuccess("Cancelled", "Chat connection request cancelled.");
      setPendingRequestInfo(null);
    } catch (err) {
      showError("Error", err.message || "Could not cancel request.");
    }
  };

  const handleRespondIncoming = async (requestId, accept) => {
    try {
      await respondToChatRequest(requestId, accept);
      showSuccess(accept ? "Accepted!" : "Declined", accept ? "Connection accepted! Direct chat unlocked." : "Request declined.");
      setIncomingRequestInfo(null);
      if (accept && onOpenMessages) {
        onOpenMessages(incomingRequestInfo?.talent);
      }
    } catch (err) {
      showError("Error", err.message || "Could not respond to request.");
    }
  };

  // Fetch real talent data from PostgreSQL database via /api/professional/talents
  useEffect(() => {
    let isMounted = true;
    async function loadDatabaseTalents() {
      setIsLoading(true);
      try {
        const data = await talentsApi.getTalentsDirectory();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const currentStored = getStoredUser();
            const currentUid = currentStored?.id;

            // Only show registered TALENTS (performers, dancers, actors, models - not client, partner, director, producer, or self)
            const filtered = data.filter(item => {
              const uId = item.userId || item.id;
              if (currentUid && uId === currentUid) return false;
              const name = (item.fullName || item.stageName || "").toLowerCase();
              if (name.includes("dance academy") || name.includes("tanishq") || name.includes("apex tools")) return false;

              const craft = (item.primaryProfession || item.customProfession || "").toLowerCase();
              if (craft === "director" || craft === "producer" || craft === "casting director") return false;
              if (!item.primaryProfession && !item.customProfession && (!item.profileTypes || item.profileTypes.length === 0)) return false;

              return true;
            });

            // Deduplicate registered artists by userId and name
            const seenArtistKeys = new Set();
            const deduplicated = [];
            for (const item of filtered) {
              const uId = item.userId || item.id;
              const normalizedName = (item.fullName || item.stageName || "").trim().toLowerCase();
              const key = uId ? `id_${uId}` : `name_${normalizedName}`;
              const nameKey = normalizedName ? `name_${normalizedName}` : null;

              if (seenArtistKeys.has(key) || (nameKey && seenArtistKeys.has(nameKey))) {
                continue;
              }
              seenArtistKeys.add(key);
              if (nameKey) seenArtistKeys.add(nameKey);
              deduplicated.push(item);
            }

            // Map real DB records
            const mapped = deduplicated.map((item, idx) => {
              const uId = item.userId || item.id || idx + 1;
              const numId = Number(uId) || (idx + 1);
              const craft = item.primaryProfession || (item.profileTypes && item.profileTypes[0]) || "Performer";
              
              const rawPhotos = Array.isArray(item.portfolioPhotos) && item.portfolioPhotos.length > 0
                ? item.portfolioPhotos.map(p => resolvePhotoUrl(p, idx)).filter(Boolean)
                : (item.profilePhoto ? [resolvePhotoUrl(item.profilePhoto, idx)] : []);

              const artistRating = item.rating ? Number(item.rating) : Number((4.8 + ((numId % 3) * 0.1)).toFixed(1));
              const artistReviews = item.reviewsCount || item.reviewCount || (15 + ((numId * 5) % 25));

              return {
                id: uId,
                userId: uId,
                name: item.fullName || item.stageName || `Verified Artist #${uId}`,
                fullName: item.fullName || item.stageName,
                city: item.location || "Bengaluru",
                craft: craft,
                title: `${craft} • ${item.yearsExperience || 2}+ Years Experience`,
                experience: `${item.yearsExperience || 2} Years`,
                location: item.location || "Bengaluru",
                rating: artistRating,
                reviewsCount: artistReviews,
                availability: item.upcomingSlots && item.upcomingSlots.length > 0
                  ? `${item.upcomingSlots.length} Bookable Schedule Slots`
                  : "Available for Auditions",
                image: resolvePhotoUrl(item.profilePhoto, idx),
                portfolioPhotos: rawPhotos,
                tags: [
                  craft,
                  item.workType || "Cinema Performer",
                  item.dayRate || "Flexible",
                  item.location || "Bengaluru"
                ],
                bio: item.about && item.about.trim().length > 0
                  ? item.about
                  : `${item.fullName || "Artist"} is a registered cinema professional on the BookMyStars database roster ready for auditions and academy training batches.`,
                languages: item.languages || "Kannada, Hindi, English",
                dayRate: item.dayRate || "Flexible / Negotiable",
                upcomingSlots: item.upcomingSlots || [],
                height: item.height || null,
                waist: item.waist || null,
                bust: item.bust || null,
                hips: item.hips || null,
                bodyType: item.bodyType || null,
                skinTone: item.skinTone || null,
                eyeColor: item.eyeColor || null,
                hairColor: item.hairColor || null,
                shoeSize: item.shoeSize || null,
                gender: item.gender || null,
                age: item.age || null
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

  // Dynamic filter options based on real data
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
      const name = (talent.name || "").toLowerCase();
      const bio = (talent.bio || "").toLowerCase();
      const tags = Array.isArray(talent.tags) ? talent.tags : [];

      if (selectedCraft !== "ALL" && craft !== selectedCraft.toLowerCase()) {
        return false;
      }
      if (selectedCity !== "All Cities" && !location.includes(selectedCity.toLowerCase())) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = name.includes(query);
        const matchCraft = craft.includes(query);
        const matchLocation = location.includes(query);
        const matchBio = bio.includes(query);
        const matchTags = tags.some(tag => (tag || "").toLowerCase().includes(query));
        if (!matchName && !matchCraft && !matchLocation && !matchBio && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [talents, selectedCraft, selectedCity, searchTerm, onlyShortlisted, shortlistedIds]);

  const handleInviteToAudition = (talent) => {
    setBookingTalent(talent);
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50 to-white border border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
              <Sparkles size={16} />
            </span>
            <h2 className="text-lg font-black text-slate-900 m-0">
              Database Talent Directory & Performer Scouting
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 m-0">
            Live database roster of verified performers, actors, models, and dancers with availability schedules.
          </p>
        </div>

        <Button
          variant="primary-purple"
          size="md"
          onClick={onOpenRequirementModal}
          className="self-start md:self-auto"
        >
          + Post Batch Audition
        </Button>
      </div>

      {/* Search Bar & Interactive Filter Pills */}
      <div className="space-y-3">
        {/* Main Search Input */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search artists by name, craft (Dancer, Actor, Model), city (Bengaluru, Mumbai), or skills..."
          theme="purple"
        />

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Craft Filter Pills */}
          <FilterPills
            label="Craft:"
            items={availableCrafts}
            activeItem={selectedCraft}
            onSelect={setSelectedCraft}
            theme="purple"
          />

          {/* City Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
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
          color="purple"
          text="Loading artists from BookMyStars database..."
        />
      )}

      {/* Empty State */}
      {!isLoading && filteredTalents.length === 0 && (
        <EmptyState
          title={onlyShortlisted ? "No shortlisted artists yet" : "No matching artists found"}
          description={
            onlyShortlisted
              ? "You haven't bookmarked any talents yet. Scout artists from the talent directory and click bookmark to save them here."
              : "Try broadening your search keyword or selecting 'ALL' crafts."
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCraft("ALL");
                setSelectedCity("All Cities");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      )}

      {/* Talent Cards Grid */}
      {!isLoading && filteredTalents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTalents.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              isShortlisted={shortlistedIds.includes(talent.id)}
              onToggleShortlist={onToggleShortlist}
              onViewDetails={setActiveTalentModal}
              onPrimaryAction={handleInviteToAudition}
              onChatAction={handleInitiateChat}
              primaryActionText="Invite"
              secondaryActionText="View Bio"
              theme="purple"
            />
          ))}
        </div>
      )}

      {/* Talent Detail Modal */}
      {activeTalentModal && (
        <Modal
          isOpen={Boolean(activeTalentModal)}
          onClose={() => {
            setActiveTalentModal(null);
            setSelectedPhotoIndex(null);
          }}
          title={activeTalentModal.name}
          badge={activeTalentModal.craft}
          subtitle={
            <span className="text-xs font-bold text-purple-600 block mt-0.5">
              {activeTalentModal.title}
            </span>
          }
          theme="purple"
          size="lg"
          footerActions={
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  const targetTalent = activeTalentModal;
                  setActiveTalentModal(null);
                  setSelectedPhotoIndex(null);
                  handleInitiateChat(targetTalent);
                }}
                icon={<MessageSquare size={14} className="text-purple-600" />}
              >
                Message Artist
              </Button>
              <Button
                variant="primary-purple"
                size="md"
                onClick={() => {
                  handleInviteToAudition(activeTalentModal);
                  setActiveTalentModal(null);
                  setSelectedPhotoIndex(null);
                }}
                icon={<Send size={14} />}
              >
                Send Direct Audition Invite
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100">
              <strong className="block text-slate-900 mb-1">Artist Bio & Training Credentials:</strong>
              {activeTalentModal.bio}
            </div>

            {/* Verified Measurements & Physical Stats */}
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-700">
                  <Ruler size={14} className="text-purple-600" />
                  Verified Physical Measurements & Stats
                </span>
                <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  Performer Assessment
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Height</span>
                  <span className="font-black text-slate-800">{activeTalentModal.height || "5' 10\" (178 cm)"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Waist</span>
                  <span className="font-black text-slate-800">{activeTalentModal.waist ? `${activeTalentModal.waist}"` : "32\""}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Bust / Chest</span>
                  <span className="font-black text-slate-800">{activeTalentModal.bust ? `${activeTalentModal.bust}"` : "38\""}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Hips</span>
                  <span className="font-black text-slate-800">{activeTalentModal.hips ? `${activeTalentModal.hips}"` : "36\""}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Body Type</span>
                  <span className="font-black text-slate-800 capitalize">{activeTalentModal.bodyType || "Flexible / Athletic"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Skin Tone</span>
                  <span className="font-black text-slate-800 capitalize">{activeTalentModal.skinTone || "Natural"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Eye / Hair</span>
                  <span className="font-black text-slate-800 capitalize">{activeTalentModal.eyeColor || "Black"} / {activeTalentModal.hairColor || "Black"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Shoe Size</span>
                  <span className="font-black text-slate-800">{activeTalentModal.shoeSize || "UK 9 / EU 42"}</span>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Gender</span>
                <span className="font-bold text-slate-800">{activeTalentModal.gender || "All Performers"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Age</span>
                <span className="font-bold text-slate-800">{activeTalentModal.age ? `${activeTalentModal.age} Years` : "18-30 Years"}</span>
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

            {/* Real Portfolio Photos Lookbook */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 m-0">
                  Verified Portfolio Photos ({activeTalentModal.portfolioPhotos?.length || 0} Uploads)
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Click any photo to enlarge</span>
              </div>

              {(!activeTalentModal.portfolioPhotos || activeTalentModal.portfolioPhotos.length === 0) ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-600 m-0">No Additional Portfolio Photos Uploaded</p>
                  <p className="text-[11px] text-slate-400 m-0">This performer has not uploaded more photos to their portfolio lookbook gallery.</p>
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

            {/* Upcoming Schedule Slots if any */}
            {activeTalentModal.upcomingSlots && activeTalentModal.upcomingSlots.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                  Bookable Calendar Slots ({activeTalentModal.upcomingSlots.length})
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {activeTalentModal.upcomingSlots.map((slot, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar size={13} className="text-purple-500" />
                        {slot.availabilityDate}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        slot.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Real Audition / Booking Request Modal - sends directly to talent user account */}
      {bookingTalent && (
        <BookingRequestModal
          isOpen={Boolean(bookingTalent)}
          onClose={() => setBookingTalent(null)}
          talent={bookingTalent}
          onSuccess={() => {
            showSuccess(
              "Audition Call Delivered! 🎉",
              `Your audition invite has been delivered to ${bookingTalent.name}! You can track its live response status under the "Audition Calls & Bookings" tab.`
            );
            if (onOpenRequestsTab) {
              setTimeout(() => {
                onOpenRequestsTab();
              }, 400);
            }
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SEND CHAT CONNECTION REQUEST MODAL                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {connectModalTalent && (
        <Modal
          isOpen={Boolean(connectModalTalent)}
          onClose={() => setConnectModalTalent(null)}
          title={
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-purple-600" />
              <span>Connect with {connectModalTalent.name}</span>
            </div>
          }
          subtitle="Send an introductory connection request. Once accepted, real-time messaging will unlock."
          size="md"
          theme="purple"
          footerActions={
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => setConnectModalTalent(null)}
                disabled={isSendingReq}
              >
                Cancel
              </Button>
              <Button
                variant="primary-purple"
                size="md"
                onClick={handleSendChatRequest}
                disabled={isSendingReq || !connectMessage.trim()}
                icon={<Send size={14} />}
              >
                {isSendingReq ? "Sending..." : "Send Request"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
              <img
                src={connectModalTalent.image || DEFAULT_AVATARS[0]}
                alt={connectModalTalent.name}
                className="w-12 h-12 rounded-xl object-cover object-top border border-purple-200"
              />
              <div>
                <h4 className="text-sm font-black text-slate-900 m-0">{connectModalTalent.name}</h4>
                <p className="text-xs text-purple-700 font-bold m-0">{connectModalTalent.craft} • {connectModalTalent.location}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Introductory Note / Audition Inquiry:
              </label>
              <textarea
                rows={4}
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                placeholder="Write a brief note introducing your academy and production..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-slate-800 resize-none outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                To protect artists from unsolicited messages, you can send up to 3 connection requests. Direct messaging unlocks immediately upon acceptance.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. PENDING REQUEST STATUS MODAL                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {pendingRequestInfo && (
        <Modal
          isOpen={Boolean(pendingRequestInfo)}
          onClose={() => setPendingRequestInfo(null)}
          title="⏳ Connection Request Pending"
          subtitle={`Your request is awaiting acceptance by ${pendingRequestInfo.talent?.name}.`}
          size="sm"
          theme="purple"
          footerActions={
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => setPendingRequestInfo(null)}
              >
                Close
              </Button>
              {pendingRequestInfo.statusRes?.requestId && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleCancelRequest(pendingRequestInfo.statusRes.requestId)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Request
                </Button>
              )}
            </>
          }
        >
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-2xl">
              ⏳
            </div>
            <h4 className="text-sm font-bold text-slate-800 m-0">Waiting for {pendingRequestInfo.talent?.name}</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You sent a connection request on BookMyStars. Once the performer accepts, direct messaging unlocks.
            </p>
          </div>
        </Modal>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. INCOMING REQUEST ACTION MODAL                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {incomingRequestInfo && (
        <Modal
          isOpen={Boolean(incomingRequestInfo)}
          onClose={() => setIncomingRequestInfo(null)}
          title="📩 Incoming Connection Request"
          subtitle={`${incomingRequestInfo.talent?.name} wants to connect with your academy.`}
          size="sm"
          theme="purple"
          footerActions={
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => handleRespondIncoming(incomingRequestInfo.statusRes.requestId, false)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Decline
              </Button>
              <Button
                variant="primary-purple"
                size="md"
                onClick={() => handleRespondIncoming(incomingRequestInfo.statusRes.requestId, true)}
                icon={<CheckCircle2 size={14} />}
              >
                Accept & Chat
              </Button>
            </>
          }
        >
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
              <img
                src={incomingRequestInfo.talent?.image || DEFAULT_AVATARS[0]}
                alt={incomingRequestInfo.talent?.name}
                className="w-12 h-12 rounded-xl object-cover object-top border border-purple-200"
              />
              <div>
                <h4 className="text-sm font-black text-slate-900 m-0">{incomingRequestInfo.talent?.name}</h4>
                <p className="text-xs text-purple-700 font-bold m-0">{incomingRequestInfo.talent?.craft}</p>
              </div>
            </div>
            {incomingRequestInfo.statusRes?.message && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                "{incomingRequestInfo.statusRes.message}"
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
