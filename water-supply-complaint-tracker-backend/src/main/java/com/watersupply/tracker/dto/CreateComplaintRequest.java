package com.watersupply.tracker.dto;

import com.watersupply.tracker.entity.ComplaintType;
import com.watersupply.tracker.entity.Priority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * JSON body of POST /api/complaints (the resident's form).
 * The rules mirror the frontend form, so the server rejects bad data even if
 * someone bypasses the browser. A Java "record" is a compact immutable data class.
 */
public record CreateComplaintRequest(

        @NotBlank(message = "Enter your full name.")
        @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters.")
        String residentName,

        @NotBlank(message = "Enter a valid 10-digit mobile number.")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number.")
        String phone,

        // Optional: an empty string is allowed, a malformed address is not
        @Email(message = "Enter a valid email address.")
        @Size(max = 150, message = "Email must be at most 150 characters.")
        String email,

        @NotBlank(message = "Select your locality.")
        @Size(max = 100, message = "Locality must be at most 100 characters.")
        String area,

        @NotBlank(message = "Enter a house number, street or landmark.")
        @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters.")
        String address,

        @NotNull(message = "Select the type of problem.")
        ComplaintType type,

        // Optional: defaults to MEDIUM
        Priority priority,

        @NotBlank(message = "Describe the problem in at least 20 characters.")
        @Size(min = 20, max = 1000, message = "Description must be between 20 and 1000 characters.")
        String description
) {
}
