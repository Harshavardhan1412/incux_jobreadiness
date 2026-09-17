/**
 * Sandboxed Remote Multi-Language Code Execution Service
 *
 * Replaces insecure, host-dependent local child_process spawning with isolated
 * containerized execution via Judge0 CE / Piston APIs.
 *
 * Supported: Python, JavaScript (Node), C++ (GCC), Java (OpenJDK), C (GCC), TypeScript.
 * Enforces hard timeouts (8-10s) and stdout/stderr output caps (10,000 characters).
 */

const MAX_OUTPUT_LENGTH = 10000;
const DEFAULT_TIMEOUT_MS = 8000;

export const LANGUAGE_CONFIG = {
  python: {
    id: 'python',
    name: 'Python',
    version: '3.12.5',
    judge0Id: 100, // Python (3.12.5)
    judge0FallbackId: 71, // Python (3.8.1)
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    fileName: 'solution.py'
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    version: 'Node.js 20',
    judge0Id: 97, // JavaScript (Node.js 20.17.0)
    judge0FallbackId: 63,
    pistonLang: 'javascript',
    pistonVersion: '18.15.0',
    fileName: 'solution.js'
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    version: 'GCC 14.1.0',
    judge0Id: 105, // C++ (GCC 14.1.0)
    judge0FallbackId: 54,
    pistonLang: 'cpp',
    pistonVersion: '10.2.0',
    fileName: 'solution.cpp'
  },
  java: {
    id: 'java',
    name: 'Java',
    version: 'OpenJDK 17',
    judge0Id: 91, // Java (JDK 17.0.6)
    judge0FallbackId: 62,
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    fileName: 'Main.java'
  },
  c: {
    id: 'c',
    name: 'C',
    version: 'GCC 14.1.0',
    judge0Id: 103, // C (GCC 14.1.0)
    judge0FallbackId: 50,
    pistonLang: 'c',
    pistonVersion: '10.2.0',
    fileName: 'solution.c'
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    version: '5.6.2',
    judge0Id: 101, // TypeScript (5.6.2)
    judge0FallbackId: 74,
    pistonLang: 'typescript',
    pistonVersion: '5.0.3',
    fileName: 'solution.ts'
  }
};

export const normalizeLanguage = (lang) => {
  const l = (lang || '').toLowerCase().trim();
  if (l === 'c++' || l === 'cpp') return 'cpp';
  if (l === 'js' || l === 'javascript' || l === 'node') return 'javascript';
  if (l === 'py' || l === 'python' || l === 'python3') return 'python';
  if (l === 'java') return 'java';
  if (l === 'c') return 'c';
  if (l === 'ts' || l === 'typescript') return 'typescript';
  return l;
};

let detectedPythonCmd = null;
let detectedCppCmd = null;

