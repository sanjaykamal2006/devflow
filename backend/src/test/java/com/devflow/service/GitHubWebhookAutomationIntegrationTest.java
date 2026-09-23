package com.devflow.service;

import com.devflow.dto.github.ConnectGitHubRepoRequest;
import com.devflow.dto.issue.CreateIssueRequest;
import com.devflow.dto.issue.IssueResponse;
import com.devflow.dto.project.CreateProjectRequest;
import com.devflow.dto.project.ProjectResponse;
import com.devflow.dto.workspace.CreateWorkspaceRequest;
import com.devflow.dto.workspace.WorkspaceResponse;
import com.devflow.entity.Issue;
import com.devflow.entity.IssuePriority;
import com.devflow.entity.IssueStatus;
import com.devflow.entity.IssueType;
import com.devflow.entity.User;
import com.devflow.repository.IssueRepository;
import com.devflow.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class GitHubWebhookAutomationIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private IssueService issueService;

    @Autowired
    private GitHubService gitHubService;

    @Autowired
    private IssueRepository issueRepository;

    private String calculateHmac(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return "sha256=" + sb.toString();
    }

    @Test
    @DisplayName("Commits with fixes/closes/resolves and merged PRs must transition referenced issues to DONE")
    void testGitHubAutomationStatusTransitions() throws Exception {
        long ts = System.currentTimeMillis();
        String secret = "test-secret-" + ts;

        User owner = userRepository.save(new User("gh." + ts + "@devflow.local", "hash", "GitHub Tester"));
        WorkspaceResponse ws = workspaceService.createWorkspace(owner.getId(), new CreateWorkspaceRequest("GH WS " + ts, "ghws-" + ts, "Desc"));
        ProjectResponse proj = projectService.createProject(ws.getId(), owner.getId(), new CreateProjectRequest("Auto Project", "AUTO", "Desc"));

        // Connect GitHub Repo
        gitHubService.connectRepository(proj.getId(), owner.getId(), new ConnectGitHubRepoRequest("test-org", "test-repo", secret));

        // Create 5 issues
        IssueResponse issue1 = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Issue 1", "Desc", IssueType.BUG, IssuePriority.HIGH, null, null, null));
        IssueResponse issue2 = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Issue 2", "Desc", IssueType.TASK, IssuePriority.MEDIUM, null, null, null));
        IssueResponse issue3 = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Issue 3", "Desc", IssueType.FEATURE, IssuePriority.LOW, null, null, null));
        IssueResponse issue4 = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Issue 4", "Desc", IssueType.TASK, IssuePriority.MEDIUM, null, null, null));
        IssueResponse issue5 = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Issue 5", "Desc", IssueType.BUG, IssuePriority.CRITICAL, null, null, null));

        assertThat(issue1.getStatus()).isEqualTo(IssueStatus.TODO);
        assertThat(issue2.getStatus()).isEqualTo(IssueStatus.TODO);
        assertThat(issue3.getStatus()).isEqualTo(IssueStatus.TODO);
        assertThat(issue4.getStatus()).isEqualTo(IssueStatus.TODO);
        assertThat(issue5.getStatus()).isEqualTo(IssueStatus.TODO);

        // 1. Commit with "fixes AUTO-1"
        String pushPayload1 = """
        {
          "repository": { "full_name": "test-org/test-repo" },
          "commits": [
            {
              "id": "c101",
              "message": "fixes AUTO-1 in master",
              "url": "https://github.com/test-org/test-repo/commit/c101",
              "author": { "name": "Dev" }
            }
          ]
        }
        """;
        gitHubService.processWebhook(pushPayload1, calculateHmac(pushPayload1, secret), "push");

        Issue updated1 = issueRepository.findById(issue1.getId()).orElseThrow();
        assertThat(updated1.getStatus()).isEqualTo(IssueStatus.DONE);

        // 2. Commit with "closes AUTO-2"
        String pushPayload2 = """
        {
          "repository": { "full_name": "test-org/test-repo" },
          "commits": [
            {
              "id": "c102",
              "message": "Refactor logic and closes #AUTO-2",
              "url": "https://github.com/test-org/test-repo/commit/c102",
              "author": { "name": "Dev" }
            }
          ]
        }
        """;
        gitHubService.processWebhook(pushPayload2, calculateHmac(pushPayload2, secret), "push");

        Issue updated2 = issueRepository.findById(issue2.getId()).orElseThrow();
        assertThat(updated2.getStatus()).isEqualTo(IssueStatus.DONE);

        // 3. Commit with "resolves AUTO-3"
        String pushPayload3 = """
        {
          "repository": { "full_name": "test-org/test-repo" },
          "commits": [
            {
              "id": "c103",
              "message": "resolves [AUTO-3] finally",
              "url": "https://github.com/test-org/test-repo/commit/c103",
              "author": { "name": "Dev" }
            }
          ]
        }
        """;
        gitHubService.processWebhook(pushPayload3, calculateHmac(pushPayload3, secret), "push");

        Issue updated3 = issueRepository.findById(issue3.getId()).orElseThrow();
        assertThat(updated3.getStatus()).isEqualTo(IssueStatus.DONE);

        // 4. Regular commit mentioning AUTO-4 without closing verb
        String pushPayload4 = """
        {
          "repository": { "full_name": "test-org/test-repo" },
          "commits": [
            {
              "id": "c104",
              "message": "Work in progress on AUTO-4",
              "url": "https://github.com/test-org/test-repo/commit/c104",
              "author": { "name": "Dev" }
            }
          ]
        }
        """;
        gitHubService.processWebhook(pushPayload4, calculateHmac(pushPayload4, secret), "push");

        Issue updated4 = issueRepository.findById(issue4.getId()).orElseThrow();
        assertThat(updated4.getStatus()).isEqualTo(IssueStatus.TODO);

        // 5. Merged PR mentioning AUTO-5
        String prPayloadMerged = """
        {
          "action": "closed",
          "repository": { "full_name": "test-org/test-repo" },
          "pull_request": {
            "number": 77,
            "title": "Release feature for AUTO-5",
            "body": "Fixes bug and cleans code",
            "html_url": "https://github.com/test-org/test-repo/pull/77",
            "merged": true,
            "user": { "login": "devlead", "avatar_url": null }
          }
        }
        """;
        gitHubService.processWebhook(prPayloadMerged, calculateHmac(prPayloadMerged, secret), "pull_request");

        Issue updated5 = issueRepository.findById(issue5.getId()).orElseThrow();
        assertThat(updated5.getStatus()).isEqualTo(IssueStatus.DONE);
    }
}
