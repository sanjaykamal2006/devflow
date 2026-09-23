package com.devflow.controller;

import com.devflow.common.ApiResponse;
import com.devflow.dto.project.CreateProjectRequest;
import com.devflow.dto.project.ProjectResponse;
import com.devflow.dto.project.UpdateProjectRequest;
import com.devflow.security.SecurityUtils;
import com.devflow.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getWorkspaceProjects(
            @PathVariable UUID workspaceId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<ProjectResponse> projects = projectService.getWorkspaceProjects(workspaceId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(projects));
    }

    @PostMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateProjectRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        ProjectResponse project = projectService.createProject(workspaceId, currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.created("Project created successfully", project),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        ProjectResponse project = projectService.getProject(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(project));
    }

    @PatchMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        ProjectResponse project = projectService.updateProject(id, currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", project));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        projectService.deleteProject(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }
}
