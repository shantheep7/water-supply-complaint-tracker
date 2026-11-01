package com.watersupply.tracker.controller;

import com.watersupply.tracker.dto.TeamResponse;
import com.watersupply.tracker.service.TeamService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    /** GET /api/teams - maintenance teams for the admin dropdown and the team card. */
    @GetMapping
    public List<TeamResponse> getTeams() {
        return teamService.getAllTeams();
    }
}
