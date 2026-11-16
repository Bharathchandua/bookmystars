# BookMyStars Partner Portal (`bmsPartnerUI`)

The independent partner-facing React application for BookMyStars, enabling acting academies, film schools, dance institutes, and talent management agencies to showcase student talent, monitor audition casting calls, and coordinate talent bookings.

---

## 1. Architecture Overview

`bmsPartnerUI` is built as an independent Vite + React Single-Page Application (SPA) following modern domain-driven and feature-based React architecture:

```text
src/
│
├── app/
│   ├── App.jsx                  # Root application wrapper & provider tree
│   ├── router.jsx               # Centralized route definitions & guards
│   └── providers/               # Global context providers (PartnerAuthProvider)
│
├── assets/                      # Application assets (images, logos, badges)
│
├── components/
│   ├── ui/                      # Standard design-token reusable UI primitives
│   │   ├── Button.jsx           # Configurable button (variant, size, loading)
│   │   ├── Input.jsx            # Configurable form input (label, error, validation)
│   │   ├── Modal.jsx            # Accessible portal-based dialog modal
│   │   ├── Card.jsx             # Card container with header/body
│   │   ├── Badge.jsx            # Status & pill badge component
│   │   └── index.js
│   └── layout/                  # Layout shells
│       ├── PartnerNavbar.jsx    # Navigation header with portal switcher
│       ├── PartnerFooter.jsx    # Brand footer with links
│       └── index.js
│
├── features/                    # Domain-driven feature modules
│   ├── auth/                    # Authentication (PartnerSignIn, services, hooks)
│   ├── dashboard/               # Main partner academy dashboard & student metrics
│   ├── landing/                 # Become Partner registration & academy showcase
│   ├── requirements/            # Opportunity and requirement posting
│   ├── bookings/                # Booking request tracking & management
│   ├── talent/                  # Talent directory & search filters
│   └── profile/                 # Academy profile management
│
├── pages/                       # Route-level screens coordinating features
│   ├── Landing/LandingPage.jsx
│   ├── Auth/SignInPage.jsx
│   ├── Dashboard/DashboardPage.jsx
│   ├── Profile/ProfilePage.jsx
│   └── TalentSearch/TalentSearchPage.jsx
│
├── services/                    # Centralized API layer
│   ├── apiConfig.js             # Environment-aware backend URLs & endpoints
│   ├── axiosInstance.js         # Axios instance with JWT interceptors
│   └── partnerApi.js            # Partner domain endpoints
│
├── hooks/                       # Shared custom hooks
├── utils/                       # Shared pure utility functions (alerts, liveSync)
└── styles/                      # Global styles and Tailwind CSS
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
Starts the partner portal on port **5175**:
```bash
npm run dev --workspace=bmsPartnerUI
# or from frontend/bmsPartnerUI:
npm run dev
```

### Production Build
```bash
npm run build --workspace=bmsPartnerUI
# or from frontend/bmsPartnerUI:
npm run build
```

---

## 3. Environment & Backend Configuration

The application points to `bmsPartnerBackend` (Port `8083` locally, or Cloudjiffy in production).
Configure via `src/services/apiConfig.js`:

```javascript
export const BACKENDS = {
  local: {
    partner: 'http://localhost:8083',
    userUi: 'http://localhost:5173',
  },
  cloud: {
    partner: 'https://kwinwsproducts.cloudjiffy.net/bmspartner',
    userUi: 'https://bmsuserui.netlify.app',
  },
};
```

Environment variables supported:
- `VITE_API_BASE_URL`: Override partner backend base URL.
- `VITE_USER_UI_URL`: Set URL of main Talent/User portal.
- `VITE_CLIENT_UI_URL`: Set URL of Client portal.

---

## 4. Reusable UI Components

Located under `src/components/ui/`:

### `<Button />`
```jsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" loading={isSubmitting} onClick={handleRegister}>
  Register Academy
</Button>
```

### `<Input />`
```jsx
import { Input } from "@/components/ui";

<Input
  label="Academy / Institute Name"
  placeholder="e.g. National School of Drama"
  value={academyName}
  onChange={(e) => setAcademyName(e.target.value)}
  error={formErrors.academyName}
  required
/>
```

### `<Modal />`
```jsx
import { Modal } from "@/components/ui";

<Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Academy Requirements" size="lg">
  <PartnerRequirementsForm />
</Modal>
```

---

## 5. Adding New Features and Pages

### How to Add a New Feature
1. Create a feature folder under `src/features/<featureName>/`.
2. Place feature-specific UI, hooks, and services inside.
3. Export the feature facade via `src/features/<featureName>/index.js`.

### How to Add a New Page Screen
1. Create `src/pages/<PageName>/<PageName>Page.jsx`.
2. Import feature components and compose the route screen.
3. Add the route to `src/app/router.jsx`.
