package com.devflow.dto.issue;

import com.devflow.entity.IssuePriority;
import com.devflow.entity.IssueStatus;
import com.devflow.entity.IssueType;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class UpdateIssueRequest {

    @Size(min = 2, max = 255, message = "Title must be between 2 and 255 characters")
    private String title;

    @Size(max = 10000, message = "Description must not exceed 10000 characters")
    private String description;

    private IssueStatus status;

    private IssuePriority priority;

    private IssueType issueType;

    private UUID assigneeId;

    private boolean unassign;

    private Set<UUID> labelIds;

    private Instant dueDate;

    public UpdateIssueRequest() {
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

    public UUID getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(UUID assigneeId) {
        this.assigneeId = assigneeId;
    }

    public boolean isUnassign() {
        return unassign;
    }

    public void setUnassign(boolean unassign) {
        this.unassign = unassign;
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
