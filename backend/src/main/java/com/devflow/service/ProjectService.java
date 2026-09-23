package com.devflow.service;

import com.devflow.dto.project.CreateProjectRequest;
import com.devflow.dto.project.ProjectResponse;
import com.devflow.dto.project.UpdateProjectRequest;
import com.devflow.entity.*;
import com.devflow.exception.ConflictException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final IssueRepository issueRepository;
    private final LabelRepository labelRepository;
    private final IssueCommentRepository commentRepository;
    private final GitHubActivityRepository gitHubActivityRepository;
    private final GitHubRepositoryRepository gitHubRepositoryRepository;
    private final ProjectIssueSequenceRepository sequenceRepository;
    private final WorkspaceSecurityService workspaceSecurityService;

    public ProjectService(ProjectRepository projectRepository,
                          WorkspaceRepository workspaceRepository,
                          UserRepository userRepository,
                          IssueRepository issueRepository,
                          LabelRepository labelRepository,
                          IssueCommentRepository commentRepository,
                          GitHubActivityRepository gitHubActivityRepository,
                          GitHubRepositoryRepository gitHubRepositoryRepository,
                          ProjectIssueSequenceRepository sequenceRepository,
                          WorkspaceSecurityService workspaceSecurityService) {
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.issueRepository = issueRepository;
        this.labelRepository = labelRepository;
        this.commentRepository = commentRepository;
        this.gitHubActivityRepository = gitHubActivityRepository;
        this.gitHubRepositoryRepository = gitHubRepositoryRepository;
        this.sequenceRepository = sequenceRepository;
        this.workspaceSecurityService = workspaceSecurityService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getWorkspaceProjects(UUID workspaceId, UUID userId) {
        workspaceSecurityService.requireMembership(workspaceId, userId);
        List<Project> projects = projectRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);

        return projects.stream()
                .map(this::toProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse createProject(UUID workspaceId, UUID userId, CreateProjectRequest request) {
        workspaceSecurityService.requireRole(workspaceId, userId, WorkspaceRole.ADMIN);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String normalizedKey = request.getKey().trim().toUpperCase(Locale.ROOT);
        if (projectRepository.existsByWorkspaceIdAndKey(workspaceId, normalizedKey)) {
            throw new ConflictException(String.format("Project with key '%s' already exists in this workspace", normalizedKey));
        }

        Project project = new Project(workspace, request.getName().trim(), normalizedKey, request.getDescription(), user);
        Project savedProject = projectRepository.save(project);

        // Initialize sequence counter
        ProjectIssueSequence sequence = new ProjectIssueSequence(savedProject.getId());
        sequenceRepository.save(sequence);

        return toProjectResponse(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);
        return toProjectResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(UUID projectId, UUID userId, UpdateProjectRequest request) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.requireRole(project.getWorkspace().getId(), userId, WorkspaceRole.ADMIN);

        project.setName(request.getName().trim());
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription().trim());
        }

        Project updated = projectRepository.save(project);
        return toProjectResponse(updated);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.requireRole(project.getWorkspace().getId(), userId, WorkspaceRole.ADMIN);
        deleteProjectInternal(projectId);
    }

    @Transactional
    public void deleteProjectInternal(UUID projectId) {
        List<Issue> issues = issueRepository.findByProjectId(projectId);
        if (!issues.isEmpty()) {
            List<UUID> issueIds = issues.stream().map(Issue::getId).toList();
            commentRepository.deleteByIssueIdIn(issueIds);
            gitHubActivityRepository.deleteByIssueIdIn(issueIds);
            for (Issue issue : issues) {
                if (issue.getLabels() != null) {
                    issue.getLabels().clear();
                }
            }
            issueRepository.deleteAll(issues);
        }
        labelRepository.deleteByProjectId(projectId);
        gitHubRepositoryRepository.deleteByProjectId(projectId);
        sequenceRepository.deleteById(projectId);
        projectRepository.deleteById(projectId);
    }

    private ProjectResponse toProjectResponse(Project project) {
        long totalIssues = issueRepository.countByProjectId(project.getId());
        long doneIssues = issueRepository.countByProjectIdAndStatus(project.getId(), IssueStatus.DONE);
        long openIssues = totalIssues - doneIssues;
        boolean githubConnected = gitHubRepositoryRepository.existsByProjectId(project.getId());

        return ProjectResponse.fromEntity(project, totalIssues, openIssues, doneIssues, githubConnected);
    }
}