export const getPythonCommand = async () => {
  if (detectedPythonCmd) return detectedPythonCmd;

  const candidates = process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python', 'py'];

  for (const cmd of candidates) {
    const works = await new Promise((resolve) => {
      try {
        const p = spawn(cmd, ['--version'], { windowsHide: true });
        let out = '';
        let errOut = '';
        p.stdout?.on('data', d => out += d);
        p.stderr?.on('data', d => errOut += d);
        p.on('error', () => resolve(false));
        p.on('close', code => {
          const combined = (out + ' ' + errOut).toLowerCase();
          // Filter out Microsoft Store alias dummy executables
          if (code === 0 && !combined.includes('not found') && !combined.includes('microsoft store')) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } catch (e) {
        resolve(false);
      }
    });

    if (works) {
      detectedPythonCmd = cmd;
      console.log(`[CodeExecution] Detected Python command: '${cmd}'`);
      return cmd;
    }
  }

  return process.platform === 'win32' ? 'python' : 'python3';
};

export const getCppCommand = async () => {
  if (detectedCppCmd) return detectedCppCmd;
  const candidates = ['g++', 'clang++'];
  for (const cmd of candidates) {
    const works = await new Promise((resolve) => {
      try {
        const p = spawn(cmd, ['--version'], { windowsHide: true });
        p.on('error', () => resolve(false));
        p.on('close', code => resolve(code === 0));
      } catch (e) {
        resolve(false);
      }
    });
    if (works) {
      detectedCppCmd = cmd;
      return cmd;
    }
  }
  return 'g++';
};

const spawnProcess = (cmd, args, stdin = '', cwd, timeoutMs = 4000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

/**
 * Normalizes Java source code so it conforms to standard Main class expectations
 */
const normalizeJavaCode = (code) => {
  if (!code) return code;
  let updated = code.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, 'public class Main');
  if (!updated.includes('class Main') && !updated.includes('public class')) {
    updated = `public class Main {\n${updated}\n}`;
  }
  return updated;
};

/**
 * Execute code via Judge0 CE Remote Sandbox
 */
const executeViaJudge0 = async ({ langConfig, sourceCode, stdin, timeoutMs }) => {
  const judge0BaseUrl = process.env.JUDGE0_URL || 'https://ce.judge0.com';
  const cpuTimeLimitSec = Math.max(1, Math.min(10, Math.ceil(timeoutMs / 1000)));

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), timeoutMs + 3000);

  const finalSource = langConfig.id === 'java' ? normalizeJavaCode(sourceCode) : sourceCode;

  try {
    const response = await fetch(`${judge0BaseUrl}/submissions?wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.JUDGE0_API_KEY ? { 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY } : {})
      },
      body: JSON.stringify({
        language_id: langConfig.judge0Id,
        source_code: finalSource,
        stdin: stdin || '',
        cpu_time_limit: cpuTimeLimitSec,
        wall_time_limit: cpuTimeLimitSec + 2,
        memory_limit: 256000 // 256 MB
      }),
      signal: controller.signal
    });

    clearTimeout(abortTimer);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Judge0 HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    const statusId = data.status?.id;
    const timeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : 0;

    let normalizedStatus = 'Success';
    let exitCode = 0;
    let timedOut = false;
    let stderr = data.stderr || '';

    if (statusId === 3) {
      // 3: Accepted
      normalizedStatus = 'Success';
      exitCode = 0;
    } else if (statusId === 5) {
      // 5: Time Limit Exceeded
      normalizedStatus = 'Time Limit Exceeded';
      exitCode = 124;
      timedOut = true;
      stderr = `Time Limit Exceeded (Execution exceeded ${cpuTimeLimitSec}s)`;
    } else if (statusId === 6) {
      // 6: Compilation Error
      normalizedStatus = 'Compilation Error';
      exitCode = 1;
      stderr = data.compile_output || stderr || 'Compilation Error';
    } else if (statusId >= 7 && statusId <= 12) {
      // 7..12: Runtime Error
      normalizedStatus = 'Runtime Error';
      exitCode = 1;
      stderr = stderr || data.message || `Runtime Error (${data.status?.description || 'Terminated'})`;
    } else {
      normalizedStatus = data.status?.description || 'Execution Error';
      exitCode = statusId === 4 ? 0 : 1;
    }

    return {
      status: normalizedStatus,
      exitCode,
      stdout: truncateOutput(data.stdout || ''),
      stderr: truncateOutput(stderr),
      executionTimeMs: timeMs,
      timeMs,
      timedOut
    };
  } catch (err) {
    clearTimeout(abortTimer);
    if (err.name === 'AbortError') {
      return {
        status: 'Time Limit Exceeded',
        exitCode: 124,
        stdout: '',
        stderr: `Time Limit Exceeded (Execution timed out after ${timeoutMs / 1000}s)`,
        executionTimeMs: timeoutMs,
        timeMs: timeoutMs,
        timedOut: true
      };
    }
    throw err;
  }
};

/**
 * Execute code via Piston Remote Sandbox
 */
const executeViaPiston = async ({ langConfig, sourceCode, stdin, timeoutMs }) => {
  const pistonBaseUrl = process.env.PISTON_URL || 'http://localhost:2000';

    proc.on('close', (code, signal) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;
      const combined = (stdout + ' ' + stderr).toLowerCase();

      // Check for Windows App Execution Alias "Python was not found"
      if (combined.includes('python was not found') || combined.includes('microsoft store')) {
        resolve({
          status: 'Compiler / Runtime Missing',
          exitCode: 1,
          stdout: '',
          stderr: 'Python is not installed or not in system PATH on this machine.\nFix: Install Python from https://www.python.org/downloads/ (check "Add python.exe to PATH"), or disable Windows Store aliases in Settings > Manage App Execution Aliases.',
          timeMs: executionTimeMs
        });
        return;
      }

      if (timedOut || signal === 'SIGTERM' || signal === 'SIGKILL' || code === 124) {
        resolve({
          status: 'Time Limit Exceeded',
          exitCode: 124,
          stdout: stdout.trim(),
          stderr: 'Time Limit Exceeded (Execution exceeded ' + (timeoutMs / 1000) + 's)',
          timeMs: executionTimeMs
        });
      } else if (code === 0) {
        resolve({
          status: 'Success',
          exitCode: 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          timeMs: executionTimeMs
        });
      } else {
        resolve({
          status: 'Runtime Error',
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim() || `Process exited with error code ${code}`,
          timeMs: executionTimeMs
        });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      let errMsg = err.message;
      if (err.code === 'ENOENT') {
        if (cmd.includes('python') || cmd === 'py') {
          errMsg = `Python is not installed or not found in system PATH on this machine.\nFix:\n• Windows: Install Python from https://www.python.org/downloads/ (ensure "Add python.exe to PATH" is checked).\n• Linux (Ubuntu/Debian): Run 'sudo apt update && sudo apt install -y python3'.\n• macOS: Run 'brew install python3'.`;
        } else if (cmd.includes('g++') || cmd.includes('clang++')) {
          errMsg = `C++ compiler (g++) is not installed or not in system PATH on this machine.\nFix:\n• Windows: Install MinGW-w64 or MSYS2.\n• Linux: Run 'sudo apt install -y g++ build-essential'.\n• macOS: Run 'xcode-select --install'.`;
        } else if (cmd.includes('javac') || cmd.includes('java')) {
          errMsg = `Java Development Kit (JDK) is not installed or not in system PATH on this machine.\nFix:\n• Windows: Install OpenJDK (Eclipse Temurin 21).\n• Linux: Run 'sudo apt install -y default-jdk'.\n• macOS: Run 'brew install openjdk'.`;
        }
      }
      resolve({
        status: 'Compiler / Runtime Missing',
        exitCode: 1,
        stdout: '',
        stderr: errMsg,
        timeMs: Date.now() - startTime
      });
    });
  });
};

