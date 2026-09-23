package com.devflow.service;

import com.devflow.dto.issue.CreateIssueRequest;
import com.devflow.dto.issue.IssueResponse;
import com.devflow.entity.*;
import com.devflow.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class IssueKeyGeneratorConcurrencyIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private IssueService issueService;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ProjectIssueSequenceRepository sequenceRepository;

    @Test
    @DisplayName("Concurrent issue creation must produce strictly unique, gapless keys with zero collisions")
    void testConcurrentIssueKeyGeneration() throws InterruptedException {
        long ts = System.currentTimeMillis();
        User user = new User("concur." + ts + "@devflow.local", "hashedpassword", "Concurrency Dev");
        User savedUser = userRepository.save(user);

        Workspace workspace = new Workspace("Concur WS " + ts, "concur-" + ts, "Test Workspace", savedUser);
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember(savedWorkspace, savedUser, WorkspaceRole.OWNER);
        workspaceMemberRepository.save(member);

        Project project = new Project(savedWorkspace, "Concurrent Project", "CONCUR", "Test concurrency", savedUser);
        Project savedProject = projectRepository.save(project);

        ProjectIssueSequence initialSequence = new ProjectIssueSequence(savedProject.getId());
        sequenceRepository.save(initialSequence);

        int numberOfThreads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch readyLatch = new CountDownLatch(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(numberOfThreads);

        ConcurrentLinkedQueue<IssueResponse> createdIssues = new ConcurrentLinkedQueue<>();
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        for (int i = 0; i < numberOfThreads; i++) {
            final int index = i;
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    CreateIssueRequest request = new CreateIssueRequest(
                            "Concurrent Issue #" + index,
                            "Testing race condition resilience",
                            IssueType.TASK,
                            IssuePriority.MEDIUM,
                            null,
                            null,
                            null
                    );
                    IssueResponse response = issueService.createIssue(savedProject.getId(), savedUser.getId(), request);
                    createdIssues.add(response);
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown(); // Fire all 10 threads simultaneously

        boolean finished = finishLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(finished).isTrue();
        assertThat(errors).as("No threads should have encountered duplicate key or locking errors").isEmpty();
        assertThat(createdIssues).hasSize(numberOfThreads);

        // Verify that all generated keys are unique
        Set<String> generatedKeys = createdIssues.stream()
                .map(IssueResponse::getIssueKey)
                .collect(Collectors.toSet());

        assertThat(generatedKeys).hasSize(numberOfThreads);

        // Verify expected sequence of keys: CONCUR-1 through CONCUR-10
        Set<String> expectedKeys = new HashSet<>();
        for (int i = 1; i <= numberOfThreads; i++) {
            expectedKeys.add("CONCUR-" + i);
        }
        assertThat(generatedKeys).containsExactlyInAnyOrderElementsOf(expectedKeys);

        // Verify in database
        List<Issue> dbIssues = issueRepository.findByProjectId(savedProject.getId());
        assertThat(dbIssues).hasSize(numberOfThreads);

        // Verify sequence table state
        ProjectIssueSequence finalSequence = sequenceRepository.findById(savedProject.getId()).orElseThrow();
        assertThat(finalSequence.getLastSequenceNumber()).isEqualTo((long) numberOfThreads);
    }
}
