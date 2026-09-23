package com.devflow.controller;

import com.devflow.common.ApiResponse;
import com.devflow.dto.workspace.*;
import com.devflow.security.SecurityUtils;
import com.devflow.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getWorkspaces() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<WorkspaceResponse> workspaces = workspaceService.getUserWorkspaces(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(workspaces));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        WorkspaceResponse workspace = workspaceService.createWorkspace(currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.created("Workspace created successfully", workspace),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspace(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        WorkspaceResponse workspace = workspaceService.getWorkspace(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(workspace));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateWorkspaceRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        WorkspaceResponse workspace = workspaceService.updateWorkspace(id, currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Workspace updated successfully", workspace));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        workspaceService.deleteWorkspace(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Workspace deleted successfully", null));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<WorkspaceMemberResponse>>> getWorkspaceMembers(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<WorkspaceMemberResponse> members = workspaceService.getWorkspaceMembers(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<WorkspaceMemberResponse>> addMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddMemberRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        WorkspaceMemberResponse member = workspaceService.addMember(id, currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.created("Member added successfully", member),
                HttpStatus.CREATED
        );
    }

    @PatchMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<WorkspaceMemberResponse>> updateMemberRole(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        WorkspaceMemberResponse member = workspaceService.updateMemberRole(id, currentUserId, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Member role updated successfully", member));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        workspaceService.removeMember(id, currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Member removed successfully", null));
    }
}
