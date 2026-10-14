import cityLightsPoster from "../../assets/city_lights_poster.png";
import brokenSilencePoster from "../../assets/broken_silence_poster.png";
import theJourneyPoster from "../../assets/the_journey_poster.png";

// Mock database for the Contacts page
export const CONTACTS_DATA = [
  {
    id: 1,
    name: "Raghav Mehta",
    role: "Casting Director",
    company: "Zenith Films",
    location: "Mumbai, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
    online: true,
    starred: false,
    category: "Casting Directors", // Can map to: Industry Professionals, Agencies, Casting Directors, Co-stars, Personal
    tags: ["Casting Director", "Short Films"],
    contactInfo: {
      email: "raghav.mehta@zenithfilms.com",
      phone: "+91 98765 43210",
      address: "Zenith Films, Andheri West,\nMumbai, Maharashtra 400058",
      website: "www.zenithfilms.com",
      socials: {
        instagram: "@raghavmehta_casting",
        linkedin: "linkedin.com/in/raghavmehta",
        twitter: "@raghav_cg"
      }
    },
    about: "Raghav Mehta is a renowned casting director with over 10 years of experience in the film and web industry. He has worked on multiple successful films, web series, and ad campaigns.",
    projects: [
      {
        id: "p1",
        title: "City Lights",
        type: "Web Series",
        role: "Casting Director",
        year: "2024",
        cover: cityLightsPoster
      },
      {
        id: "p2",
        title: "Broken Silence",
        type: "Feature Film",
        role: "Casting Director",
        year: "2023",
        cover: brokenSilencePoster
      },
      {
        id: "p3",
        title: "The Journey",
        type: "Short Film",
        role: "Casting Director",
        year: "2023",
        cover: theJourneyPoster
      }
    ],
    companyInfo: {
      logoText: "ZENITH",
      name: "Zenith Films",
      industry: "Film Production",
      founded: "2012",
      headOffice: "Mumbai, Maharashtra",
      website: "www.zenithfilms.com"
    },
    conversations: [
      { id: "c1", time: "11:30 AM", message: "Hi Arjun, we have an exciting project...", unread: 2 },
      { id: "c2", time: "2 May", message: "Please share your availability..." },
      { id: "c3", time: "28 Apr", message: "Thanks for your time today." }
    ]
  },
  {
    id: 2,
    name: "Neha Kapoor",
    role: "Production Manager",
    company: "Balaji Telefilms",
    location: "Delhi, India",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80",
    online: false,
    starred: false,
    category: "Industry Professionals",
    tags: ["Production", "Coordinator"],
    contactInfo: {
      email: "neha.kapoor@balaji.com",
      phone: "+91 99887 76655",
      address: "Balaji Telefilms, Film City,\nSector 16A, Noida",
      website: "www.balajitelefilms.com",
      socials: {
        instagram: "@neha_kapoor_prod",
        linkedin: "linkedin.com/in/nehakapoor_balaji",
        twitter: "@neha_k_prod"
      }
    },
    about: "Neha Kapoor is an experienced Production Manager with a demonstrated history of working in television and commercial productions. Specialist in scheduling and casting coordination.",
    projects: [
      {
        id: "p4",
        title: "Kahaani 2026",
        type: "Web Series",
        role: "Production Manager",
        year: "2024",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=200&q=80"
      }
    ],
    companyInfo: {
      logoText: "BALAJI",
      name: "Balaji Telefilms",
      industry: "Television Production",
      founded: "1994",
      headOffice: "Mumbai, Maharashtra",
      website: "www.balajitelefilms.com"
    },
    conversations: [
      { id: "c4", time: "10:15 AM", message: "Did you review the production plan?" }
    ]
  },
  {
    id: 3,
    name: "Amit Sharma",
    role: "Director",
    company: "Viacom18 Studios",
    location: "Mumbai, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
    online: false,
    starred: true,
    category: "Industry Professionals",
    tags: ["Director", "Drama"],
    contactInfo: {
      email: "amit.sharma@viacom18.com",
      phone: "+91 98989 89898",
      address: "Viacom18 Studios, Senapati Bapat Marg,\nMumbai",
      website: "www.viacom18.com",
      socials: {
        instagram: "@amitsharma_director",
        linkedin: "linkedin.com/in/amitsharmadirects",
        twitter: "@amitsharmadirects"
      }
    },
    about: "Amit Sharma is an award-winning feature film director specializing in gripping narrative dramas and cinematic excellence.",
    projects: [
      {
        id: "p5",
        title: "The Silent Valley",
        type: "Feature Film",
        role: "Director",
        year: "2023",
        cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=300&h=200&q=80"
      }
    ],
    companyInfo: {
      logoText: "VIACOM",
      name: "Viacom18 Studios",
      industry: "Film Production & Distribution",
      founded: "2007",
      headOffice: "Mumbai, India",
      website: "www.viacom18.com"
    },
    conversations: [
      { id: "c5", time: "3 May", message: "Excellent showreel. Let's discuss details next week." }
    ]
  },
  {
    id: 4,
    name: "Karan Malhotra",
    role: "Producer",
    company: "Dharma Productions",
    location: "Mumbai, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=300&h=300&q=80",
    online: false,
    starred: false,
    category: "Industry Professionals",
    tags: ["Producer", "Bollywood"],
    contactInfo: {
      email: "karan.malhotra@dharma.com",
      phone: "+91 97777 66666",
      address: "Dharma Productions, Khar West, Mumbai",
      website: "www.dharma-production.com",
      socials: {
        instagram: "@karanmalhotra_prod",
        linkedin: "linkedin.com/in/karanmalhotra"
      }
    },
    about: "Karan Malhotra works at Dharma Productions overseeing casting allocations and talent relations for big-budget movies.",
    projects: [],
    companyInfo: {
      logoText: "DHARMA",
      name: "Dharma Productions",
      industry: "Entertainment Production",
      founded: "1979",
      headOffice: "Mumbai, Maharashtra",
      website: "www.dharma-production.com"
    },
    conversations: []
  },
  {
    id: 5,
    name: "Meera Iyer",
    role: "Talent Coordinator",
    company: "Talent Hunt Agency",
    location: "Bangalore, Karnataka",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80",
    online: false,
    starred: false,
    category: "Agencies",
    tags: ["Talent Scouting", "Modeling"],
    contactInfo: {
      email: "meera.iyer@talenthunt.com",
      phone: "+91 80234 56789",
      address: "Talent Hunt, Indiranagar, Bangalore",
      website: "www.talenthunt.com",
      socials: {
        instagram: "@meera_talentscout",
        linkedin: "linkedin.com/in/meera-iyer-talent"
      }
    },
    about: "Meera is a professional scouting agent helping top production companies find model and acting talent in South India.",
    projects: [],
    companyInfo: {
      logoText: "THUNT",
      name: "Talent Hunt Agency",
      industry: "Talent Agency",
      founded: "2015",
      headOffice: "Bangalore, Karnataka",
      website: "www.talenthunt.com"
    },
    conversations: []
  },
  {
    id: 6,
    name: "Silver Screen Productions",
    role: "Production House",
    company: "Silver Screen",
    location: "Mumbai, Maharashtra",
    avatar: "", // Initials will be used
    online: false,
    starred: false,
    category: "Agencies",
    tags: ["Production House", "VFX Studios"],
    contactInfo: {
      email: "info@silverscreen.in",
      phone: "+91 22 8888 9999",
      address: "Silver Screen Heights, Goregaon East, Mumbai",
      website: "www.silverscreen.in",
      socials: {
        linkedin: "linkedin.com/company/silverscreen",
        twitter: "@silverscreen_in"
      }
    },
    about: "Silver Screen Productions is one of India's leading providers of end-to-end filming and post-production VFX facilities.",
    projects: [],
    companyInfo: {
      logoText: "SSP",
      name: "Silver Screen Productions",
      industry: "Film & VFX Studio",
      founded: "2010",
      headOffice: "Mumbai, India",
      website: "www.silverscreen.in"
    },
    conversations: []
  },
  {
    id: 7,
    name: "Pooja Desai",
    role: "Costume Designer",
    company: "Vogue Styles",
    location: "Mumbai, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80",
    online: false,
    starred: false,
    category: "Personal",
    tags: ["Designer", "Costumes"],
    contactInfo: {
      email: "pooja.desai@voguestyles.com",
      phone: "+91 91234 56780",
      address: "Bandra West, Mumbai",
      website: "www.poojadesaistyle.com",
      socials: {
        instagram: "@poojadesai_costumes",
        linkedin: "linkedin.com/in/poojadesaistyle"
      }
    },
    about: "Pooja is a seasoned designer responsible for style directions, set dressings, and wardrobes of major Bollywood stars.",
    projects: [],
    companyInfo: {
      logoText: "VOGUE",
      name: "Vogue Styles",
      industry: "Fashion Styling & Costumes",
      founded: "2018",
      headOffice: "Mumbai, Maharashtra",
      website: "www.poojadesaistyle.com"
    },
    conversations: []
  },
  {
    id: 8,
    name: "Poght TV Network",
    role: "Channel / Broadcaster",
    company: "Poght Media Group",
    location: "Mumbai, Maharashtra",
    avatar: "", // Initials
    online: false,
    starred: false,
    category: "Agencies",
    tags: ["Channel", "TV Shows", "Broadcasting"],
    contactInfo: {
      email: "programming@poghttv.com",
      phone: "+91 22 5555 4444",
      address: "Poght Media Centre, Worli, Mumbai",
      website: "www.poghttv.com",
      socials: {
        instagram: "@poghttv",
        twitter: "@poght_network"
      }
    },
    about: "Poght TV Network is a major entertainment broadcaster and satellite TV network airing dramas, soaps, and game shows.",
    projects: [],
    companyInfo: {
      logoText: "POGHT",
      name: "Poght TV Network",
      industry: "Media Broadcasting",
      founded: "2009",
      headOffice: "Mumbai, India",
      website: "www.poghttv.com"
    },
    conversations: []
  }
];
