package com.watersupply.tracker.dto;

import java.util.List;

public record TeamResponse(
        String id,
        String name,
        String specialization,
        String leader,
        String phone,
        int members,
        List<String> zones
) {
}
