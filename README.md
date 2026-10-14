# 🌟 Book My Stars (BMS) - Talent & Professional Platform

An enterprise full-stack casting, media portfolio, and professional talent management platform connecting emerging and experienced talents (Actors, Models, Directors, Crew) with casting agencies, production houses, and casting directors.

---

## 🏛️ Project Architecture

The repository is organized into a clean, decoupled monorepo structure:

```text
bookmystarts/
├── backend/                       # Spring Boot 3 Enterprise REST API
│   ├── src/main/java/             # Java 17+ Enterprise Codebase
│   │   └── com/example/bookmystars/
│   │       ├── restcontroller/    # REST API Controllers (Profile, Work, Media, Auth)
│   │       ├── service/           # Core Business Logic & Auto-Sync
│   │       ├── model/             # JPA Entities (PostgreSQL)
│   │       ├── repository/        # Spring Data Repositories
│   │       ├── dto/               # Request & Response Data Transfer Objects
│   │       ├── exception/         # Centralized Global Exception Handling
│   │       └── properties/        # Type-Safe Configuration Properties
│   ├── pom.xml                    # Maven Dependency & Build Config
│   └── mvnw.cmd                   # Maven Wrapper
│
├── frontend/                      # React 18 + Vite Modern SPA
│   ├── src/
│   │   ├── pages/Profile/         # Profile Overview, Work Exp, Portfolio, Videos
│   │   ├── shared/                # Axios Interceptors, BaseUrl, SweetAlert2 Alerts
│   │   └── services/api.js        # Centralized REST API Service Client
│   ├── package.json               # NPM Scripts & Dependencies
│   └── vite.config.js             # Vite Build & Proxy Configuration
│
└── README.md                      # Complete Project Documentation
```

---

## ✨ Key Features & Capabilities

### 1. Dynamic Talent Overview & Real-Time Stats
- **Auto-Synced Overview**: The **About** overview card calculates your career statistics automatically in real time:
  - **Projects Completed**: Derived directly from the user's verified work history.
  - **Brands Worked**: Unique company/brand partnerships (e.g., Netflix, Amazon, LAKMÉ).
  - **Years Experience**: Calculated from the span of production dates.
  - **Features**: Total portfolio highlights and showreel video productions.
- **Smart Bio Generation**: Synthesizes a role summary, location, and achievements if no custom bio is written.

### 2. Work Experience & Proof Attachments
- Full CRUD operations with document/media file upload attachments (Certificates, contracts, project proofs).
- SweetAlert2 interactive confirmations for delete operations and error/success notifications.

### 3. Media Portfolio & Showreels
- **Portfolio Tab**: Multi-category image upload (Runway, Editorial, Commercial, Fashion, Lifestyle) with preview.
- **Videos Tab**: YouTube embed & direct video uploads for showreels, auditions, and monologues.

### 4. Measurements & Casting Specs
- Interactive visual silhouette representation with industry specifications: Height, Bust, Waist, Hips, Shoe Size, Hair Color, Eye Color.

### 5. Instagram-Style Profile Privacy
- **Public vs. Private toggle**: Private profiles mask sensitive portfolio and media until an access request is approved.
- **Access Request Workflow**: Viewers can request access, and talents can approve or reject incoming requests.

### 6. Social Sharing
- One-click generated links for WhatsApp, Email, LinkedIn, and direct talent link copying.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3, Spring Data JPA, Spring Security, JWT, Maven |
| **Database** | PostgreSQL |
| **API Docs** | Swagger 3 / OpenAPI 3.0 (`/swagger-ui/index.html`) |
| **Frontend** | React 18, Vite, Axios, Lucide Icons, SweetAlert2 |
| **Architecture** | RESTful APIs, Centralized Exception Handling (`GlobalExceptionHandler`), Standardized Client Response Wrapper (`ClientResponseBean`) |

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v18 or higher (with `npm`)
- **Database**: PostgreSQL (running locally or cloud instance)

---

### 1. Running the Backend (Spring Boot)

1. Open a terminal and navigate to `backend/`:
   ```powershell
   cd backend
   ```
2. Verify application properties in `src/main/resources/application.properties` (PostgreSQL URL, username, password).
3. Start the Spring Boot application:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *Or on macOS/Linux:*
   ```bash
   ./mvnw spring-boot:run
   ```
4. **Backend Server URL**: `http://localhost:8080`
5. **Interactive Swagger API Documentation**: `http://localhost:8080/swagger-ui/index.html`

---

### 2. Running the Frontend (React + Vite)

1. Open a new terminal and navigate to `frontend/`:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the local development server:
   ```powershell
   npm run dev
   ```
4. **Frontend Application URL**: `http://localhost:5173`

---

## 🔒 Enterprise Standards Implemented

- **Standardized API Response**: All API endpoints return a uniform envelope structure with status codes, timestamp, and message payload.
- **Global Error Handling**: Comprehensive HTTP status code mapping (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 413 Payload Too Large, 500 Server Error).
- **Security**: JWT token-based authentication with Bearer authorization interceptors in Axios.
- **User Experience**: SweetAlert2 dialogs for user verification before deleting records and actionable feedback on failures.
