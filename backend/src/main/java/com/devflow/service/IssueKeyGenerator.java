package com.devflow.service;

import com.devflow.entity.Project;
import com.devflow.entity.ProjectIssueSequence;
import com.devflow.repository.ProjectIssueSequenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IssueKeyGenerator {

    private static final Logger log = LoggerFactory.getLogger(IssueKeyGenerator.class);
    private final ProjectIssueSequenceRepository sequenceRepository;

    public IssueKeyGenerator(ProjectIssueSequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    public record KeyResult(String issueKey, Long sequenceNumber) {}

    /**
     * Atomically generates a unique, strictly incremental issue key for a project.
     * Uses pessimistic write locking on the project sequence row to serialize concurrent requests.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public KeyResult generateNextKey(Project project) {
        ProjectIssueSequence sequence = sequenceRepository.findByProjectIdForUpdate(project.getId())
                .orElseGet(() -> {
                    log.info("Initializing issue sequence for project [{}] ({})", project.getKey(), project.getId());
                    ProjectIssueSequence initial = new ProjectIssueSequence(project.getId());
                    return sequenceRepository.saveAndFlush(initial);
                });

        Long nextNumber = sequence.incrementAndGet();
        sequenceRepository.save(sequence);

        String issueKey = project.getKey() + "-" + nextNumber;
        log.debug("Generated issue key [{}] for project [{}]", issueKey, project.getKey());

        return new KeyResult(issueKey, nextNumber);
    }
}
