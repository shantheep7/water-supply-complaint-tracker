package com.watersupply.tracker.entity;

/**
 * Lifecycle of a complaint. The order of the constants IS the workflow:
 * SUBMITTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED.
 * "Pending" on the admin dashboard = SUBMITTED + ASSIGNED.
 */
public enum ComplaintStatus {
    SUBMITTED("Submitted"),
    ASSIGNED("Assigned"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved");

    private final String label;

    ComplaintStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** True if moving from this status to {@code target} goes backwards in the workflow. */
    public boolean isAfter(ComplaintStatus target) {
        return this.ordinal() > target.ordinal();
    }
}
