package com.devflow.controller;

import com.devflow.dto.auth.LoginRequest;
import com.devflow.dto.auth.RegisterRequest;
import com.devflow.dto.comment.CreateCommentRequest;
import com.devflow.dto.issue.ChangeStatusRequest;
import com.devflow.dto.issue.CreateIssueRequest;
import com.devflow.dto.project.CreateProjectRequest;
import com.devflow.dto.workspace.AddMemberRequest;
import com.devflow.dto.workspace.CreateWorkspaceRequest;
import com.devflow.entity.IssuePriority;
import com.devflow.entity.IssueStatus;
import com.devflow.entity.IssueType;
import com.devflow.entity.WorkspaceRole;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class IssueApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String email, String name) throws Exception {
        RegisterRequest req = new RegisterRequest(email, "password123", name);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest(email, "password123"))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Complete workspace, project, issue, comment lifecycle and cross-workspace authorization test")
    void testIssueLifecycleAndAuthorizationBoundary() throws Exception {
        long ts = System.currentTimeMillis();
        String userAEmail = "alice." + ts + "@devflow.local";
        String userBEmail = "bob." + ts + "@devflow.local";

        String tokenA = registerAndGetToken(userAEmail, "Alice Engineer");
        String tokenB = registerAndGetToken(userBEmail, "Bob Outsider");

        // 1. User A creates Workspace
        CreateWorkspaceRequest wsReq = new CreateWorkspaceRequest("Campus Engineering " + ts, "campus-" + ts, "Main workspace");
        MvcResult wsResult = mockMvc.perform(post("/api/workspaces")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wsReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String workspaceId = objectMapper.readTree(wsResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. User A creates Project "API"
        CreateProjectRequest projReq = new CreateProjectRequest("Backend API", "API", "Core services");
        MvcResult projResult = mockMvc.perform(post("/api/workspaces/" + workspaceId + "/projects")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.key").value("API"))
                .andReturn();

        String projectId = objectMapper.readTree(projResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 3. User A creates Issue 1
        CreateIssueRequest issue1Req = new CreateIssueRequest(
                "Implement JWT Authentication", "Use jjwt and BCrypt",
                IssueType.FEATURE, IssuePriority.HIGH, null, null, null
        );
        MvcResult issue1Result = mockMvc.perform(post("/api/projects/" + projectId + "/issues")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(issue1Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.issueKey").value("API-1"))
                .andExpect(jsonPath("$.data.status").value("TODO"))
                .andReturn();

        String issue1Id = objectMapper.readTree(issue1Result.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 4. User A creates Issue 2 -> must be API-2
        CreateIssueRequest issue2Req = new CreateIssueRequest(
                "Fix login validation bug", "Check null passwords",
                IssueType.BUG, IssuePriority.CRITICAL, null, null, null
        );
        mockMvc.perform(post("/api/projects/" + projectId + "/issues")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(issue2Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.issueKey").value("API-2"));

        // 5. User A transitions status to IN_PROGRESS
        mockMvc.perform(patch("/api/issues/" + issue1Id + "/status")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ChangeStatusRequest(IssueStatus.IN_PROGRESS))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

        // 6. User A adds a comment to Issue 1
        CreateCommentRequest commentReq = new CreateCommentRequest("Working on token expiration logic today.");
        mockMvc.perform(post("/api/issues/" + issue1Id + "/comments")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.content").value("Working on token expiration logic today."));

        // 7. Security Check: User B (outsider) attempts to view Issue 1 -> MUST RETURN 403 FORBIDDEN
        mockMvc.perform(get("/api/issues/" + issue1Id)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));

        // 8. User A invites User B to the Workspace as MEMBER
        AddMemberRequest addMemberReq = new AddMemberRequest(userBEmail, WorkspaceRole.MEMBER);
        mockMvc.perform(post("/api/workspaces/" + workspaceId + "/members")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addMemberReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.user.email").value(userBEmail))
                .andExpect(jsonPath("$.data.role").value("MEMBER"));

        // 9. User B now accesses Issue 1 -> MUST SUCCEED (200 OK)
        mockMvc.perform(get("/api/issues/" + issue1Id)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.issueKey").value("API-1"));
    }
}
