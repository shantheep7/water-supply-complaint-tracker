-- ------------------------------------------------------------------
-- Water Supply Complaint Tracker - table reference
--
-- You do NOT need to run this: Spring Boot (Hibernate, ddl-auto=update)
-- creates these tables automatically from the @Entity classes.
-- It documents the schema (e.g. for a project report) and can be used
-- to create the tables by hand if you switch ddl-auto to "validate".
-- ------------------------------------------------------------------

USE water_supply_tracker;

CREATE TABLE IF NOT EXISTS maintenance_teams (
    id             VARCHAR(20)  NOT NULL,          -- e.g. TEAM-01
    name           VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    leader         VARCHAR(100) NOT NULL,
    phone          VARCHAR(20)  NOT NULL,
    members        INT          NOT NULL,
    PRIMARY KEY (id)
);

-- Areas covered by each team (one row per zone)
CREATE TABLE IF NOT EXISTS team_zones (
    team_id  VARCHAR(20)  NOT NULL,
    position INT          NOT NULL,                -- keeps the display order
    zone     VARCHAR(100),
    PRIMARY KEY (team_id, position),
    CONSTRAINT fk_team_zones_team FOREIGN KEY (team_id) REFERENCES maintenance_teams (id)
);

CREATE TABLE IF NOT EXISTS complaints (
    id               BIGINT       NOT NULL AUTO_INCREMENT,  -- internal number
    complaint_code   VARCHAR(20)  UNIQUE,                   -- public ID, e.g. WSC-2026-1013
    resident_name    VARCHAR(100) NOT NULL,
    phone            VARCHAR(10)  NOT NULL,
    email            VARCHAR(150),
    area             VARCHAR(100) NOT NULL,
    address          VARCHAR(255) NOT NULL,
    type             ENUM('WATER_SHORTAGE','PIPELINE_LEAKAGE','NO_WATER_SUPPLY','CONTAMINATED_WATER') NOT NULL,
    priority         ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    description      VARCHAR(1000) NOT NULL,
    status           ENUM('SUBMITTED','ASSIGNED','IN_PROGRESS','RESOLVED') NOT NULL,
    assigned_team_id VARCHAR(20),
    created_at       DATETIME(6)  NOT NULL,                 -- stored in UTC
    updated_at       DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_area (area),
    CONSTRAINT fk_complaints_team FOREIGN KEY (assigned_team_id) REFERENCES maintenance_teams (id)
);

-- Timeline: one row per status change
CREATE TABLE IF NOT EXISTS status_history (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    complaint_id BIGINT       NOT NULL,
    status       ENUM('SUBMITTED','ASSIGNED','IN_PROGRESS','RESOLVED') NOT NULL,
    changed_at   DATETIME(6)  NOT NULL,
    note         VARCHAR(500) NOT NULL,
    changed_by   VARCHAR(100) NOT NULL,                     -- Resident, Control Room, Team Alpha ...
    PRIMARY KEY (id),
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id)
);

-- Useful queries ---------------------------------------------------

-- Complaints per status ("Pending" = SUBMITTED + ASSIGNED)
-- SELECT status, COUNT(*) FROM complaints GROUP BY status;

-- Timeline of one complaint
-- SELECT h.status, h.changed_at, h.note, h.changed_by
-- FROM status_history h JOIN complaints c ON c.id = h.complaint_id
-- WHERE c.complaint_code = 'WSC-2026-1002' ORDER BY h.changed_at;
