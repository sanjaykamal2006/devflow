package com.devflow.repository;

import com.devflow.dto.issue.IssueFilterParams;
import com.devflow.entity.Issue;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

public final class IssueSpecifications {

    private IssueSpecifications() {
    }

    public static Specification<Issue> withFilters(UUID projectId, IssueFilterParams params) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always scope to project
            predicates.add(criteriaBuilder.equal(root.get("project").get("id"), projectId));

            if (params != null) {
                if (params.getStatus() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("status"), params.getStatus()));
                }

                if (params.getPriority() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("priority"), params.getPriority()));
                }

                if (params.getIssueType() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("issueType"), params.getIssueType()));
                }

                if (params.getAssigneeId() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("assignee").get("id"), params.getAssigneeId()));
                }

                if (params.getLabelId() != null) {
                    predicates.add(criteriaBuilder.equal(
                            root.join("labels").get("id"), params.getLabelId()));
                }

                if (StringUtils.hasText(params.getSearch())) {
                    String pattern = "%" + params.getSearch().trim().toLowerCase(Locale.ROOT) + "%";
                    Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
                    Predicate descMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                    Predicate keyMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("issueKey")), pattern);
                    predicates.add(criteriaBuilder.or(titleMatch, descMatch, keyMatch));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
