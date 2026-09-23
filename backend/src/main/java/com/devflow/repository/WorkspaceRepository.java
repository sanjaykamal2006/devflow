package com.devflow.repository;

import com.devflow.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    Optional<Workspace> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT wm.workspace FROM WorkspaceMember wm WHERE wm.user.id = :userId ORDER BY wm.workspace.name ASC")
    List<Workspace> findAllByMemberUserId(@Param("userId") UUID userId);
}
