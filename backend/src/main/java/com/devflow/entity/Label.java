package com.devflow.entity;

import com.devflow.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "labels",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_project_label_name", columnNames = {"project_id", "name"})
        },
        indexes = {
                @Index(name = "idx_labels_project", columnList = "project_id")
        }
)
public class Label extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "color", nullable = false, length = 20)
    private String color = "#64748b";

    @Column(name = "description", length = 200)
    private String description;

    public Label() {
    }

    public Label(Project project, String name, String color, String description) {
        this.project = project;
        this.name = name;
        this.color = (color != null && !color.isBlank()) ? color : "#64748b";
        this.description = description;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
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
