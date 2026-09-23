package com.devflow.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_issue_sequences")
public class ProjectIssueSequence implements Serializable {

    @Id
    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "last_sequence_number", nullable = false)
    private Long lastSequenceNumber = 0L;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public ProjectIssueSequence() {
    }

    public ProjectIssueSequence(UUID projectId) {
        this.projectId = projectId;
        this.lastSequenceNumber = 0L;
        this.updatedAt = Instant.now();
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public Long getLastSequenceNumber() {
        return lastSequenceNumber;
    }

    public void setLastSequenceNumber(Long lastSequenceNumber) {
        this.lastSequenceNumber = lastSequenceNumber;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long incrementAndGet() {
        this.lastSequenceNumber = (this.lastSequenceNumber == null ? 0L : this.lastSequenceNumber) + 1L;
        this.updatedAt = Instant.now();
        return this.lastSequenceNumber;
    }
}
