// Post-Audit Fix Verification Suite
const BASE = 'http://localhost:5000';

async function runVerification() {
  console.log('====================================================');
  console.log('  READYSETJOB — POST-AUDIT FIX VERIFICATION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(testName, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ PASS: [${testName}] ${details}`);
    } else {
      console.error(`❌ FAIL: [${testName}] ${details}`);
    }
  }

  // 1. Health check & degradation visibility (VULN-009)
  try {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    assert('VULN-009 Health Check Redis/DB Status', 
      res.status === 200 && data.database && data.redis, 
      `status=${res.status}, db=${data.database}, redis=${data.redis?.substring(0, 30)}...`
    );
  } catch (e) {
    assert('VULN-009 Health Check', false, e.message);
  }

  // 2. Large payload handling (VULN-005)
  try {
    const bigStr = 'X'.repeat(1200000); // 1.2 MB
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: bigStr, password: 'test' })
    });
    const body = await res.json().catch(() => ({}));
    assert('VULN-005 Payload Too Large (413)', 
      res.status === 413, 
      `status=${res.status} (expected 413, got ${res.status}), err="${body.error}"`
    );
  } catch (e) {
    assert('VULN-005 Payload Too Large', false, e.message);
  }

  // 3. Unauthenticated Code Execution Blocked (VULN-003)
  try {
    const res = await fetch(`${BASE}/api/code/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python', sourceCode: 'print(42)', stdin: '' })
    });
    const body = await res.json().catch(() => ({}));
    assert('VULN-003 Code Run Auth Guard', 
      res.status === 401, 
      `status=${res.status} (expected 401), msg="${body.error}"`
    );
  } catch (e) {
    assert('VULN-003 Code Run Auth Guard', false, e.message);
  }

  // 4. Unauthenticated Code Submit Blocked (VULN-003)
  try {
    const res = await fetch(`${BASE}/api/code/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python', sourceCode: 'print(42)', stdin: '' })
    });
    const body = await res.json().catch(() => ({}));
    assert('VULN-003 Code Submit Auth Guard', 
      res.status === 401, 
      `status=${res.status} (expected 401), msg="${body.error}"`
    );
  } catch (e) {
    assert('VULN-003 Code Submit Auth Guard', false, e.message);
  }

  // 5. Account Enumeration Normalization (VULN-007)
  try {
    // Attempt registration with an existing email
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Candidate',
        email: 'sectest_1789967861552@example.com',
        mobile: '9876543210',
        college: 'Test College',
        degree: 'B.Tech',
        branch: 'CS',
        specialization: 'General',
        state: 'MH',
        city: 'Mumbai',
        password: 'Password@123'
      })
    });
    const data = await res.json().catch(() => ({}));
    // Should NOT explicitly reveal "An account with this email already exists"
    const isGeneric = data.error && !data.error.includes('An account with this email already exists');
    assert('VULN-007 Account Enumeration Guard', 
      isGeneric, 
      `status=${res.status}, error="${data.error}"`
    );
  } catch (e) {
    assert('VULN-007 Account Enumeration Guard', false, e.message);
  }

  // 6. Unauthenticated Assessment Submission Blocked (VULN-002)
  try {
    const res = await fetch(`${BASE}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId: 'asm-fake-nonexistent',
        score: 100,
        accuracy: 100,
        categoryScores: { aptitude: 100, reasoning: 100, technical: 100 },
        answers: {},
        questionIds: []
      })
    });
    const data = await res.json().catch(() => ({}));
    assert('VULN-002 Unauthenticated Assessment Submission Blocked', 
      res.status === 401, 
      `status=${res.status} (expected 401), err="${data.error}"`
    );
  } catch (e) {
    assert('VULN-002 Unauthenticated Assessment Submission Blocked', false, e.message);
  }

  // 7. Unauthenticated Candidate endpoints blocked
  try {
    const res = await fetch(`${BASE}/api/candidates`);
    assert('RBAC Candidates List Guard', res.status === 401, `status=${res.status}`);
  } catch (e) {
    assert('RBAC Candidates List Guard', false, e.message);
  }

  // 8. Unauthenticated Admin stats blocked
  try {
    const res = await fetch(`${BASE}/api/admin/stats`);
    assert('RBAC Admin Stats Guard', res.status === 401, `status=${res.status}`);
  } catch (e) {
    assert('RBAC Admin Stats Guard', false, e.message);
  }

  // 9. Unauthenticated Questions bank blocked
  try {
    const res = await fetch(`${BASE}/api/questions`);
    assert('RBAC Question Bank Guard', res.status === 401, `status=${res.status}`);
  } catch (e) {
    assert('RBAC Question Bank Guard', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} / ${total} PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('====================================================\n');
}

runVerification().catch(e => console.error('Verification failed:', e));
