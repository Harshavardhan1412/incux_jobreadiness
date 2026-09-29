/**
 * Client-Side Resume Parsing & ATS Intelligence Engine
 * Extracts Candidate Details, Technical Stack, Projects, compares with target job role benchmarks,
 * calculates ATS match, extracts skill gaps, and generates moderate-level interview questions.
 */

export const KNOWN_SKILLS = [
  // Web & Full Stack
  'React', 'React.js', 'Next.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'TailwindCSS',
  'Node.js', 'Express', 'NestJS', 'GraphQL', 'REST APIs', 'WebSockets', 'Vite', 'Webpack',
  // Backend & Systems
  'Python', 'Django', 'FastAPI', 'Flask', 'Java', 'Spring Boot', 'Go', 'Golang', 'C++', 'C#', '.NET',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL', 'Prisma', 'Hibernate', 'Microservices', 'System Design',
  // AI, Machine Learning & Data Science
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy',
  'Computer Vision', 'NLP', 'Natural Language Processing', 'LLMs', 'RAG', 'Hugging Face', 'Data Analysis',
  'Data Science', 'Data Preprocessing', 'Model Training', 'Model Evaluation', 'Statistics',
  // Cloud, DevOps & Tools
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'GitHub', 'Linux',
  'Kafka', 'RabbitMQ', 'Jest', 'Unit Testing', 'Power BI', 'Tableau'
];

/**
 * Benchmark skills by technical category for role alignment & skill gap suggestions.
 */
export const ROLE_BENCHMARK_SKILLS = {
  ml: {
    coreSkills: ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'Model Training', 'PyTorch', 'Data Preprocessing', 'Model Evaluation'],
    advancedSkills: ['TensorFlow', 'Deep Learning', 'FastAPI', 'Docker', 'MLOps', 'Hyperparameter Tuning', 'NLP', 'Computer Vision']
  },
  data: {
    coreSkills: ['SQL', 'Python', 'Pandas', 'Data Cleaning', 'Data Visualization', 'Exploratory Analysis', 'Statistics'],
    advancedSkills: ['Power BI', 'Tableau', 'A/B Testing', 'Machine Learning', 'BigQuery', 'ETL Pipelines']
  },
  frontend: {
    coreSkills: ['React', 'JavaScript', 'TypeScript', 'HTML5/CSS3', 'Responsive UI', 'REST API Integration', 'State Management'],
    advancedSkills: ['Next.js', 'TailwindCSS', 'Redux / Zustand', 'Performance Optimization', 'Jest / Testing', 'WebSockets']
  },
  backend: {
    coreSkills: ['Node.js', 'Express', 'PostgreSQL', 'RESTful APIs', 'JWT Authentication', 'Database Schema', 'SQL'],
    advancedSkills: ['Redis', 'Docker', 'Microservices', 'GraphQL', 'Prisma / ORM', 'CI/CD Pipelines']
  },
  devops: {
    coreSkills: ['Docker', 'CI/CD Pipelines', 'Linux', 'AWS Cloud', 'Git', 'Containerization'],
    advancedSkills: ['Kubernetes', 'Terraform', 'Prometheus / Grafana', 'Helm', 'Bash Scripting', 'Security & IAM']
  },
  fullstack: {
    coreSkills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'JavaScript', 'TypeScript', 'Git', 'Database Schema'],
    advancedSkills: ['Docker', 'Redis', 'Next.js', 'TailwindCSS', 'System Design', 'CI/CD']
  }
};

/**
 * Categorizes any job role title into a recognized technical domain.
 */
export const getRoleCategory = (role = '') => {
  const r = (role || '').toLowerCase();
  if (r.includes('ml') || r.includes('machine learning') || r.includes('ai') || r.includes('artificial intelligence') || r.includes('deep learning') || r.includes('computer vision') || r.includes('nlp')) {
    return 'ml';
  }
  if (r.includes('data science') || r.includes('data scientist') || r.includes('data analyst') || r.includes('analytics') || r.includes('bi analyst')) {
    return 'data';
  }
  if (r.includes('frontend') || r.includes('front-end') || r.includes('react') || r.includes('ui') || r.includes('web developer')) {
    return 'frontend';
  }
  if (r.includes('backend') || r.includes('back-end') || r.includes('node') || r.includes('java') || r.includes('api') || r.includes('spring') || r.includes('django')) {
    return 'backend';
  }
  if (r.includes('devops') || r.includes('cloud') || r.includes('docker') || r.includes('kubernetes') || r.includes('platform') || r.includes('sre') || r.includes('infrastructure')) {
    return 'devops';
  }
  if (r.includes('mobile') || r.includes('android') || r.includes('ios') || r.includes('flutter') || r.includes('react native')) {
    return 'mobile';
  }
  return 'fullstack';
};

