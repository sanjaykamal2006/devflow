package com.devflow.dto.issue;

import com.devflow.dto.auth.UserResponse;
import com.devflow.dto.label.LabelResponse;
import com.devflow.entity.Issue;
import com.devflow.entity.IssuePriority;
import com.devflow.entity.IssueStatus;
import com.devflow.entity.IssueType;

import java.io.Serializable;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class IssueResponse implements Serializable {

    private UUID id;
    private UUID projectId;
    private String projectKey;
    private String projectName;
    private String issueKey;
    private Long sequenceNumber;
    private String title;
    private String description;
    private IssueStatus status;
    private IssuePriority priority;
    private IssueType issueType;
    private UserResponse reporter;
    private UserResponse assignee;
    private List<LabelResponse> labels;
    private Instant dueDate;
    private long commentCount;
    private long githubActivityCount;
    private Instant createdAt;
    private Instant updatedAt;

    public IssueResponse() {
    }

    public IssueResponse(UUID id, UUID projectId, String projectKey, String projectName,
                         String issueKey, Long sequenceNumber, String title, String description,
                         IssueStatus status, IssuePriority priority, IssueType issueType,
                         UserResponse reporter, UserResponse assignee, List<LabelResponse> labels,
                         Instant dueDate, long commentCount, long githubActivityCount,
                         Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.projectKey = projectKey;
        this.projectName = projectName;
        this.issueKey = issueKey;
        this.sequenceNumber = sequenceNumber;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.issueType = issueType;
        this.reporter = reporter;
        this.assignee = assignee;
        this.labels = labels;
        this.dueDate = dueDate;
        this.commentCount = commentCount;
        this.githubActivityCount = githubActivityCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static IssueResponse fromEntity(Issue issue, long commentCount, long githubActivityCount) {
        List<LabelResponse> labelResponses = issue.getLabels() != null
                ? issue.getLabels().stream().map(LabelResponse::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return new IssueResponse(
                issue.getId(),
                issue.getProject().getId(),
                issue.getProject().getKey(),
                issue.getProject().getName(),
                issue.getIssueKey(),
                issue.getSequenceNumber(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus(),
                issue.getPriority(),
                issue.getIssueType(),
                UserResponse.fromEntity(issue.getReporter()),
                UserResponse.fromEntity(issue.getAssignee()),
                labelResponses,
                issue.getDueDate(),
                commentCount,
                githubActivityCount,
                issue.getCreatedAt(),
                issue.getUpdatedAt()
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

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getIssueKey() {
        return issueKey;
    }

    public void setIssueKey(String issueKey) {
        this.issueKey = issueKey;
    }

    public Long getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Long sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public IssuePriority getPriority() {
        return priority;
    }

    public void setPriority(IssuePriority priority) {
        this.priority = priority;
    }

    public IssueType getIssueType() {
        return issueType;
    }

    public void setIssueType(IssueType issueType) {
        this.issueType = issueType;
    }

    public UserResponse getReporter() {
        return reporter;
    }

    public void setReporter(UserResponse reporter) {
        this.reporter = reporter;
    }

    public UserResponse getAssignee() {
        return assignee;
    }

    public void setAssignee(UserResponse assignee) {
        this.assignee = assignee;
    }

    public List<LabelResponse> getLabels() {
        return labels;
    }

    public void setLabels(List<LabelResponse> labels) {
        this.labels = labels;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public long getGithubActivityCount() {
        return githubActivityCount;
    }

    public void setGithubActivityCount(long githubActivityCount) {
        this.githubActivityCount = githubActivityCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
