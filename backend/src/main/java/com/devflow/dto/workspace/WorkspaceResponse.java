package com.devflow.dto.workspace;

import com.devflow.dto.auth.UserResponse;
import com.devflow.entity.Workspace;
import com.devflow.entity.WorkspaceRole;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class WorkspaceResponse implements Serializable {

    private UUID id;
    private String name;
    private String slug;
    private String description;
    private UserResponse owner;
    private WorkspaceRole currentUserRole;
    private long memberCount;
    private long projectCount;
    private Instant createdAt;
    private Instant updatedAt;

    public WorkspaceResponse() {
    }

    public WorkspaceResponse(UUID id, String name, String slug, String description,
                             UserResponse owner, WorkspaceRole currentUserRole,
                             long memberCount, long projectCount,
                             Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.owner = owner;
        this.currentUserRole = currentUserRole;
        this.memberCount = memberCount;
        this.projectCount = projectCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static WorkspaceResponse fromEntity(Workspace workspace, WorkspaceRole currentUserRole,
                                              long memberCount, long projectCount) {
        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getSlug(),
                workspace.getDescription(),
                UserResponse.fromEntity(workspace.getOwner()),
                currentUserRole,
                memberCount,
                projectCount,
                workspace.getCreatedAt(),
                workspace.getUpdatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserResponse getOwner() {
        return owner;
    }

    public void setOwner(UserResponse owner) {
        this.owner = owner;
    }

    public WorkspaceRole getCurrentUserRole() {
        return currentUserRole;
    }

    public void setCurrentUserRole(WorkspaceRole currentUserRole) {
        this.currentUserRole = currentUserRole;
    }

    public long getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(long memberCount) {
        this.memberCount = memberCount;
    }

    public long getProjectCount() {
        return projectCount;
    }

    public void setProjectCount(long projectCount) {
        this.projectCount = projectCount;
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
