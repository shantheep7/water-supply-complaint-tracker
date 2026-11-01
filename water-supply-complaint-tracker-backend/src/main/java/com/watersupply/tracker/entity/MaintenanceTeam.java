package com.watersupply.tracker.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/** A field crew that can be assigned to complaints. Table: maintenance_teams. */
@Entity
@Table(name = "maintenance_teams")
public class MaintenanceTeam {

    /** Readable ID such as "TEAM-01" (also what the frontend uses). */
    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(nullable = false, length = 100)
    private String leader;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false)
    private int members;

    /** Areas the team covers, stored in a separate table team_zones (one row per zone). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "team_zones", joinColumns = @JoinColumn(name = "team_id"))
    @OrderColumn(name = "position")
    @Column(name = "zone", length = 100)
    private List<String> zones = new ArrayList<>();

    protected MaintenanceTeam() {
        // required by JPA
    }

    public MaintenanceTeam(String id, String name, String specialization, String leader,
                           String phone, int members, List<String> zones) {
        this.id = id;
        this.name = name;
        this.specialization = specialization;
        this.leader = leader;
        this.phone = phone;
        this.members = members;
        this.zones = new ArrayList<>(zones);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getLeader() {
        return leader;
    }

    public String getPhone() {
        return phone;
    }

    public int getMembers() {
        return members;
    }

    public List<String> getZones() {
        return zones;
    }
}
