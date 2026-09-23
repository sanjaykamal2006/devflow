package com.devflow.dto.issue;

import com.devflow.entity.IssuePriority;
import com.devflow.entity.IssueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class CreateIssueRequest {

    @NotBlank(message = "Issue title is required")
    @Size(min = 2, max = 255, message = "Title must be between 2 and 255 characters")
    private String title;

    @Size(max = 10000, message = "Description must not exceed 10000 characters")
    private String description;

    private IssueType issueType = IssueType.TASK;

    private IssuePriority priority = IssuePriority.MEDIUM;

    private UUID assigneeId;

    private Set<UUID> labelIds;

    private Instant dueDate;

    public CreateIssueRequest() {
    }

    public CreateIssueRequest(String title, String description, IssueType issueType,
                              IssuePriority priority, UUID assigneeId, Set<UUID> labelIds, Instant dueDate) {
        this.title = title;
        this.description = description;
        this.issueType = issueType;
        this.priority = priority;
        this.assigneeId = assigneeId;
        this.labelIds = labelIds;
        this.dueDate = dueDate;
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

    public IssueType getIssueType() {
        return issueType;
    }

    public void setIssueType(IssueType issueType) {
        this.issueType = issueType;
    }

    public IssuePriority getPriority() {
        return priority;
    }

    public void setPriority(IssuePriority priority) {
        this.priority = priority;
    }

    public UUID getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(UUID assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Set<UUID> getLabelIds() {
        return labelIds;
    }

    public void setLabelIds(Set<UUID> labelIds) {
        this.labelIds = labelIds;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }
}
