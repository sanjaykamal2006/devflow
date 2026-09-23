package com.devflow.service;

import com.devflow.dto.issue.CreateIssueRequest;
import com.devflow.dto.issue.IssueResponse;
import com.devflow.entity.*;
import com.devflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {

    @Mock
    private IssueRepository issueRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LabelRepository labelRepository;
    @Mock
    private IssueCommentRepository commentRepository;
    @Mock
    private GitHubActivityRepository gitHubActivityRepository;
    @Mock
    private IssueKeyGenerator issueKeyGenerator;
    @Mock
    private WorkspaceSecurityService workspaceSecurityService;

    private IssueService issueService;
    private Project project;
    private User reporter;

    @BeforeEach
    void setUp() {
        issueService = new IssueService(
                issueRepository, projectRepository, userRepository,
                labelRepository, commentRepository, gitHubActivityRepository,
                issueKeyGenerator, workspaceSecurityService
        );

        reporter = new User("reporter@devflow.local", "hash", "Reporter Dev");
        reporter.setId(UUID.randomUUID());

        Workspace workspace = new Workspace("Acme", "acme", null, reporter);
        workspace.setId(UUID.randomUUID());

        project = new Project(workspace, "Web Platform", "WEB", "Frontend app", reporter);
        project.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should create issue with generated key and default TODO status")
    void testCreateIssueSuccess() {
        CreateIssueRequest request = new CreateIssueRequest(
                "Build navigation bar", "Implement responsive nav",
                IssueType.FEATURE, IssuePriority.HIGH, null, null, null
        );

        when(projectRepository.findByIdWithWorkspace(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findById(reporter.getId())).thenReturn(Optional.of(reporter));
        when(issueKeyGenerator.generateNextKey(project)).thenReturn(new IssueKeyGenerator.KeyResult("WEB-1", 1L));

        Issue savedIssue = new Issue(
                project, "WEB-1", 1L, request.getTitle(), request.getDescription(),
                request.getIssueType(), request.getPriority(), reporter, null, null
        );
        savedIssue.setId(UUID.randomUUID());

        when(issueRepository.save(any(Issue.class))).thenReturn(savedIssue);
        when(commentRepository.findByIssueIdOrderByCreatedAtAsc(savedIssue.getId())).thenReturn(Collections.emptyList());
        when(gitHubActivityRepository.findByIssueIdOrderByEventTimestampDesc(savedIssue.getId())).thenReturn(Collections.emptyList());

        IssueResponse response = issueService.createIssue(project.getId(), reporter.getId(), request);

        assertThat(response).isNotNull();
        assertThat(response.getIssueKey()).isEqualTo("WEB-1");
        assertThat(response.getTitle()).isEqualTo("Build navigation bar");
        assertThat(response.getStatus()).isEqualTo(IssueStatus.TODO);
        assertThat(response.getPriority()).isEqualTo(IssuePriority.HIGH);
        assertThat(response.getReporter().getEmail()).isEqualTo("reporter@devflow.local");
        verify(workspaceSecurityService).validateProjectAccess(project, reporter.getId());
    }

    @Test
    @DisplayName("Should successfully change issue status (TODO -> IN_PROGRESS)")
    void testChangeStatusSuccess() {
        UUID issueId = UUID.randomUUID();
        Issue existing = new Issue(
                project, "WEB-1", 1L, "Fix auth bug", null,
                IssueType.BUG, IssuePriority.MEDIUM, reporter, null, null
        );
        existing.setId(issueId);

        when(issueRepository.findByIdWithDetails(issueId)).thenReturn(Optional.of(existing));
        when(issueRepository.save(any(Issue.class))).thenAnswer(inv -> inv.getArgument(0));
        when(commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId)).thenReturn(Collections.emptyList());
        when(gitHubActivityRepository.findByIssueIdOrderByEventTimestampDesc(issueId)).thenReturn(Collections.emptyList());

        IssueResponse response = issueService.changeStatus(issueId, reporter.getId(), IssueStatus.IN_PROGRESS);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(IssueStatus.IN_PROGRESS);
        verify(issueRepository).save(existing);
    }
}
