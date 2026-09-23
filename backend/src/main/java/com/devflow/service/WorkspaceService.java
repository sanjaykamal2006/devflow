package com.devflow.service;

import com.devflow.dto.workspace.*;
import com.devflow.entity.*;
import com.devflow.exception.BadRequestException;
import com.devflow.exception.ConflictException;
import com.devflow.exception.ForbiddenException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final WorkspaceSecurityService workspaceSecurityService;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository workspaceMemberRepository,
                            UserRepository userRepository,
                            ProjectRepository projectRepository,
                            ProjectService projectService,
                            WorkspaceSecurityService workspaceSecurityService) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectService = projectService;
        this.workspaceSecurityService = workspaceSecurityService;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getUserWorkspaces(UUID userId) {
        List<Workspace> workspaces = workspaceRepository.findAllByMemberUserId(userId);
        return workspaces.stream().map(ws -> {
            WorkspaceRole role = workspaceSecurityService.getUserRoleInWorkspace(ws.getId(), userId)
                    .orElse(WorkspaceRole.MEMBER);
            long memberCount = workspaceMemberRepository.countByWorkspaceId(ws.getId());
            long projectCount = projectRepository.countByWorkspaceId(ws.getId());
            return WorkspaceResponse.fromEntity(ws, role, memberCount, projectCount);
        }).collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceResponse createWorkspace(UUID userId, CreateWorkspaceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String slug = generateSlug(request.getName(), request.getSlug());

        if (workspaceRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        Workspace workspace = new Workspace(request.getName().trim(), slug, request.getDescription(), user);
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember(savedWorkspace, user, WorkspaceRole.OWNER);
        workspaceMemberRepository.save(member);

        return WorkspaceResponse.fromEntity(savedWorkspace, WorkspaceRole.OWNER, 1, 0);
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(UUID workspaceId, UUID userId) {
        WorkspaceMember member = workspaceSecurityService.requireMembership(workspaceId, userId);
        Workspace workspace = member.getWorkspace();
        long memberCount = workspaceMemberRepository.countByWorkspaceId(workspaceId);
        long projectCount = projectRepository.countByWorkspaceId(workspaceId);
        return WorkspaceResponse.fromEntity(workspace, member.getRole(), memberCount, projectCount);
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(UUID workspaceId, UUID userId, UpdateWorkspaceRequest request) {
        WorkspaceMember member = workspaceSecurityService.requireRole(workspaceId, userId, WorkspaceRole.ADMIN);
        Workspace workspace = member.getWorkspace();

        workspace.setName(request.getName().trim());
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription().trim());
        }

        Workspace updated = workspaceRepository.save(workspace);
        long memberCount = workspaceMemberRepository.countByWorkspaceId(workspaceId);
        long projectCount = projectRepository.countByWorkspaceId(workspaceId);
        return WorkspaceResponse.fromEntity(updated, member.getRole(), memberCount, projectCount);
    }

    @Transactional
    public void deleteWorkspace(UUID workspaceId, UUID userId) {
        WorkspaceMember member = workspaceSecurityService.requireRole(workspaceId, userId, WorkspaceRole.OWNER);
        Workspace workspace = member.getWorkspace();

        List<Project> projects = projectRepository.findByWorkspaceId(workspaceId);
        for (Project project : projects) {
            projectService.deleteProjectInternal(project.getId());
        }

        workspaceMemberRepository.deleteByWorkspaceId(workspaceId);
        workspaceRepository.delete(workspace);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> getWorkspaceMembers(UUID workspaceId, UUID userId) {
        workspaceSecurityService.requireMembership(workspaceId, userId);
        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceIdWithUser(workspaceId);
        return members.stream()
                .map(WorkspaceMemberResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceMemberResponse addMember(UUID workspaceId, UUID userId, AddMemberRequest request) {
        workspaceSecurityService.requireRole(workspaceId, userId, WorkspaceRole.ADMIN);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        User targetUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + email));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, targetUser.getId())) {
            throw new ConflictException("User is already a member of this workspace");
        }

        WorkspaceRole roleToAdd = request.getRole() != null ? request.getRole() : WorkspaceRole.MEMBER;
        if (roleToAdd == WorkspaceRole.OWNER) {
            throw new BadRequestException("Cannot add user directly as OWNER. Transfer ownership instead.");
        }

        WorkspaceMember newMember = new WorkspaceMember(workspace, targetUser, roleToAdd);
        WorkspaceMember saved = workspaceMemberRepository.save(newMember);

        return WorkspaceMemberResponse.fromEntity(saved);
    }

    @Transactional
    public WorkspaceMemberResponse updateMemberRole(UUID workspaceId, UUID userId, UUID targetUserId, UpdateMemberRoleRequest request) {
        WorkspaceMember requester = workspaceSecurityService.requireRole(workspaceId, userId, WorkspaceRole.OWNER);
        Workspace workspace = requester.getWorkspace();

        if (workspace.getOwner().getId().equals(targetUserId)) {
            throw new BadRequestException("Cannot modify the role of the workspace OWNER");
        }

        WorkspaceMember targetMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));

        if (request.getRole() == WorkspaceRole.OWNER) {
            throw new BadRequestException("To transfer ownership, use the transfer ownership endpoint");
        }

        targetMember.setRole(request.getRole());
        WorkspaceMember saved = workspaceMemberRepository.save(targetMember);
        return WorkspaceMemberResponse.fromEntity(saved);
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID userId, UUID targetUserId) {
        WorkspaceMember requester = workspaceSecurityService.requireMembership(workspaceId, userId);
        Workspace workspace = requester.getWorkspace();

        if (workspace.getOwner().getId().equals(targetUserId)) {
            throw new BadRequestException("Cannot remove the OWNER from the workspace");
        }

        // Allow self-removal (leaving workspace) OR removal by ADMIN/OWNER
        boolean isSelf = userId.equals(targetUserId);
        boolean isAdminOrOwner = workspaceSecurityService.hasSufficientRole(requester.getRole(), WorkspaceRole.ADMIN);

        if (!isSelf && !isAdminOrOwner) {
            throw new ForbiddenException("You do not have permission to remove members from this workspace");
        }

        workspaceMemberRepository.deleteByWorkspaceIdAndUserId(workspaceId, targetUserId);
    }

    private String generateSlug(String name, String providedSlug) {
        if (providedSlug != null && !providedSlug.isBlank()) {
            return providedSlug.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "-");
        }
        String slug = name.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-");
        if (slug.startsWith("-")) slug = slug.substring(1);
        if (slug.endsWith("-")) slug = slug.substring(0, slug.length() - 1);
        return slug.isBlank() ? "workspace" : slug;
    }
}
