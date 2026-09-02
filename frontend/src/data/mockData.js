// Comprehensive mock data for Job Readiness & Assessment Platform

export const INITIAL_CANDIDATE = {
  id: "cand-101",
  name: "John Doe",
  email: "john.doe@techgrad.edu",
  mobile: "+1 (555) 349-2810",
  college: "ABC University of Technology",
  degree: "Bachelor of Technology (B.Tech)",
  branch: "Computer Science & Engineering",
  graduationYear: "2026",
  experienceLevel: "Fresher",
  tenthCertificate: "john_doe_10th_marksheet.pdf",
  twelfthCertificate: "john_doe_12th_certificate.pdf",
  resumeFile: "john_doe_resume.pdf",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  jobReadinessScore: 78,
  readinessLevel: "Job Ready — With Improvement Areas",
  readinessStatus: "Good Progress",
  aptitudeScore: 82,
  reasoningScore: 74,
  technicalScore: 78,
  assessmentsCompleted: 4,
  registeredAt: "2026-07-15",
  recentScores: [
    { assessment: "Assessment 1", score: 62, date: "Aug 02" },
    { assessment: "Assessment 2", score: 69, date: "Aug 10" },
    { assessment: "Assessment 3", score: 74, date: "Aug 20" },
    { assessment: "Assessment 4", score: 78, date: "Aug 30" }
  ],
  strongAreas: [
    { name: "Logical Reasoning", mastery: 88, category: "Reasoning" },
    { name: "Problem Solving", mastery: 85, category: "Reasoning" },
    { name: "Python Fundamentals", mastery: 84, category: "Technical" },
    { name: "Data Structures (Arrays/Strings)", mastery: 82, category: "Technical" }
  ],
  needsImprovement: [
    { name: "Quantitative Aptitude (Probability & Permutations)", mastery: 58, category: "Aptitude" },
    { name: "SQL Joins & Window Functions", mastery: 54, category: "Technical" },
    { name: "Advanced Graph Algorithms", mastery: 60, category: "Technical" }
  ],
  aiInsights: {
    summary: "You demonstrate strong logical reasoning and programming fundamentals. Your biggest improvement opportunity is quantitative aptitude and SQL. Improving these areas could significantly increase your overall job-readiness score from 78 to 88+.",
    strengths: [
      "Logical reasoning and deductive deduction",
      "Programming fundamentals and algorithmic complexity analysis",
      "Core array and string manipulation problem solving",
      "Object-Oriented Programming (OOP) concepts"
    ],
    weaknesses: [
      "SQL subqueries, aggregation, and window functions",
      "Quantitative aptitude: Probability, Permutation & Combinations",
      "Complex tree traversals and dynamic programming optimization"
    ],
    skillGaps: [
      { skill: "SQL Query Optimization", candidateLevel: "54%", requiredLevel: "80%", gap: "-26%", priority: "High" },
      { skill: "Quantitative Aptitude", candidateLevel: "58%", requiredLevel: "75%", gap: "-17%", priority: "High" },
      { skill: "Graph Algorithms", candidateLevel: "60%", requiredLevel: "75%", gap: "-15%", priority: "Medium" },
      { skill: "System Design Basics", candidateLevel: "68%", requiredLevel: "75%", gap: "-7%", priority: "Low" }
    ],
    prescriptivePlan: "Focus on SQL joins, aggregation, and window functions for the next 7 days. Complete 3 quantitative aptitude practice sets and retake the technical assessment."
  }
};

export const INITIAL_ASSESSMENTS = [];

export const INITIAL_QUESTION_BANK = [];

export const INITIAL_CANDIDATES_LIST = [];

export const INITIAL_ADMIN_KPIS = {
  totalCandidates: 1248,
  activeCandidates: 892,
  assessmentsCompleted: 3482,
  averageScore: 72,
  jobReadyCandidates: 684,
  categoryAverages: {
    aptitude: 71,
    reasoning: 75,
    technical: 68
  },
  weakestTopics: [
    { topic: "SQL & Window Functions", avgScore: "52%", failureRate: "48%" },
    { topic: "Probability & Combinatorics", avgScore: "56%", failureRate: "44%" },
    { topic: "Graph Algorithms & Dynamic Prog", avgScore: "59%", failureRate: "41%" },
    { topic: "Complex Logical Syllogisms", avgScore: "62%", failureRate: "38%" }
  ],
  scoreDistribution: [
    { range: "< 50%", count: 142, label: "Needs Training" },
    { range: "50-65%", count: 324, label: "Developing" },
    { range: "66-80%", count: 498, label: "Job Ready" },
    { range: "80%+", count: 284, label: "High Achiever" }
  ]
};

export const INITIAL_RECOMMENDATIONS = [
  {
    id: "rec-1",
    skill: "Quantitative Aptitude",
    currentLevel: "58%",
    targetLevel: "80%",
    action: "Complete 3 Quantitative Aptitude practice modules with focus on Probability, Ratios, and Permutations.",
    duration: "4 hours",
    priority: "High",
    category: "Aptitude"
  },
  {
    id: "rec-2",
    skill: "SQL Fundamentals & Joins",
    currentLevel: "54%",
    targetLevel: "85%",
    action: "Practice complex SQL joins, subqueries, and aggregation group functions in interactive sandbox.",
    duration: "3.5 hours",
    priority: "High",
    category: "Technical"
  },
  {
    id: "rec-3",
    skill: "Data Structures (Trees & Graphs)",
    currentLevel: "60%",
    targetLevel: "75%",
    action: "Solve 10 medium-difficulty tree traversal and breadth-first search problems.",
    duration: "5 hours",
    priority: "Medium",
    category: "Technical"
  },
  {
    id: "rec-4",
    skill: "Full Technical Retake",
    currentLevel: "78%",
    targetLevel: "90%",
    action: "Take the Full-Stack Job Readiness Mock Exam to validate improved knowledge.",
    duration: "45 mins",
    priority: "Recommended",
    category: "Assessment"
  }
];