/**
 * Provides domain-specific default skills and realistic projects based on target role.
 */
export const getRoleDefaults = (role = 'Software Engineer') => {
  const category = getRoleCategory(role);
  switch (category) {
    case 'ml':
      return {
        skills: ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'Model Training', 'PyTorch'],
        featuredProject: 'Predictive Machine Learning Classification Pipeline with Model Evaluation'
      };
    case 'data':
      return {
        skills: ['SQL', 'Python', 'Pandas', 'Data Cleaning', 'Data Visualization', 'Exploratory Analysis'],
        featuredProject: 'Customer Insights & Business Intelligence Analytics Dashboard'
      };
    case 'frontend':
      return {
        skills: ['React', 'JavaScript', 'TypeScript', 'HTML5/CSS3', 'Responsive UI', 'REST API Integration'],
        featuredProject: 'Interactive Web Application with Responsive Component Architecture'
      };
    case 'backend':
      return {
        skills: ['Node.js', 'Express', 'PostgreSQL', 'RESTful APIs', 'JWT Authentication', 'Database Schema'],
        featuredProject: 'Scalable Backend REST API Service with Authentication & Database Integration'
      };
    case 'devops':
      return {
        skills: ['Docker', 'CI/CD Pipelines', 'Linux', 'AWS Cloud', 'Git', 'Containerization'],
        featuredProject: 'Automated Containerized CI/CD Deployment Pipeline on Cloud'
      };
    case 'mobile':
      return {
        skills: ['React Native', 'JavaScript', 'Mobile UI/UX', 'State Management', 'REST APIs', 'Git'],
        featuredProject: 'Cross-Platform Mobile Application with Offline Sync & Clean Navigation'
      };
    case 'fullstack':
    default:
      return {
        skills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'JavaScript', 'Git'],
        featuredProject: 'Full Stack Web Application with Responsive Frontend and Secure REST API'
      };
  }
};

/**
 * Analyzes candidate skills against the target role's core & advanced skill benchmark.
 * Returns matched skills, missing skills (skills to cover), and calculated ATS score.
 */
export const analyzeRoleSkillGaps = (candidateSkills = [], targetRole = 'Software Engineer') => {
  const category = getRoleCategory(targetRole);
  const benchmark = ROLE_BENCHMARK_SKILLS[category] || ROLE_BENCHMARK_SKILLS.fullstack;
  const candidateLower = (candidateSkills || []).map(s => s.toLowerCase());

  const matchedCore = benchmark.coreSkills.filter(s =>
    candidateLower.some(c => c === s.toLowerCase() || c.includes(s.toLowerCase()) || s.toLowerCase().includes(c))
  );

  const missingCore = benchmark.coreSkills.filter(s =>
    !candidateLower.some(c => c === s.toLowerCase() || c.includes(s.toLowerCase()) || s.toLowerCase().includes(c))
  );

  const recommendedAdvanced = benchmark.advancedSkills.filter(s =>
    !candidateLower.some(c => c === s.toLowerCase() || c.includes(s.toLowerCase()) || s.toLowerCase().includes(c))
  ).slice(0, 4);

  const matchRatio = benchmark.coreSkills.length > 0 ? (matchedCore.length / benchmark.coreSkills.length) : 0.8;
  const atsScore = Math.min(97, Math.max(68, Math.round(65 + (matchRatio * 28) + (candidateSkills.length > 4 ? 4 : 1))));

  return {
    matchedCore,
    missingCore,
    skillsToCover: [...missingCore, ...recommendedAdvanced.slice(0, 2)],
    recommendedAdvanced,
    atsScore,
    matchPercentage: Math.round(matchRatio * 100)
  };
};

/**
 * Parse raw resume text and extract candidate info, detected skills, projects, and ATS score.
 */
