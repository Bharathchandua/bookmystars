# Product & Architecture Specification: Manager Aligned Requirements
### (Experience-Based Classification • Registered Profession + Dynamic Skills Addition • Partner Production Houses)

**Version:** 3.1  
**Target:** Stakeholder & Management Sign-Off  

---

## 1. Executive Summary & Core Rules

Following your strategic meeting with leadership, the platform architecture establishes three foundational requirements:

1. **Experience-Based Role Segregation (Task 1):** Anyone (Actor, Director, Dancer, Singer, Cinematographer) can register under any field. The distinction between **Talent** and **Professional** is governed strictly by **experience (> 1 year with completed industry work)**, not by their craft title.
2. **Registered Profession + Dynamic Skills Addition (Task 2):** Users select their primary **Profession** during registration. Once logged in, their profile displays their profession with an interactive **`[+ Add Skill]`** button right next to it. They can dynamically add extra skills (e.g. Comedy, Dancing, Singing) and manage experience/portfolio projects under each skill with full **CRUD** (Create, Read, Update, Delete).
3. **In-House Studio + Partner Production Houses (Task 3):** The system supports both the primary **In-House Studio** (parent company) and external **Partner Production Houses** who onboard as partners to run casting calls and book talent.

---

## 2. Core Pillars Breakdown

### 2.1 Task 1: Talent vs. Professional (Experience-Based)
* **Talent (< 1 Year Experience):**
  * Freshers, newcomers, students, debutants without verified completed commercial projects.
  * Focus: Auditions, discovering opportunities, entry-level shoot bookings.
* **Professional (> 1 Year Experience + Completed Work):**
  * Experienced artists with > 1 year tenure and verified completed credits.
  * Focus: Senior roles, department leadership, multi-skill commercial productions.

| Craft | When Considered "Talent" (< 1 Yr Exp) | When Considered "Professional" (> 1 Yr Exp + Work) |
| :--- | :--- | :--- |
| **Actor** | Fresher actor, acting student, zero releases | Actor with > 1 year experience, verified films/ads |
| **Director** | Debutant director, student filmmaker | Director with > 1 year experience and released titles |
| **Dancer** | Entry-level dancer, student performer | Lead dancer / choreographer with verified credits |
| **Singer** | Debut singer, cover vocalist | Playback singer / recording artist with official tracks |

---

### 2.2 Task 2: Registered Profession + Dynamic Skills Management (Post-Login)
* **Registration Flow:**
  * User selects their primary **Profession** during signup (e.g. `Actor`, `Director`, `Dancer`, `Singer`).
* **Profile / Dashboard Flow:**
  * Post-login, the user's dashboard displays their profession with an immediate **`[+ Add Skill]`** button right beside it.
* **Real-World Scenarios:**
  * **Scenario 1 (Bharath):** Registers as `Actor`. After logging in, next to the `Actor` badge, Bharath clicks **`[+ Add Skill]`** to add extra skills like **Comedy**, **Dancing**, and **Singing**.
  * **Scenario 2 (Upendra):** Registers as `Director`. After logging in, next to the `Director` badge, Upendra clicks **`[+ Add Skill]`** to add skills like **Acting**, **Screenplay Writing**, and **Lyricist**.
* **Skill-Specific Works & Portfolio CRUD:**
  * Users can manage dedicated projects and portfolio items under each skill/craft:
    * **Create:** Add new projects, roles, and media reels.
    * **Read:** View portfolios organized by craft.
    * **Update:** Edit project titles, roles, shoot dates, and video links.
    * **Delete:** Remove outdated works or delete added skills.

---

### 2.3 Task 3: In-House & Partner Production Houses
* **Primary In-House Studio:** Internal production banner of the parent platform managing internal roster allocations and talent bench.
* **Partner Production Houses:** External third-party studios and production banners onboarded as official partners to publish casting calls and hire roster members.

---

## 3. Database & Entity Architecture

```
User (id, fullName, email, accountType: TALENT / PROFESSIONAL, primaryProfession)
  ├── UserSkill (id, userId, skillName, category, addedAt)
  │     └── SkillWork (id, skillId, projectTitle, roleName, mediaUrl, year, description) [CRUD]
  └── UserExperience (id, userId, totalYears, verifiedWorkSummary)

ProductionHouse (id, companyName, isPartner, bannerLogo, activeProjectCount, contactEmail)
```
