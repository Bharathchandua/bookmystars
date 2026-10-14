import pptxgen from "pptxgenjs";
import path from "path";
import fs from "fs";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "BookMyStars Team";
pptx.company = "BookMyStars";
pptx.title = "BookMyStars - Full-Stack Architecture & Module Presentation";

// Color Palette
const C_BG_DARK = "0F172A";
const C_BG_CARD = "1E293B";
const C_PRIMARY = "7C3AED";
const C_SECONDARY = "EC4899";
const C_SUCCESS = "10B981";
const C_TEXT_LIGHT = "F8FAFC";
const C_TEXT_MUTED = "94A3B8";
const C_ACCENT = "38BDF8";

const imagesDir = "C:\\Users\\User\\.gemini\\antigravity\\brain\\f1517739-a329-4601-ac86-a352aa8c2fbe\\.user_uploaded";
const imgDash = path.join(imagesDir, "media_1791196080078.png");
const imgProf = path.join(imagesDir, "media_1791617001931_56e70d8d.png");
const imgOverview = path.join(imagesDir, "media_1790857874505.png");
const imgTalents = path.join(imagesDir, "media_1791614765038_b52ec6d7.png");

function createBaseSlide(title, subtitle = "") {
  const slide = pptx.addSlide();
  slide.background = { color: C_BG_DARK };

  // Top header bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 1.1,
    fill: { color: C_BG_CARD },
    line: { color: C_PRIMARY, width: 2 }
  });

  slide.addText(title, {
    x: 0.8, y: 0.15, w: 9.5, h: 0.55,
    fontSize: 22, bold: true, color: C_TEXT_LIGHT, fontFace: "Arial"
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 0.65, w: 9.5, h: 0.35,
      fontSize: 12, color: C_ACCENT, fontFace: "Arial"
    });
  }

  slide.addText("BookMyStars Enterprise Architecture", {
    x: 9.5, y: 0.4, w: 3.2, h: 0.3,
    fontSize: 10, color: C_TEXT_MUTED, align: "right", fontFace: "Arial"
  });

  return slide;
}

// ----------------------------------------------------
// SLIDE 1: Title Slide
// ----------------------------------------------------
const s1 = pptx.addSlide();
s1.background = { color: C_BG_DARK };

s1.addText("🎬 BOOKMYSTARS", {
  x: 1.0, y: 1.8, w: 11.33, h: 0.8,
  fontSize: 40, bold: true, color: C_PRIMARY, fontFace: "Arial"
});

s1.addText("Full-Stack Enterprise Talent, Casting & Media Platform", {
  x: 1.0, y: 2.7, w: 11.33, h: 0.6,
  fontSize: 24, bold: true, color: C_TEXT_LIGHT, fontFace: "Arial"
});

s1.addText("End-to-End System Walkthrough, Architecture, Frontend Routing & Technical Deep Dive", {
  x: 1.0, y: 3.4, w: 11.33, h: 0.5,
  fontSize: 15, color: C_ACCENT, fontFace: "Arial"
});

s1.addShape(pptx.shapes.RECTANGLE, {
  x: 1.0, y: 4.3, w: 11.33, h: 1.8,
  fill: { color: C_BG_CARD },
  line: { color: "334155", width: 1 }
});

