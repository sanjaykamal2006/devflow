package com.devflow.dto.github;

import com.devflow.entity.GitHubActivity;
import com.devflow.entity.GitHubActivityType;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class GitHubActivityResponse implements Serializable {

    private UUID id;
    private UUID issueId;
    private String issueKey;
    private GitHubActivityType activityType;
    private String externalId;
    private String title;
    private String url;
    private String authorName;
    private String authorAvatarUrl;
    private Instant eventTimestamp;

    public GitHubActivityResponse() {
    }

    public GitHubActivityResponse(UUID id, UUID issueId, String issueKey,
                                  GitHubActivityType activityType, String externalId,
                                  String title, String url, String authorName,
                                  String authorAvatarUrl, Instant eventTimestamp) {
        this.id = id;
        this.issueId = issueId;
        this.issueKey = issueKey;
        this.activityType = activityType;
        this.externalId = externalId;
        this.title = title;
        this.url = url;
        this.authorName = authorName;
        this.authorAvatarUrl = authorAvatarUrl;
        this.eventTimestamp = eventTimestamp;
    }

    public static GitHubActivityResponse fromEntity(GitHubActivity activity) {
        return new GitHubActivityResponse(
                activity.getId(),
                activity.getIssue().getId(),
                activity.getIssue().getIssueKey(),
                activity.getActivityType(),
                activity.getExternalId(),
                activity.getTitle(),
                activity.getUrl(),
                activity.getAuthorName(),
                activity.getAuthorAvatarUrl(),
                activity.getEventTimestamp()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getIssueId() {
        return issueId;
    }

    public void setIssueId(UUID issueId) {
        this.issueId = issueId;
    }

    public String getIssueKey() {
        return issueKey;
    }

    public void setIssueKey(String issueKey) {
        this.issueKey = issueKey;
    }

    public GitHubActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(GitHubActivityType activityType) {
        this.activityType = activityType;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorAvatarUrl() {
        return authorAvatarUrl;
    }

    public void setAuthorAvatarUrl(String authorAvatarUrl) {
        this.authorAvatarUrl = authorAvatarUrl;
    }

    public Instant getEventTimestamp() {
        return eventTimestamp;
    }

    public void setEventTimestamp(Instant eventTimestamp) {
        this.eventTimestamp = eventTimestamp;
    }
}
