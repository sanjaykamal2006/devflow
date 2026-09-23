package com.devflow.service;

import com.devflow.common.PagedResponse;
import com.devflow.dto.issue.*;
import com.devflow.entity.*;
import com.devflow.exception.BadRequestException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final IssueCommentRepository commentRepository;
    private final GitHubActivityRepository gitHubActivityRepository;
    private final IssueKeyGenerator issueKeyGenerator;
    private final WorkspaceSecurityService workspaceSecurityService;

    public IssueService(IssueRepository issueRepository,
                        ProjectRepository projectRepository,
                        UserRepository userRepository,
                        LabelRepository labelRepository,
                        IssueCommentRepository commentRepository,
                        GitHubActivityRepository gitHubActivityRepository,
                        IssueKeyGenerator issueKeyGenerator,
                        WorkspaceSecurityService workspaceSecurityService) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.labelRepository = labelRepository;
        this.commentRepository = commentRepository;
        this.gitHubActivityRepository = gitHubActivityRepository;
        this.issueKeyGenerator = issueKeyGenerator;
        this.workspaceSecurityService = workspaceSecurityService;
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "issues", allEntries = true),
            @CacheEvict(value = "projects", key = "#projectId")
    })
    public IssueResponse createIssue(UUID projectId, UUID userId, CreateIssueRequest request) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);

        User reporter = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
            workspaceSecurityService.requireMembership(project.getWorkspace().getId(), assignee.getId());
        }

        // Generate issue key concurrency-safely
        IssueKeyGenerator.KeyResult keyResult = issueKeyGenerator.generateNextKey(project);

        Issue issue = new Issue(
                project,
                keyResult.issueKey(),
                keyResult.sequenceNumber(),
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getIssueType(),
                request.getPriority(),
                reporter,
                assignee,
                request.getDueDate()
        );

        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            issue.setLabels(labels);
        }

        Issue saved = issueRepository.save(issue);
        return toIssueResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<IssueResponse> getProjectIssues(UUID projectId, UUID userId,
                                                        IssueFilterParams params, Pageable pageable) {
        Project project = projectRepository.findByIdWithWorkspace(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        workspaceSecurityService.validateProjectAccess(project, userId);

        Specification<Issue> spec = IssueSpecifications.withFilters(projectId, params);
        Page<Issue> issuePage = issueRepository.findAll(spec, pageable);

        Page<IssueResponse> responsePage = issuePage.map(this::toIssueResponse);
        return PagedResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(UUID issueId, UUID userId) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);
        return toIssueResponse(issue);
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueByKey(String issueKey, UUID userId) {
        Issue issue = issueRepository.findByIssueKeyWithDetails(issueKey)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "key", issueKey));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);
        return toIssueResponse(issue);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "issues", allEntries = true),
            @CacheEvict(value = "projects", allEntries = true)
    })
    public IssueResponse updateIssue(UUID issueId, UUID userId, UpdateIssueRequest request) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            issue.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            issue.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            issue.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        if (request.getIssueType() != null) {
            issue.setIssueType(request.getIssueType());
        }
        if (request.isUnassign()) {
            issue.setAssignee(null);
        } else if (request.getAssigneeId() != null) {
            User newAssignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            workspaceSecurityService.requireMembership(issue.getProject().getWorkspace().getId(), newAssignee.getId());
            issue.setAssignee(newAssignee);
        }
        if (request.getLabelIds() != null) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            issue.setLabels(labels);
        }
        if (request.getDueDate() != null) {
            issue.setDueDate(request.getDueDate());
        }

        Issue updated = issueRepository.save(issue);
        return toIssueResponse(updated);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "issues", allEntries = true),
            @CacheEvict(value = "projects", allEntries = true)
    })
    public IssueResponse changeStatus(UUID issueId, UUID userId, IssueStatus newStatus) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);
        issue.setStatus(newStatus);
        Issue saved = issueRepository.save(issue);

        return toIssueResponse(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "issues", allEntries = true)
    })
    public IssueResponse assignIssue(UUID issueId, UUID userId, UUID newAssigneeId) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);

        if (newAssigneeId == null) {
            issue.setAssignee(null);
        } else {
            User assignee = userRepository.findById(newAssigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            workspaceSecurityService.requireMembership(issue.getProject().getWorkspace().getId(), assignee.getId());
            issue.setAssignee(assignee);
        }

        Issue saved = issueRepository.save(issue);
        return toIssueResponse(saved);
    }

    @Transactional
    public void deleteIssue(UUID issueId, UUID userId) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.requireRole(issue.getProject().getWorkspace().getId(), userId, WorkspaceRole.ADMIN);

        commentRepository.deleteByIssueId(issue.getId());
        gitHubActivityRepository.deleteByIssueId(issue.getId());
        if (issue.getLabels() != null) {
            issue.getLabels().clear();
        }
        issueRepository.delete(issue);
    }

    @Transactional
    public IssueResponse attachLabel(UUID issueId, UUID labelId, UUID userId) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId));

        if (!label.getProject().getId().equals(issue.getProject().getId())) {
            throw new BadRequestException("Label does not belong to the same project as the issue");
        }

        issue.addLabel(label);
        Issue saved = issueRepository.save(issue);
        return toIssueResponse(saved);
    }

    @Transactional
    public IssueResponse removeLabel(UUID issueId, UUID labelId, UUID userId) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId));

        issue.removeLabel(label);
        Issue saved = issueRepository.save(issue);
        return toIssueResponse(saved);
    }

    private IssueResponse toIssueResponse(Issue issue) {
        long commentCount = commentRepository.findByIssueIdOrderByCreatedAtAsc(issue.getId()).size();
        long activityCount = gitHubActivityRepository.findByIssueIdOrderByEventTimestampDesc(issue.getId()).size();
        return IssueResponse.fromEntity(issue, commentCount, activityCount);
    }
}
