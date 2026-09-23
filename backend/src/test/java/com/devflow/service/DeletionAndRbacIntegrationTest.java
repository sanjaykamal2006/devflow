package com.devflow.service;

import com.devflow.dto.comment.CreateCommentRequest;
import com.devflow.dto.issue.CreateIssueRequest;
import com.devflow.dto.issue.IssueResponse;
import com.devflow.dto.label.CreateLabelRequest;
import com.devflow.dto.project.CreateProjectRequest;
import com.devflow.dto.project.ProjectResponse;
import com.devflow.dto.workspace.AddMemberRequest;
import com.devflow.dto.workspace.CreateWorkspaceRequest;
import com.devflow.dto.workspace.WorkspaceResponse;
import com.devflow.entity.*;
import com.devflow.exception.ForbiddenException;
import com.devflow.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class DeletionAndRbacIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private IssueService issueService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private LabelService labelService;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private GitHubActivityRepository activityRepository;

    @Test
    @DisplayName("Issue deletion must reject MEMBER, but allow ADMIN and OWNER")
    void testIssueDeletionRbac() {
        long ts = System.currentTimeMillis();

        User owner = userRepository.save(new User("owner." + ts + "@devflow.local", "hash", "Owner User"));
        User admin = userRepository.save(new User("admin." + ts + "@devflow.local", "hash", "Admin User"));
        User member = userRepository.save(new User("member." + ts + "@devflow.local", "hash", "Member User"));

        WorkspaceResponse ws = workspaceService.createWorkspace(owner.getId(), new CreateWorkspaceRequest("WS " + ts, "ws-" + ts, "Desc"));
        workspaceService.addMember(ws.getId(), owner.getId(), new AddMemberRequest(admin.getEmail(), WorkspaceRole.ADMIN));
        workspaceService.addMember(ws.getId(), owner.getId(), new AddMemberRequest(member.getEmail(), WorkspaceRole.MEMBER));

        ProjectResponse proj = projectService.createProject(ws.getId(), owner.getId(), new CreateProjectRequest("Project Alpha", "ALPHA", "Desc"));

        IssueResponse issue1 = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Issue 1", "Desc", IssueType.TASK, IssuePriority.MEDIUM, null, null, null
        ));

        IssueResponse issue2 = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Issue 2", "Desc", IssueType.TASK, IssuePriority.MEDIUM, null, null, null
        ));

        // 1. MEMBER attempt must fail with ForbiddenException
        assertThatThrownBy(() -> issueService.deleteIssue(issue1.getId(), member.getId()))
                .isInstanceOf(ForbiddenException.class);

        // 2. ADMIN attempt must succeed
        issueService.deleteIssue(issue1.getId(), admin.getId());
        assertThat(issueRepository.findById(issue1.getId())).isEmpty();

        // 3. OWNER attempt must succeed
        issueService.deleteIssue(issue2.getId(), owner.getId());
        assertThat(issueRepository.findById(issue2.getId())).isEmpty();
    }

    @Test
    @DisplayName("Deleting issue with comments, activities, and labels must clean up without foreign key crash")
    void testDeleteIssueWithChildRecords() {
        long ts = System.currentTimeMillis();
        User owner = userRepository.save(new User("cascade." + ts + "@devflow.local", "hash", "Cascade Dev"));
        WorkspaceResponse ws = workspaceService.createWorkspace(owner.getId(), new CreateWorkspaceRequest("Cascade WS " + ts, "cas-" + ts, "Desc"));
        ProjectResponse proj = projectService.createProject(ws.getId(), owner.getId(), new CreateProjectRequest("Cascade Project", "CAS", "Desc"));

        IssueResponse issue = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "Cascade Issue", "Desc", IssueType.TASK, IssuePriority.HIGH, null, null, null
        ));

        // Add label, comment, activity
        labelService.createLabel(proj.getId(), owner.getId(), new CreateLabelRequest("frontend", "#3b82f6", "Frontend label"));
        commentService.createComment(issue.getId(), owner.getId(), new CreateCommentRequest("Important comment"));

        Issue issueEntity = issueRepository.findById(issue.getId()).orElseThrow();
        activityRepository.save(new GitHubActivity(
                issueEntity, GitHubActivityType.COMMIT, "abc1234", "Commit message",
                "https://github.com/test", "Author", null, Instant.now()
        ));

        // Delete issue
        issueService.deleteIssue(issue.getId(), owner.getId());
        assertThat(issueRepository.findById(issue.getId())).isEmpty();
    }

    @Test
    @DisplayName("Deleting project containing issues and child records must clean up completely")
    void testDeleteProjectWithIssuesAndChildRecords() {
        long ts = System.currentTimeMillis();
        User owner = userRepository.save(new User("delproj." + ts + "@devflow.local", "hash", "DelProj Dev"));
        WorkspaceResponse ws = workspaceService.createWorkspace(owner.getId(), new CreateWorkspaceRequest("DelProj WS " + ts, "dp-" + ts, "Desc"));
        ProjectResponse proj = projectService.createProject(ws.getId(), owner.getId(), new CreateProjectRequest("DelProj Project", "DP", "Desc"));

        IssueResponse issue = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "DelProj Issue", "Desc", IssueType.BUG, IssuePriority.CRITICAL, null, null, null
        ));
        commentService.createComment(issue.getId(), owner.getId(), new CreateCommentRequest("Comment on project issue"));

        // Delete project
        projectService.deleteProject(proj.getId(), owner.getId());
        assertThat(projectRepository.findById(proj.getId())).isEmpty();
        assertThat(issueRepository.findById(issue.getId())).isEmpty();
    }

    @Test
    @DisplayName("Deleting workspace containing projects, members, and issues must clean up completely")
    void testDeleteWorkspaceWithFullHierarchy() {
        long ts = System.currentTimeMillis();
        User owner = userRepository.save(new User("delws." + ts + "@devflow.local", "hash", "DelWS Dev"));
        User member = userRepository.save(new User("delwsmember." + ts + "@devflow.local", "hash", "DelWS Member"));

        WorkspaceResponse ws = workspaceService.createWorkspace(owner.getId(), new CreateWorkspaceRequest("DelWS WS " + ts, "dws-" + ts, "Desc"));
        workspaceService.addMember(ws.getId(), owner.getId(), new AddMemberRequest(member.getEmail(), WorkspaceRole.MEMBER));

        ProjectResponse proj = projectService.createProject(ws.getId(), owner.getId(), new CreateProjectRequest("DelWS Project", "DWS", "Desc"));
        IssueResponse issue = issueService.createIssue(proj.getId(), owner.getId(), new CreateIssueRequest(
                "DelWS Issue", "Desc", IssueType.FEATURE, IssuePriority.LOW, null, null, null
        ));

        // Delete workspace
        workspaceService.deleteWorkspace(ws.getId(), owner.getId());
        assertThat(workspaceRepository.findById(ws.getId())).isEmpty();
        assertThat(projectRepository.findById(proj.getId())).isEmpty();
        assertThat(issueRepository.findById(issue.getId())).isEmpty();
    }
}
