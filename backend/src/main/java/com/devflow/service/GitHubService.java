package com.devflow.service;

import com.devflow.dto.github.ConnectGitHubRepoRequest;
import com.devflow.dto.github.GitHubActivityResponse;
import com.devflow.dto.github.GitHubRepositoryResponse;
import com.devflow.entity.*;
import com.devflow.exception.BadRequestException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);

    private final GitHubRepositoryRepository gitHubRepositoryRepository;
    private final GitHubActivityRepository gitHubActivityRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final GitHubApiClient gitHubApiClient;
    private final GitHubIssueKeyExtractor issueKeyExtractor;
    private final WorkspaceSecurityService workspaceSecurityService;
    private final ObjectMapper objectMapper;

    public GitHubService(GitHubRepositoryRepository gitHubRepositoryRepository,
                         GitHubActivityRepository gitHubActivityRepository,
                         ProjectRepository projectRepository,
                         IssueRepository issueRepository,
                         GitHubApiClient gitHubApiClient,
                         GitHubIssueKeyExtractor issueKeyExtractor,
                         WorkspaceSecurityService workspaceSecurityService,
                         ObjectMapper objectMapper) {
        this.gitHubRepositoryRepository = gitHubRepositoryRepository;
        this.gitHubActivityRepository = gitHubActivityRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.gitHubApiClient = gitHubApiClient;
        this.issueKeyExtractor = issueKeyExtractor;
        this.workspaceSecurityService = workspaceSecurityService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public GitHubRepositoryResponse connectRepository(UUID projectId, UUID userId, ConnectGitHubRepoRequest request) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.requireRole(project.getWorkspace().getId(), userId, WorkspaceRole.ADMIN);

        if (gitHubRepositoryRepository.existsByProjectId(projectId)) {
            throw new BadRequestException("This project already has a connected GitHub repository");
        }

        String owner = request.getOwner().trim();
        String name = request.getName().trim();
        String repoUrl = String.format("https://github.com/%s/%s", owner, name);

        Optional<GitHubApiClient.RepoMeta> metaOpt = gitHubApiClient.fetchRepository(owner, name);

        GitHubRepository repo = new GitHubRepository(
                project,
                owner,
                name,
                metaOpt.map(GitHubApiClient.RepoMeta::htmlUrl).orElse(repoUrl),
                request.getWebhookSecret() != null ? request.getWebhookSecret().trim() : null
        );

        metaOpt.ifPresent(m -> repo.setDefaultBranch(m.defaultBranch()));
        GitHubRepository saved = gitHubRepositoryRepository.save(repo);

        // Sync recent commits right away to find existing linked issues
        syncCommitsInternal(saved, project);

        Integer stars = metaOpt.map(GitHubApiClient.RepoMeta::stargazersCount).orElse(null);
        Integer forks = metaOpt.map(GitHubApiClient.RepoMeta::forksCount).orElse(null);
        Integer openIssues = metaOpt.map(GitHubApiClient.RepoMeta::openIssuesCount).orElse(null);

        return GitHubRepositoryResponse.fromEntity(saved, stars, forks, openIssues);
    }

    @Transactional(readOnly = true)
    public GitHubRepositoryResponse getConnectedRepository(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);

        GitHubRepository repo = gitHubRepositoryRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No GitHub repository connected to project"));

        Optional<GitHubApiClient.RepoMeta> metaOpt = gitHubApiClient.fetchRepository(repo.getRepoOwner(), repo.getRepoName());

        return GitHubRepositoryResponse.fromEntity(
                repo,
                metaOpt.map(GitHubApiClient.RepoMeta::stargazersCount).orElse(null),
                metaOpt.map(GitHubApiClient.RepoMeta::forksCount).orElse(null),
                metaOpt.map(GitHubApiClient.RepoMeta::openIssuesCount).orElse(null)
        );
    }

    @Transactional
    public void disconnectRepository(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.requireRole(project.getWorkspace().getId(), userId, WorkspaceRole.ADMIN);

        GitHubRepository repo = gitHubRepositoryRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No connected repository found"));

        gitHubRepositoryRepository.delete(repo);
    }

    @Transactional(readOnly = true)
    public List<GitHubActivityResponse> getIssueActivities(UUID issueId, UUID userId) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);

        return gitHubActivityRepository.findByIssueIdOrderByEventTimestampDesc(issueId)
                .stream()
                .map(GitHubActivityResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public int syncRecentCommits(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);

        GitHubRepository repo = gitHubRepositoryRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No connected repository found"));

        return syncCommitsInternal(repo, project);
    }

    private int syncCommitsInternal(GitHubRepository repo, Project project) {
        List<GitHubApiClient.CommitInfo> commits = gitHubApiClient.fetchRecentCommits(repo.getRepoOwner(), repo.getRepoName());
        int linkedCount = 0;

        for (GitHubApiClient.CommitInfo commit : commits) {
            Set<String> keys = issueKeyExtractor.extractIssueKeys(commit.message());
            for (String key : keys) {
                Optional<Issue> issueOpt = issueRepository.findByProjectIdAndIssueKey(project.getId(), key);
                if (issueOpt.isPresent()) {
                    Issue issue = issueOpt.get();
                    if (!gitHubActivityRepository.existsByIssueIdAndActivityTypeAndExternalId(
                            issue.getId(), GitHubActivityType.COMMIT, commit.sha())) {

                        Instant timestamp = Instant.now();
                        try {
                            if (commit.timestamp() != null) {
                                timestamp = Instant.parse(commit.timestamp());
                            }
                        } catch (Exception ignored) {}

                        GitHubActivity activity = new GitHubActivity(
                                issue,
                                GitHubActivityType.COMMIT,
                                commit.sha(),
                                commit.message(),
                                commit.url(),
                                commit.authorName(),
                                commit.authorAvatarUrl(),
                                timestamp
                        );
                        gitHubActivityRepository.save(activity);
                        linkedCount++;
                    }

                    if (issueKeyExtractor.extractClosingKeys(commit.message()).contains(key)) {
                        issue.setStatus(IssueStatus.DONE);
                        issueRepository.save(issue);
                    }
                }
            }
        }
        return linkedCount;
    }

    @Transactional
    public void processWebhook(String payload, String signature, String eventType) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String repoFullName = root.path("repository").path("full_name").asText("");
            if (repoFullName.isBlank() || !repoFullName.contains("/")) {
                return;
            }

            String[] parts = repoFullName.split("/", 2);
            String owner = parts[0];
            String name = parts[1];

            Optional<GitHubRepository> repoOpt = gitHubRepositoryRepository.findByOwnerAndName(owner, name);
            if (repoOpt.isEmpty()) {
                log.info("Received webhook for untracked repository: {}", repoFullName);
                return;
            }

            GitHubRepository repo = repoOpt.get();

            // Verify signature if secret is configured
            if (repo.getWebhookSecret() != null && !repo.getWebhookSecret().isBlank()) {
                if (!verifySignature(payload, signature, repo.getWebhookSecret())) {
                    log.warn("Invalid HMAC signature for webhook on repository: {}", repoFullName);
                    return;
                }
            }

            if ("push".equalsIgnoreCase(eventType)) {
                handlePushWebhook(root, repo);
            } else if ("pull_request".equalsIgnoreCase(eventType)) {
                handlePullRequestWebhook(root, repo);
            }
        } catch (Exception ex) {
            log.error("Error processing GitHub webhook: {}", ex.getMessage(), ex);
        }
    }

    private void handlePushWebhook(JsonNode root, GitHubRepository repo) {
        JsonNode commitsNode = root.path("commits");
        if (commitsNode.isArray()) {
            for (JsonNode commitNode : commitsNode) {
                String sha = commitNode.path("id").asText();
                String message = commitNode.path("message").asText();
                String url = commitNode.path("url").asText();
                String authorName = commitNode.path("author").path("name").asText("Unknown");

                Set<String> keys = issueKeyExtractor.extractIssueKeys(message);
                Set<String> closingKeys = issueKeyExtractor.extractClosingKeys(message);

                for (String key : keys) {
                    Optional<Issue> issueOpt = issueRepository.findByProjectIdAndIssueKey(repo.getProject().getId(), key);
                    if (issueOpt.isPresent()) {
                        Issue issue = issueOpt.get();
                        if (!gitHubActivityRepository.existsByIssueIdAndActivityTypeAndExternalId(
                                issue.getId(), GitHubActivityType.COMMIT, sha)) {
                            GitHubActivity activity = new GitHubActivity(
                                    issue,
                                    GitHubActivityType.COMMIT,
                                    sha,
                                    message,
                                    url,
                                    authorName,
                                    null,
                                    Instant.now()
                            );
                            gitHubActivityRepository.save(activity);
                            log.info("Linked commit [{}] to issue [{}] via webhook", sha, key);
                        }

                        if (closingKeys.contains(key)) {
                            issue.setStatus(IssueStatus.DONE);
                            issueRepository.save(issue);
                            log.info("Automatically transitioned issue [{}] to DONE via closing commit [{}]", key, sha);
                        }
                    }
                }
            }
        }
    }

    private void handlePullRequestWebhook(JsonNode root, GitHubRepository repo) {
        JsonNode prNode = root.path("pull_request");
        if (prNode.isMissingNode()) return;

        String prNumber = String.valueOf(prNode.path("number").asInt());
        String title = prNode.path("title").asText();
        String body = prNode.path("body").asText("");
        String url = prNode.path("html_url").asText();
        String authorName = prNode.path("user").path("login").asText("Unknown");
        String avatarUrl = prNode.path("user").path("avatar_url").asText(null);

        Set<String> keys = new HashSet<>();
        keys.addAll(issueKeyExtractor.extractIssueKeys(title));
        keys.addAll(issueKeyExtractor.extractIssueKeys(body));

        boolean isMerged = prNode.path("merged").asBoolean(false) ||
                ("closed".equalsIgnoreCase(root.path("action").asText("")) && prNode.path("merged").asBoolean(false));

        for (String key : keys) {
            Optional<Issue> issueOpt = issueRepository.findByProjectIdAndIssueKey(repo.getProject().getId(), key);
            if (issueOpt.isPresent()) {
                Issue issue = issueOpt.get();
                if (!gitHubActivityRepository.existsByIssueIdAndActivityTypeAndExternalId(
                        issue.getId(), GitHubActivityType.PULL_REQUEST, prNumber)) {
                    GitHubActivity activity = new GitHubActivity(
                            issue,
                            GitHubActivityType.PULL_REQUEST,
                            prNumber,
                            title,
                            url,
                            authorName,
                            avatarUrl,
                            Instant.now()
                    );
                    gitHubActivityRepository.save(activity);
                    log.info("Linked PR #{} to issue [{}] via webhook", prNumber, key);
                }

                if (isMerged) {
                    issue.setStatus(IssueStatus.DONE);
                    issueRepository.save(issue);
                    log.info("Automatically transitioned issue [{}] to DONE via merged PR #{}", key, prNumber);
                }
            }
        }
    }

    private boolean verifySignature(String payload, String signatureHeader, String secret) {
        if (signatureHeader == null || !signatureHeader.startsWith("sha256=")) {
            return false;
        }
        String expectedHash = signatureHeader.substring(7);
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            return MessageDigest.isEqual(sb.toString().getBytes(StandardCharsets.UTF_8),
                    expectedHash.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            log.error("HMAC SHA256 calculation failed: {}", ex.getMessage());
            return false;
        }
    }
}
