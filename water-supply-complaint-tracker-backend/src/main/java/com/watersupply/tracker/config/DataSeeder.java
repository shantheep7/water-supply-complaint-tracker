package com.watersupply.tracker.config;

import com.watersupply.tracker.entity.Complaint;
import com.watersupply.tracker.entity.ComplaintStatus;
import com.watersupply.tracker.entity.ComplaintType;
import com.watersupply.tracker.entity.MaintenanceTeam;
import com.watersupply.tracker.entity.Priority;
import com.watersupply.tracker.entity.StatusHistory;
import com.watersupply.tracker.repository.ComplaintRepository;
import com.watersupply.tracker.repository.MaintenanceTeamRepository;
import com.watersupply.tracker.service.ComplaintIdGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static com.watersupply.tracker.entity.ComplaintStatus.ASSIGNED;
import static com.watersupply.tracker.entity.ComplaintStatus.IN_PROGRESS;
import static com.watersupply.tracker.entity.ComplaintStatus.RESOLVED;
import static com.watersupply.tracker.entity.ComplaintStatus.SUBMITTED;

/**
 * Loads the same sample teams and complaints the React app shows in demo mode.
 * Runs once at startup (CommandLineRunner) and only inserts data into EMPTY tables,
 * so your own complaints are never overwritten. Disable with app.seed-sample-data=false.
 */
