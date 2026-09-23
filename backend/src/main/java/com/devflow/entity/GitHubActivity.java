package com.devflow.entity;

import com.devflow.common.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "github_activities",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_issue_activity", columnNames = {"issue_id", "activity_type", "external_id"})
        },
        indexes = {
                @Index(name = "idx_github_activity_issue", columnList = "issue_id, event_timestamp DESC")
        }
)
public class GitHubActivity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 30)
    private GitHubActivityType activityType;

    @Column(name = "external_id", nullable = false, length = 100)
    private String externalId;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "author_name", length = 150)
    private String authorName;

    @Column(name = "author_avatar_url", length = 500)
    private String authorAvatarUrl;

    @Column(name = "event_timestamp", nullable = false)
    private Instant eventTimestamp = Instant.now();

    public GitHubActivity() {
    }

    public GitHubActivity(Issue issue, GitHubActivityType activityType, String externalId,
                          String title, String url, String authorName, String authorAvatarUrl,
                          Instant eventTimestamp) {
        this.issue = issue;
        this.activityType = activityType;
        this.externalId = externalId;
        this.title = title;
        this.url = url;
        this.authorName = authorName;
        this.authorAvatarUrl = authorAvatarUrl;
        this.eventTimestamp = eventTimestamp != null ? eventTimestamp : Instant.now();
    }

    public Issue getIssue() {
        return issue;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
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
