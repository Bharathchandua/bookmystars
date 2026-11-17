// Mock database for the Messages page
export const CONVERSATIONS = [
  {
    id: 1,
    name: "Raghav Mehta",
    role: "Casting Director",
    company: "Zenith Films",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "Hi Arjun, we'd like to schedule...",
    time: "11:30 AM",
    unread: 2,
    online: true,
    starred: false,
    email: "raghav.mehta@zenithfilms.com",
    phone: "+91 98765 43210",
    booking: {
      id: "BK-24-5128",
      project: "Dil Ki Baat – Season 2",
      role: "Supporting Role (Male)",
      cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=300&h=200&q=80"
    },
    sharedMedia: [
      { id: 1, type: "video", url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 2, type: "video", url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 3, type: "image", url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 4, type: "image", url: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 5, type: "video", url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 6, type: "image", url: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 7, type: "image", url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 8, type: "video", url: "https://images.unsplash.com/photo-1460889418202-14df4772c776?auto=format&fit=crop&w=150&h=150&q=80" },
      { id: 9, type: "image", count: "+12", url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    sharedFiles: [
      { id: 1, name: "Script_DilKiBaat_S2.pdf", size: "2.4 MB", type: "pdf" },
      { id: 2, name: "Character_Breakdown_Karan.docx", size: "1.2 MB", type: "docx" }
    ]
  },
  {
    id: 2,
    name: "DreamWorks Entertainment",
    role: "Casting Department",
    company: "DreamWorks",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "Thank you for your interest in...",
    time: "Yesterday",
    unread: 1,
    online: false,
    starred: false,
    email: "casting@dreamworks.com",
    phone: "+1 555-019-2834",
    booking: null,
    sharedMedia: [],
    sharedFiles: []
  },
  {
    id: 3,
    name: "Neha Kapoor",
    role: "Production Manager",
    company: "Balaji Telefilms",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "Please send your updated portfolio.",
    time: "Yesterday",
    unread: 0,
    online: true,
    starred: false,
    email: "neha.kapoor@balaji.com",
    phone: "+91 99887 76655",
    booking: {
      id: "BK-24-9082",
      project: "Kahaani 2026",
      role: "Lead Actress",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=200&q=80"
    },
    sharedMedia: [
      { id: 1, type: "image", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    sharedFiles: []
  },
  {
    id: 4,
    name: "Silver Screen Productions",
    role: "Auditions Desk",
    company: "Silver Screen",
    avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "Hi Arjun, your audition has been...",
    time: "2 Days ago",
    unread: 1,
    online: false,
    starred: false,
    email: "auditions@silverscreen.in",
    phone: "+91 22 4567 8901",
    booking: null,
    sharedMedia: [],
    sharedFiles: []
  },
  {
    id: 5,
    name: "Amit Sharma",
    role: "Director",
    company: "Viacom18 Studios",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "Looking forward to working with you.",
    time: "3 Days ago",
    unread: 0,
    online: false,
    starred: true,
    email: "amit.sharma@viacom18.com",
    phone: "+91 91234 56789",
    booking: null,
    sharedMedia: [],
    sharedFiles: []
  },
  {
    id: 6,
    name: "Bright TV Network",
    role: "Talent Acquisition",
    company: "Bright TV",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "We have an exciting opportunity...",
    time: "4 Days ago",
    unread: 0,
    online: false,
    starred: false,
    email: "hr@brighttv.com",
    phone: "+91 22 9988 7766",
    booking: null,
    sharedMedia: [],
    sharedFiles: []
  },
  {
    id: 7,
    name: "Meera Iyer",
    role: "Talent Coordinator",
    company: "Matrix Media",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "Let me know your availability.",
    time: "1 Week ago",
    unread: 0,
    online: false,
    starred: false,
    email: "meera.iyer@matrixmedia.in",
    phone: "+91 90001 20002",
    booking: null,
    sharedMedia: [],
    sharedFiles: []
  },
  {
    id: 8,
    name: "Sanjay Leela Bhansali",
    role: "Director & Producer",
    company: "Bhansali Productions",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "The costume trials are scheduled for Friday.",
    time: "1 Week ago",
    unread: 0,
    online: true,
    starred: true,
    email: "slb@bhansaliproductions.com",
    phone: "+91 22 2345 6789",
    booking: null,
    sharedMedia: [],
    sharedFiles: []
  },
  {
    id: 9,
    name: "Ekta Kapoor",
    role: "Joint Managing Director",
    company: "Balaji Telefilms",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    lastMsg: "Let's lock the agreement by this week.",
    time: "1 Week ago",
    unread: 0,
    online: false,
    starred: false,
    email: "ekta@balajitelefilms.com",
    phone: "+91 22 9876 5432",
    booking: null,
    sharedMedia: [],
    sharedFiles: []
  }
];

export const INITIAL_MESSAGES = {
  1: [
    {
      id: 101,
      sender: "them",
      text: "Hi Arjun,\n\nWe loved your profile and would like to consider you for the role of Karan in our upcoming web series \"Dil Ki Baat – Season 2\".\n\nAre you available for an audition this week?",
      time: "11:30 AM"
    },
    {
      id: 102,
      sender: "me",
      text: "Hi Raghav,\n\nThank you! I'm really excited about this opportunity.\n\nYes, I'm available. Please let me know the details.",
      time: "11:35 AM",
      read: true
    },
    {
      id: 103,
      sender: "them",
      text: "Great! Please share your available slots for 20th and 21st May. The audition will be online.",
      time: "11:40 AM"
    },
    {
      id: 104,
      sender: "me",
      text: "I'm available on 20th May after 2 PM and 21st May before 1 PM.\n\nPlease let me know which works for you.",
      time: "11:45 AM",
      read: true
    }
  ],
  2: [
    { id: 201, sender: "them", text: "Hello Arjun, we reviewed your profile for the project. Thank you for your interest in casting.", time: "Yesterday" }
  ],
  3: [
    { id: 301, sender: "them", text: "Hey Arjun! Please send your updated portfolio by tonight.", time: "Yesterday" }
  ],
  4: [
    { id: 401, sender: "them", text: "Hi Arjun, your audition has been scheduled successfully.", time: "2 Days ago" }
  ],
  5: [
    { id: 501, sender: "them", text: "Excellent work on the last shot. Looking forward to working with you again.", time: "3 Days ago" }
  ],
  6: [
    { id: 601, sender: "them", text: "Hi Arjun, We have an exciting opportunity. Are you open to commercials?", time: "4 Days ago" }
  ],
  7: [
    { id: 701, sender: "them", text: "Hey Arjun, Meera here. Let know your availability for next week.", time: "1 Week ago" }
  ],
  8: [
    { id: 801, sender: "them", text: "Hi Arjun, Sanjay here. The costume trials for the historical epic are scheduled for Friday. Please confirm your size details with the styling team.", time: "1 Week ago" }
  ],
  9: [
    { id: 901, sender: "them", text: "Hello Arjun, we have reviewed the terms of the lead role. Let's lock the agreement by this week so we can begin pre-production.", time: "1 Week ago" }
  ]
};
