package com.watersupply.tracker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * One entry in a complaint's timeline ("Assigned to Team Coral", "Supply restored" ...).
 * Table: status_history. Many history rows belong to one complaint.
 */
@Entity
@Table(name = "status_history")
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ComplaintStatus status;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    @Column(nullable = false, length = 500)
    private String note;

    /** Who made the change: "Resident", "Control Room", "Team Alpha" ... */
    @Column(name = "changed_by", nullable = false, length = 100)
    private String changedBy;

    protected StatusHistory() {
        // required by JPA
    }

    public StatusHistory(ComplaintStatus status, Instant changedAt, String note, String changedBy) {
        this.status = status;
        this.changedAt = changedAt;
        this.note = note;
        this.changedBy = changedBy;
    }

    public Long getId() {
        return id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public Instant getChangedAt() {
        return changedAt;
    }

    public String getNote() {
        return note;
    }

    public String getChangedBy() {
        return changedBy;
    }
}
