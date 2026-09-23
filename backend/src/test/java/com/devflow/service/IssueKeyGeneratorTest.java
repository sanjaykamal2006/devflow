package com.devflow.service;

import com.devflow.entity.Project;
import com.devflow.entity.ProjectIssueSequence;
import com.devflow.entity.User;
import com.devflow.entity.Workspace;
import com.devflow.repository.ProjectIssueSequenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueKeyGeneratorTest {

    @Mock
    private ProjectIssueSequenceRepository sequenceRepository;

    private IssueKeyGenerator issueKeyGenerator;
    private Project project;

    @BeforeEach
    void setUp() {
        issueKeyGenerator = new IssueKeyGenerator(sequenceRepository);

        User owner = new User("owner@devflow.local", "hash", "Owner");
        owner.setId(UUID.randomUUID());
        Workspace workspace = new Workspace("Acme Corp", "acme", "Acme", owner);
        workspace.setId(UUID.randomUUID());

        project = new Project(workspace, "Web Platform", "WEB", "Frontend app", owner);
        project.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should initialize sequence and generate WEB-1 for brand new project")
    void testGenerateFirstKey() {
        when(sequenceRepository.findByProjectIdForUpdate(project.getId())).thenReturn(Optional.empty());

        ProjectIssueSequence newSequence = new ProjectIssueSequence(project.getId());
        when(sequenceRepository.saveAndFlush(any(ProjectIssueSequence.class))).thenReturn(newSequence);

        IssueKeyGenerator.KeyResult result = issueKeyGenerator.generateNextKey(project);

        assertThat(result.issueKey()).isEqualTo("WEB-1");
        assertThat(result.sequenceNumber()).isEqualTo(1L);
        verify(sequenceRepository).save(newSequence);
    }

    @Test
    @DisplayName("Should increment existing sequence correctly (e.g. from 141 to WEB-142)")
    void testIncrementExistingSequence() {
        ProjectIssueSequence sequence = new ProjectIssueSequence(project.getId());
        sequence.setLastSequenceNumber(141L);

        when(sequenceRepository.findByProjectIdForUpdate(project.getId())).thenReturn(Optional.of(sequence));

        IssueKeyGenerator.KeyResult result = issueKeyGenerator.generateNextKey(project);

        assertThat(result.issueKey()).isEqualTo("WEB-142");
        assertThat(result.sequenceNumber()).isEqualTo(142L);
        assertThat(sequence.getLastSequenceNumber()).isEqualTo(142L);
        verify(sequenceRepository).save(sequence);
    }
}
