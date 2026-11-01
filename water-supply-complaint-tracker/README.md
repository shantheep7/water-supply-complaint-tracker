# Water Supply Complaint Tracker

A responsive web portal where residents register water supply complaints, administrators assign maintenance teams, and everyone can track repair status from **Submitted → Assigned → In Progress → Resolved**.

> **Problem:** residents report water shortages or pipeline leaks to multiple offices without knowing whether a repair has been scheduled.
> **Solution:** one portal to register complaints, assign maintenance teams and track repair status.

Built with **React 18 · JavaScript · Vite 6 · Tailwind CSS 4 · Lucide React · React Router 6**. No backend — demo data lives in `localStorage`, behind a service layer that can be switched to a Spring Boot REST API.

---

## Quick start

Requirements: **Node.js 18.18+** (20 or 22 LTS recommended) and npm.

```bash
cd water-supply-complaint-tracker
npm install
npm run dev
```

Open http://localhost:5173.

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload |
| `npm run build`   | Production build into `dist/`        |
| `npm run preview` | Serve the production build locally   |

**Admin demo login** (front-end only gate): Officer ID `WSB-ADMIN`, access code `demo@123` — or click *Fill demo credentials* on the login card.

**Sample complaint IDs to track:** `WSC-2026-1001` (resolved), `WSC-2026-1002` (in progress), `WSC-2026-1003` (assigned), `WSC-2026-1005` (submitted).

To restore the original sample data, use **Reset demo data** in the admin console (or clear the site's localStorage).

---

## Features

| Page | Route | Highlights |
| --- | --- | --- |
| Home | `/` | Government-style portal, hero with Register / Track buttons, live statistics, how-it-works, complaint categories |
| Resident dashboard | `/resident` | Validated complaint form (locality, type, urgency, description), unique ID generation (`WSC-<year>-<seq>`), success dialog with copy-ID, "My complaints" list |
| Complaint tracking | `/track?id=…` | Search by ID, complaint details, 4-step status timeline, assigned team card, activity log |
| Admin dashboard | `/admin` | Officer sign-in, total / pending / in-progress / resolved cards (clickable filters), search + filter by area, type and status, assign teams, update status with notes, type breakdown, team workload |

Business rules (enforced in the service layer, same as the backend should):

- Status only moves forward: Submitted → Assigned → In Progress → Resolved.
- A team must be assigned before the status can move past Submitted; assigning a team to a Submitted complaint moves it to Assigned automatically.
- Resolved complaints are locked.
- Every change appends an entry to the complaint's `history`, which drives the timeline and activity log.

---

## Project structure

```
water-supply-complaint-tracker/
├── index.html
├── package.json
├── vite.config.js              # React + Tailwind plugins, /api proxy → :8080
├── .env.example                # VITE_DATA_SOURCE, VITE_API_BASE_URL
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                # Router + context providers
    ├── App.jsx                 # Route table
    ├── index.css               # Tailwind import, theme tokens, base styles
    ├── config/
    │   └── appConfig.js        # App name, helpline, data-source switch
    ├── constants/
    │   └── complaint.js        # Status / type / priority enums + labels, areas
    ├── data/
    │   └── sampleData.js       # Sample teams and complaints (seed data)
    ├── services/
    │   ├── storage.js          # Safe localStorage wrapper
    │   ├── apiClient.js        # fetch wrapper for the REST API
    │   ├── complaintService.js # local + API implementations, same interface
    │   └── teamService.js
    ├── context/
    │   ├── ComplaintContext.jsx # Complaint state + actions for the whole app
    │   ├── AuthContext.jsx      # Demo admin session (replace with Spring Security)
    │   └── ToastContext.jsx     # Notifications
    ├── utils/
    │   ├── format.js           # Dates, relative time, durations
    │   ├── idGenerator.js      # WSC-<year>-<seq> IDs
    │   └── stats.js            # Dashboard statistics
    ├── components/
    │   ├── layout/             # Navbar, Footer, Layout
    │   ├── ui/                 # Button, Card, StatCard, StatusBadge, PriorityBadge,
    │   │                       # FormField (Field/Input/Select/Textarea), Modal,
    │   │                       # EmptyState, PageHeader, Spinner
    │   ├── complaints/         # ComplaintForm, ComplaintCard, ComplaintDetails,
    │   │                       # StatusTimeline, TeamCard, ActivityLog, ComplaintTypeIcon
    │   └── admin/              # ComplaintFilters, ComplaintTable,
    │                           # ManageComplaintModal, TypeBreakdown, TeamWorkload
    └── pages/
        ├── HomePage.jsx
        ├── ResidentDashboard.jsx
        ├── TrackComplaint.jsx
        ├── AdminLogin.jsx
        ├── AdminDashboard.jsx
        └── NotFound.jsx
```

---

## Spring Boot integration

The UI never touches `localStorage` directly — it calls `complaintService` and `teamService`, which return Promises. Each service has a **local** implementation (default) and an **API** implementation with the same methods.

1. Copy `.env.example` to `.env` and set:
   ```
   VITE_DATA_SOURCE=api
   VITE_API_BASE_URL=/api
   ```
2. Run Spring Boot on port 8080. In development, Vite proxies `/api/*` to `http://localhost:8080` (see `vite.config.js`), so no CORS setup is needed. For a deployed build, either serve the app from the same origin or set `VITE_API_BASE_URL=https://your-api-host/api` and enable CORS.
3. Implement these endpoints:

| Method | Endpoint | Body | Returns |
| --- | --- | --- | --- |
| GET | `/api/complaints?area=&type=&status=&search=` | — | `Complaint[]` |
| GET | `/api/complaints/{id}` | — | `Complaint` or 404 |
| POST | `/api/complaints` | `{ residentName, phone, email, area, address, type, priority, description }` | created `Complaint` (server generates `id`) |
| PATCH | `/api/complaints/{id}/assign` | `{ teamId, note }` | updated `Complaint` |
| PATCH | `/api/complaints/{id}/status` | `{ status, note }` | updated `Complaint` |
| GET | `/api/teams` | — | `Team[]` |

Error responses should include a `message` field (Spring Boot's default error body does); the UI shows it to the user.

**Data shapes** (see `src/data/sampleData.js` for full examples):

```js
Complaint {
  id: "WSC-2026-1002",
  residentName, phone, email, area, address,
  type: "WATER_SHORTAGE" | "PIPELINE_LEAKAGE" | "NO_WATER_SUPPLY" | "CONTAMINATED_WATER",
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  description,
  status: "SUBMITTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED",
  assignedTeamId: "TEAM-02" | null,
  createdAt, updatedAt,                 // ISO-8601 strings
  history: [{ status, timestamp, note, by }]
}

Team { id, name, specialization, leader, phone, members, zones: string[] }
```

The enum values match Java enums one-to-one (`ComplaintType`, `ComplaintStatus`, `Priority`), and `history` maps naturally to a `@OneToMany` `ComplaintStatusHistory` entity.

**Authentication:** `AuthContext.jsx` is a front-end only demo gate that separates the resident and administrator views. When Spring Security is added, replace `login()` with a call to e.g. `POST /api/auth/login`, store the token, and add an `Authorization` header in `src/services/apiClient.js`.
