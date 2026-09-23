package com.devflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

@Component
public class GitHubApiClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubApiClient.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String githubToken;
    private final ObjectMapper objectMapper;

    public GitHubApiClient(
            RestTemplateBuilder builder,
            @Value("${devflow.github.api-url:https://api.github.com}") String apiUrl,
            @Value("${devflow.github.token:}") String githubToken,
            ObjectMapper objectMapper) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
        this.apiUrl = apiUrl;
        this.githubToken = githubToken;
        this.objectMapper = objectMapper;
    }

    public record RepoMeta(
            String owner,
            String name,
            String htmlUrl,
            String defaultBranch,
            int stargazersCount,
            int forksCount,
            int openIssuesCount
    ) {}

    public record CommitInfo(
            String sha,
            String message,
            String url,
            String authorName,
            String authorAvatarUrl,
            String timestamp
    ) {}

    public Optional<RepoMeta> fetchRepository(String owner, String name) {
        String url = String.format("%s/repos/%s/%s", apiUrl, owner, name);
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return Optional.of(new RepoMeta(
                        root.path("owner").path("login").asText(owner),
                        root.path("name").asText(name),
                        root.path("html_url").asText(String.format("https://github.com/%s/%s", owner, name)),
                        root.path("default_branch").asText("main"),
                        root.path("stargazers_count").asInt(0),
                        root.path("forks_count").asInt(0),
                        root.path("open_issues_count").asInt(0)
                ));
            }
        } catch (HttpStatusCodeException ex) {
            log.warn("GitHub API error fetching repo {}/{}: HTTP {} - {}", owner, name, ex.getStatusCode(), ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.warn("Failed to fetch repository metadata for {}/{}: {}", owner, name, ex.getMessage());
        }
        return Optional.empty();
    }

    public List<CommitInfo> fetchRecentCommits(String owner, String name) {
        String url = String.format("%s/repos/%s/%s/commits?per_page=30", apiUrl, owner, name);
        List<CommitInfo> commits = new ArrayList<>();
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode array = objectMapper.readTree(response.getBody());
                if (array.isArray()) {
                    for (JsonNode node : array) {
                        String sha = node.path("sha").asText("");
                        JsonNode commitNode = node.path("commit");
                        String message = commitNode.path("message").asText("");
                        String commitUrl = node.path("html_url").asText("");
                        String authorName = commitNode.path("author").path("name").asText("Unknown");
                        String avatarUrl = node.path("author").path("avatar_url").asText(null);
                        String timestamp = commitNode.path("author").path("date").asText(null);

                        commits.add(new CommitInfo(sha, message, commitUrl, authorName, avatarUrl, timestamp));
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch commits for {}/{}: {}", owner, name, ex.getMessage());
        }
        return commits;
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT, "application/vnd.github.v3+json");
        headers.set(HttpHeaders.USER_AGENT, "DevFlow-Workspace");
        if (githubToken != null && !githubToken.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken.trim());
        }
        return headers;
    }
}
