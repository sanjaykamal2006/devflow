package com.devflow.service;

import com.devflow.entity.User;
import com.devflow.entity.Workspace;
import com.devflow.entity.WorkspaceMember;
import com.devflow.entity.WorkspaceRole;
import com.devflow.exception.ForbiddenException;
import com.devflow.repository.WorkspaceMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkspaceSecurityServiceTest {

    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;

    private WorkspaceSecurityService securityService;
    private UUID workspaceId;
    private UUID userId;
    private WorkspaceMember member;

    @BeforeEach
    void setUp() {
        securityService = new WorkspaceSecurityService(workspaceMemberRepository);
        workspaceId = UUID.randomUUID();
        userId = UUID.randomUUID();

        User user = new User("user@devflow.local", "hash", "Test User");
        user.setId(userId);
        Workspace workspace = new Workspace("Engineering", "engineering", null, user);
        workspace.setId(workspaceId);

        member = new WorkspaceMember(workspace, user, WorkspaceRole.MEMBER);
    }

    @Test
    @DisplayName("Should permit MEMBER when minimum required role is MEMBER")
    void testMemberSufficientForMemberRole() {
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(member));

        WorkspaceMember result = securityService.requireRole(workspaceId, userId, WorkspaceRole.MEMBER);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should throw ForbiddenException when MEMBER attempts ADMIN action")
    void testMemberForbiddenForAdminRole() {
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(member));

        assertThatThrownBy(() -> securityService.requireRole(workspaceId, userId, WorkspaceRole.ADMIN))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Action requires ADMIN permission");
    }

    @Test
    @DisplayName("Should permit OWNER for all roles (OWNER, ADMIN, MEMBER)")
    void testOwnerHasFullAccess() {
        member.setRole(WorkspaceRole.OWNER);
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(member));

        assertThat(securityService.requireRole(workspaceId, userId, WorkspaceRole.OWNER)).isNotNull();
        assertThat(securityService.requireRole(workspaceId, userId, WorkspaceRole.ADMIN)).isNotNull();
        assertThat(securityService.requireRole(workspaceId, userId, WorkspaceRole.MEMBER)).isNotNull();
    }

    @Test
    @DisplayName("Should throw ForbiddenException for cross-workspace non-member")
    void testNonMemberForbidden() {
        UUID outsiderId = UUID.randomUUID();
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, outsiderId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> securityService.requireMembership(workspaceId, outsiderId))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("You are not a member of this workspace");
    }
}
