package com.devflow.dto.workspace;

import com.devflow.entity.WorkspaceRole;
import jakarta.validation.constraints.NotNull;

public class UpdateMemberRoleRequest {

    @NotNull(message = "Role is required")
    private WorkspaceRole role;

    public UpdateMemberRoleRequest() {
    }

    public UpdateMemberRoleRequest(WorkspaceRole role) {
        this.role = role;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }
}
