package com.devflow.controller;

import com.devflow.common.ApiResponse;
import com.devflow.dto.github.ConnectGitHubRepoRequest;
import com.devflow.dto.github.GitHubActivityResponse;
import com.devflow.dto.github.GitHubRepositoryResponse;
import com.devflow.security.SecurityUtils;
import com.devflow.service.GitHubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class GitHubController {

    private final GitHubService gitHubService;

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @PostMapping("/projects/{projectId}/github")
    public ResponseEntity<ApiResponse<GitHubRepositoryResponse>> connectRepository(
            @PathVariable UUID projectId,
            @Valid @RequestBody ConnectGitHubRepoRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        GitHubRepositoryResponse response = gitHubService.connectRepository(projectId, currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.created("GitHub repository connected successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/projects/{projectId}/github")
    public ResponseEntity<ApiResponse<GitHubRepositoryResponse>> getConnectedRepository(
            @PathVariable UUID projectId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        GitHubRepositoryResponse response = gitHubService.getConnectedRepository(projectId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/projects/{projectId}/github")
    public ResponseEntity<ApiResponse<Void>> disconnectRepository(@PathVariable UUID projectId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        gitHubService.disconnectRepository(projectId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("GitHub repository disconnected successfully", null));
    }

    @PostMapping("/projects/{projectId}/github/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncCommits(@PathVariable UUID projectId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        int linked = gitHubService.syncRecentCommits(projectId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Commits synced successfully", Map.of("newlyLinkedCommits", linked)));
    }

    @GetMapping("/issues/{issueId}/github-activity")
    public ResponseEntity<ApiResponse<List<GitHubActivityResponse>>> getIssueActivities(
            @PathVariable UUID issueId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<GitHubActivityResponse> activities = gitHubService.getIssueActivities(issueId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }
}
