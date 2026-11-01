package com.watersupply.tracker.repository;

import com.watersupply.tracker.entity.MaintenanceTeam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceTeamRepository extends JpaRepository<MaintenanceTeam, String> {
}