export const parseResumeText = (rawText, targetRole = 'Software Engineer') => {
  const text = rawText || '';
  const roleDefaults = getRoleDefaults(targetRole);

  // 1. Extract Detected Skills from text
  const detectedSkills = [];
  KNOWN_SKILLS.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      if (!detectedSkills.includes(skill)) {
        detectedSkills.push(skill);
      }
    }
  });

  // Supplement with role-aligned skills if detected count is minimal
  if (detectedSkills.length === 0) {
    detectedSkills.push(...roleDefaults.skills);
  } else if (detectedSkills.length < 3) {
    roleDefaults.skills.forEach(s => {
      if (!detectedSkills.includes(s)) detectedSkills.push(s);
    });
  }

  // 2. Extract Candidate Name (First non-empty line or default)
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let candidateName = 'Candidate';
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].toLowerCase().includes('resume') && !lines[0].toLowerCase().includes('curriculum')) {
    candidateName = lines[0].replace(/^[#\*\s]+/, '').trim();
  }

  // 3. Extract Project Highlights
  const projectKeywords = ['project', 'developed', 'architected', 'built', 'created', 'implemented', 'engine', 'platform', 'app', 'model', 'pipeline', 'system'];
  const projectLines = lines.filter((line) => {
    const lower = line.toLowerCase();
    return projectKeywords.some((kw) => lower.includes(kw)) && line.length > 20 && line.length < 160;
  });

  const featuredProject = projectLines.length > 0
    ? projectLines[0].replace(/^[•\-\*\d\.\s]+/, '').trim()
    : roleDefaults.featuredProject;

  // 4. Calculate Role-Aware Skill Gap & ATS Score
  const skillGaps = analyzeRoleSkillGaps(detectedSkills, targetRole);
  const atsScore = skillGaps.atsScore;

  return {
    candidateName,
    atsScore,
    skills: detectedSkills,
    featuredProject,
    targetRole,
    skillGaps,
    wordCount: text.split(/\s+/).filter(Boolean).length
  };
};

/**
 * Generate 5 Targeted, Moderate-Level (Basic to Mid-Level) Interview Questions.
 *
 * Requirements:
 * 1. Question 1 MUST ALWAYS BE "Tell me about yourself..." tailored to the candidate's skills & target role.
 * 2. Questions 2-5 MUST be moderate / approachable, directly addressing the candidate's target job role
 *    and resume project/skills, avoiding hyper-difficult staff-level queries.
 */
export const generateResumeQuestions = (resumeData, targetRole = 'Software Engineer') => {
  const role = targetRole || 'Software Engineer';
  const category = getRoleCategory(role);
  const defaults = getRoleDefaults(role);

  // Filter skills to prioritize those relevant to the category
  const allSkills = resumeData?.skills && resumeData.skills.length > 0 ? resumeData.skills : defaults.skills;
  const topSkillsStr = allSkills.slice(0, 3).join(', ');
  const project = resumeData?.featuredProject || defaults.featuredProject;

  switch (category) {
    case 'ml':
      return [
        {
          questionNumber: 1,
          category: 'INTRODUCTION & PROFILE',
          questionText: `Tell me about yourself, your background in ${topSkillsStr}, and what sparked your interest in becoming a ${role}.`
        },
        {
          questionNumber: 2,
          category: 'RESUME PROJECT OVERVIEW',
          questionText: `In your resume, you worked on "${project}". Could you explain the problem statement, which machine learning algorithm or model you selected, and how you evaluated its performance?`
        },
        {
          questionNumber: 3,
          category: 'CORE CONCEPTS & WORKFLOW',
          questionText: `In a standard machine learning workflow, how do you handle missing values or feature scaling, and how do you check whether a model is underfitting or overfitting?`
        },
        {
          questionNumber: 4,
          category: 'PRACTICAL APPLICATION',
          questionText: `What is the difference between Precision and Recall, and in what kind of real-world scenario would you prioritize Precision over Recall (or vice versa)?`
        },
        {
          questionNumber: 5,
          category: 'DEPLOYMENT & BEST PRACTICES',
          questionText: `Once a model is trained and validated, how do you typically export or serve it (for example via an API endpoint with Flask/FastAPI or Docker) so that other applications can consume its predictions?`
        }
      ];

    case 'data':
      return [
        {
          questionNumber: 1,
          category: 'INTRODUCTION & PROFILE',
          questionText: `Tell me about yourself, your background working with data and ${topSkillsStr}, and what excites you about this ${role} position.`
        },
        {
          questionNumber: 2,
          category: 'RESUME PROJECT OVERVIEW',
          questionText: `Could you walk me through your work on "${project}"? What were the main business questions you were trying to answer and what insights did you uncover?`
        },
        {
          questionNumber: 3,
          category: 'SQL & DATA TRANSFORMATION',
          questionText: `When querying relational datasets with SQL, how do you decide when to use different types of JOINs, GROUP BY aggregations, and filtering conditions for accurate reporting?`
        },
        {
          questionNumber: 4,
          category: 'DATA CLEANING & VALIDATION',
          questionText: `When you receive messy or incomplete raw data, what is your step-by-step checklist to clean, validate, and verify the data before presenting results?`
        },
        {
          questionNumber: 5,
          category: 'COMMUNICATION & VISUALIZATION',
          questionText: `How do you decide which charts (such as bar charts, line graphs, or heatmaps) best communicate trends and metrics to non-technical stakeholders?`
        }
      ];

    case 'frontend':
      return [
        {
          questionNumber: 1,
          category: 'INTRODUCTION & PROFILE',
          questionText: `Tell me about yourself, your experience building user interfaces with ${topSkillsStr}, and what excites you about this ${role} position.`
        },
        {
          questionNumber: 2,
          category: 'RESUME PROJECT OVERVIEW',
          questionText: `Can you walk me through your project "${project}"? How did you break down the UI into reusable components and manage user interactions?`
        },
        {
          questionNumber: 3,
          category: 'COMPONENT STATE & LIFECYCLE',
          questionText: `In React, how do you manage component state and side effects (like fetching data with useEffect or handling form inputs), and how do you ensure the UI remains smooth?`
        },
        {
          questionNumber: 4,
          category: 'API INTEGRATION & USER EXPERIENCE',
          questionText: `When connecting a front-end view to a backend REST API, how do you handle loading spinners, error states, and responsive styling across mobile and desktop screens?`
        },
        {
          questionNumber: 5,
          category: 'CODE QUALITY & BEST PRACTICES',
          questionText: `What practices or browser developer tools do you rely on to test responsiveness, clean up CSS layouts, and debug UI bugs quickly?`
        }
      ];

    case 'backend':
      return [
        {
          questionNumber: 1,
          category: 'INTRODUCTION & PROFILE',
          questionText: `Tell me about yourself, your experience building backend services with ${topSkillsStr}, and what drives your interest in this ${role} role.`
        },
        {
          questionNumber: 2,
          category: 'RESUME PROJECT OVERVIEW',
          questionText: `Can you tell me about your project "${project}"? How did you structure your API routes, controller logic, and database schemas?`
        },
        {
          questionNumber: 3,
          category: 'API DESIGN & ERROR HANDLING',
          questionText: `When developing RESTful APIs, how do you structure request validation, handle exceptions cleanly with HTTP status codes, and format error responses for the client?`
        },
        {
          questionNumber: 4,
          category: 'DATABASE MANAGEMENT & SECURITY',
          questionText: `When interacting with databases like PostgreSQL or MySQL, how do you approach table relationships, foreign keys, and preventing security issues like SQL injection?`
        },
        {
          questionNumber: 5,
          category: 'AUTHENTICATION & MIDDLEWARE',
          questionText: `How do you implement user authentication (such as JWT tokens or session cookies) and protect private API routes using Express middleware?`
        }
      ];

    case 'devops':
      return [
        {
          questionNumber: 1,
          category: 'INTRODUCTION & PROFILE',
          questionText: `Tell me about yourself, your experience working with cloud infrastructure and ${topSkillsStr}, and what motivates you in this ${role} role.`
        },
        {
          questionNumber: 2,
          category: 'RESUME PROJECT OVERVIEW',
          questionText: `Can you describe your work on "${project}"? How did code transition from local development to being containerized and running in a live environment?`
        },
        {
          questionNumber: 3,
          category: 'CONTAINERIZATION BASICS',
          questionText: `What are the practical advantages of using Docker for applications, and what basic practices do you follow when writing a clean, efficient Dockerfile?`
        },
        {
          questionNumber: 4,
          category: 'CI/CD PIPELINES',
          questionText: `How do you set up an automated CI/CD pipeline (such as GitHub Actions) to run unit tests and verify code quality whenever a developer pushes a new commit?`
        },
        {
          questionNumber: 5,
          category: 'TROUBLESHOOTING & MONITORING',
          questionText: `If a deployed service fails health checks or restarts unexpectedly in production, what basic Linux commands and logs do you check first to diagnose the issue?`
        }
      ];

    case 'fullstack':
    default:
      return [
        {
          questionNumber: 1,
          category: 'INTRODUCTION & PROFILE',
          questionText: `Tell me about yourself, your technical journey with ${topSkillsStr}, and what drives your passion for this ${role} role.`
        },
        {
          questionNumber: 2,
          category: 'RESUME PROJECT OVERVIEW',
          questionText: `Can you walk me through your project "${project}"? How did the client-side communicate with the backend server, and what was your role in building it?`
        },
        {
          questionNumber: 3,
          category: 'API INTEGRATION & STATE',
          questionText: `When developing full-stack features, how do you design clear API endpoints between frontend and backend, and how do you handle asynchronous data loading on the user interface?`
        },
        {
          questionNumber: 4,
          category: 'DATABASE & DATA PERSISTENCE',
          questionText: `When saving and querying application data, how do you design your database tables and ensure that common user operations (like create, read, update, delete) perform reliably?`
        },
        {
          questionNumber: 5,
          category: 'PRACTICAL DEBUGGING & TESTING',
          questionText: `Tell me about a technical bug or unexpected error you encountered in a recent project. What was your step-by-step approach to finding and fixing the root cause?`
        }
      ];
  }
};
