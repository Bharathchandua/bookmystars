# BookMyStars Client Portal (`bmsClientUI`)

The independent client-facing React application for BookMyStars, enabling commercial brands, film production studios, and advertising agencies to discover, audition, shortlist, and book verified talent across India.

---

## 1. Architecture Overview

`bmsClientUI` is built as an independent Vite + React Single-Page Application (SPA) following modern domain-driven and feature-based React architecture:

```text
src/
│
├── app/
│   ├── App.jsx                  # Root application wrapper & provider tree
│   ├── router.jsx               # Centralized route definitions & guards
│   └── providers/               # Global context providers (ClientAuthProvider)
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
│       ├── ClientNavbar.jsx     # Navigation header with portal switcher
│       ├── ClientFooter.jsx     # Brand footer with links
│       └── index.js
│
├── features/                    # Domain-driven feature modules
│   ├── auth/                    # Authentication (ClientSignIn, services, hooks)
│   ├── dashboard/               # Main client overview & metrics
│   ├── landing/                 # Become Client registration & landing showcase
│   ├── requirements/            # Casting & requirement posting modals
│   ├── bookings/                # Booking request tracking & management
│   ├── talent/                  # Talent directory & search filters
│   └── profile/                 # Corporate brand profile management
│
├── pages/                       # Route-level screens coordinating features
│   ├── Landing/LandingPage.jsx
│   ├── Auth/SignInPage.jsx
│   ├── Dashboard/DashboardPage.jsx
│   ├── Profile/ProfilePage.jsx
│   ├── Bookings/BookingsPage.jsx
│   └── TalentSearch/TalentSearchPage.jsx
│
├── services/                    # Centralized API layer
│   ├── apiConfig.js             # Environment-aware backend URLs & endpoints
│   ├── axiosInstance.js         # Axios instance with JWT interceptors
│   └── clientApi.js             # Client domain endpoints
│
├── hooks/                       # Shared application custom hooks
├── utils/                       # Shared pure utility functions (alerts, helpers)
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
Starts the client portal on port **5174**:
```bash
npm run dev --workspace=bmsClientUI
# or from frontend/bmsClientUI:
npm run dev
```

### Production Build
```bash
npm run build --workspace=bmsClientUI
# or from frontend/bmsClientUI:
npm run build
```

---

## 3. Environment & Backend Configuration

The application points to `bmsClientBackend` (Port `8084` locally, or Cloudjiffy in production).
Configure via `src/services/apiConfig.js`:

```javascript
export const BACKENDS = {
  local: {
    client: 'http://localhost:8084',
    userUi: 'http://localhost:5173',
  },
  cloud: {
    client: 'https://kwinwsproducts.cloudjiffy.net/bmsclient',
    userUi: 'https://bmsuserui.netlify.app',
  },
};
```

Environment variables supported:
- `VITE_API_BASE_URL`: Override client backend base URL.
- `VITE_USER_UI_URL`: Set URL of main Talent/User portal.

---

## 4. Reusable UI Components

Located under `src/components/ui/`:

### `<Button />`
```jsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" loading={isSubmitting} onClick={handleSubmit}>
  Post Casting Requirement
</Button>
```
Supported variants: `primary`, `secondary`, `danger`, `outline`, `ghost`.
Supported sizes: `sm`, `md`, `lg`.

### `<Input />`
```jsx
import { Input } from "@/components/ui";

<Input
  label="Brand / Company Name"
  placeholder="e.g. Acme Productions"
  value={companyName}
  onChange={(e) => setCompanyName(e.target.value)}
  error={formErrors.companyName}
  required
/>
```

### `<Modal />`
```jsx
import { Modal } from "@/components/ui";

<Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post Requirement" size="lg">
  <PostRequirementForm />
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