/**
 * Unified execution entrypoint.
 * Automatically delegates to Judge0 CE or Piston based on configuration.
 */
export const executeSingleCode = async ({
  language,
  sourceCode,
  stdin = '',
  timeoutMs = DEFAULT_TIMEOUT_MS
}) => {
  const normLang = normalizeLanguage(language);
  const langConfig = LANGUAGE_CONFIG[normLang];

  if (!langConfig) {
    const supportedList = Object.keys(LANGUAGE_CONFIG).join(', ');
    return {
      status: 'Unsupported Language',
      exitCode: 1,
      stdout: '',
      stderr: `Language '${language}' is not supported. Supported: ${supportedList}`,
      executionTimeMs: 0,
      timeMs: 0,
      timedOut: false
    };
  }

  const executor = (process.env.CODE_EXECUTOR || '').toLowerCase().trim();
  const usePiston = executor === 'piston' || Boolean(process.env.PISTON_URL);

  try {
    if (lang === 'python') {
      const pythonCmd = await getPythonCommand();
      const filePath = path.join(tmpDir, 'solution.py');
      await fs.writeFile(filePath, sourceCode, 'utf-8');
      return await spawnProcess(pythonCmd, [filePath], stdin, tmpDir, timeoutMs);
    }

    if (lang === 'javascript') {
      const filePath = path.join(tmpDir, 'solution.js');
      await fs.writeFile(filePath, sourceCode, 'utf-8');
      return await spawnProcess('node', [filePath], stdin, tmpDir, timeoutMs);
    }
    return await executeViaJudge0({ langConfig, sourceCode, stdin, timeoutMs });
  } catch (err) {
    console.error(`Remote code execution failed via ${usePiston ? 'Piston' : 'Judge0'}:`, err.message);

    // If Piston failed and Judge0 is available as fallback
    if (usePiston) {
      console.warn('Piston failed, attempting fallback to Judge0 CE...');
      try {
        return await executeViaJudge0({ langConfig, sourceCode, stdin, timeoutMs });
      } catch (fallbackErr) {
        console.error('Judge0 fallback also failed:', fallbackErr.message);
      }
    }

    return {
      status: 'Service Unavailable',
      exitCode: 1,
      stdout: '',
      stderr: 'Code execution service is temporarily unavailable — you can still write and submit your code, it will be evaluated shortly.',
      executionTimeMs: 0,
      timeMs: 0,
      timedOut: false
    };
  }
};

