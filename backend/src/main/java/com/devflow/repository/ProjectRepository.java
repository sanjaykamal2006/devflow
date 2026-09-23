package com.devflow.repository;

import com.devflow.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);

    List<Project> findByWorkspaceId(UUID workspaceId);

    long countByWorkspaceId(UUID workspaceId);

    Optional<Project> findByWorkspaceIdAndKey(UUID workspaceId, String key);

    boolean existsByWorkspaceIdAndKey(UUID workspaceId, String key);

    @Query("SELECT p FROM Project p JOIN FETCH p.workspace WHERE p.id = :id")
    Optional<Project> findByIdWithWorkspace(@Param("id") UUID id);
}
