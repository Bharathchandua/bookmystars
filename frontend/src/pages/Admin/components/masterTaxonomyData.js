/**
 * Standard Film & Entertainment Industry Master Taxonomy
 * Represents the 24 Crafts of Cinema and ~114 Recognized Industry Designations
 */

export const STANDARD_INDUSTRY_PROFESSIONS = [
  // 1. Writing & Direction
  { name: "Film Director", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Assistant Director (1st AD)", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Second Assistant Director (2nd AD)", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Associate Director", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Creative Director", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Screenplay Writer", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Dialogue Writer", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Story Writer", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Script Supervisor", craftCategory: "Writing & Direction", department: "Writing & Direction" },
  { name: "Continuity Supervisor", craftCategory: "Writing & Direction", department: "Writing & Direction" },

  // 2. Acting & Performance
  { name: "Actor", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Lead Actor", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Lead Actress", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Supporting Actor", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Character Actor", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Child Artist", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Theater Artist", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Standup Comedian", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Mimicry Artist", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Voice Artist", craftCategory: "Music & Voice", department: "Acting & Performance" },
  { name: "Dubbing Artist", craftCategory: "Music & Voice", department: "Acting & Performance" },
  { name: "Body Double", craftCategory: "Acting & Performance", department: "Acting & Performance" },
  { name: "Stunt Double", craftCategory: "Stunts & Action", department: "Acting & Performance" },
  { name: "Background Artist / Extra", craftCategory: "Acting & Performance", department: "Acting & Performance" },

  // 3. Modeling & Commercials
  { name: "Model", craftCategory: "Acting & Performance", department: "Modeling & Commercials" },
  { name: "Fashion Model", craftCategory: "Acting & Performance", department: "Modeling & Commercials" },
  { name: "Commercial Model", craftCategory: "Acting & Performance", department: "Modeling & Commercials" },
  { name: "Runway / Ramp Model", craftCategory: "Acting & Performance", department: "Modeling & Commercials" },
  { name: "Fitness Model", craftCategory: "Acting & Performance", department: "Modeling & Commercials" },
  { name: "Hand & Parts Model", craftCategory: "Acting & Performance", department: "Modeling & Commercials" },
  { name: "Editorial Model", craftCategory: "Acting & Performance", department: "Modeling & Commercials" },

  // 4. Cinematography & Camera
  { name: "Director of Photography (DoP)", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "Cinematographer", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "Camera Operator", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "Steadicam Operator", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "Drone / Aerial Cinematographer", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "1st Assistant Camera (Focus Puller)", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "2nd Assistant Camera (Clapper Loader)", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "Gimbal Operator", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "Underwater Camera Specialist", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },
  { name: "DIT (Digital Imaging Technician)", craftCategory: "Technical & Camera", department: "Cinematography & Camera" },

  // 5. Lighting & Grip
  { name: "Gaffer (Chief Lighting Technician)", craftCategory: "Technical & Camera", department: "Lighting & Grip" },
  { name: "Best Boy Electric", craftCategory: "Technical & Camera", department: "Lighting & Grip" },
  { name: "Key Grip", craftCategory: "Technical & Camera", department: "Lighting & Grip" },
  { name: "Best Boy Grip", craftCategory: "Technical & Camera", department: "Lighting & Grip" },
  { name: "Dolly Grip", craftCategory: "Technical & Camera", department: "Lighting & Grip" },
  { name: "Rigging Grip", craftCategory: "Technical & Camera", department: "Lighting & Grip" },
  { name: "Lighting Programmer", craftCategory: "Technical & Camera", department: "Lighting & Grip" },

  // 6. Sound & Audio Engineering
  { name: "Production Sound Mixer", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "Boom Operator", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "Sound Designer", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "Foley Artist", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "Supervising Sound Editor", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "ADR Recordist", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "Re-recording Mixer", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "Audio Mastering Engineer", craftCategory: "Music & Voice", department: "Sound & Audio" },
  { name: "Sound Effects (SFX) Editor", craftCategory: "Music & Voice", department: "Sound & Audio" },

  // 7. Music & Singing
  { name: "Music Director / Composer", craftCategory: "Music & Voice", department: "Music & Singing" },
  { name: "Singer", craftCategory: "Music & Voice", department: "Music & Singing" },
  { name: "Playback Singer (Male)", craftCategory: "Music & Voice", department: "Music & Singing" },
  { name: "Playback Singer (Female)", craftCategory: "Music & Voice", department: "Music & Singing" },
  { name: "Background Score Composer", craftCategory: "Music & Voice", department: "Music & Singing" },
  { name: "Lyricist", craftCategory: "Writing & Direction", department: "Music & Singing" },
  { name: "Music Arranger / Programmer", craftCategory: "Music & Voice", department: "Music & Singing" },
  { name: "Instrumentalist / Session Musician", craftCategory: "Music & Voice", department: "Music & Singing" },

  // 8. Dance & Movement
  { name: "Choreographer", craftCategory: "Dance & Movement", department: "Dance & Movement" },
  { name: "Associate Choreographer", craftCategory: "Dance & Movement", department: "Dance & Movement" },
  { name: "Dancer", craftCategory: "Dance & Movement", department: "Dance & Movement" },
  { name: "Background Dancer", craftCategory: "Dance & Movement", department: "Dance & Movement" },
  { name: "Classical Dancer", craftCategory: "Dance & Movement", department: "Dance & Movement" },
  { name: "Contemporary Dancer", craftCategory: "Dance & Movement", department: "Dance & Movement" },
  { name: "Hip-Hop / Folk Dancer", craftCategory: "Dance & Movement", department: "Dance & Movement" },

  // 9. Stunts & Action
  { name: "Action Director / Stunt Coordinator", craftCategory: "Stunts & Action", department: "Stunts & Action" },
  { name: "Fight Master", craftCategory: "Stunts & Action", department: "Stunts & Action" },
  { name: "Stunt Performer", craftCategory: "Stunts & Action", department: "Stunts & Action" },
  { name: "Wirework Specialist", craftCategory: "Stunts & Action", department: "Stunts & Action" },
  { name: "Precision Stunt Driver", craftCategory: "Stunts & Action", department: "Stunts & Action" },
  { name: "Horse & Equestrian Stunt Artist", craftCategory: "Stunts & Action", department: "Stunts & Action" },
  { name: "Martial Arts Specialist", craftCategory: "Stunts & Action", department: "Stunts & Action" },

  // 10. Art & Production Design
  { name: "Production Designer", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Art Director", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Assistant Art Director", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Set Decorator", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Set Dresser", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Prop Master", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Construction Coordinator", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Concept Artist", craftCategory: "Art & Production Design", department: "Art & Production Design" },
  { name: "Storyboard Artist", craftCategory: "Art & Production Design", department: "Art & Production Design" },

  // 11. Costume & Styling
  { name: "Costume Designer", craftCategory: "Hair, Makeup & Costume", department: "Costume & Styling" },
  { name: "Celebrity Fashion Stylist", craftCategory: "Hair, Makeup & Costume", department: "Costume & Styling" },
  { name: "Wardrobe Supervisor", craftCategory: "Hair, Makeup & Costume", department: "Costume & Styling" },
  { name: "Set Costumer", craftCategory: "Hair, Makeup & Costume", department: "Costume & Styling" },
  { name: "Textile & Dye Specialist", craftCategory: "Hair, Makeup & Costume", department: "Costume & Styling" },
  { name: "Costume Standby", craftCategory: "Hair, Makeup & Costume", department: "Costume & Styling" },

  // 12. Hair, Makeup & Prosthetics
  { name: "Key Makeup Artist", craftCategory: "Hair, Makeup & Costume", department: "Hair, Makeup & SFX" },
  { name: "Prosthetics & SFX Makeup Artist", craftCategory: "Hair, Makeup & Costume", department: "Hair, Makeup & SFX" },
  { name: "Character Makeup Artist", craftCategory: "Hair, Makeup & Costume", department: "Hair, Makeup & SFX" },
  { name: "Hair Stylist", craftCategory: "Hair, Makeup & Costume", department: "Hair, Makeup & SFX" },
  { name: "Wig & Beard Specialist", craftCategory: "Hair, Makeup & Costume", department: "Hair, Makeup & SFX" },
  { name: "Airbrush Makeup Specialist", craftCategory: "Hair, Makeup & Costume", department: "Hair, Makeup & SFX" },

  // 13. Post-Production, Editing & VFX
  { name: "Film Editor", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Assistant Film Editor", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Colorist / DI Specialist", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "VFX Supervisor", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "VFX Compositor", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "3D Modeler & Animator", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Roto & Paint Artist", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Motion Graphics Designer", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Title Sequence Designer", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "CGI Artist", craftCategory: "Post-Production & VFX", department: "Post-Production & VFX" },

  // 14. Production Management & Executive
  { name: "Producer", craftCategory: "Writing & Direction", department: "Production Management" },
  { name: "Executive Producer (EP)", craftCategory: "Writing & Direction", department: "Production Management" },
  { name: "Line Producer", craftCategory: "Writing & Direction", department: "Production Management" },
  { name: "Production Manager", craftCategory: "Writing & Direction", department: "Production Management" },
  { name: "Unit Production Manager (UPM)", craftCategory: "Writing & Direction", department: "Production Management" },
  { name: "Production Controller", craftCategory: "Writing & Direction", department: "Production Management" },
  { name: "Location Manager", craftCategory: "Writing & Direction", department: "Production Management" },
  { name: "Post-Production Supervisor", craftCategory: "Writing & Direction", department: "Production Management" },

  // 15. Casting, Publicity & BTS
  { name: "Casting Director", craftCategory: "Writing & Direction", department: "Casting & Publicity" },
  { name: "Casting Associate", craftCategory: "Writing & Direction", department: "Casting & Publicity" },
  { name: "Talent Agent / Artist Manager", craftCategory: "Specialized Craft", department: "Casting & Publicity" },
  { name: "Publicist / PR Manager", craftCategory: "Specialized Craft", department: "Casting & Publicity" },
  { name: "Still Photographer", craftCategory: "Technical & Camera", department: "Casting & Publicity" },
  { name: "BTS Videographer (Making-of)", craftCategory: "Technical & Camera", department: "Casting & Publicity" }
];

export const STANDARD_24_CRAFTS = [
  { name: "Direction", description: "Film, series, stage and commercial direction" },
  { name: "Screenplay & Writing", description: "Screenplays, dialogs, script doctoring and story arts" },
  { name: "Acting & Performance", description: "Screen acting, method performance, comedy, theater and stage arts" },
  { name: "Cinematography", description: "Director of photography, camera capture, drone and lighting arts" },
  { name: "Film Editing", description: "Offline, online storytelling, assembly, and pacing" },
  { name: "Music Direction & Composition", description: "Original soundtracks, background scoring, and orchestration" },
  { name: "Sound Recording & Design", description: "Sync sound, boom operation, Foley, ADR and Dolby Atmos mixing" },
  { name: "Art & Production Design", description: "World building, architectural sets, props and scenery" },
  { name: "Stunts & Action", description: "Combat choreography, wire rigging, fight coordination and stunt execution" },
  { name: "Dance & Choreography", description: "Classical, contemporary, cinematic, and street choreographies" },
  { name: "Costume Design & Styling", description: "Wardrobe fabrication, period dressing, and couture styling" },
  { name: "Hair & Makeup Styling", description: "Character cosmetology, prosthetics, SFX, and period hairdressing" },
  { name: "Visual Effects (VFX)", description: "CGI modeling, compositing, green-screen keying, and simulations" },
  { name: "Color Grading (DI)", description: "Digital intermediate, LUT mastering, and color timing" },
  { name: "Production Management", description: "Line production, scheduling, logistics, and budgeting" },
  { name: "Casting Direction", description: "Auditions, character scouting, and talent packaging" },
  { name: "Playback Singing", description: "Studio vocal recordings across all cinematic genres" },
  { name: "Lyrics Writing", description: "Lyrical poetry, meter construction, and song writing" },
  { name: "Gaffer & Lighting", description: "Lighting design, power distribution, and mood illumination" },
  { name: "Grip & Rigging", description: "Dolly tracks, cranes, Steadicam stabilization, and safety rigging" },
  { name: "Voice Dubbing & Foley", description: "Multi-lingual dubbing, voice matching, and live sound reproduction" },
  { name: "Modeling & Commercials", description: "Fashion runways, print advertising, and brand campaigns" },
  { name: "Still Photography & BTS", description: "Set publicity stills, promotional posters, and behind-the-scenes" },
  { name: "PR, Publicity & Promotion", description: "Press relations, digital promotion, and studio marketing" }
];

export const STANDARD_INDUSTRY_SKILLS = [
  // Acting & Performance
  { name: "Method Acting", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Monologue Delivery", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Improvisation", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Comic Timing", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Dialect & Accent Control", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Micro-Expressions", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Classical Theater", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Voice Modulation", category: "Music & Voice", department: "Acting & Performance" },
  { name: "Mimicry", category: "Acting & Performance", department: "Acting & Performance" },
  { name: "Standup Comedy", category: "Acting & Performance", department: "Acting & Performance" },

  // Dance & Movement
  { name: "Bharatanatyam", category: "Dance & Movement", department: "Dance & Movement" },
  { name: "Kathak", category: "Dance & Movement", department: "Dance & Movement" },
  { name: "Kuchipudi", category: "Dance & Movement", department: "Dance & Movement" },
  { name: "Hip-Hop / Street Dance", category: "Dance & Movement", department: "Dance & Movement" },
  { name: "Contemporary Dance", category: "Dance & Movement", department: "Dance & Movement" },
  { name: "Freestyle Dance", category: "Dance & Movement", department: "Dance & Movement" },
  { name: "Aerial Silk & Acrobatics", category: "Dance & Movement", department: "Dance & Movement" },
  { name: "Choreography Design", category: "Dance & Movement", department: "Dance & Movement" },

  // Music & Vocal
  { name: "Carnatic Classical Vocal", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Hindustani Classical Vocal", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Western Pop / Jazz Vocal", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Playback Singing", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Rap / Hip-Hop Vocal", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Beatboxing", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Acoustic Guitar", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Piano / Synthesizer", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Flute", category: "Music & Voice", department: "Music & Vocal" },
  { name: "Music Programming / DAW", category: "Music & Voice", department: "Music & Vocal" },

  // Stunts & Action
  { name: "Kickboxing & MMA", category: "Stunts & Action", department: "Stunts & Action" },
  { name: "Kalarippayattu", category: "Stunts & Action", department: "Stunts & Action" },
  { name: "Martial Arts / Karate", category: "Stunts & Action", department: "Stunts & Action" },
  { name: "Wirework & Rigging", category: "Stunts & Action", department: "Stunts & Action" },
  { name: "Sword Fighting & Fencing", category: "Stunts & Action", department: "Stunts & Action" },
  { name: "High Falls & Airbag Landings", category: "Stunts & Action", department: "Stunts & Action" },
  { name: "Precision Stunt Driving", category: "Stunts & Action", department: "Stunts & Action" },
  { name: "Gymnastics & Parkour", category: "Stunts & Action", department: "Stunts & Action" },

  // Camera & Technical
  { name: "Cinematography", category: "Technical & Camera", department: "Camera & Technical" },
  { name: "Steadicam Operation", category: "Technical & Camera", department: "Camera & Technical" },
  { name: "Drone Pilot (DGCA Licensed)", category: "Technical & Camera", department: "Camera & Technical" },
  { name: "Gimbal Balancing (Ronin)", category: "Technical & Camera", department: "Camera & Technical" },
  { name: "Anamorphic Lenses", category: "Technical & Camera", department: "Camera & Technical" },
  { name: "Lighting & Gaffing", category: "Technical & Camera", department: "Camera & Technical" },

  // Post-Production & VFX
  { name: "Adobe Premiere Pro", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "DaVinci Resolve Color Grading", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Final Cut Pro", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Avid Media Composer", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Nuke Compositing", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Blender 3D", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Maya Animation", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "After Effects Motion Graphics", category: "Post-Production & VFX", department: "Post-Production & VFX" },
  { name: "Pro Tools Audio Mixing", category: "Music & Voice", department: "Post-Production & VFX" },
  { name: "Foley Creation", category: "Music & Voice", department: "Post-Production & VFX" },

  // Makeup, Hair & Art
  { name: "Prosthetics & Silicone SFX", category: "Hair, Makeup & Costume", department: "Makeup & Art" },
  { name: "Airbrush Makeup", category: "Hair, Makeup & Costume", department: "Makeup & Art" },
  { name: "Period Hairdressing", category: "Hair, Makeup & Costume", department: "Makeup & Art" },
  { name: "Digital Storyboarding", category: "Art & Production Design", department: "Makeup & Art" },
  { name: "Set Miniature Model Making", category: "Art & Production Design", department: "Makeup & Art" },
  { name: "Calligraphy & Prop Design", category: "Art & Production Design", department: "Makeup & Art" }
];

export const STANDARD_LANGUAGES = [
  { name: "Telugu", nativeName: "తెలుగు", code: "te" },
  { name: "Hindi", nativeName: "हिन्दी", code: "hi" },
  { name: "Tamil", nativeName: "தமிழ்", code: "ta" },
  { name: "Kannada", nativeName: "ಕನ್ನಡ", code: "kn" },
  { name: "Malayalam", nativeName: "മലയാളം", code: "ml" },
  { name: "English", nativeName: "English", code: "en" },
  { name: "Bengali", nativeName: "বাংলা", code: "bn" },
  { name: "Marathi", nativeName: "मराठी", code: "mr" },
  { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", code: "pa" },
  { name: "Gujarati", nativeName: "ગુજરાતી", code: "gu" },
  { name: "Odia", nativeName: "ଓଡ଼ିଆ", code: "or" },
  { name: "Bhojpuri", nativeName: "भोजपुरी", code: "bho" },
  { name: "Urdu", nativeName: "اردو", code: "ur" },
  { name: "Assamese", nativeName: "অসমীয়া", code: "as" },
  { name: "Konkani", nativeName: "कोंकणी", code: "kok" },
  { name: "Sanskrit", nativeName: "संस्कृतम्", code: "sa" },
  { name: "Spanish", nativeName: "Español", code: "es" },
  { name: "French", nativeName: "Français", code: "fr" },
  { name: "German", nativeName: "Deutsch", code: "de" },
  { name: "Arabic", nativeName: "العربية", code: "ar" },
  { name: "Japanese", nativeName: "日本語", code: "ja" },
  { name: "Korean", nativeName: "한국어", code: "ko" },
  { name: "Mandarin Chinese", nativeName: "中文", code: "zh" },
  { name: "Italian", nativeName: "Italiano", code: "it" }
];
