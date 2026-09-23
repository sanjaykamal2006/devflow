package com.devflow.dto.label;

import com.devflow.entity.Label;

import java.io.Serializable;
import java.util.UUID;

public class LabelResponse implements Serializable {

    private UUID id;
    private UUID projectId;
    private String name;
    private String color;
    private String description;

    public LabelResponse() {
    }

    public LabelResponse(UUID id, UUID projectId, String name, String color, String description) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.color = color;
        this.description = description;
    }

    public static LabelResponse fromEntity(Label label) {
        if (label == null) return null;
        return new LabelResponse(
                label.getId(),
                label.getProject().getId(),
                label.getName(),
                label.getColor(),
                label.getDescription()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
