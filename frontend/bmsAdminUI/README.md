# BookMyStars – Admin Portal (`bmsAdminUI`)

Production-grade, enterprise administration dashboard for the BookMyStars entertainment platform. Built with **React 18**, **Vite**, and **Feature-Driven Architecture**.

---

## 1. Application Purpose
`bmsAdminUI` provides dedicated tooling for Super Admins and authorized staff officers:
- **Talent KYC Verification**: Review and approve actor, dancer, and technician credentials.
- **RBAC & Staff Operations**: Granular permissions (view, create, edit, delete, approve) across departments.
- **Master Data Desks**: Manage standard 125+ professions, crafts, and skills.
- **Client & Partner Moderation**: Verify brand clients and acting academies.
- **Audit & Security**: Strict JWT session tracking with automatic error boundaries.

---

## 2. Directory Architecture

The application strictly follows modern feature-driven React architecture:

```text
src/
├── app/
│   ├── App.jsx               # Application root shell
│   ├── router.jsx            # Centralized routes & scroll behavior
│   └── providers/            # Global context (AdminAuthProvider)
│
├── assets/                   # Static branding, favicons, illustrations
│
├── components/
│   ├── ui/                   # Reusable atomic UI elements
│   │   ├── Button.jsx        # Configurable buttons (variants, sizes, loading)
│   │   ├── Input.jsx         # Accessible form inputs with validation
│   │   ├── Modal.jsx         # Portaled dialog modals with escape listener
│   │   ├── Card.jsx          # Container cards with title & action slots
│   │   └── Badge.jsx         # Status indicator badges (success, danger, etc.)
│   └── layout/               # Global layouts
│       ├── Header.jsx        # Admin top navigation & profile menu
│       ├── Sidebar.jsx       # Expandable/pinnable navigation drawer
│       ├── Footer.jsx        # Platform version & copyright
│       └── AdminLayout.jsx   # Coordinating layout wrapper
│
├── features/                 # Self-contained business domains
│   ├── auth/                 # Admin login, token storage & hooks
│   ├── dashboard/            # Executive scorecards, metric counters
│   ├── kyc/                  # Talent verification & audit desk
│   ├── staff/                # RBAC matrix, staff role management
│   ├── masters/              # Professions, crafts & skills libraries
│   ├── clients/              # Brand client verification
│   └── partners/             # Academy partner verification
│
├── pages/                    # Route-level coordinating screens
│   └── Admin/
│       ├── AdminDashboard.jsx
│       └── AdminLogin.jsx
│
├── services/                 # Shared networking infrastructure
│   ├── apiConfig.js          # Environment-aware backend URLs
│   └── axiosInstance.js      # Axios instance with JWT interceptor
│
├── hooks/                    # Reusable React hooks
├── utils/                    # Helper functions & alerts
└── styles/                   # Global style tokens
```

---

## 3. Getting Started

### Installation
```bash
npm install
```

### Development Startup
```bash
npm run dev
# Running on http://localhost:5170 (or assigned Vite port)
```

### Production Build
```bash
npm run build
# Outputs minified assets to dist/
```

---

## 4. Environment Configuration

Backend target URLs are configured in `src/services/apiConfig.js`:

| Environment | Admin Backend Target | Override Key (`localStorage`) |
| :--- | :--- | :--- |
| **Local** | `http://localhost:8081` | `localStorage.setItem('bms_api_override', 'http://localhost:8081')` |
| **Cloud Production** | `https://kwinwsproducts.cloudjiffy.net/bmsadmin` | Controlled via `import.meta.env.PROD` |

---

## 5. Reusable Component Guidelines

All atomic UI components live in `src/components/ui/` and accept configurable props:

```jsx
import { Button, Input, Modal, Card, Badge } from "@/components/ui";

// Button with loading state
<Button variant="primary" size="md" loading={isSubmitting} onClick={handleSave}>
  Save Changes
</Button>

// Form Input with error display
<Input
  label="Staff Corporate Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>

// Status Badge
<Badge variant="success">APPROVED</Badge>
```

---

## 6. How to Add a New Feature

1. **Create the feature folder**: `src/features/<feature-name>/`
2. **Add subfolders as needed**:
   - `components/` (UI pieces specific to this feature)
   - `services/` (API calls via `axiosInstance`)
   - `hooks/` (State and lifecycle logic)
3. **Export public API**: Expose components and hooks via `src/features/<feature-name>/index.js`.
4. **Mount in Dashboard**: Import and render the feature component inside `src/pages/Admin/AdminDashboard.jsx`.
