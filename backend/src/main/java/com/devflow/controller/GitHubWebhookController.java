package com.devflow.controller;

import com.devflow.common.ApiResponse;
import com.devflow.service.GitHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/github")
public class GitHubWebhookController {

    private final GitHubService gitHubService;

    public GitHubWebhookController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "push") String eventType) {

        gitHubService.processWebhook(payload, signature, eventType);
        return ResponseEntity.ok(ApiResponse.ok("Webhook processed", "Event: " + eventType));
    }
}
