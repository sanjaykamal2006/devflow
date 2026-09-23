package com.devflow.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 100, message = "Project name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Project key is required")
    @Pattern(regexp = "^[A-Z0-9]{2,10}$", message = "Project key must be 2 to 10 uppercase letters or digits (e.g., 'WEB', 'API')")
    private String key;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    public CreateProjectRequest() {
    }

    public CreateProjectRequest(String name, String key, String description) {
        this.name = name;
        this.key = key;
        this.description = description;
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
}
