package com.watersupply.tracker.service;

import java.time.Instant;
import java.time.ZoneOffset;

/**
 * Builds the public complaint ID "WSC-<year>-<number>" from the database row number.
 *
 * MySQL's AUTO_INCREMENT never hands out the same number twice, even when two residents
 * submit at the same moment, so the generated IDs are always unique.
 * Row 1 -> WSC-2026-1001, row 13 -> WSC-2026-1013.
 */
public final class ComplaintIdGenerator {

    private static final String PREFIX = "WSC";
    private static final long OFFSET = 1000;

    private ComplaintIdGenerator() {
    }

    public static String generate(long databaseId, Instant createdAt) {
        int year = createdAt.atZone(ZoneOffset.UTC).getYear();
        return "%s-%d-%d".formatted(PREFIX, year, OFFSET + databaseId);
    }

    /** Accepts "wsc-2026-1013 " as well as "WSC-2026-1013". */
    public static String normalize(String complaintId) {
        return complaintId == null ? "" : complaintId.trim().toUpperCase();
    }
}
