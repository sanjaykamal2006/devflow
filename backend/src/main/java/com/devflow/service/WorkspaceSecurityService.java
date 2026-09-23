package com.devflow.service;

import com.devflow.entity.Project;
import com.devflow.entity.WorkspaceMember;
import com.devflow.entity.WorkspaceRole;
import com.devflow.exception.ForbiddenException;
import com.devflow.repository.WorkspaceMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class WorkspaceSecurityService {

    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceSecurityService(WorkspaceMemberRepository workspaceMemberRepository) {
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    @Transactional(readOnly = true)
    public WorkspaceMember requireMembership(UUID workspaceId, UUID userId) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));
    }

    @Transactional(readOnly = true)
    public WorkspaceMember requireRole(UUID workspaceId, UUID userId, WorkspaceRole requiredRole) {
        WorkspaceMember member = requireMembership(workspaceId, userId);

        if (!hasSufficientRole(member.getRole(), requiredRole)) {
            throw new ForbiddenException(String.format(
                    "Action requires %s permission, but current role is %s",
                    requiredRole, member.getRole()));
        }

        return member;
    }

    public boolean hasSufficientRole(WorkspaceRole userRole, WorkspaceRole requiredRole) {
        if (userRole == WorkspaceRole.OWNER) {
            return true;
        }
        if (userRole == WorkspaceRole.ADMIN) {
            return requiredRole == WorkspaceRole.ADMIN || requiredRole == WorkspaceRole.MEMBER;
        }
        return userRole == WorkspaceRole.MEMBER && requiredRole == WorkspaceRole.MEMBER;
    }

    @Transactional(readOnly = true)
    public Optional<WorkspaceRole> getUserRoleInWorkspace(UUID workspaceId, UUID userId) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(WorkspaceMember::getRole);
    }

    @Transactional(readOnly = true)
    public void validateProjectAccess(Project project, UUID userId) {
        requireMembership(project.getWorkspace().getId(), userId);
    }
}
