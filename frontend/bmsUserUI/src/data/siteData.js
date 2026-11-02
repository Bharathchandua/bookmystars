import {
  UserRound,
  BriefcaseBusiness,
  Mic,
  AudioWaveform,
  Camera,
  Upload,
  ShieldCheck,
  Network,
  Send,
  LockKeyhole,
  Clapperboard,
  Megaphone,
  BarChart3,
  Sparkles,
  Music,
  Wand2,
  Video,
  Radio,
  BadgeCheck,
  Crown
} from "lucide-react";

/* ==========================================================================
   1. HERO CARD IMAGES (IMPORTS)
   ========================================================================== */
import spotlight from "../assets/card-spotlight.png";
import branding from "../assets/card-branding.png";
import agencies from "../assets/card-agencies.png";

/* ==========================================================================
   2. MEDIA GRID IMAGES (LOCAL HIGH-DEFINITION GRAPHICS)
   ========================================================================== */
import film from "../assets/media-film.png";
import video from "../assets/media-video.png";
import music from "../assets/media-music.png";
import photo from "../assets/media-photo.png";
import vfx from "../assets/media-vfx.png";
import event from "../assets/media-event.png";
import live from "../assets/media-live.png";
import content from "../assets/media-content.png";



/* ==========================================================================
   3. HERO STATS DATA
   Format: [value, label, IconComponent]
   ========================================================================== */
export const stats = [
  ["10K", "Profiles", UserRound],
  ["500", "Live Opportunities", BriefcaseBusiness],
  ["200", "Studios & Brands", BadgeCheck],
  ["AI", "Smart Matching", Network],
];


/* ==========================================================================
   4. THREE TOP OPPORTUNITY CARDS DATA
   Format: [title, description, buttonText, imageAsset, IconComponent]
   ========================================================================== */
export const cards = [
  [
    'Step Into the Spotlight',
    'Showcase your talent, build your profile and get discovered by the right people.',
    'Join as Talent',
    spotlight,
    UserRound,
    '/join'
  ],
  [
    'Branding / Requirements',
    'Find verified artists, stylists and crew for your project requirements.',
    'Become a Client',
    branding,
    BriefcaseBusiness,
    '/become-client'
  ],
  [
    'Agencies',
    "Hire verified artists and creators who match your brand's unique vision.",
    'Become a Partner',
    agencies,
    Crown,
    '/become-partner'
  ],
];


/* ==========================================================================
   5. PODCAST SERVICES STRIP CARDS DATA
   Format: [serviceTitle, description, IconComponent]
   ========================================================================== */
export const podcast = [
  [
    'Podcast Recording',
    'High-quality audio & video recording in premium studios.',
    Mic
  ],
  [
    'Editing & Post Production',
    'Professional editing, sound design, mixing & mastering.',
    AudioWaveform
  ],
  [
    'Show Branding',
    'Custom intros, logo, thumbnails & visual identity.',
    Camera
  ],
  [
    'Distribution Support',
    'Publish and promote on all major podcast platforms.',
    Upload
  ],
];


/* ==========================================================================
   6. AUDITION / OPPORTUNITY CATEGORIES
   ========================================================================== */
export const opportunityCats = [
  'Auditions & Castings',
  'Ad Shoots',
  'Film & Web Series',
  'Music Videos',
  'Dance',
  'Fashion Shows',
  'Influencer Jobs',
  'Event Gigs',
];


/* ==========================================================================
   7. CORE NETWORK FEATURES DATA
   Format: [featureTitle, shortDescription, IconComponent]
   ========================================================================== */
export const features = [
  ['Verified Opportunities', '100% authentic listings',  ShieldCheck],
  ['Smart Matching',         'AI powered matches',       Network],
  ['Easy Applications',      'Quick & hassle-free',      Send],
  ['Secure Process',         'Safe & transparent',       LockKeyhole],
];


/* ==========================================================================
   8. MEDIA PRODUCTION PORTFOLIO DATA
   Format: [productionType, tagline, backgroundImageUrl, IconComponent]
   ========================================================================== */
export const media = [
  ['Film Production',  'Concept to Screen',          film,    Clapperboard],
  ['Video Editing',    'Stories that Engage',         video,   Video],
  ['Music Production', 'Sound that Stands Out',       music,   Music],
  ['Photography',      'Capture Every Moment',        photo,   Camera],
  ['VFX & Animation',  'Bring Imagination to Life',   vfx,     Sparkles],
  ['Event Coverage',   'Events that Inspire',         event,   Camera],
  ['Live Streaming',   'Broadcast Without Limits',    live,    Radio],
  ['Content Creation', 'Ideas that Connect',          content, Wand2],
];


/* ==========================================================================
   9. MAKEOVER SERVICES DATA
   ========================================================================== */
export const makeovers = [
  'Film & TV Makeover',
  'Event Makeover',
  'Dance Makeover',
  'Ad Shoot Makeover',
  'Music Video Makeover',
  'Influencer Makeover',
];


/* ==========================================================================
   10. BOTTOM PRODUCTION SERVICES DATA
   Format: [serviceTitle, description, IconComponent]
   ========================================================================== */
export const bottomServices = [
  [
    'POST PRODUCTION',
    'Professional editing, color grading, sound design, VFX and final polish to bring your story to life.',
    Clapperboard
  ],
  [
    'PROMOTION',
    'Strategic campaign promotion, engaging content teasers, trailers, and social media campaigns that create buzz.',
    Megaphone
  ],
  [
    'DIGITAL MARKETING',
    'Targeted digital marketing campaigns, influencer outreach, and high-converting ads that grow your audience.',
    BarChart3
  ],
];