@Component
@ConditionalOnProperty(name = "app.seed-sample-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String REGISTERED = "Complaint registered online.";

    private final MaintenanceTeamRepository teamRepository;
    private final ComplaintRepository complaintRepository;

    public DataSeeder(MaintenanceTeamRepository teamRepository, ComplaintRepository complaintRepository) {
        this.teamRepository = teamRepository;
        this.complaintRepository = complaintRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (teamRepository.count() == 0) {
            teamRepository.saveAll(sampleTeams());
            log.info("Seeded {} maintenance teams", teamRepository.count());
        }
        if (complaintRepository.count() == 0) {
            seedComplaints();
            log.info("Seeded {} sample complaints", complaintRepository.count());
        }
    }

    private List<MaintenanceTeam> sampleTeams() {
        return List.of(
                new MaintenanceTeam("TEAM-01", "Team Alpha", "Pipeline Repair", "R. Karthik", "+91 94430 11201", 6,
                        List.of("Riverside Ward", "Old Market Area", "Temple Street")),
                new MaintenanceTeam("TEAM-02", "Team Bravo", "Leak Detection & Valves", "S. Priya", "+91 94430 11202", 4,
                        List.of("Lakeview Colony", "Hillcrest Heights")),
                new MaintenanceTeam("TEAM-03", "Team Coral", "Supply Restoration", "M. Arul", "+91 94430 11203", 5,
                        List.of("Gandhi Nagar", "Station Road", "Sunrise Enclave")),
                new MaintenanceTeam("TEAM-04", "Team Delta", "Water Quality & Testing", "Dr. N. Lakshmi", "+91 94430 11204", 3,
                        List.of("All areas")),
                new MaintenanceTeam("TEAM-05", "Team Echo", "Emergency Response", "V. Senthil", "+91 94430 11205", 8,
                        List.of("Industrial Estate", "Green Park Extension")));
    }

    /** Inserted in order so the generated IDs come out as WSC-2026-1001 ... WSC-2026-1012. */
    private void seedComplaints() {
        Map<String, MaintenanceTeam> teams = Map.of(
                "TEAM-01", teamRepository.getReferenceById("TEAM-01"),
                "TEAM-02", teamRepository.getReferenceById("TEAM-02"),
                "TEAM-03", teamRepository.getReferenceById("TEAM-03"),
                "TEAM-04", teamRepository.getReferenceById("TEAM-04"),
                "TEAM-05", teamRepository.getReferenceById("TEAM-05"));

        // 1001
        save(complaint("Anitha Raman", "9840012345", "anitha.r@example.com", "Riverside Ward",
                "12, 3rd Cross Street, near Riverside Park", ComplaintType.PIPELINE_LEAKAGE, Priority.HIGH,
                "Main pipeline on 3rd Cross Street has burst. Water is flowing onto the road continuously since early morning and houses downstream have very low pressure.",
                "2026-10-18T07:40:00Z"),
                teams.get("TEAM-01"), "2026-10-19T15:10:00Z",
                h(SUBMITTED, "2026-10-18T07:40:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-18T09:05:00Z", "Assigned to Team Alpha (Pipeline Repair).", "Control Room"),
                h(IN_PROGRESS, "2026-10-18T12:30:00Z", "Excavation started, supply isolated at valve V-14.", "Team Alpha"),
                h(RESOLVED, "2026-10-19T15:10:00Z", "Damaged 150mm section replaced. Supply restored.", "Team Alpha"));
        // 1002
        save(complaint("Mohammed Irfan", "9789056781", "", "Lakeview Colony", "Block C, Lakeview Apartments",
                ComplaintType.WATER_SHORTAGE, Priority.MEDIUM,
                "Water supply comes only for 30 minutes in the morning for the past week. Overhead tanks are not getting filled.",
                "2026-10-24T05:15:00Z"),
                teams.get("TEAM-02"), "2026-10-26T10:00:00Z",
                h(SUBMITTED, "2026-10-24T05:15:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-24T08:20:00Z", "Assigned to Team Bravo for pressure survey.", "Control Room"),
                h(IN_PROGRESS, "2026-10-26T10:00:00Z", "Partially closed valve found at junction; flow testing in progress.", "Team Bravo"));
        // 1003
        save(complaint("Lakshmi Narayanan", "9445023456", "lakshmi.n@example.com", "Gandhi Nagar", "45, 2nd Main Road",
                ComplaintType.NO_WATER_SUPPLY, Priority.CRITICAL,
                "No water supply in the entire 2nd Main Road for two days. Around 40 houses affected including a primary school.",
                "2026-10-29T06:00:00Z"),
                teams.get("TEAM-03"), "2026-10-29T07:45:00Z",
                h(SUBMITTED, "2026-10-29T06:00:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-29T07:45:00Z", "Marked critical. Assigned to Team Coral.", "Control Room"));
        // 1004
        save(complaint("Joseph Fernandes", "9003078912", "", "Old Market Area", "Shop 7, Vegetable Market Lane",
                ComplaintType.CONTAMINATED_WATER, Priority.HIGH,
                "Tap water is brownish and has a foul smell since yesterday evening. Several shop owners have complained of the same.",
                "2026-10-27T11:20:00Z"),
                teams.get("TEAM-04"), "2026-10-28T09:30:00Z",
                h(SUBMITTED, "2026-10-27T11:20:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-27T13:00:00Z", "Assigned to Team Delta for water quality testing.", "Control Room"),
                h(IN_PROGRESS, "2026-10-28T09:30:00Z", "Samples collected. Suspected sewage cross-connection near drain.", "Team Delta"));
        // 1005
        save(complaint("Priya Subramanian", "9677034567", "priya.s@example.com", "Hillcrest Heights",
                "Villa 22, Hillcrest Main Road", ComplaintType.PIPELINE_LEAKAGE, Priority.MEDIUM,
                "Small leakage near the water meter outside the house. Water pooling on the footpath for the past three days.",
                "2026-10-31T16:45:00Z"),
                null, "2026-10-31T16:45:00Z",
                h(SUBMITTED, "2026-10-31T16:45:00Z", REGISTERED, "Resident"));
        // 1006
        save(complaint("Ganesh Kumar", "9952045678", "", "Industrial Estate", "Plot 18, Phase II",
                ComplaintType.NO_WATER_SUPPLY, Priority.HIGH,
                "Water supply to Phase II industrial units stopped after road-widening work. Suspect pipeline damaged by excavator.",
                "2026-10-15T04:30:00Z"),
                teams.get("TEAM-05"), "2026-10-15T18:20:00Z",
                h(SUBMITTED, "2026-10-15T04:30:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-15T05:10:00Z", "Emergency team dispatched.", "Control Room"),
                h(IN_PROGRESS, "2026-10-15T07:00:00Z", "Damaged 200mm main located near culvert.", "Team Echo"),
                h(RESOLVED, "2026-10-15T18:20:00Z", "Pipe joint replaced and pressure tested.", "Team Echo"));
        // 1007
        save(complaint("Fathima Begum", "9841067890", "fathima.b@example.com", "Station Road", "9, Railway Colony Quarters",
                ComplaintType.WATER_SHORTAGE, Priority.LOW,
                "Water pressure has reduced in the evenings. Ground floor gets water but first floor tanks do not fill.",
                "2026-11-01T03:10:00Z"),
                null, "2026-11-01T03:10:00Z",
                h(SUBMITTED, "2026-11-01T03:10:00Z", REGISTERED, "Resident"));
        // 1008
        save(complaint("Suresh Babu", "9786078901", "", "Green Park Extension", "3rd Avenue, near Community Hall",
                ComplaintType.PIPELINE_LEAKAGE, Priority.CRITICAL,
                "Large leak from the distribution line has created a crater on 3rd Avenue. Traffic diverted and nearby houses without water.",
                "2026-10-30T08:00:00Z"),
                teams.get("TEAM-05"), "2026-10-30T14:15:00Z",
                h(SUBMITTED, "2026-10-30T08:00:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-30T08:25:00Z", "Emergency response team assigned.", "Control Room"),
                h(IN_PROGRESS, "2026-10-30T14:15:00Z", "Area barricaded, repair crew on site.", "Team Echo"));
        // 1009
        save(complaint("Deepa Krishnan", "9500089012", "deepa.k@example.com", "Sunrise Enclave", "Flat 4B, Sunrise Residency",
                ComplaintType.CONTAMINATED_WATER, Priority.MEDIUM,
                "Water has a strong chlorine smell and slight white residue after boiling. Requesting quality check.",
                "2026-10-20T10:00:00Z"),
                teams.get("TEAM-04"), "2026-10-22T12:00:00Z",
                h(SUBMITTED, "2026-10-20T10:00:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-20T13:30:00Z", "Assigned to Team Delta.", "Control Room"),
                h(IN_PROGRESS, "2026-10-21T09:00:00Z", "Samples sent to lab.", "Team Delta"),
                h(RESOLVED, "2026-10-22T12:00:00Z", "Chlorine dosing corrected at the local sump. Water within safe limits.", "Team Delta"));
        // 1010
        save(complaint("Arun Prakash", "9884090123", "", "Temple Street", "27, North Car Street",
                ComplaintType.NO_WATER_SUPPLY, Priority.HIGH,
                "No water supply since the festival weekend. Street pipeline valve appears to be closed.",
                "2026-10-31T06:30:00Z"),
                teams.get("TEAM-01"), "2026-10-31T09:00:00Z",
                h(SUBMITTED, "2026-10-31T06:30:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-31T09:00:00Z", "Assigned to Team Alpha for valve inspection.", "Control Room"));
        // 1011
        save(complaint("Kavitha Murugan", "9600001234", "kavitha.m@example.com", "Riverside Ward", "5, Bridge Road",
                ComplaintType.WATER_SHORTAGE, Priority.MEDIUM,
                "Alternate-day supply has become once in three days. Please restore the regular schedule.",
                "2026-10-31T12:05:00Z"),
                null, "2026-10-31T12:05:00Z",
                h(SUBMITTED, "2026-10-31T12:05:00Z", REGISTERED, "Resident"));
        // 1012
        save(complaint("Ramesh Pillai", "9443012340", "", "Lakeview Colony", "88, Lake Front Road",
                ComplaintType.PIPELINE_LEAKAGE, Priority.LOW,
                "Dripping leak at the public tap near the bus stop. Wastage throughout the day.",
                "2026-10-12T09:00:00Z"),
                teams.get("TEAM-02"), "2026-10-13T11:40:00Z",
                h(SUBMITTED, "2026-10-12T09:00:00Z", REGISTERED, "Resident"),
                h(ASSIGNED, "2026-10-12T11:00:00Z", "Assigned to Team Bravo.", "Control Room"),
                h(IN_PROGRESS, "2026-10-13T08:30:00Z", "Crew on site.", "Team Bravo"),
                h(RESOLVED, "2026-10-13T11:40:00Z", "Tap washer and valve replaced.", "Team Bravo"));
    }

    private static Complaint complaint(String name, String phone, String email, String area, String address,
                                       ComplaintType type, Priority priority, String description, String createdAt) {
        return new Complaint(name, phone, email, area, address, type, priority, description, Instant.parse(createdAt));
    }

    private static StatusHistory h(ComplaintStatus status, String at, String note, String by) {
        return new StatusHistory(status, Instant.parse(at), note, by);
    }

    /** The complaint's status becomes the status of its last history entry. */
    private void save(Complaint complaint, MaintenanceTeam team, String updatedAt, StatusHistory... history) {
        for (StatusHistory entry : history) {
            complaint.addHistory(entry);
        }
        complaint.setStatus(history[history.length - 1].getStatus());
        complaint.setAssignedTeam(team);
        complaint.setUpdatedAt(Instant.parse(updatedAt));
        Complaint saved = complaintRepository.save(complaint);
        saved.setComplaintCode(ComplaintIdGenerator.generate(saved.getId(), saved.getCreatedAt()));
    }
}
