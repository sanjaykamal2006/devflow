package com.devflow.dto.workspace;

import com.devflow.dto.auth.UserResponse;
import com.devflow.entity.WorkspaceMember;
import com.devflow.entity.WorkspaceRole;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class WorkspaceMemberResponse implements Serializable {

    private UUID id;
    private UserResponse user;
    private WorkspaceRole role;
    private Instant joinedAt;

    public WorkspaceMemberResponse() {
    }

    public WorkspaceMemberResponse(UUID id, UserResponse user, WorkspaceRole role, Instant joinedAt) {
        this.id = id;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public static WorkspaceMemberResponse fromEntity(WorkspaceMember member) {
        return new WorkspaceMemberResponse(
                member.getId(),
                UserResponse.fromEntity(member.getUser()),
                member.getRole(),
                member.getJoinedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}
