# Water Supply Complaint Tracker – Backend (Spring Boot)

REST API for the Water Supply Complaint Tracker React app. Residents register complaints and get a unique complaint ID. Administrators assign maintenance teams and update the repair status. Everything is stored in MySQL.

**Stack:** Java 17 · Spring Boot 3.5 · Spring Web · Spring Data JPA (Hibernate) · Bean Validation · MySQL 8/9 · Maven

---

## 1. Prerequisites

| Tool | Check with | Notes |
|---|---|---|
| Java 17 or newer | `java -version` | Java 22 works too |
| Maven 3.9+ | `mvn -v` | |
| MySQL 8 or 9 | `mysql --version` | Must be running on port 3306 |

## 2. Set up the database (one time)

```bash
mysql -u root -p < database/setup.sql
```

This creates:
- the database `water_supply_tracker`
- the user `wst_user` with the password `Wst#Dev2026`, which can only access that database

The app logs in as `wst_user`, so it never needs your root password.

You don't create tables yourself. When the app starts, Hibernate creates them from the entity classes, and `DataSeeder` loads 5 teams and 12 sample complaints (`WSC-2026-1001` … `WSC-2026-1012`). The seeder only runs while the tables are empty.

`database/schema.sql` documents the four tables and has some useful queries. Use it as a reference, for example in your project report.

> If MySQL was installed with the official installer, the client is at `/usr/local/mysql/bin/mysql`.
> To use different credentials, set them with environment variables instead of editing the code:
> `DB_USERNAME=me DB_PASSWORD=secret mvn spring-boot:run`

## 3. Run the backend

```bash
mvn spring-boot:run
```

The API runs at **http://localhost:8080/api**. Quick check: http://localhost:8080/api/teams

Other commands:

```bash
mvn test                 # 7 API tests, using an in-memory H2 database (no MySQL needed)
mvn clean package        # build target/water-supply-complaint-tracker-backend-1.0.0.jar
java -jar target/water-supply-complaint-tracker-backend-1.0.0.jar
```

## 4. Run the frontend against the backend

The React app (`../water-supply-complaint-tracker`) uses browser localStorage by default. A `.env` file switches it to this API:

```bash
cd ../water-supply-complaint-tracker
cp .env.example .env     # then make sure it contains VITE_DATA_SOURCE=api
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Vite forwards every `/api/...` request to `http://localhost:8080` (see `vite.config.js`). Restart `npm run dev` after creating or changing `.env`.

**Order:** start MySQL → backend → frontend.

---

## 5. API reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| GET | `/complaints` | All complaints, newest first. Optional filters: `?area=&type=&status=&search=` | 200 |
| GET | `/complaints/{id}` | Track one complaint (`id` like `WSC-2026-1002`, any letter case) | 200 / 404 |
| POST | `/complaints` | Register a complaint | 201 + `Location` header |
| PATCH | `/complaints/{id}/assign` | Assign or reassign a maintenance team | 200 |
| PATCH | `/complaints/{id}/status` | Update status | 200 |
| GET | `/teams` | Maintenance teams | 200 |

**Allowed values**
- `type`: `WATER_SHORTAGE`, `PIPELINE_LEAKAGE`, `NO_WATER_SUPPLY`, `CONTAMINATED_WATER`
- `priority`: `LOW`, `MEDIUM` (default), `HIGH`, `CRITICAL`
- `status`: `SUBMITTED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`. The admin dashboard shows **Pending** as SUBMITTED + ASSIGNED.

### Try it with curl

```bash
# Register a complaint
curl -i -X POST http://localhost:8080/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"residentName":"Test Resident","phone":"9876543210","email":"","area":"Station Road",
       "address":"14, Platform Road","type":"PIPELINE_LEAKAGE","priority":"HIGH",
       "description":"Pipeline near the junction is leaking heavily since morning."}'

# Track it (use the "id" returned above)
curl http://localhost:8080/api/complaints/WSC-2026-1013

# Assign a team (SUBMITTED becomes ASSIGNED automatically)
curl -X PATCH http://localhost:8080/api/complaints/WSC-2026-1013/assign \
  -H "Content-Type: application/json" -d '{"teamId":"TEAM-03","note":"Crew dispatched"}'

# Move to In Progress, then Resolved
curl -X PATCH http://localhost:8080/api/complaints/WSC-2026-1013/status \
  -H "Content-Type: application/json" -d '{"status":"IN_PROGRESS","note":"Excavation started"}'

# Filter: all resolved complaints in Riverside Ward
curl "http://localhost:8080/api/complaints?status=RESOLVED&area=Riverside%20Ward"
```

