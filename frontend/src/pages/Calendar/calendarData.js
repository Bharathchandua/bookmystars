// Shared event data used across Calendar components
export const CALENDAR_EVENTS = [
  // Week of April 28 (shown as previous month)
  // Week of May 1
  { id: 1,  date: "2024-05-01", title: "Gym",           category: "personal",  time: "7:00 AM",  endTime: "8:00 AM",  location: "Gold's Gym, Lokhandwala" },
  { id: 2,  date: "2024-05-03", title: "Audition",      category: "audition",  time: "11:00 AM", endTime: "12:00 PM", location: "Film City, Mumbai" },
  // Week of May 5
  { id: 3,  date: "2024-05-06", title: "Acting Class",  category: "training",  time: "10:00 AM", endTime: "12:00 PM", location: "Drama School, Andheri" },
  { id: 4,  date: "2024-05-06", title: "Meeting",       category: "meeting",   time: "4:00 PM",  endTime: "5:00 PM",  location: "Zoom Meeting" },
  { id: 5,  date: "2024-05-08", title: "Shoot Day 1",   category: "shooting",  time: "9:00 AM",  endTime: "6:00 PM",  location: "Studio 7, Bandra" },
  { id: 6,  date: "2024-05-11", title: "Casting Call",  category: "casting",   time: "2:00 PM",  endTime: "4:00 PM",  location: "Casting Office, Juhu" },
  // Week of May 12
  { id: 7,  date: "2024-05-14", title: "Audition",      category: "audition",  time: "10:30 AM", endTime: "12:00 PM", location: "Web Series – City Lights" },
  { id: 8,  date: "2024-05-15", title: "Brand Shoot",   category: "shooting",  time: "8:00 AM",  endTime: "4:00 PM",  location: "Ad Campaign" },
  // Week of May 19
  { id: 9,  date: "2024-05-20", title: "Voice Training",category: "training",  time: "11:00 AM", endTime: "12:30 PM", location: "Andheri West, Mumbai" },
  { id: 10, date: "2024-05-20", title: "Meeting with Director", category: "meeting", time: "3:00 PM", endTime: "4:00 PM", location: "Zoom Meeting" },
  { id: 11, date: "2024-05-20", title: "Gym",           category: "personal",  time: "7:00 PM",  endTime: "8:00 PM",  location: "Gold's Gym, Lokhandwala" },
  { id: 12, date: "2024-05-22", title: "Shoot Day 2",   category: "shooting",  time: "9:00 AM",  endTime: "6:00 PM",  location: "Ad Campaign" },
  { id: 13, date: "2024-05-24", title: "Meeting",       category: "meeting",   time: "3:00 PM",  endTime: "4:00 PM",  location: "Project Discussion" },
  // Week of May 26
  { id: 14, date: "2024-05-27", title: "Workshop",      category: "other",     time: "2:00 PM",  endTime: "5:00 PM",  location: "Camera Acting Workshop" },
  { id: 15, date: "2024-05-30", title: "Audition",      category: "audition",  time: "1:00 PM",  endTime: "3:00 PM",  location: "Film Studio, Goregaon" },
];

export const UPCOMING_EVENTS = [
  { id: 1,  month: "MAY", day: 21, title: "Audition",   sub: "Web Series – City Lights", time: "10:30 AM – 12:00 PM", category: "audition" },
  { id: 2,  month: "MAY", day: 22, title: "Shoot Day 2",sub: "Ad Campaign",               time: "9:00 AM – 6:00 PM",  category: "shooting" },
  { id: 3,  month: "MAY", day: 24, title: "Meeting",    sub: "Project Discussion",        time: "3:00 PM – 4:00 PM",  category: "meeting"  },
  { id: 4,  month: "MAY", day: 27, title: "Workshop",   sub: "Camera Acting Workshop",    time: "2:00 PM – 5:00 PM",  category: "other"    },
];

export const TODAY_EVENTS = [
  { id: 9,  startTime: "11:00 AM", endTime: "12:30 PM", title: "Voice Training",        location: "Andheri West, Mumbai", category: "training" },
  { id: 10, startTime: "03:00 PM", endTime: "04:00 PM", title: "Meeting with Director", location: "Zoom Meeting",          category: "meeting"  },
  { id: 11, startTime: "07:00 PM", endTime: "08:00 PM", title: "Gym",                   location: "Gold's Gym, Lokhandwala",category: "personal" },
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
