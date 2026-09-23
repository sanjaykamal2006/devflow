package com.devflow.entity;

import com.devflow.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "workspaces", indexes = {
        @Index(name = "idx_workspaces_slug", columnList = "slug"),
        @Index(name = "idx_workspaces_owner", columnList = "owner_id")
})
public class Workspace extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    public Workspace() {
    }

    public Workspace(String name, String slug, String description, User owner) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.owner = owner;
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

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }
}
