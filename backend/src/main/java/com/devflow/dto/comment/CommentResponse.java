package com.devflow.dto.comment;

import com.devflow.dto.auth.UserResponse;
import com.devflow.entity.IssueComment;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class CommentResponse implements Serializable {

    private UUID id;
    private UUID issueId;
    private UserResponse author;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;

    public CommentResponse() {
    }

    public CommentResponse(UUID id, UUID issueId, UserResponse author, String content,
                           Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.issueId = issueId;
        this.author = author;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static CommentResponse fromEntity(IssueComment comment) {
        if (comment == null) return null;
        return new CommentResponse(
                comment.getId(),
                comment.getIssue().getId(),
                UserResponse.fromEntity(comment.getAuthor()),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getIssueId() {
        return issueId;
    }

    public void setIssueId(UUID issueId) {
        this.issueId = issueId;
    }

    public UserResponse getAuthor() {
        return author;
    }

    public void setAuthor(UserResponse author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
