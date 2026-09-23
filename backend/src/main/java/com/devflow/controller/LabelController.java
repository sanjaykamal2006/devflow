package com.devflow.controller;

import com.devflow.common.ApiResponse;
import com.devflow.dto.label.CreateLabelRequest;
import com.devflow.dto.label.LabelResponse;
import com.devflow.security.SecurityUtils;
import com.devflow.service.LabelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/labels")
public class LabelController {

    private final LabelService labelService;

    public LabelController(LabelService labelService) {
        this.labelService = labelService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LabelResponse>>> getLabels(@PathVariable UUID projectId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<LabelResponse> labels = labelService.getProjectLabels(projectId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(labels));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LabelResponse>> createLabel(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateLabelRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LabelResponse label = labelService.createLabel(projectId, currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.created("Label created successfully", label),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/{labelId}")
    public ResponseEntity<ApiResponse<Void>> deleteLabel(
            @PathVariable UUID projectId,
            @PathVariable UUID labelId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        labelService.deleteLabel(projectId, labelId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Label deleted successfully", null));
    }
}
