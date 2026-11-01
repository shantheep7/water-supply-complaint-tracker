package com.watersupply.tracker.mapper;

import com.watersupply.tracker.dto.ComplaintResponse;
import com.watersupply.tracker.dto.StatusHistoryResponse;
import com.watersupply.tracker.dto.TeamResponse;
import com.watersupply.tracker.entity.Complaint;
import com.watersupply.tracker.entity.MaintenanceTeam;
import com.watersupply.tracker.entity.StatusHistory;

import java.util.Comparator;
import java.util.List;

/**
 * Converts entities (database shape) into DTOs (JSON shape).
 * Written by hand instead of using a mapping library, so every field is visible.
 */
public final class ComplaintMapper {

    private ComplaintMapper() {
    }

    public static ComplaintResponse toResponse(Complaint complaint) {
        // getId() on a lazy proxy does not hit the database, so this stays cheap
        String teamId = complaint.getAssignedTeam() == null ? null : complaint.getAssignedTeam().getId();

        List<StatusHistoryResponse> history = complaint.getHistory().stream()
                .sorted(Comparator.comparing(StatusHistory::getChangedAt)
                        .thenComparing(StatusHistory::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(ComplaintMapper::toResponse)
                .toList();

        return new ComplaintResponse(
                complaint.getComplaintCode(),
                complaint.getResidentName(),
                complaint.getPhone(),
                complaint.getEmail() == null ? "" : complaint.getEmail(),
                complaint.getArea(),
                complaint.getAddress(),
                complaint.getType(),
                complaint.getPriority(),
                complaint.getDescription(),
                complaint.getStatus(),
                teamId,
                complaint.getCreatedAt(),
                complaint.getUpdatedAt(),
                history);
    }

    public static StatusHistoryResponse toResponse(StatusHistory entry) {
        return new StatusHistoryResponse(entry.getStatus(), entry.getChangedAt(), entry.getNote(), entry.getChangedBy());
    }

    public static TeamResponse toResponse(MaintenanceTeam team) {
        return new TeamResponse(team.getId(), team.getName(), team.getSpecialization(), team.getLeader(),
                team.getPhone(), team.getMembers(), List.copyOf(team.getZones()));
    }
}
