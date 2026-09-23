package com.devflow.entity;

import com.devflow.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "issue_comments", indexes = {
        @Index(name = "idx_comments_issue_created", columnList = "issue_id, created_at ASC"),
        @Index(name = "idx_comments_author", columnList = "author_id")
})
public class IssueComment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    public IssueComment() {
    }

    public IssueComment(Issue issue, User author, String content) {
        this.issue = issue;
        this.author = author;
        this.content = content;
    }

    public Issue getIssue() {
        return issue;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
