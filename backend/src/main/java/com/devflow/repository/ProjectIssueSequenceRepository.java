package com.devflow.repository;

import com.devflow.entity.ProjectIssueSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectIssueSequenceRepository extends JpaRepository<ProjectIssueSequence, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ProjectIssueSequence s WHERE s.projectId = :projectId")
    Optional<ProjectIssueSequence> findByProjectIdForUpdate(@Param("projectId") UUID projectId);
}
