package com.devflow.service;

import com.devflow.dto.label.CreateLabelRequest;
import com.devflow.dto.label.LabelResponse;
import com.devflow.entity.Label;
import com.devflow.entity.Project;
import com.devflow.exception.ConflictException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.LabelRepository;
import com.devflow.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceSecurityService workspaceSecurityService;

    public LabelService(LabelRepository labelRepository,
                        ProjectRepository projectRepository,
                        WorkspaceSecurityService workspaceSecurityService) {
        this.labelRepository = labelRepository;
        this.projectRepository = projectRepository;
        this.workspaceSecurityService = workspaceSecurityService;
    }

    @Transactional(readOnly = true)
    public List<LabelResponse> getProjectLabels(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);

        return labelRepository.findByProjectIdOrderByNameAsc(projectId)
                .stream()
                .map(LabelResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabelResponse createLabel(UUID projectId, UUID userId, CreateLabelRequest request) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);

        String normalizedName = request.getName().trim();
        if (labelRepository.existsByProjectIdAndNameIgnoreCase(projectId, normalizedName)) {
            throw new ConflictException(String.format("Label '%s' already exists in this project", normalizedName));
        }

        Label label = new Label(project, normalizedName, request.getColor(), request.getDescription());
        Label saved = labelRepository.save(label);

        return LabelResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteLabel(UUID projectId, UUID labelId, UUID userId) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId));

        labelRepository.delete(label);
    }
}
