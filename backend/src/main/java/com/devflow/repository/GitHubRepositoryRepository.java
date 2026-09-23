package com.devflow.repository;

import com.devflow.entity.GitHubRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GitHubRepositoryRepository extends JpaRepository<GitHubRepository, UUID> {

    Optional<GitHubRepository> findByProjectId(UUID projectId);

    @Query("SELECT gr FROM GitHubRepository gr " +
            "WHERE LOWER(gr.repoOwner) = LOWER(:owner) AND LOWER(gr.repoName) = LOWER(:name)")
    Optional<GitHubRepository> findByOwnerAndName(@Param("owner") String owner, @Param("name") String name);

    boolean existsByProjectId(UUID projectId);

    void deleteByProjectId(UUID projectId);
}
