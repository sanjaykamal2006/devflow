package com.devflow.dto.github;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ConnectGitHubRepoRequest {

    @NotBlank(message = "Repository owner is required (e.g., 'facebook')")
    @Size(max = 100, message = "Owner must not exceed 100 characters")
    private String owner;

    @NotBlank(message = "Repository name is required (e.g., 'react')")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Webhook secret must not exceed 255 characters")
    private String webhookSecret;

    public ConnectGitHubRepoRequest() {
    }

    public ConnectGitHubRepoRequest(String owner, String name, String webhookSecret) {
        this.owner = owner;
        this.name = name;
        this.webhookSecret = webhookSecret;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }
}
