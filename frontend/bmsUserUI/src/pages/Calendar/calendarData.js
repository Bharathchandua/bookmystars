// Shared event data dynamically anchored to current month/year
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const monthNamesShort = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const currentMonthStr = String(currentMonth + 1).padStart(2, "0");
const makeDate = (day) => `${currentYear}-${currentMonthStr}-${String(day).padStart(2, "0")}`;

export const CALENDAR_EVENTS = [
  { id: 1,  date: makeDate(1),  title: "Gym & Fitness",     category: "personal",  time: "7:00 AM",  endTime: "8:00 AM",  location: "Gold's Gym, Lokhandwala" },
  { id: 2,  date: makeDate(3),  title: "Audition Screen",   category: "audition",  time: "11:00 AM", endTime: "12:00 PM", location: "Film City, Mumbai" },
  { id: 3,  date: makeDate(6),  title: "Acting Workshop",   category: "training",  time: "10:00 AM", endTime: "12:00 PM", location: "Drama School, Andheri" },
  { id: 4,  date: makeDate(8),  title: "Director Meeting",  category: "meeting",   time: "4:00 PM",  endTime: "5:00 PM",  location: "Zoom Video Call" },
  { id: 5,  date: makeDate(10), title: "Commercial Shoot",  category: "shooting",  time: "9:00 AM",  endTime: "6:00 PM",  location: "Studio 7, Bandra" },
  { id: 6,  date: makeDate(14), title: "Casting Briefing",  category: "casting",   time: "2:00 PM",  endTime: "4:00 PM",  location: "Casting Office, Juhu" },
  { id: 7,  date: makeDate(17), title: "Web Series Audition", category: "audition", time: "10:30 AM", endTime: "12:00 PM", location: "City Lights Studio" },
  { id: 8,  date: makeDate(20), title: "Jewelry Campaign",  category: "shooting",  time: "8:00 AM",  endTime: "4:00 PM",  location: "Tanishq Flagship Ad" },
  { id: 9,  date: makeDate(22), title: "Voice Modulation",  category: "training",  time: "11:00 AM", endTime: "12:30 PM", location: "Andheri West, Mumbai" },
  { id: 10, date: makeDate(25), title: "Production Review", category: "meeting",   time: "3:00 PM",  endTime: "4:00 PM",  location: "BookMyStars Studio" },
  { id: 11, date: makeDate(28), title: "Editorial Lookbook", category: "shooting", time: "9:00 AM",  endTime: "5:00 PM",  location: "Prestige Studio" },
];

export const UPCOMING_EVENTS = [
  { id: 1,  month: monthNamesShort[currentMonth], day: 14, title: "Casting Briefing",   sub: "Web Series – City Lights", time: "10:30 AM – 12:00 PM", category: "audition" },
  { id: 2,  month: monthNamesShort[currentMonth], day: 20, title: "Jewelry Campaign",   sub: "Tanishq Brand Shoot",       time: "9:00 AM – 6:00 PM",  category: "shooting" },
  { id: 3,  month: monthNamesShort[currentMonth], day: 25, title: "Production Review",  sub: "Project Discussion",        time: "3:00 PM – 4:00 PM",  category: "meeting"  },
  { id: 4,  month: monthNamesShort[currentMonth], day: 28, title: "Editorial Lookbook", sub: "Prestige Studio Setup",     time: "9:00 AM – 5:00 PM",  category: "shooting" },
];

export const TODAY_EVENTS = [
  { id: 9,  startTime: "11:00 AM", endTime: "12:30 PM", title: "Voice Modulation",      location: "Andheri West, Mumbai", category: "training" },
  { id: 10, startTime: "03:00 PM", endTime: "04:00 PM", title: "Meeting with Director", location: "Zoom Meeting",          category: "meeting"  },
  { id: 11, startTime: "07:00 PM", endTime: "08:00 PM", title: "Fitness & Conditioning", location: "Gold's Gym",           category: "personal" },
];

export const LEGEND_ITEMS = [
  { category: "audition",  label: "Audition"    },
  { category: "shooting",  label: "Shooting"    },
  { category: "meeting",   label: "Meeting"     },
  { category: "training",  label: "Training"    },
  { category: "casting",   label: "Casting Call"},
  { category: "personal",  label: "Personal"    },
  { category: "other",     label: "Other"       },
];

export const CALENDAR_SYNC_PROVIDERS = [
  { id: "google",  name: "Google Calendar",  icon: "G", iconColor: "#4285F4", iconBg: "#EBF2FE" },
  { id: "outlook", name: "Outlook Calendar", icon: "O", iconColor: "#0078D4", iconBg: "#E5F2FB" },
  { id: "apple",   name: "Apple Calendar",   icon: "A", iconColor: "#555555", iconBg: "#F2F2F2" },
];
