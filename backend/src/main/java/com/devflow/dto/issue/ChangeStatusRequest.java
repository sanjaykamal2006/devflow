package com.devflow.dto.issue;

import com.devflow.entity.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class ChangeStatusRequest {

    @NotNull(message = "Status is required")
    private IssueStatus status;

    public ChangeStatusRequest() {
    }

    public ChangeStatusRequest(IssueStatus status) {
        this.status = status;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }
}
