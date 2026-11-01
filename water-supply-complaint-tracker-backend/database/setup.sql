-- ------------------------------------------------------------------
-- Water Supply Complaint Tracker - one-time MySQL setup
--
-- Run as the MySQL root user:
--   mysql -u root -p < database/setup.sql
--
-- Creates the database and a dedicated application user, so the
-- Spring Boot app never needs the root password. Tables are created
-- automatically by Spring Boot (Hibernate) on first start.
-- ------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS water_supply_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Development credentials - must match src/main/resources/application.properties
CREATE USER IF NOT EXISTS 'wst_user'@'localhost' IDENTIFIED BY 'Wst#Dev2026';
-- Also (re)set the password in case the user already existed
ALTER USER 'wst_user'@'localhost' IDENTIFIED BY 'Wst#Dev2026';

GRANT ALL PRIVILEGES ON water_supply_tracker.* TO 'wst_user'@'localhost';
FLUSH PRIVILEGES;

SELECT 'Database water_supply_tracker and user wst_user are ready.' AS status;
