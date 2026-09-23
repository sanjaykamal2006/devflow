package com.devflow.controller;

import com.devflow.common.ApiResponse;
import com.devflow.dto.comment.CommentResponse;
import com.devflow.dto.comment.CreateCommentRequest;
import com.devflow.dto.comment.UpdateCommentRequest;
import com.devflow.security.SecurityUtils;
import com.devflow.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/issues/{issueId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getIssueComments(@PathVariable UUID issueId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<CommentResponse> comments = commentService.getIssueComments(issueId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(comments));
    }

    @PostMapping("/issues/{issueId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable UUID issueId,
            @Valid @RequestBody CreateCommentRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        CommentResponse comment = commentService.createComment(issueId, currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.created("Comment posted successfully", comment),
                HttpStatus.CREATED
        );
    }

    @PatchMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCommentRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        CommentResponse comment = commentService.updateComment(id, currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Comment updated successfully", comment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        commentService.deleteComment(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Comment deleted successfully", null));
    }
}
