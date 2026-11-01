package com.watersupply.tracker.dto;

import com.watersupply.tracker.entity.ComplaintStatus;
import com.watersupply.tracker.entity.ComplaintType;
import com.watersupply.tracker.entity.Priority;

import java.time.Instant;
import java.util.List;

/**
 * A complaint as the frontend sees it. Field names match the React app exactly,
 * e.g. "id" is the public complaint code ("WSC-2026-1013"), not the database number.
 */
public record ComplaintResponse(
        String id,
        String residentName,
        String phone,
        String email,
        String area,
        String address,
        ComplaintType type,
        Priority priority,
        String description,
        ComplaintStatus status,
        String assignedTeamId,
        Instant createdAt,
        Instant updatedAt,
        List<StatusHistoryResponse> history
) {
}
