package com.watersupply.tracker.dto;

import com.watersupply.tracker.entity.ComplaintStatus;

import java.time.Instant;

/** One timeline entry: { status, timestamp, note, by }. */
public record StatusHistoryResponse(
        ComplaintStatus status,
        Instant timestamp,
        String note,
        String by
) {
}
