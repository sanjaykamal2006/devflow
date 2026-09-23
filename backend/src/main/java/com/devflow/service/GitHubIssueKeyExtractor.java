package com.devflow.service;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GitHubIssueKeyExtractor {

    // Matches issue keys like API-37, WEB-142, #CORE-5, [API-37], (#API-37)
    private static final Pattern ISSUE_KEY_PATTERN =
            Pattern.compile("(?i)(?:^|[\s\\[\\(\\{#])([A-Z0-9]{2,10}-\\d+)(?:$|[\s\\]\\)\\},.:;])");

    private static final Pattern CLOSING_KEY_PATTERN =
            Pattern.compile("(?i)(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)[\\s:]+[#\\[\\(]?([A-Z0-9]{2,10}-\\d+)");

    public Set<String> extractIssueKeys(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }

        Set<String> keys = new HashSet<>();
        Matcher matcher = ISSUE_KEY_PATTERN.matcher(text);

        while (matcher.find()) {
            String key = matcher.group(1);
            if (key != null && !key.isBlank()) {
                keys.add(key.toUpperCase(Locale.ROOT));
            }
        }

        return keys;
    }

    public Set<String> extractClosingKeys(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }

        Set<String> keys = new HashSet<>();
        Matcher matcher = CLOSING_KEY_PATTERN.matcher(text);

        while (matcher.find()) {
            String key = matcher.group(1);
            if (key != null && !key.isBlank()) {
                keys.add(key.toUpperCase(Locale.ROOT));
            }
        }

        return keys;
    }
}
