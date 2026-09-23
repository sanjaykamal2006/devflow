package com.devflow.repository;

import com.devflow.entity.GitHubActivity;
import com.devflow.entity.GitHubActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GitHubActivityRepository extends JpaRepository<GitHubActivity, UUID> {

    List<GitHubActivity> findByIssueIdOrderByEventTimestampDesc(UUID issueId);

    Optional<GitHubActivity> findByIssueIdAndActivityTypeAndExternalId(
            UUID issueId, GitHubActivityType activityType, String externalId);

    boolean existsByIssueIdAndActivityTypeAndExternalId(
            UUID issueId, GitHubActivityType activityType, String externalId);

    void deleteByIssueId(UUID issueId);

    void deleteByIssueIdIn(List<UUID> issueIds);
}
