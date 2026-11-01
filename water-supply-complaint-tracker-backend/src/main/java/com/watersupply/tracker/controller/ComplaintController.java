package com.watersupply.tracker.controller;

import com.watersupply.tracker.dto.AssignTeamRequest;
import com.watersupply.tracker.dto.ComplaintResponse;
import com.watersupply.tracker.dto.CreateComplaintRequest;
import com.watersupply.tracker.dto.UpdateStatusRequest;
import com.watersupply.tracker.entity.ComplaintStatus;
import com.watersupply.tracker.entity.ComplaintType;
import com.watersupply.tracker.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * HTTP layer for complaints. Controllers stay thin: they read the request,
 * call the service and return the result. @Valid triggers the validation
 * annotations on the request DTO before the method body runs.
 */
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /** GET /api/complaints?area=&type=&status=&search=  (all filters optional) */
    @GetMapping
    public List<ComplaintResponse> getComplaints(@RequestParam(required = false) String area,
                                                 @RequestParam(required = false) ComplaintType type,
                                                 @RequestParam(required = false) ComplaintStatus status,
                                                 @RequestParam(required = false) String search) {
        return complaintService.getComplaints(area, type, status, search);
    }

    /** GET /api/complaints/WSC-2026-1002 - used by the Track Complaint page. */
    @GetMapping("/{complaintId}")
    public ComplaintResponse getComplaint(@PathVariable String complaintId) {
        return complaintService.getComplaint(complaintId);
    }

    /** POST /api/complaints - register a complaint. Returns 201 Created with the new ID. */
    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody CreateComplaintRequest request) {
        ComplaintResponse created = complaintService.createComplaint(request);
        return ResponseEntity.created(URI.create("/api/complaints/" + created.id())).body(created);
    }

    /** PATCH /api/complaints/{id}/assign - body: { "teamId": "TEAM-03", "note": "..." } */
    @PatchMapping("/{complaintId}/assign")
    public ComplaintResponse assignTeam(@PathVariable String complaintId,
                                        @Valid @RequestBody AssignTeamRequest request) {
        return complaintService.assignTeam(complaintId, request);
    }

    /** PATCH /api/complaints/{id}/status - body: { "status": "IN_PROGRESS", "note": "..." } */
    @PatchMapping("/{complaintId}/status")
    public ComplaintResponse updateStatus(@PathVariable String complaintId,
                                          @Valid @RequestBody UpdateStatusRequest request) {
        return complaintService.updateStatus(complaintId, request);
    }
}