s1.addText([
  { text: "Technology Stack: ", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "React 18 + Vite | Spring Boot 3 REST | PostgreSQL | JWT Security | TailwindCSS\n", options: { color: C_TEXT_MUTED } },
  { text: "Key Modules: ", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Instagram-Style Privacy | Dynamic Discovery | 100MB 4K Media Streaming | Shoot Bookings\n", options: { color: C_TEXT_MUTED } },
  { text: "Architecture: ", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Single Page Application (SPA) + Stateless Micro-Tier Backend with RBAC", options: { color: C_TEXT_MUTED } }
], {
  x: 1.3, y: 4.5, w: 10.7, h: 1.4,
  fontSize: 13, fontFace: "Arial"
});

s1.addNotes("Good morning/afternoon everyone. Today I am presenting BookMyStars, a full-stack talent management and casting platform engineered using React 18, Vite, Spring Boot 3, and PostgreSQL. I will walk you through the system architecture, frontend and backend request lifecycle, frontend routing, and the core modules we developed.");

// ----------------------------------------------------
// SLIDE 2: Problem Statement & Solution
// ----------------------------------------------------
const s2 = createBaseSlide("1. Executive Summary & Problem vs. Solution", "Why BookMyStars was engineered and what real-world industry problems it solves");

s2.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: "EF4444", width: 1 }
});
s2.addText("❌ The Industry Bottlenecks", {
  x: 1.1, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 16, bold: true, color: "EF4444", fontFace: "Arial"
});
s2.addText([
  { text: "• Fragmented Portfolios:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Talent photos, videos, and stats are scattered across multiple websites, causing loss of casting opportunities.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• High-Definition Upload Failures:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Default web servers reject 4K video showreels due to 1MB/10MB file limits.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Unstandardized Physical Measurements:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Lack of verified height, bust, waist, and hips specs leads to rejected auditions.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Hardcoded / Mock Data in Legacy Portals:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Fake placeholders prevent casting agencies from viewing real registered talent.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 2.3, w: 5.0, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s2.addShape(pptx.shapes.RECTANGLE, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_SUCCESS, width: 1 }
});
s2.addText("✔ The BookMyStars Engineering Solution", {
  x: 7.1, y: 1.8, w: 5.1, h: 0.4,
  fontSize: 16, bold: true, color: C_SUCCESS, fontFace: "Arial"
});
s2.addText([
  { text: "• Unified Digital Portfolio:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Single link containing bio, rates, verified photo portfolio, video showreels, and client reviews.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• 100MB High-Performance Upload Pipeline:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Spring Boot multipart streaming pipeline with client-side HTML5 canvas auto-thumbnails.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Instagram-Style Public vs. Private Profiles:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Privacy toggle with backend data stripping and viewer approval workflow.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• 100% Dynamic Database Architecture:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Zero dummy data; queries PostgreSQL directly for real-time registered talent.", options: { color: C_TEXT_MUTED } }
], {
  x: 7.1, y: 2.3, w: 5.1, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s2.addNotes("In the entertainment casting industry, actors and models struggle with fragmented portfolios and upload limits for 4K video showreels. BookMyStars provides an integrated solution: a 100MB media upload pipeline, verified physical measurements, dynamic talent discovery with zero mock data, and Instagram-style profile privacy.");

// ----------------------------------------------------
// SLIDE 3: System Architecture & Data Flow
// ----------------------------------------------------
const s3 = createBaseSlide("2. End-to-End System Architecture & REST Communication", "How the Client, Vite Proxy, Spring Boot Server, and PostgreSQL interact");

s3.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 11.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_PRIMARY, width: 1 }
});

