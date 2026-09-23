package com.devflow.dto.github;

import com.devflow.entity.GitHubRepository;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class GitHubRepositoryResponse implements Serializable {

    private UUID id;
    private UUID projectId;
    private String repoOwner;
    private String repoName;
    private String repoUrl;
    private String defaultBranch;
    private boolean webhookConfigured;
    private Instant connectedAt;

    // Optional live stats fetched from GitHub API
    private Integer starsCount;
    private Integer forksCount;
    private Integer openIssuesCount;

    public GitHubRepositoryResponse() {
    }

    public GitHubRepositoryResponse(UUID id, UUID projectId, String repoOwner, String repoName,
                                    String repoUrl, String defaultBranch, boolean webhookConfigured,
                                    Instant connectedAt, Integer starsCount, Integer forksCount,
                                    Integer openIssuesCount) {
        this.id = id;
        this.projectId = projectId;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.repoUrl = repoUrl;
        this.defaultBranch = defaultBranch;
        this.webhookConfigured = webhookConfigured;
        this.connectedAt = connectedAt;
        this.starsCount = starsCount;
        this.forksCount = forksCount;
        this.openIssuesCount = openIssuesCount;
    }

    public static GitHubRepositoryResponse fromEntity(GitHubRepository repo, Integer stars, Integer forks, Integer openIssues) {
        if (repo == null) return null;
        return new GitHubRepositoryResponse(
                repo.getId(),
                repo.getProject().getId(),
                repo.getRepoOwner(),
                repo.getRepoName(),
                repo.getRepoUrl(),
                repo.getDefaultBranch(),
                repo.getWebhookSecret() != null && !repo.getWebhookSecret().isBlank(),
                repo.getConnectedAt(),
                stars,
                forks,
                openIssues
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getRepoOwner() {
        return repoOwner;
    }

    public void setRepoOwner(String repoOwner) {
        this.repoOwner = repoOwner;
    }

    public String getRepoName() {
        return repoName;
    }

    public void setRepoName(String repoName) {
        this.repoName = repoName;
    }

    public String getRepoUrl() {
        return repoUrl;
    }

    public void setRepoUrl(String repoUrl) {
        this.repoUrl = repoUrl;
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    public boolean isWebhookConfigured() {
        return webhookConfigured;
    }

    public void setWebhookConfigured(boolean webhookConfigured) {
        this.webhookConfigured = webhookConfigured;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(Instant connectedAt) {
        this.connectedAt = connectedAt;
    }

    public Integer getStarsCount() {
        return starsCount;
    }

    public void setStarsCount(Integer starsCount) {
        this.starsCount = starsCount;
    }

    public Integer getForksCount() {
        return forksCount;
    }

    public void setForksCount(Integer forksCount) {
        this.forksCount = forksCount;
    }

    public Integer getOpenIssuesCount() {
        return openIssuesCount;
    }

    public void setOpenIssuesCount(Integer openIssuesCount) {
        this.openIssuesCount = openIssuesCount;
    }
}
