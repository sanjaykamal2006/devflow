package com.devflow.entity;

import com.devflow.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "projects",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_workspace_project_key", columnNames = {"workspace_id", "project_key"})
        },
        indexes = {
                @Index(name = "idx_projects_workspace", columnList = "workspace_id"),
                @Index(name = "idx_projects_key", columnList = "workspace_id, project_key")
        }
)
public class Project extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "project_key", nullable = false, length = 20)
    private String key;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public Project() {
    }

    public Project(Workspace workspace, String name, String key, String description, User createdBy) {
        this.workspace = workspace;
        this.name = name;
        this.key = key.toUpperCase().trim();
        this.description = description;
        this.createdBy = createdBy;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
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
        this.key = key != null ? key.toUpperCase().trim() : null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}
