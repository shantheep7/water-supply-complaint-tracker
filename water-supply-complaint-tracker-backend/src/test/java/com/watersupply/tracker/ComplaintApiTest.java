package com.watersupply.tracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end tests of the REST API: real controllers, services and repositories,
 * running against an in-memory database loaded with the sample data.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ComplaintApiTest {

    private static final String VALID_COMPLAINT = """
            {
              "residentName": "Test Resident",
              "phone": "9876543210",
              "email": "",
              "area": "Station Road",
              "address": "14, Platform Road",
              "type": "PIPELINE_LEAKAGE",
              "priority": "HIGH",
              "description": "Pipeline near the junction is leaking heavily since morning."
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void listsSeededComplaintsAndTeams() throws Exception {
        mockMvc.perform(get("/api/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[0].id").value("TEAM-01"))
                .andExpect(jsonPath("$[0].zones", hasSize(3)));

        mockMvc.perform(get("/api/complaints").param("status", "RESOLVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
    }

    @Test
    void tracksComplaintById() throws Exception {
        mockMvc.perform(get("/api/complaints/wsc-2026-1002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("WSC-2026-1002"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.assignedTeamId").value("TEAM-02"))
                .andExpect(jsonPath("$.history", hasSize(3)))
                .andExpect(jsonPath("$.history[0].by").value("Resident"))
                .andExpect(jsonPath("$.createdAt").value("2026-10-24T05:15:00Z"));
    }

    @Test
    void unknownComplaintReturns404WithMessage() throws Exception {
        mockMvc.perform(get("/api/complaints/WSC-2000-9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Complaint WSC-2000-9999 was not found."));
    }

    @Test
    void fullRepairWorkflow() throws Exception {
        String id = createComplaint();

        // Cannot start work before a team is assigned
        updateStatus(id, "IN_PROGRESS")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Assign a maintenance team before updating the status."));

        // Assigning a team moves SUBMITTED -> ASSIGNED
        mockMvc.perform(patch("/api/complaints/{id}/assign", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"teamId\": \"TEAM-03\", \"note\": \"\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedTeamId").value("TEAM-03"))
                .andExpect(jsonPath("$.history[1].note").value("Assigned to Team Coral (Supply Restoration)."));

        updateStatus(id, "IN_PROGRESS").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // Status cannot go backwards
        updateStatus(id, "ASSIGNED")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", matchesPattern("Status can only move forward.*")));

        updateStatus(id, "RESOLVED").andExpect(status().isOk()).andExpect(jsonPath("$.history", hasSize(4)));

        // Resolved complaints are locked
        mockMvc.perform(patch("/api/complaints/{id}/assign", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"teamId\": \"TEAM-01\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A resolved complaint cannot be reassigned."));
    }

    @Test
    void rejectsInvalidComplaint() throws Exception {
        mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"residentName\": \"Al\", \"phone\": \"12345\", \"description\": \"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.phone").value("Enter a valid 10-digit mobile number."))
                .andExpect(jsonPath("$.fieldErrors.type").value("Select the type of problem."))
                .andExpect(jsonPath("$.fieldErrors.area").exists());
    }

    @Test
    void rejectsUnknownEnumValue() throws Exception {
        mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_COMPLAINT.replace("PIPELINE_LEAKAGE", "FLOOD")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", matchesPattern("Invalid value 'FLOOD' for 'type'.*")));
    }

    @Test
    void allowsCorsFromViteDevServer() throws Exception {
        mockMvc.perform(options("/api/complaints")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5174")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PATCH"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5174"));
    }

    private String createComplaint() throws Exception {
        String body = mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_COMPLAINT))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", matchesPattern("WSC-\\d{4}-\\d+")))
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(header().exists(HttpHeaders.LOCATION))
                .andReturn().getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        return json.get("id").asText();
    }

    private org.springframework.test.web.servlet.ResultActions updateStatus(String id, String status) throws Exception {
        return mockMvc.perform(patch("/api/complaints/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\": \"" + status + "\"}"));
    }
}
