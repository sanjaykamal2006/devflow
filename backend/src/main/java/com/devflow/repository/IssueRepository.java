package com.devflow.repository;

import com.devflow.entity.Issue;
import com.devflow.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID>, JpaSpecificationExecutor<Issue> {

    Optional<Issue> findByProjectIdAndIssueKey(UUID projectId, String issueKey);

    Optional<Issue> findByIssueKey(String issueKey);

    List<Issue> findByProjectId(UUID projectId);

    void deleteByProjectId(UUID projectId);

    long countByProjectId(UUID projectId);

    long countByProjectIdAndStatus(UUID projectId, IssueStatus status);

    @Query("SELECT i FROM Issue i " +
            "JOIN FETCH i.project p " +
            "JOIN FETCH p.workspace " +
            "JOIN FETCH i.reporter " +
            "LEFT JOIN FETCH i.assignee " +
            "LEFT JOIN FETCH i.labels " +
            "WHERE i.id = :id")
    Optional<Issue> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT i FROM Issue i " +
            "JOIN FETCH i.project p " +
            "JOIN FETCH p.workspace " +
            "JOIN FETCH i.reporter " +
            "LEFT JOIN FETCH i.assignee " +
            "LEFT JOIN FETCH i.labels " +
            "WHERE i.issueKey = :issueKey")
    Optional<Issue> findByIssueKeyWithDetails(@Param("issueKey") String issueKey);
}
