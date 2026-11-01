package com.watersupply.tracker.service;

import com.watersupply.tracker.dto.AssignTeamRequest;
import com.watersupply.tracker.dto.ComplaintResponse;
import com.watersupply.tracker.dto.CreateComplaintRequest;
import com.watersupply.tracker.dto.UpdateStatusRequest;
import com.watersupply.tracker.entity.Complaint;
import com.watersupply.tracker.entity.ComplaintStatus;
import com.watersupply.tracker.entity.ComplaintType;
import com.watersupply.tracker.entity.MaintenanceTeam;
import com.watersupply.tracker.entity.Priority;
import com.watersupply.tracker.entity.StatusHistory;
import com.watersupply.tracker.exception.BusinessRuleException;
import com.watersupply.tracker.exception.ResourceNotFoundException;
import com.watersupply.tracker.mapper.ComplaintMapper;
import com.watersupply.tracker.repository.ComplaintRepository;
import com.watersupply.tracker.repository.MaintenanceTeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * All complaint business rules live here (not in the controller):
 *  - status only moves forward: SUBMITTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED
 *  - a team must be assigned before the status can move past SUBMITTED
 *  - assigning a team to a SUBMITTED complaint moves it to ASSIGNED automatically
 *  - resolved complaints are locked
 *  - every change is recorded in the complaint's history
 *
 * @Transactional: each public method runs in one database transaction, so either
 * all of its changes are saved or none are.
 */
@Service
public class ComplaintService {

    private static final String RESIDENT = "Resident";
    private static final String CONTROL_ROOM = "Control Room";

    private final ComplaintRepository complaintRepository;
    private final MaintenanceTeamRepository teamRepository;

    public ComplaintService(ComplaintRepository complaintRepository, MaintenanceTeamRepository teamRepository) {
        this.complaintRepository = complaintRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaints(String area, ComplaintType type, ComplaintStatus status, String search) {
        String searchPattern = isBlank(search) ? null : "%" + search.trim().toLowerCase() + "%";
        return complaintRepository.search(blankToNull(area), type, status, searchPattern).stream()
                .map(ComplaintMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaint(String complaintId) {
        return ComplaintMapper.toResponse(findComplaint(complaintId));
    }

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request) {
        Instant now = Instant.now();
        Complaint complaint = new Complaint(
                request.residentName().trim(),
                request.phone().trim(),
                isBlank(request.email()) ? "" : request.email().trim(),
                request.area().trim(),
                request.address().trim(),
                request.type(),
                request.priority() == null ? Priority.MEDIUM : request.priority(),
                request.description().trim(),
                now);
        complaint.addHistory(new StatusHistory(ComplaintStatus.SUBMITTED, now, "Complaint registered online.", RESIDENT));

        // First save: MySQL assigns the auto-increment id ...
        Complaint saved = complaintRepository.save(complaint);
        // ... which we turn into the public ID. The change is written when the transaction commits.
        saved.setComplaintCode(ComplaintIdGenerator.generate(saved.getId(), saved.getCreatedAt()));
        return ComplaintMapper.toResponse(saved);
    }

    @Transactional
    public ComplaintResponse assignTeam(String complaintId, AssignTeamRequest request) {
        Complaint complaint = findComplaint(complaintId);
        MaintenanceTeam team = teamRepository.findById(request.teamId().trim())
                .orElseThrow(() -> new BusinessRuleException("Please select a valid maintenance team."));

        if (complaint.getStatus() == ComplaintStatus.RESOLVED) {
            throw new BusinessRuleException("A resolved complaint cannot be reassigned.");
        }
        MaintenanceTeam current = complaint.getAssignedTeam();
        if (current != null && current.getId().equals(team.getId())) {
            return ComplaintMapper.toResponse(complaint); // already assigned to this team - nothing to do
        }

        ComplaintStatus nextStatus = complaint.getStatus() == ComplaintStatus.SUBMITTED
                ? ComplaintStatus.ASSIGNED
                : complaint.getStatus();
        String defaultNote = "%s to %s (%s).".formatted(
                current == null ? "Assigned" : "Reassigned", team.getName(), team.getSpecialization());

        Instant now = Instant.now();
        complaint.setAssignedTeam(team);
        complaint.setStatus(nextStatus);
        complaint.setUpdatedAt(now);
        complaint.addHistory(new StatusHistory(nextStatus, now, noteOrDefault(request.note(), defaultNote), CONTROL_ROOM));
        // No save() call needed: JPA notices changes to loaded entities and writes them on commit
        return ComplaintMapper.toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse updateStatus(String complaintId, UpdateStatusRequest request) {
        Complaint complaint = findComplaint(complaintId);
        ComplaintStatus target = request.status();

        if (complaint.getStatus().isAfter(target)) {
            throw new BusinessRuleException(
                    "Status can only move forward: Submitted → Assigned → In Progress → Resolved.");
        }
        if (target != ComplaintStatus.SUBMITTED && complaint.getAssignedTeam() == null) {
            throw new BusinessRuleException("Assign a maintenance team before updating the status.");
        }
        if (target == complaint.getStatus()) {
            return ComplaintMapper.toResponse(complaint);
        }

        Instant now = Instant.now();
        complaint.setStatus(target);
        complaint.setUpdatedAt(now);
        complaint.addHistory(new StatusHistory(target, now,
                noteOrDefault(request.note(), "Status changed to " + target.getLabel() + "."), CONTROL_ROOM));
        return ComplaintMapper.toResponse(complaint);
    }

    private Complaint findComplaint(String complaintId) {
        String code = ComplaintIdGenerator.normalize(complaintId);
        return complaintRepository.findByComplaintCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint " + code + " was not found."));
    }

    private static String noteOrDefault(String note, String defaultNote) {
        return isBlank(note) ? defaultNote : note.trim();
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }
}
