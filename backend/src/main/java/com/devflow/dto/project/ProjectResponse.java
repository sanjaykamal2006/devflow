package com.devflow.dto.project;

import com.devflow.dto.auth.UserResponse;
import com.devflow.entity.Project;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class ProjectResponse implements Serializable {

    private UUID id;
    private UUID workspaceId;
    private String workspaceName;
    private String name;
    private String key;
    private String description;
    private UserResponse createdBy;
    private long totalIssues;
    private long openIssues;
    private long doneIssues;
    private boolean githubConnected;
    private Instant createdAt;
    private Instant updatedAt;

    public ProjectResponse() {
    }

    public ProjectResponse(UUID id, UUID workspaceId, String workspaceName, String name, String key,
                           String description, UserResponse createdBy, long totalIssues,
                           long openIssues, long doneIssues, boolean githubConnected,
                           Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.workspaceName = workspaceName;
        this.name = name;
        this.key = key;
        this.description = description;
        this.createdBy = createdBy;
        this.totalIssues = totalIssues;
        this.openIssues = openIssues;
        this.doneIssues = doneIssues;
        this.githubConnected = githubConnected;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ProjectResponse fromEntity(Project project, long totalIssues, long openIssues,
                                           long doneIssues, boolean githubConnected) {
        return new ProjectResponse(
                project.getId(),
                project.getWorkspace().getId(),
                project.getWorkspace().getName(),
                project.getName(),
                project.getKey(),
                project.getDescription(),
                UserResponse.fromEntity(project.getCreatedBy()),
                totalIssues,
                openIssues,
                doneIssues,
                githubConnected,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(UUID workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getWorkspaceName() {
        return workspaceName;
    }

    public void setWorkspaceName(String workspaceName) {
        this.workspaceName = workspaceName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserResponse getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserResponse createdBy) {
        this.createdBy = createdBy;
    }

    public long getTotalIssues() {
        return totalIssues;
    }

    public void setTotalIssues(long totalIssues) {
        this.totalIssues = totalIssues;
    }

    public long getOpenIssues() {
        return openIssues;
    }

    public void setOpenIssues(long openIssues) {
        this.openIssues = openIssues;
    }

    public long getDoneIssues() {
        return doneIssues;
    }

    public void setDoneIssues(long doneIssues) {
        this.doneIssues = doneIssues;
    }

    public boolean isGithubConnected() {
        return githubConnected;
    }

    public void setGithubConnected(boolean githubConnected) {
        this.githubConnected = githubConnected;
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
