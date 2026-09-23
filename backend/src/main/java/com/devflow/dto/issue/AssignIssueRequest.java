package com.devflow.dto.issue;

import java.util.UUID;

public class AssignIssueRequest {

    private UUID assigneeId;

    public AssignIssueRequest() {
    }

    public AssignIssueRequest(UUID assigneeId) {
        this.assigneeId = assigneeId;
    }

    public UUID getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(UUID assigneeId) {
        this.assigneeId = assigneeId;
    }
}
