/**
 * Zero-Cost Client-Side AI Issue Doctor & Spec Generator
 * Formats unstructured bug reports and rough engineer notes into
 * Linear/Raycast-grade specifications with objectives, reproduction steps,
 * acceptance criteria, and technical architecture notes.
 */

export interface SpecGeneratorInput {
  title: string;
  description: string;
  issueType?: 'TASK' | 'BUG' | 'FEATURE';
}

export async function generateAiIssueSpec({
  title,
  description,
  issueType = 'FEATURE',
}: SpecGeneratorInput): Promise<string> {
  // Simulate intelligent heuristic synthesis with tactile latency
  await new Promise((resolve) => setTimeout(resolve, 850));

  const cleanTitle = title.trim() || 'Engineering Task';
  const cleanDesc = description.trim();

  // Infer context from keywords
  const isBug = issueType === 'BUG' || /bug|error|fail|crash|broken|timeout|leak|overflow|race|deadlock/i.test(cleanTitle + ' ' + cleanDesc);
  const isPerf = /perf|slow|latency|throughput|cache|memory|cpu|bandwidth|optimiz/i.test(cleanTitle + ' ' + cleanDesc);
  const isSecurity = /auth|security|token|jwt|hmac|encrypt|permission|rbac|vulnerab/i.test(cleanTitle + ' ' + cleanDesc);
  const isFrontend = /ui|button|modal|kanban|table|render|view|mobile|css|tailwind|keyboard|shortcut/i.test(cleanTitle + ' ' + cleanDesc);

  let inferredObjective = cleanDesc
    ? cleanDesc.split(/\n/)[0].replace(/^#+\s*/, '')
    : `Implement ${cleanTitle} with production-grade reliability and low latency.`;

  if (inferredObjective.length < 20) {
    inferredObjective = `Address and resolve "${cleanTitle}" across the target subsystem to improve reliability, maintainability, and developer experience.`;
  }

  // Generate technical reproduction / benchmark steps
  let reproSteps = '';
  if (isBug) {
    reproSteps = `1. Navigate to the relevant module or trigger the pipeline affected by **${cleanTitle}**.\n2. Execute action sequence with concurrent test load or edge-case input parameters.\n3. Observe abnormal state or unexpected exception: \`${cleanDesc || 'Uncaught failure under peak execution'}\`.`;
  } else if (isPerf) {
    reproSteps = `1. Execute synthetic performance benchmark using high concurrency:\n   \`wrk -t8 -c200 -d30s /api/v1/workspaces\`\n2. Inspect CPU profile, garbage collection pauses, or database lock wait counters.\n3. Identify hotspot at critical execution path for **${cleanTitle}**.`;
  } else {
    reproSteps = `1. Check out current base branch and verify baseline integration test suite passes.\n2. Review technical requirements and dependencies for **${cleanTitle}**.\n3. Execute end-to-end user scenario to validate existing baseline behavior.`;
  }

  // Generate targeted acceptance criteria
  const acceptanceItems = [
    `Root cause / core implementation for **${cleanTitle}** completed without regressions.`,
    isBug ? 'Edge cases tested with negative input fixtures and timeout thresholds.' : 'Modular architecture adhering to zero-cost abstractions and strict typing.',
    isSecurity ? 'Cryptographic tokens and access controls validated against OWASP standards.' : 'Comprehensive unit and integration test coverage added to CI test suite.',
    isFrontend ? 'Keyboard shortcuts, ARIA accessible focus rings, and dark-theme contrast verified.' : 'Database lock contention, index coverage, and p99 query latency measured.',
    'Telemetry metrics, error logging, and audit timeline verification completed.',
  ];

  // Generate technical notes
  let techNotes = '';
  if (isSecurity) {
    techNotes = `- Enforce constant-time comparison for all HMAC / token signatures.\n- Verify stateless token invalidation with zero leakage.\n- Inspect HTTP response headers for strict security directives.`;
  } else if (isPerf) {
    techNotes = `- Ensure algorithmic complexity remains O(1) or O(log N) for critical lookup loops.\n- Use connection pooling and verify zero resource leaks under burst pressure.\n- Benchmark p95 and p99 latency before and after deployment.`;
  } else if (isFrontend) {
    techNotes = `- Maintain zero layout shift (CLS 0) and sub-100ms interaction latency.\n- Ensure full keyboard operability (Vim engine: J/K navigation, C create, ? cheatsheet).\n- Confirm seamless fallback support when running in offline or demo mode.`;
  } else {
    techNotes = `- Adhere to pessimistic concurrency locking rules to prevent duplicate sequence generation.\n- Isolate database transactions and ensure idempotency across webhook endpoints.\n- Review pull request against multi-axis code quality standards before merging.`;
  }

  return `### 🎯 Objective / Problem Statement
${inferredObjective}

### 🧪 Steps to Reproduce / Verification Scenario
${reproSteps}

### 📋 Acceptance Criteria
${acceptanceItems.map((item) => `- [ ] ${item}`).join('\n')}

### 💡 Technical Notes & Architecture Suggestions
${techNotes}
`;
}
