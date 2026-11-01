package com.watersupply.tracker.dto;

import com.watersupply.tracker.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** JSON body of PATCH /api/complaints/{id}/status. */
public record UpdateStatusRequest(

        @NotNull(message = "Status is required.")
        ComplaintStatus status,

        @Size(max = 500, message = "Note must be at most 500 characters.")
        String note
) {
}
