# BookMyStars User & Talent Portal (`bmsUserUI`)

The central talent-facing React application and primary public showcase for BookMyStars, enabling actors, models, singers, voiceover artists, technicians, and crew professionals to create industry-grade verified portfolios, discover casting calls, apply for auditions, manage project calendars, and receive direct booking contracts.

---

## 1. Architecture Overview

`bmsUserUI` is built as an independent Vite + React Single-Page Application (SPA) following modern domain-driven and feature-based React architecture:

```text
src/
│
├── app/
│   ├── App.jsx                  # Root application wrapper & provider tree
│   ├── router.jsx               # Centralized route definitions & guards
│   └── providers/               # Global context providers (UserAuthProvider)
│
├── assets/                      # Application assets (images, logos, heroes, badges)
│
├── components/
│   ├── ui/                      # Standard design-token reusable UI primitives
│   │   ├── Button.jsx           # Configurable button (variant, size, loading)
│   │   ├── Input.jsx            # Configurable form input (label, error, validation)
│   │   ├── Modal.jsx            # Accessible portal-based dialog modal
│   │   ├── Card.jsx             # Card container with header/body
│   │   ├── Badge.jsx            # Status & pill badge component
│   │   └── index.js
│   │
│   ├── layout/                  # Layout shells
│   │   ├── Navbar.jsx           # Main sticky navigation header & portal links
│   │   ├── Sidebar.jsx          # Talent workspace sidebar
│   │   ├── Footer.jsx           # Global multi-column footer
│   │   └── index.js
│   │
│   └── ... (Landing showcase sections: Hero, OpportunityCards, PodcastSection, etc.)
│
├── features/                    # Domain-driven feature facades
│   ├── auth/                    # Talent auth & registration
│   ├── profile/                 # Profile, work experience, physical stats, crafts
│   ├── casting/                 # Auditions & opportunity applications
│   ├── booking/                 # Direct bookings & calendar availability
│   └── media/                   # Video reels, headshots, audio tracks, scripts
│
├── pages/                       # Route-level screens coordinating features
│   ├── Dashboard/
│   ├── Profile/
│   ├── Opportunities/
│   ├── Auditions/
│   ├── Bookings/
│   ├── Calendar/
│   ├── Messages/
│   └── Talents/
│
├── services/                    # Centralized API infrastructure
│   ├── apiConfig.js             # Environment-aware backend URLs & endpoints
│   ├── axiosInstance.js         # Axios instance with JWT interceptors
│   └── api.js                   # Backward-compatible API facade
│
├── hooks/                       # Shared application custom hooks
├── utils/                       # Shared utility functions (alert, liveSync, logger)
└── styles/                      # Global styles and design system tokens
```

---

## 2. Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation
From the repository root or `frontend/` directory:
```bash
npm install
```

### Development Server
Starts the talent portal on port **5173**:
```bash
npm run dev --workspace=bmsUserUI
# or from frontend/bmsUserUI:
npm run dev
```

### Production Build
```bash
npm run build --workspace=bmsUserUI
# or from frontend/bmsUserUI:
npm run build
```

---

## 3. Environment & Backend Configuration

The application points to `bmsUserBackend` (Port `8080` locally, or Cloudjiffy in production).
Configure via `src/services/apiConfig.js`:

```javascript
export const BACKENDS = {
  local: {
    users: 'http://localhost:8080',
    admin: 'http://localhost:8081',
    partner: 'http://localhost:8083',
    client: 'http://localhost:8084',
    clientUi: 'http://localhost:5174',
    partnerUi: 'http://localhost:5175',
    adminUi: 'http://localhost:5170',
  },
  cloud: {
    users: 'https://kwinwsproducts.cloudjiffy.net/bmsuser',
    admin: 'https://kwinwsproducts.cloudjiffy.net/bmsadmin',
    partner: 'https://kwinwsproducts.cloudjiffy.net/bmspartner',
    client: 'https://kwinwsproducts.cloudjiffy.net/bmsclient',
    clientUi: 'https://bmsclientui.netlify.app',
    partnerUi: 'https://bmspartnerui.netlify.app',
    adminUi: 'https://bmsadminui.netlify.app',
  },
};
```

Supported Environment Variables:
- `VITE_API_BASE_URL`: Override user backend base URL.
- `VITE_CLIENT_UI_URL`: Set URL of Client Brand portal.
- `VITE_PARTNER_UI_URL`: Set URL of Partner Academy portal.
- `VITE_ADMIN_UI_URL`: Set URL of Admin desk portal.

---

## 4. Reusable UI Components

Located under `src/components/ui/`:

### `<Button />`
```jsx
import { Button } from "../components/ui";

<Button variant="primary" size="md" loading={isSubmitting} onClick={handleSave}>
  Save Profile
</Button>
```
Variants: `primary`, `secondary`, `danger`, `outline`, `ghost`.
Sizes: `sm`, `md`, `lg`.

### `<Input />`
```jsx
import { Input } from "../components/ui";

<Input
  label="Full Stage Name"
  placeholder="e.g. Ranbir Kapoor"
  value={stageName}
  onChange={(e) => setStageName(e.target.value)}
  error={errors.stageName}
  required
/>
```

### `<Modal />`
```jsx
import { Modal } from "../components/ui";

<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Add Work Experience" size="md">
  <ExperienceForm />
</Modal>
```

---

## 5. Adding New Features and Pages

### How to Add a New Feature
1. Create a feature folder under `src/features/<featureName>/`.
2. Place feature-specific UI, hooks, and services inside.
3. Export the feature facade via `src/features/<featureName>/index.js`.

### How to Add a New Page Screen
1. Create `src/pages/<PageName>/<PageName>.jsx`.
2. Import feature components and compose the route screen.
3. Add the route to `src/app/router.jsx`.
