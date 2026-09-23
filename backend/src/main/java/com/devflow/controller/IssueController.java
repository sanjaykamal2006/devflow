package com.devflow.controller;

import com.devflow.common.ApiResponse;
import com.devflow.common.PagedResponse;
import com.devflow.dto.issue.*;
import com.devflow.security.SecurityUtils;
import com.devflow.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping("/projects/{projectId}/issues")
    public ResponseEntity<ApiResponse<PagedResponse<IssueResponse>>> getProjectIssues(
            @PathVariable UUID projectId,
            IssueFilterParams filterParams,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        PagedResponse<IssueResponse> issues = issueService.getProjectIssues(projectId, currentUserId, filterParams, pageable);
        return ResponseEntity.ok(ApiResponse.ok(issues));
    }

    @PostMapping("/projects/{projectId}/issues")
    public ResponseEntity<ApiResponse<IssueResponse>> createIssue(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateIssueRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.createIssue(projectId, currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.created("Issue created successfully", issue),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/issues/{id}")
    public ResponseEntity<ApiResponse<IssueResponse>> getIssueById(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.getIssueById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(issue));
    }

    @GetMapping("/issues/key/{key}")
    public ResponseEntity<ApiResponse<IssueResponse>> getIssueByKey(@PathVariable String key) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.getIssueByKey(key, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(issue));
    }

    @PatchMapping("/issues/{id}")
    public ResponseEntity<ApiResponse<IssueResponse>> updateIssue(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIssueRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.updateIssue(id, currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Issue updated successfully", issue));
    }

    @PatchMapping("/issues/{id}/status")
    public ResponseEntity<ApiResponse<IssueResponse>> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.changeStatus(id, currentUserId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Issue status updated successfully", issue));
    }

    @PatchMapping("/issues/{id}/assign")
    public ResponseEntity<ApiResponse<IssueResponse>> assignIssue(
            @PathVariable UUID id,
            @RequestBody AssignIssueRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.assignIssue(id, currentUserId, request.getAssigneeId());
        return ResponseEntity.ok(ApiResponse.ok("Issue assignee updated successfully", issue));
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIssue(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        issueService.deleteIssue(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Issue deleted successfully", null));
    }

    @PostMapping("/issues/{id}/labels/{labelId}")
    public ResponseEntity<ApiResponse<IssueResponse>> attachLabel(
            @PathVariable UUID id,
            @PathVariable UUID labelId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.attachLabel(id, labelId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Label attached successfully", issue));
    }

    @DeleteMapping("/issues/{id}/labels/{labelId}")
    public ResponseEntity<ApiResponse<IssueResponse>> removeLabel(
            @PathVariable UUID id,
            @PathVariable UUID labelId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        IssueResponse issue = issueService.removeLabel(id, labelId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Label removed successfully", issue));
    }
}