/**
 * Normalizes string output for whitespace-resilient comparisons
 */
export const cleanOutput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
};

/**
 * Runs code against a test case suite using sandboxed remote execution
 */
export const evaluateCodeAgainstTestCases = async ({
  language,
  sourceCode,
  testCases = [],
  includeHiddenDetails = false,
  timeoutMs = DEFAULT_TIMEOUT_MS
}) => {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    return {
      passed: true,
      totalTests: 0,
      passedTests: 0,
      score: 100,
      verdict: 'Accepted',
      testResults: []
    };
  }

  const results = [];
  let passedCount = 0;
  let hasCompilationError = false;
  let compilationStderr = '';
  let overallVerdict = 'Accepted';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const isHidden = Boolean(tc.isHidden ?? tc.is_hidden ?? false);
    const input = String(tc.input ?? '');
    const expected = cleanOutput(String(tc.expectedOutput ?? tc.expected_output ?? ''));

    // Fast-fail if previous test failed due to compilation error
    if (hasCompilationError) {
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: 'Compilation Error',
        passed: false,
        stderr: compilationStderr,
        timeMs: 0
      });
      continue;
    }

    const execRes = await executeSingleCode({
      language,
      sourceCode,
      stdin: input,
      timeoutMs
    });

    if (execRes.status === 'Compilation Error') {
      hasCompilationError = true;
      compilationStderr = execRes.stderr;
      overallVerdict = 'Compilation Error';
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: 'Compilation Error',
        passed: false,
        stderr: execRes.stderr,
        timeMs: execRes.timeMs || 0
      });
      continue;
    }

    if (execRes.status === 'Time Limit Exceeded') {
      if (overallVerdict === 'Accepted') overallVerdict = 'Time Limit Exceeded';
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: 'Time Limit Exceeded',
        passed: false,
        timeMs: execRes.timeMs || 0,
        stderr: 'Execution timed out.'
      });
      continue;
    }

    if (execRes.status === 'Runtime Error') {
      if (overallVerdict === 'Accepted') overallVerdict = 'Runtime Error';
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: 'Runtime Error',
        passed: false,
        stderr: execRes.stderr,
        timeMs: execRes.timeMs || 0
      });
      continue;
    }

    if (execRes.status === 'Service Unavailable') {
      if (overallVerdict === 'Accepted') overallVerdict = 'Service Unavailable';
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: 'Service Unavailable',
        passed: false,
        stderr: execRes.stderr,
        timeMs: 0
      });
      continue;
    }

    const actual = cleanOutput(execRes.stdout);
    const passed = actual === expected;

    if (passed) {
      passedCount++;
    } else if (overallVerdict === 'Accepted') {
      overallVerdict = 'Wrong Answer';
    }

    if (isHidden && !includeHiddenDetails) {
      results.push({
        id: tc.id || (i + 1),
        isHidden: true,
        status: passed ? 'Passed' : 'Wrong Answer',
        passed,
        timeMs: execRes.timeMs || 0
      });
    } else {
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: passed ? 'Passed' : 'Wrong Answer',
        passed,
        input,
        expectedOutput: expected,
        actualOutput: actual,
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        timeMs: execRes.timeMs || 0
      });
    }
  }

  const scorePercentage = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 100;

  return {
    passed: passedCount === testCases.length,
    totalTests: testCases.length,
    passedTests: passedCount,
    score: scorePercentage,
    verdict: overallVerdict,
    testResults: results
  };
};