s3.addText([
  { text: "CLIENT TIER (React 18 + Vite - Port 5173)\n", options: { bold: true, color: C_ACCENT, fontSize: 13 } },
  { text: "• User Interface Components (Dashboard, Profile, PublicProfile, Bookings)\n• Client-Side Routing (React Router v7) & Browser LocalStorage (JWT Token, User State)\n• Axios / Fetch API Service layer managing asynchronous HTTP Requests\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },
  
  { text: "NETWORK & SECURITY BOUNDARY (Vite Reverse Proxy & CORS)\n", options: { bold: true, color: C_SECONDARY, fontSize: 13 } },
  { text: "• Forwards `/api/*` and `/uploads/*` calls to Backend Port 8080 without cross-origin friction\n• Carries Stateless HTTP Header: `Authorization: Bearer <JWT_TOKEN>`\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "APPLICATION TIER (Spring Boot 3 - Port 8080)\n", options: { bold: true, color: C_SUCCESS, fontSize: 13 } },
  { text: "• JwtAuthenticationFilter: Intercepts request, validates claims, populates SecurityContext\n• Controller Layer: REST Endpoints (ProfileController, VideoController, UserController)\n• Service Layer: Business logic, transactional validation, atomic database UPSERTs\n• Repository Layer: Spring Data JPA & Hibernate Object-Relational Mapping\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "PERSISTENCE TIER (PostgreSQL & Disk File System)\n", options: { bold: true, color: C_TEXT_LIGHT, fontSize: 13 } },
  { text: "• PostgreSQL Database: Relational tables (`users`, `profiles`, `videos`, `profile_access_requests`)\n• Disk Storage: High-capacity physical storage for static streaming (`uploads/videos/`, `uploads/portfolio/`)", options: { color: C_TEXT_MUTED, fontSize: 11 } }
], {
  x: 1.2, y: 1.7, w: 10.9, h: 4.7,
  fontFace: "Arial"
});

s3.addNotes("Here is the architectural overview. The frontend is a React Single Page Application on port 5173. During development, Vite acts as a reverse proxy, forwarding requests to the Spring Boot backend on port 8080. The backend validates the JWT token in a security filter chain before passing the request to controllers, services, and the PostgreSQL database.");

// ----------------------------------------------------
// SLIDE 4: Frontend Routing & SPA Deep Dive
// ----------------------------------------------------
const s4 = createBaseSlide("3. Frontend Deep Dive: Single Page Application & Routing", "What happens in the frontend when a user navigates and clicks?");

s4.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_ACCENT, width: 1 }
});
s4.addText("🌐 SPA vs. Traditional Multi-Page Apps", {
  x: 1.1, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 15, bold: true, color: C_ACCENT, fontFace: "Arial"
});
s4.addText([
  { text: "• Single HTML Delivery:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Only one `index.html` is downloaded on the first request. Subsequent navigations never reload the page from the server.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Client-Side Routing (react-router-dom):\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "The browser's HTML5 History API (`pushState`) intercepts URL changes and renders the corresponding component in memory.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Dynamic Parameterized Routing:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Route `/public-profile/:userId` parses the ID via `useParams()` and executes an asynchronous fetch to load the target profile.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Virtual DOM Reconciliation:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "React compares Virtual DOM nodes and repaints only the modified elements (e.g., privacy switch), resulting in 60 FPS fluidity.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 2.3, w: 5.0, h: 4.1,
  fontSize: 11, fontFace: "Arial"
});

s4.addShape(pptx.shapes.RECTANGLE, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_SECONDARY, width: 1 }
});
s4.addText("⚙️ Frontend State & Lifecycle Flow", {
  x: 7.1, y: 1.8, w: 5.1, h: 0.4,
  fontSize: 15, bold: true, color: C_SECONDARY, fontFace: "Arial"
});
s4.addText([
  { text: "1. Component Mount (`useEffect`):\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Component triggers `getCurrentUserProfile()` on load to populate local component state.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "2. Optimistic UI Updates:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "When user clicks 'Private Account', the toggle immediately animates to 'Private' before waiting for the network response, providing zero-lag feedback.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "3. Error Rollback:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "If the backend returns an HTTP 500 or 401 error, state catches the exception and gracefully rolls back the toggle to its previous state.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "4. Token State Synchronization:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Stored user credentials in `localStorage` update simultaneously, maintaining auth continuity across tabs.", options: { color: C_TEXT_MUTED } }
], {
  x: 7.1, y: 2.3, w: 5.1, h: 4.1,
  fontSize: 11, fontFace: "Arial"
});

s4.addNotes("When explaining the frontend to evaluators, mention that BookMyStars is a Single Page Application. It uses React Router v7 for client-side routing. Navigating from /dashboard to /public-profile does not make a server request for a new HTML page; instead, the browser's History API handles the route and mounts the component. We also implemented Optimistic UI updates for a seamless user experience.");

// ----------------------------------------------------
// SLIDE 5: Backend Request Lifecycle & Spring Boot Core
// ----------------------------------------------------
const s5 = createBaseSlide("4. Backend Deep Dive: Spring Boot 3 Request Lifecycle", "What happens behind the scenes when an API call hits the server?");

s5.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 11.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_PRIMARY, width: 1 }
});

