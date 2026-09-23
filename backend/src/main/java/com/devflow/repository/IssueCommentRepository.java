package com.devflow.repository;

import com.devflow.entity.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IssueCommentRepository extends JpaRepository<IssueComment, UUID> {

    @Query("SELECT c FROM IssueComment c " +
            "JOIN FETCH c.author " +
            "WHERE c.issue.id = :issueId " +
            "ORDER BY c.createdAt ASC")
    List<IssueComment> findByIssueIdOrderByCreatedAtAsc(@Param("issueId") UUID issueId);

    @Query("SELECT c FROM IssueComment c " +
            "JOIN FETCH c.author " +
            "JOIN FETCH c.issue i " +
            "JOIN FETCH i.project p " +
            "JOIN FETCH p.workspace " +
            "WHERE c.id = :id")
    Optional<IssueComment> findByIdWithDetails(@Param("id") UUID id);

    void deleteByIssueId(UUID issueId);

    void deleteByIssueIdIn(List<UUID> issueIds);
}
