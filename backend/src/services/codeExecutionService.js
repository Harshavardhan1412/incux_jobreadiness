import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Robust Multi-Language Code Execution Sandbox
 * Supports Python, JavaScript (Node), C++ (GCC), and Java (OpenJDK).
 * Executes code in isolated temporary directories with strict timeouts and memory safety.
 */

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'cpp', 'c++', 'java'];

export const isLanguageSupported = (lang) => {
  if (!lang) return false;
  return SUPPORTED_LANGUAGES.includes(lang.toLowerCase().trim());
};

const normalizeLanguage = (lang) => {
  const l = (lang || '').toLowerCase().trim();
  if (l === 'c++' || l === 'cpp') return 'cpp';
  if (l === 'js' || l === 'javascript' || l === 'node') return 'javascript';
  if (l === 'py' || l === 'python' || l === 'python3') return 'python';
  if (l === 'java') return 'java';
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

    const proc = spawn(cmd, args, {
      cwd,
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 1024 * 512 // 512 KB max buffer
    });

    // Enforce manual timer backup in case OS spawn timeout hangs
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        proc.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs + 200);

    if (stdin) {
      try {
        proc.stdin.write(stdin);
        proc.stdin.end();
      } catch (e) {
        // Stream may have closed
      }
    } else {
      try {
        proc.stdin.end();
      } catch (e) {}
    }

    proc.stdout.on('data', (data) => {
      if (stdout.length < 50000) {
        stdout += data.toString();
      }
    });

    proc.stderr.on('data', (data) => {
      if (stderr.length < 50000) {
        stderr += data.toString();
      }
    });

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
 * Executes a single snippet with provided standard input
 */
export const executeSingleCode = async ({
  language,
  sourceCode,
  stdin = '',
  timeoutMs = 4000
}) => {
  const lang = normalizeLanguage(language);
  if (!isLanguageSupported(lang)) {
    return {
      status: 'Unsupported Language',
      exitCode: 1,
      stdout: '',
      stderr: `Language '${language}' is not supported. Supported: python, javascript, cpp, java`,
      timeMs: 0
    };
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `rsj-exec-${lang}-`));

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

    if (lang === 'cpp') {
      const srcPath = path.join(tmpDir, 'solution.cpp');
      const binPath = path.join(tmpDir, 'solution.exe');
      await fs.writeFile(srcPath, sourceCode, 'utf-8');

      // 1. Compile C++ with -O2 optimization
      const compileRes = await spawnProcess('g++', ['-O2', srcPath, '-o', binPath], '', tmpDir, 6000);
      if (compileRes.exitCode !== 0) {
        return {
          status: 'Compilation Error',
          exitCode: compileRes.exitCode,
          stdout: '',
          stderr: compileRes.stderr || 'C++ compilation failed.',
          timeMs: compileRes.timeMs
        };
      }

      // 2. Execute compiled binary
      return await spawnProcess(binPath, [], stdin, tmpDir, timeoutMs);
    }

    if (lang === 'java') {
      // Detect public class name from code or default to Main / Solution
      const match = sourceCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      let className = match ? match[1] : 'Main';
      let javaCode = sourceCode;

      if (!match && !sourceCode.includes('class Main') && !sourceCode.includes('class Solution')) {
        className = 'Main';
        javaCode = `public class Main {\n${sourceCode}\n}`;
      }

      const srcPath = path.join(tmpDir, `${className}.java`);
      await fs.writeFile(srcPath, javaCode, 'utf-8');

      // 1. Compile Java
      const compileRes = await spawnProcess('javac', [srcPath], '', tmpDir, 8000);
      if (compileRes.exitCode !== 0) {
        return {
          status: 'Compilation Error',
          exitCode: compileRes.exitCode,
          stdout: '',
          stderr: compileRes.stderr || 'Java compilation failed.',
          timeMs: compileRes.timeMs
        };
      }

      // 2. Run Java bytecode
      return await spawnProcess('java', ['-cp', tmpDir, className], stdin, tmpDir, timeoutMs);
    }
  } finally {
    // Clean up temporary sandbox directory safely
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
};

/**
 * Normalizes string output for whitespace-resilient comparisons
 */
const cleanOutput = (str) => {
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
 * Runs code against a test case suite and calculates verdict and pass rate
 */
export const evaluateCodeAgainstTestCases = async ({
  language,
  sourceCode,
  testCases = [],
  includeHiddenDetails = false,
  timeoutMs = 4000
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
  let overallVerdict = 'Accepted';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const isHidden = Boolean(tc.isHidden ?? tc.is_hidden ?? false);
    const input = String(tc.input ?? '');
    const expected = cleanOutput(String(tc.expectedOutput ?? tc.expected_output ?? ''));

    // If previous test failed due to compilation error, no need to re-compile
    if (hasCompilationError) {
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: 'Compilation Error',
        passed: false,
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
      overallVerdict = 'Compilation Error';
      results.push({
        id: tc.id || (i + 1),
        isHidden,
        status: 'Compilation Error',
        passed: false,
        stderr: execRes.stderr,
        timeMs: execRes.timeMs
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
        timeMs: execRes.timeMs,
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
        timeMs: execRes.timeMs
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

    // For hidden test cases, protect answer confidentiality unless requested
    if (isHidden && !includeHiddenDetails) {
      results.push({
        id: tc.id || (i + 1),
        isHidden: true,
        status: passed ? 'Passed' : 'Wrong Answer',
        passed,
        timeMs: execRes.timeMs
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
        timeMs: execRes.timeMs
      });
    }
  }

  const scorePercentage = Math.round((passedCount / testCases.length) * 100);

  return {
    passed: passedCount === testCases.length,
    totalTests: testCases.length,
    passedTests: passedCount,
    score: scorePercentage,
    verdict: overallVerdict,
    testResults: results
  };
};
