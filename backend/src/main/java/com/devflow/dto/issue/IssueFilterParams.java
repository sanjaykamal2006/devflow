package com.devflow.dto.issue;

import com.devflow.entity.IssuePriority;
import com.devflow.entity.IssueStatus;
import com.devflow.entity.IssueType;

import java.util.UUID;

public class IssueFilterParams {

    private IssueStatus status;
    private IssuePriority priority;
    private IssueType issueType;
    private UUID assigneeId;
    private UUID labelId;
    private String search;

    public IssueFilterParams() {
    }

    public IssueFilterParams(IssueStatus status, IssuePriority priority, IssueType issueType,
                             UUID assigneeId, UUID labelId, String search) {
        this.status = status;
        this.priority = priority;
        this.issueType = issueType;
        this.assigneeId = assigneeId;
        this.labelId = labelId;
        this.search = search;
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

    public UUID getLabelId() {
        return labelId;
    }

    public void setLabelId(UUID labelId) {
        this.labelId = labelId;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }
}
