package com.devflow.service;

import com.devflow.dto.comment.CommentResponse;
import com.devflow.dto.comment.CreateCommentRequest;
import com.devflow.dto.comment.UpdateCommentRequest;
import com.devflow.entity.Issue;
import com.devflow.entity.IssueComment;
import com.devflow.entity.User;
import com.devflow.entity.WorkspaceRole;
import com.devflow.exception.ForbiddenException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.IssueCommentRepository;
import com.devflow.repository.IssueRepository;
import com.devflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final IssueCommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final WorkspaceSecurityService workspaceSecurityService;

    public CommentService(IssueCommentRepository commentRepository,
                          IssueRepository issueRepository,
                          UserRepository userRepository,
                          WorkspaceSecurityService workspaceSecurityService) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.workspaceSecurityService = workspaceSecurityService;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getIssueComments(UUID issueId, UUID userId) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);

        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId)
                .stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse createComment(UUID issueId, UUID userId, CreateCommentRequest request) {
        Issue issue = issueRepository.findByIdWithDetails(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        workspaceSecurityService.validateProjectAccess(issue.getProject(), userId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        IssueComment comment = new IssueComment(issue, author, request.getContent().trim());
        IssueComment saved = commentRepository.save(comment);

        return CommentResponse.fromEntity(saved);
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, UUID userId, UpdateCommentRequest request) {
        IssueComment comment = commentRepository.findByIdWithDetails(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        // Only comment author can edit comment content
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setContent(request.getContent().trim());
        IssueComment updated = commentRepository.save(comment);

        return CommentResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        IssueComment comment = commentRepository.findByIdWithDetails(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        boolean isAuthor = comment.getAuthor().getId().equals(userId);
        boolean isAdminOrOwner = workspaceSecurityService.getUserRoleInWorkspace(
                comment.getIssue().getProject().getWorkspace().getId(), userId
        ).filter(role -> role == WorkspaceRole.OWNER || role == WorkspaceRole.ADMIN).isPresent();

        if (!isAuthor && !isAdminOrOwner) {
            throw new ForbiddenException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
