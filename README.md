# Water Supply Complaint Tracker

Residents register water supply complaints, administrators assign maintenance teams, and everyone can track repair status.

| Folder | What | Tech |
|---|---|---|
| `water-supply-complaint-tracker/` | Frontend | React 18, Vite, Tailwind CSS, Lucide icons |
| `water-supply-complaint-tracker-backend/` | Backend REST API | Java 17, Spring Boot 3.5, Spring Data JPA, MySQL, Maven |

## Run everything

**1. Database (one time).** MySQL must be running.

```bash
cd water-supply-complaint-tracker-backend
mysql -u root -p < database/setup.sql
```

**2. Backend.** Runs at http://localhost:8080/api.

```bash
cd water-supply-complaint-tracker-backend
mvn spring-boot:run
```

**3. Frontend.** Use a second terminal; it runs at http://localhost:5173.

```bash
cd water-supply-complaint-tracker
npm install
npm run dev
```

The frontend's `.env` file contains `VITE_DATA_SOURCE=api`, so it uses the backend. Remove that line, or set it to `local`, to run the frontend alone with demo data in browser localStorage.

**Admin demo login:** Officer ID `WSB-ADMIN`, access code `demo@123`.

Details: [backend README](water-supply-complaint-tracker-backend/README.md) · [frontend README](water-supply-complaint-tracker/README.md)