s5.addText([
  { text: "STEP 1: SERVLET CONTAINER & SECURITY FILTER CHAIN (`SecurityConfig.java`)\n", options: { bold: true, color: C_ACCENT, fontSize: 12.5 } },
  { text: "• The incoming HTTP request arrives at Tomcat embedded servlet container.\n• `JwtAuthenticationFilter` executes: extracts `Bearer <token>`, verifies signature with HMAC-SHA256, and extracts user email and role.\n• Public endpoints (e.g. `/api/auth/**`, `/api/profile/public/**`) bypass token requirements; secured endpoints reject with 401 Unauthorized.\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "STEP 2: CONTROLLER LAYER (`ProfileController.java`, `VideoController.java`)\n", options: { bold: true, color: C_SECONDARY, fontSize: 12.5 } },
  { text: "• Spring MVC routes the request based on `@GetMapping`, `@PostMapping`, `@PatchMapping`.\n• Binds incoming JSON/Multipart data into strongly typed Java DTOs using `@RequestBody` and `@RequestParam`.\n• Extracts authenticated user context via `Authentication auth` parameter.\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "STEP 3: SERVICE LAYER & BUSINESS LOGIC (`ProfileService.java`)\n", options: { bold: true, color: C_SUCCESS, fontSize: 12.5 } },
  { text: "• Contains business validations, role verification, and access rule evaluations.\n• Strips private data if an unapproved viewer attempts to fetch a locked private profile.\n• Executes `@Transactional` operations ensuring ACID compliance across database writes.\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "STEP 4: REPOSITORY LAYER & POSTGRESQL PERSISTENCE (`Spring Data JPA`)\n", options: { bold: true, color: C_TEXT_LIGHT, fontSize: 12.5 } },
  { text: "• Hibernate translates Java repository calls into optimized PostgreSQL SQL queries.\n• Executes atomic UPSERTs, saves entities, and converts records into safe response DTOs to return JSON to the client.", options: { color: C_TEXT_MUTED, fontSize: 11 } }
], {
  x: 1.2, y: 1.7, w: 10.9, h: 4.7,
  fontFace: "Arial"
});

s5.addNotes("On the backend, every incoming request passes through Spring Security's JwtAuthenticationFilter. If valid, the Controller maps the payload to DTOs. The Service layer enforces business rules, like checking if a profile is private and stripping sensitive photos and measurements. Finally, Spring Data JPA and Hibernate query PostgreSQL and return the serialized JSON response.");

// ----------------------------------------------------
// SLIDE 6: Instagram-Style Public vs. Private Profile Module
// ----------------------------------------------------
const s6 = createBaseSlide("5. Highlight Feature: Instagram-Style Public vs. Private Profiles", "Complete privacy toggle, access request state machine, and data protection");

s6.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_PRIMARY, width: 1 }
});
s6.addText("🔒 Privacy Architecture & Toggle", {
  x: 1.1, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 15, bold: true, color: C_PRIMARY, fontFace: "Arial"
});
s6.addText([
  { text: "• Interactive Switch Next to Photo:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Talent can toggle between Public and Private directly from their Dashboard and Profile headers.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• True Backend Security (Data Stripping):\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Unlike insecure portals that hide data with CSS `display:none`, our backend empties portfolio photos, video showreels, and measurements directly from the API response payload.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• The Locked Card Experience:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Unapproved viewers only see the talent's name, verified badge, and role tags alongside an Instagram-style locked card: 'This Account is Private'.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 2.3, w: 5.0, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s6.addShape(pptx.shapes.RECTANGLE, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_SECONDARY, width: 1 }
});
s6.addText("🔄 Access Request State Machine", {
  x: 7.1, y: 1.8, w: 5.1, h: 0.4,
  fontSize: 15, bold: true, color: C_SECONDARY, fontFace: "Arial"
});
s6.addText([
  { text: "1. Request Submission:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Viewer clicks 'Request to View Profile', fills in Name, Email, Role (e.g. Casting Director), and optional note.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "2. State: PENDING:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Viewer sees '⏳ Request Sent · Pending Talent Approval'. Talent Dashboard shows purple notification banner with counter badge.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "3. Talent Decision (Interactive Modal):\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Talent inspects requester details in 'Profile View Requests' modal and clicks 'Approve Access' or 'Decline'.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "4. State: APPROVED / REJECTED:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Upon approval, the shared link unlocks instantly for that viewer, revealing full media and physical specs.", options: { color: C_TEXT_MUTED } }
], {
  x: 7.1, y: 2.3, w: 5.1, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s6.addNotes("This is one of our flagship features: the Instagram-style Public vs. Private mechanism. We placed a toggle switch right next to the user's photo. When private, unauthorized viewers cannot access photos or measurements. We enforce true security at the API layer by stripping sensitive data in Java, not just hiding it with CSS. Viewers can submit access requests, which the talent reviews and approves from a dedicated modal.");

// ----------------------------------------------------
// SLIDE 7: Talent Dashboard & Profile Management
// ----------------------------------------------------
const s7 = createBaseSlide("6. Talent Dashboard & Dynamic Demographics", "Consolidated talent profile, SVG body silhouette, and dynamic statistics");

s7.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 6.2, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: "334155", width: 1 }
});

s7.addText([
  { text: "• Dynamic Header & Verified Badge:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Displays live full name, verified rosette badge, location, age calculated automatically from date of birth, and language proficiencies.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Multi-Profile Type Support:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Supports multiple talent roles selected during onboarding or profile editing (Actor, Model, Singer, Dancer, Director, Producer).\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Casting Measurements with SVG Silhouette:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Standardized physical casting attributes (Height, Bust, Waist, Hips, Shoe Size, Dress Size, Hair, Eyes) rendered over an anatomical SVG model.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Interactive Edit Profile Modal:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Seamless modal dialog allowing talent to modify bio, day rate, location, roles, and profile privacy in a single atomic transaction.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 1.8, w: 5.6, h: 4.5,
  fontSize: 11.5, fontFace: "Arial"
});

if (fs.existsSync(imgDash)) {
  s7.addImage({ path: imgDash, x: 7.3, y: 1.5, w: 5.2, h: 5.1 });
} else {
  s7.addShape(pptx.shapes.RECTANGLE, { x: 7.3, y: 1.5, w: 5.2, h: 5.1, fill: { color: C_BG_CARD } });
}

s7.addNotes("The Talent Dashboard consolidates all critical casting data. It calculates age dynamically from the date of birth, shows active roles, and visualizes physical measurements over an SVG body silhouette so casting agents have exact sizing specifications.");

// ----------------------------------------------------
// SLIDE 8: 100MB 4K Media Pipeline & Canvas Processing
// ----------------------------------------------------
const s8 = createBaseSlide("7. 100MB Media Pipeline & Smart Video Processing", "High-capacity multipart uploads and zero-overhead client-side thumbnailing");

s8.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_SUCCESS, width: 1 }
});
s8.addText("🎥 100MB Multipart Video Pipeline", {
  x: 1.1, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 15, bold: true, color: C_SUCCESS, fontFace: "Arial"
});
s8.addText([
  { text: "• High-Capacity Server Configuration:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Configured `spring.servlet.multipart.max-file-size=100MB` in `application.properties` to easily accept 4K UHD video reels.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Collision-Proof File Storage:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Generates unique UUID filenames (`<uuid>.mp4`) to prevent file collisions during simultaneous uploads.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Progressive Static Streaming:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Spring MVC ResourceHandlers map physical disk paths directly to `/uploads/videos/**`, enabling progressive byte-range video streaming in browsers.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 2.3, w: 5.0, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s8.addShape(pptx.shapes.RECTANGLE, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_ACCENT, width: 1 }
});
s8.addText("⚡ Smart Client-Side Canvas Processing", {
  x: 7.1, y: 1.8, w: 5.1, h: 0.4,
  fontSize: 15, bold: true, color: C_ACCENT, fontFace: "Arial"
});
s8.addText([
  { text: "• Zero-Server FFmpeg Overhead:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Traditional servers require heavy FFmpeg software to generate video thumbnails. We engineered a client-side solution.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• HTML5 Canvas Frame Extraction:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "The browser loads the video into an in-memory `<video>` tag, seeks to 1 second, and draws the frame onto a `<canvas>` element to extract a JPEG poster thumbnail automatically.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Auto-Duration Calculation:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Reads video duration metadata directly on the client side and formats it into `m:ss` (e.g., `2:15`) before uploading.", options: { color: C_TEXT_MUTED } }
], {
  x: 7.1, y: 2.3, w: 5.1, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s8.addNotes("Handling high-definition 4K video reels was a critical engineering challenge. On the backend, we configured 100MB multipart file limits and static progressive streaming handlers. On the frontend, we solved thumbnail generation without server-side FFmpeg by using HTML5 Canvas to capture the first frame in the browser.");

// ----------------------------------------------------
// SLIDE 9: Professional & Casting Dashboard Module
// ----------------------------------------------------
const s9 = createBaseSlide("8. Professional / Casting Dashboard & Talent Discovery", "Dynamic discovery of verified registered talent without mock or fake data");

s9.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 6.2, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: "334155", width: 1 }
});

s9.addText([
  { text: "• Real Database Querying (`/api/users/talents`):\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Eliminated all hardcoded placeholder data. The discovery grid queries only registered talent from PostgreSQL with active profiles.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Multi-Category Filter System:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Allows casting directors to filter registered talents by profession (Actors, Models, Singers, Dancers, Directors) and location.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• In-Depth Portfolio Inspector:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Clicking any talent card displays their photos, video showreels, verified measurements, and past work experiences in a clean, view-only inspector.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Role-Based Guardrails:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Professionals can evaluate all assets, but booking management tabs are restricted to protect platform integrity.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 1.8, w: 5.6, h: 4.5,
  fontSize: 11.5, fontFace: "Arial"
});

if (fs.existsSync(imgProf)) {
  s9.addImage({ path: imgProf, x: 7.3, y: 1.5, w: 5.2, h: 5.1 });
} else {
  s9.addShape(pptx.shapes.RECTANGLE, { x: 7.3, y: 1.5, w: 5.2, h: 5.1, fill: { color: C_BG_CARD } });
}

s9.addNotes("For casting agencies and directors, we created the Professional Dashboard. All hardcoded mock users were removed; it queries PostgreSQL to display only real, registered talents. Professionals can inspect high-resolution portfolios, video reels, and measurements while role-based guardrails safeguard system workflows.");

// ----------------------------------------------------
// SLIDE 10: Packages, Shoot Bookings & Share Deep-Links
// ----------------------------------------------------
const s10 = createBaseSlide("9. Shoot Bookings, Packages & One-Click Deep-Links", "Commercial workflow: Shoot bookings and multi-channel casting pitches");

s10.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_PRIMARY, width: 1 }
});
s10.addText("📅 Shoot Bookings & Packages", {
  x: 1.1, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 15, bold: true, color: C_PRIMARY, fontFace: "Arial"
});
s10.addText([
  { text: "• Commercial Packages CRUD:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Talents can define pricing packages for half-day shoots, full-day feature shoots, and brand campaigns.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Incoming Booking Banners:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "When a professional requests a shoot, the talent dashboard highlights a gradient banner: 'You have new shoot booking requests!' with direct review links.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Status Workflow:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Bookings move through structured states: PENDING, CONFIRMED, COMPLETED, or DECLINED.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 2.3, w: 5.0, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s10.addShape(pptx.shapes.RECTANGLE, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_SUCCESS, width: 1 }
});
s10.addText("🚀 One-Click Multi-Channel Deep Links", {
  x: 7.1, y: 1.8, w: 5.1, h: 0.4,
  fontSize: 15, bold: true, color: C_SUCCESS, fontFace: "Arial"
});
s10.addText([
  { text: "• WhatsApp Integration:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "One-click button compiles talent details, unique ID, and direct profile link into pre-formatted WhatsApp chat text.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Gmail & Outlook Web Deep-Links:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Opens direct web composers in Gmail and Outlook with professional subject lines and casting proposals.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Native Mailto & Copy Link:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Supports system email clients and quick clipboard copying with instant visual feedback.", options: { color: C_TEXT_MUTED } }
], {
  x: 7.1, y: 2.3, w: 5.1, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s10.addNotes("To monetize talent work, we implemented Shoot Packages and Shoot Booking requests. Talents also have a One-Click Sharing dialog that generates direct WhatsApp, Gmail, and Outlook invitations containing their official talent code and portfolio link.");

// ----------------------------------------------------
// SLIDE 11: Technical Terms & Evaluation Cheat Sheet
// ----------------------------------------------------
const s11 = createBaseSlide("10. Technical Terms Glossary & Viva / Evaluation Q&A", "Key concepts and precise technical terminology for evaluation questions");

s11.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 11.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_ACCENT, width: 1 }
});

s11.addText([
  { text: "TECHNICAL CONCEPT\t\t\tPRECISE EXPLANATION\n", options: { bold: true, color: C_ACCENT, fontSize: 11.5 } },
  { text: "Single Page Application (SPA)\t\tLoads one HTML page; React Router dynamically rewires the DOM without page refreshes.\n", options: { color: C_TEXT_LIGHT, fontSize: 10 } },
  { text: "Stateless JWT Auth\t\t\tServer maintains zero session memory; identity is cryptographically verified from the token header.\n", options: { color: C_TEXT_MUTED, fontSize: 10 } },
  { text: "DTO Pattern\t\t\t\tData Transfer Objects separate database entities from API output, preventing sensitive data leakage.\n", options: { color: C_TEXT_LIGHT, fontSize: 10 } },
  { text: "Object-Relational Mapping (ORM)\tHibernate maps Java objects directly to PostgreSQL tables, eliminating fragile raw SQL queries.\n", options: { color: C_TEXT_MUTED, fontSize: 10 } },
  { text: "Optimistic UI\t\t\t\tUI reflects state changes immediately before server confirmation, rolling back only on failure.\n", options: { color: C_TEXT_LIGHT, fontSize: 10 } },
  { text: "Atomic UPSERT\t\t\t\tInsert-or-update database pattern preventing 500 errors when records do not yet exist.\n", options: { color: C_TEXT_MUTED, fontSize: 10 } },
  { text: "Multipart/Form-Data\t\t\tMIME protocol allowing concurrent transmission of binary files (videos) alongside JSON text.\n", options: { color: C_TEXT_LIGHT, fontSize: 10 } },
  { text: "Client-Side Canvas Processing\tExtracts video poster frames in browser memory via HTML5 Canvas, eliminating server FFmpeg load.\n", options: { color: C_TEXT_MUTED, fontSize: 10 } },
  { text: "Data Stripping (Security)\t\tRemoves restricted fields in Java before sending JSON, ensuring true privacy rather than CSS hiding.\n", options: { color: C_TEXT_LIGHT, fontSize: 10 } }
], {
  x: 1.1, y: 1.8, w: 11.1, h: 4.5,
  fontFace: "Arial"
});

s11.addNotes("When answering questions during the evaluation, refer to this glossary. Highlight terms like Single Page Application, Stateless JWT Authentication, DTO Pattern, Optimistic UI, and Client-Side Canvas Processing to demonstrate deep full-stack mastery.");

// ----------------------------------------------------
// SLIDE 12: Live Demo Walkthrough Steps
// ----------------------------------------------------
const s12 = createBaseSlide("11. Step-by-Step Live Demonstration Guide", "The exact sequence to follow during your live system walkthrough");

s12.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 11.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_PRIMARY, width: 1 }
});

