package com.watersupply.tracker.service;

import com.watersupply.tracker.dto.TeamResponse;
import com.watersupply.tracker.mapper.ComplaintMapper;
import com.watersupply.tracker.repository.MaintenanceTeamRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final MaintenanceTeamRepository teamRepository;

    // Constructor injection: Spring passes in the repository automatically
    public TeamService(MaintenanceTeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll(Sort.by("id")).stream()
                .map(ComplaintMapper::toResponse)
                .toList();
    }
}