### Complaint JSON

```json
{
  "id": "WSC-2026-1002",
  "residentName": "Mohammed Irfan",
  "phone": "9789056781",
  "email": "",
  "area": "Lakeview Colony",
  "address": "Block C, Lakeview Apartments",
  "type": "WATER_SHORTAGE",
  "priority": "MEDIUM",
  "description": "Water supply comes only for 30 minutes ...",
  "status": "IN_PROGRESS",
  "assignedTeamId": "TEAM-02",
  "createdAt": "2026-10-24T05:15:00Z",
  "updatedAt": "2026-10-26T10:00:00Z",
  "history": [
    { "status": "SUBMITTED", "timestamp": "2026-10-24T05:15:00Z", "note": "Complaint registered online.", "by": "Resident" }
  ]
}
```

### Errors

Every error has the same JSON shape. The React app shows `message` to the user.

```json
{
  "timestamp": "2026-11-01T12:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Enter a valid 10-digit mobile number.",
  "path": "/api/complaints",
  "fieldErrors": { "phone": "Enter a valid 10-digit mobile number." }
}
```

| Status | When |
|---|---|
| 400 | Validation failed (`fieldErrors` lists each field), invalid JSON or enum value, or a workflow rule was broken |
| 404 | Complaint not found, or no such endpoint |
| 405 | Wrong HTTP method |
| 500 | Unexpected server error (details are only in the server log) |

---

## 6. How the code is organised

```
src/main/java/com/watersupply/tracker/
├── WaterSupplyTrackerApplication.java   entry point (main method)
├── controller/   ComplaintController, TeamController       HTTP: read request → call service → return JSON
├── service/      ComplaintService, TeamService             business rules + transactions
│                 ComplaintIdGenerator                      builds "WSC-<year>-<number>"
├── repository/   ComplaintRepository, MaintenanceTeamRepository   database access (Spring Data JPA)
├── entity/       Complaint, StatusHistory, MaintenanceTeam  Java classes mapped to MySQL tables
│                 ComplaintStatus, ComplaintType, Priority   enums stored as text
├── dto/          *Request / *Response records               the JSON the frontend sends/receives
├── mapper/       ComplaintMapper                           entity → DTO
├── exception/    GlobalExceptionHandler + custom exceptions consistent JSON errors
└── config/       CorsConfig, DataSeeder                    browser access rules, sample data
src/main/resources/application.properties                   DB connection, CORS origins, seeding
src/test/...                                                API tests (H2 in-memory DB)
database/setup.sql, database/schema.sql                     MySQL setup + table reference
```

A request goes through the layers like this:

```
React app ──HTTP/JSON──▶ Controller ──DTO──▶ Service ──Entity──▶ Repository ──SQL──▶ MySQL
```

### Design decisions, in plain words

- **Why separate entities and DTOs?** Entities mirror database tables; DTOs mirror the JSON. Keeping them apart means a change to one doesn't break the other. It also means a client can't set fields it shouldn't, such as `status` when creating a complaint.
- **How the unique complaint ID works.** Each row gets an auto-increment number from MySQL (1, 2, 3…). After the first save, the service turns it into `WSC-<year>-<1000 + number>`. MySQL never repeats a number, so two people submitting at the same moment can't get the same ID. The public ID is stored in its own `complaint_code` column, which has a unique index.
- **Where the rules are checked.** The browser can be bypassed, so the server checks everything again:
  - Validation annotations (`@NotBlank`, `@Pattern`, `@Size`) on the request records, triggered by `@Valid`.
  - Workflow rules in `ComplaintService`:
    - status only moves forward
    - a team is required before moving past Submitted
    - resolved complaints are locked
    - every change is written to `status_history`
- **`@Transactional`.** Each service method runs as one database transaction: all of its changes are saved, or none are. Changes to entities loaded inside a transaction are saved automatically when it ends, which is why `assignTeam` doesn't call `save()`.
- **Avoiding extra queries.** `@EntityGraph(attributePaths = "history")` loads complaints and their timelines in one query instead of one query per complaint.
- **CORS.** The React dev server (`localhost:5173`) and the API (`localhost:8080`) count as different origins, so browsers block calls between them unless the API allows it. `CorsConfig` allows `http://localhost:*`, which covers any Vite port. The allowed origins are set in `application.properties`.
- **Admin access.** The admin login is currently checked only in the browser. The API itself is open. Adding Spring Security (for example, a JWT login endpoint) is the natural next step if you need real authentication.

### Reset the sample data

```sql
DROP DATABASE water_supply_tracker;
```
Then run `database/setup.sql` again and restart the backend.