s12.addText([
  { text: "STEP 1: TALENT ONBOARDING & DASHBOARD (http://localhost:5173/dashboard)\n", options: { bold: true, color: C_ACCENT, fontSize: 12 } },
  { text: "• Log in as a Talent. Point out the dynamic demographics (Age calculated from DOB, multi-role tags).\n• Demonstrate the toggle switch next to the photo: click to switch to 'Private Account'. Show instant UI animation.\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "STEP 2: PUBLIC SHARED PROFILE & LOCKED ACCESS (http://localhost:5173/public-profile/7)\n", options: { bold: true, color: C_SECONDARY, fontSize: 12 } },
  { text: "• Copy public link, open an Incognito window. Show the locked screen: 'This Account is Private'.\n• Inspect Network tab to prove media data is NOT delivered in the JSON payload (true backend security).\n• Click 'Request to View Profile', enter name, email, role (e.g. Casting Director), and submit.\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "STEP 3: TALENT APPROVAL WORKFLOW\n", options: { bold: true, color: C_SUCCESS, fontSize: 12 } },
  { text: "• Switch back to Talent Dashboard. Highlight the 'Pending Profile Requests' banner and counter badge.\n• Open modal, review requester details, click 'Approve Access'.\n• Refresh Incognito window: the profile instantly unlocks, displaying all photos, showreels, and measurements!\n\n", options: { color: C_TEXT_MUTED, fontSize: 11 } },

  { text: "STEP 4: PROFESSIONAL DASHBOARD (http://localhost:5173/client-dashboard)\n", options: { bold: true, color: C_TEXT_LIGHT, fontSize: 12 } },
  { text: "• Log in as Professional. Show dynamic discovery fetching only registered talent from PostgreSQL with zero mock data.", options: { color: C_TEXT_MUTED, fontSize: 11 } }
], {
  x: 1.2, y: 1.7, w: 10.9, h: 4.7,
  fontFace: "Arial"
});

s12.addNotes("Follow these four steps for your live demonstration: 1. Show the talent dashboard and the privacy toggle switch next to the photo. 2. Open an incognito window to show the locked private profile screen and submit an access request. 3. Return to the talent dashboard, review the notification banner, and approve the request. 4. Refresh incognito to show the unlocked media. Finally, show the professional dashboard with real registered talent.");

// ----------------------------------------------------
// SLIDE 13: Conclusion & Roadmap
// ----------------------------------------------------
const s13 = createBaseSlide("12. Conclusion, Engineering Impact & Future Roadmap", "Project achievements and upcoming commercial enhancements");

s13.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_SUCCESS, width: 1 }
});
s13.addText("🏆 Key Engineering Achievements", {
  x: 1.1, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 15, bold: true, color: C_SUCCESS, fontFace: "Arial"
});
s13.addText([
  { text: "• Enterprise Spring Boot 3 Backend:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Robust REST architecture with JWT authentication, Spring Data JPA, and PostgreSQL.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Instagram-Style Privacy Engine:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Toggle switch next to photo, locked viewer screen, access request modal, and backend data stripping.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• 100MB 4K Media Pipeline:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Zero-server FFmpeg overhead using client-side HTML5 Canvas frame extraction.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• 100% Dynamic Architecture:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Zero dummy data; queries live registered talent database.", options: { color: C_TEXT_MUTED } }
], {
  x: 1.1, y: 2.3, w: 5.0, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s13.addShape(pptx.shapes.RECTANGLE, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: C_BG_CARD },
  line: { color: C_ACCENT, width: 1 }
});
s13.addText("🚀 Production Roadmap", {
  x: 7.1, y: 1.8, w: 5.1, h: 0.4,
  fontSize: 15, bold: true, color: C_ACCENT, fontFace: "Arial"
});
s13.addText([
  { text: "• Escrow Payments (Razorpay / Stripe):\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Hold shoot booking advance deposits in escrow until production confirms shoot completion.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Real-Time WebSockets Messaging:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Instant chat between casting directors and talents with live read receipts.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• Mobile App (React Native):\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Push notifications for shoot bookings and profile view approvals.\n\n", options: { color: C_TEXT_MUTED } },
  { text: "• AI Casting Matchmaker:\n", options: { bold: true, color: C_TEXT_LIGHT } },
  { text: "Smart recommendations matching script requirements to physical measurements.", options: { color: C_TEXT_MUTED } }
], {
  x: 7.1, y: 2.3, w: 5.1, h: 4.1,
  fontSize: 11.5, fontFace: "Arial"
});

s13.addNotes("In conclusion, BookMyStars solves core industry casting challenges with a production-ready full-stack architecture. For our future roadmap, we plan to integrate escrow payments with Razorpay, real-time messaging using WebSockets, and an AI casting matchmaker. Thank you, and I am now open to any questions.");

// Save outputs
const out1 = "C:\\Users\\User\\Downloads\\BookMyStars_Presentation.pptx";
const out2 = "C:\\Users\\User\\Downloads\\projects\\bookmystarts\\BookMyStars_Presentation.pptx";

await pptx.writeFile({ fileName: out1 });
await pptx.writeFile({ fileName: out2 });
console.log("Presentation generated successfully at: " + out1);
