package com.watersupply.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** JSON body of PATCH /api/complaints/{id}/assign. */
public record AssignTeamRequest(

        @NotBlank(message = "Please select a valid maintenance team.")
        String teamId,

        @Size(max = 500, message = "Note must be at most 500 characters.")
        String note
) {
}
