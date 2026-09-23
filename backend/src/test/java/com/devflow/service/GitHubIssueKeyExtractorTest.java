package com.devflow.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class GitHubIssueKeyExtractorTest {

    private GitHubIssueKeyExtractor extractor;

    @BeforeEach
    void setUp() {
        extractor = new GitHubIssueKeyExtractor();
    }

    @Test
    @DisplayName("Should extract issue key from commit message: 'Fix login validation (#API-37)'")
    void testExtractFromParenthesesHash() {
        Set<String> keys = extractor.extractIssueKeys("Fix login validation (#API-37)");
        assertThat(keys).containsExactly("API-37");
    }

    @Test
    @DisplayName("Should extract issue key from commit message: 'API-37 Fix authentication bug'")
    void testExtractFromLeadingKey() {
        Set<String> keys = extractor.extractIssueKeys("API-37 Fix authentication bug");
        assertThat(keys).containsExactly("API-37");
    }

    @Test
    @DisplayName("Should extract multiple issue keys from PR description")
    void testExtractMultipleKeys() {
        String text = "Resolves WEB-142 and closes API-37. Also see [MOBILE-8].";
        Set<String> keys = extractor.extractIssueKeys(text);
        assertThat(keys).containsExactlyInAnyOrder("WEB-142", "API-37", "MOBILE-8");
    }

    @Test
    @DisplayName("Should return empty set when no issue keys are present")
    void testNoKeys() {
        Set<String> keys = extractor.extractIssueKeys("Updated README documentation and fixed typos");
        assertThat(keys).isEmpty();
    }

    @Test
    @DisplayName("Should extract closing keys for fixes, closes, resolves keywords")
    void testExtractClosingKeys() {
        String msg1 = "fixes PROJ-101 in this commit";
        assertThat(extractor.extractClosingKeys(msg1)).containsExactly("PROJ-101");

        String msg2 = "Closes #API-42 and resolves [WEB-99]";
        assertThat(extractor.extractClosingKeys(msg2)).containsExactlyInAnyOrder("API-42", "WEB-99");

        String msg3 = "Working on PROJ-102 without closing verb";
        assertThat(extractor.extractClosingKeys(msg3)).isEmpty();
    }
}
