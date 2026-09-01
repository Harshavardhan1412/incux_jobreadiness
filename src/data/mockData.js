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

export const INITIAL_ASSESSMENTS = [
  {
    id: "asm-tech-1",
    title: "Technical Assessment",
    category: "Technical",
    description: "Evaluates Data Structures, Algorithms, DBMS, SQL, OOP, and Modern Programming Fundamentals.",
    difficulty: "Medium",
    durationMinutes: 30,
    totalQuestions: 20,
    passingScore: 65,
    status: "In Progress",
    progress: 70,
    completedQuestions: 14,
    estimatedTimeMin: 10,
    lastScore: null,
    badge: "Core Requirement",
    tags: ["Data Structures", "SQL", "OOP", "Algorithms"]
  },
  {
    id: "asm-apt-1",
    title: "Quantitative Aptitude",
    category: "Aptitude",
    description: "Evaluates numerical reasoning, arithmetic, probability, percentages, speed math, and data interpretation.",
    difficulty: "Medium",
    durationMinutes: 30,
    totalQuestions: 20,
    passingScore: 60,
    status: "Completed",
    progress: 100,
    completedQuestions: 20,
    estimatedTimeMin: 0,
    lastScore: 82,
    badge: "Completed",
    tags: ["Arithmetic", "Probability", "Percentages", "Data Interpretation"]
  },
  {
    id: "asm-res-1",
    title: "Logical Reasoning",
    category: "Reasoning",
    description: "Evaluates analytical thinking, pattern recognition, syllogisms, blood relations, and coding-decoding puzzles.",
    difficulty: "Hard",
    durationMinutes: 25,
    totalQuestions: 15,
    passingScore: 70,
    status: "Completed",
    progress: 100,
    completedQuestions: 15,
    estimatedTimeMin: 0,
    lastScore: 74,
    badge: "Completed",
    tags: ["Deductive Logic", "Puzzles", "Pattern Recognition"]
  },
  {
    id: "asm-full-1",
    title: "Full-Stack Job Readiness Mock Exam",
    category: "Technical",
    description: "Comprehensive industry benchmark covering Frontend, Backend, Database Architecture, and Problem Solving.",
    difficulty: "Hard",
    durationMinutes: 45,
    totalQuestions: 25,
    passingScore: 75,
    status: "Available",
    progress: 0,
    completedQuestions: 0,
    estimatedTimeMin: 45,
    lastScore: null,
    badge: "Recommended",
    tags: ["Full Stack", "System Design", "Databases", "APIs"]
  }
];

export const INITIAL_QUESTION_BANK = [
  {
    id: "q-101",
    category: "Technical",
    topic: "Data Structures",
    difficulty: "Easy",
    type: "Single Choice",
    question: "Which data structure follows the LIFO (Last In, First Out) principle?",
    options: [
      { id: "A", text: "Queue" },
      { id: "B", text: "Stack" },
      { id: "C", text: "Linked List" },
      { id: "D", text: "Binary Tree" }
    ],
    correctAnswer: "B",
    explanation: "A Stack follows the Last-In-First-Out (LIFO) order where the element added last is removed first (e.g. push and pop operations).",
    marks: 4,
    timeLimitSec: 90,
    tags: ["Stack", "LIFO", "Core DS"]
  },
  {
    id: "q-102",
    category: "Technical",
    topic: "Algorithms",
    difficulty: "Medium",
    type: "Code Snippet",
    question: "What is the time complexity of the following code snippet for searching in a balanced Binary Search Tree (BST)?",
    codeSnippet: `// Searching a key in balanced BST
function searchBST(root, val) {
  if (!root || root.val === val) return root;
  if (val < root.val) {
    return searchBST(root.left, val);
  }
  return searchBST(root.right, val);
}`,
    language: "javascript",
    options: [
      { id: "A", text: "O(1)" },
      { id: "B", text: "O(n)" },
      { id: "C", text: "O(log n)" },
      { id: "D", text: "O(n log n)" }
    ],
    correctAnswer: "C",
    explanation: "In a balanced BST, the height of the tree is O(log n). Each comparison cuts the search space in half, resulting in O(log n) time complexity.",
    marks: 5,
    timeLimitSec: 120,
    tags: ["BST", "Recursion", "Time Complexity"]
  },
  {
    id: "q-103",
    category: "Technical",
    topic: "SQL / DBMS",
    difficulty: "Medium",
    type: "Single Choice",
    question: "Which SQL clause is used to filter groups created by the GROUP BY clause?",
    options: [
      { id: "A", text: "WHERE" },
      { id: "B", text: "HAVING" },
      { id: "C", text: "ORDER BY" },
      { id: "D", text: "FILTER" }
    ],
    correctAnswer: "B",
    explanation: "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions on grouped records.",
    marks: 4,
    timeLimitSec: 60,
    tags: ["SQL", "Aggregation", "GROUP BY"]
  },
  {
    id: "q-104",
    category: "Technical",
    topic: "OOP",
    difficulty: "Easy",
    type: "True/False",
    question: "In Object-Oriented Programming, polymorphism allows methods to do different things based on the object it is acting upon.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    correctAnswer: "A",
    explanation: "Polymorphism means 'many forms', enabling the same interface to represent different underlying forms (data types or classes).",
    marks: 2,
    timeLimitSec: 45,
    tags: ["OOP", "Polymorphism"]
  },
  {
    id: "q-105",
    category: "Aptitude",
    topic: "Probability",
    difficulty: "Hard",
    type: "Single Choice",
    question: "Two fair dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on the dice is 8?",
    options: [
      { id: "A", text: "5 / 36" },
      { id: "B", text: "1 / 6" },
      { id: "C", text: "7 / 36" },
      { id: "D", text: "1 / 9" }
    ],
    correctAnswer: "A",
    explanation: "Total outcomes = 6 * 6 = 36. Pairs summing to 8 are: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes. Probability = 5/36.",
    marks: 5,
    timeLimitSec: 90,
    tags: ["Probability", "Quantitative"]
  },
  {
    id: "q-106",
    category: "Reasoning",
    topic: "Logical Deduction",
    difficulty: "Medium",
    type: "Single Choice",
    question: "Statements: 1. All laptops are electronic gadgets. 2. Some electronic gadgets are expensive. Conclusions: I. Some laptops are expensive. II. All expensive items are electronic gadgets. Which conclusion follows?",
    options: [
      { id: "A", text: "Only Conclusion I follows" },
      { id: "B", text: "Only Conclusion II follows" },
      { id: "C", text: "Both I and II follow" },
      { id: "D", text: "Neither I nor II follows" }
    ],
    correctAnswer: "D",
    explanation: "Since only 'some' electronic gadgets are expensive, we cannot definitively conclude that laptops belong to the expensive subset. Nor can we conclude all expensive items are electronic gadgets.",
    marks: 4,
    timeLimitSec: 75,
    tags: ["Syllogism", "Reasoning"]
  },
  {
    id: "q-107",
    category: "Technical",
    topic: "Data Structures",
    difficulty: "Medium",
    type: "Single Choice",
    question: "What is the worst-case time complexity of inserting an element into a Hash Table with open addressing and chaining?",
    options: [
      { id: "A", text: "O(1)" },
      { id: "B", text: "O(log n)" },
      { id: "C", text: "O(n)" },
      { id: "D", text: "O(n^2)" }
    ],
    correctAnswer: "C",
    explanation: "In the worst case (e.g. poor hash function or all elements hash to the same bucket), searching and inserting requires traversing all n elements, yielding O(n).",
    marks: 4,
    timeLimitSec: 60,
    tags: ["Hashing", "Time Complexity"]
  },
  {
    id: "q-108",
    category: "Reasoning",
    topic: "Pattern Recognition",
    difficulty: "Easy",
    type: "Single Choice",
    question: "Find the next number in the series: 3, 7, 15, 31, 63, ?",
    options: [
      { id: "A", text: "125" },
      { id: "B", text: "127" },
      { id: "C", text: "129" },
      { id: "D", text: "131" }
    ],
    correctAnswer: "B",
    explanation: "Each number is generated by (previous * 2) + 1. So 63 * 2 + 1 = 127.",
    marks: 3,
    timeLimitSec: 60,
    tags: ["Series", "Pattern"]
  }
];

export const INITIAL_CANDIDATES_LIST = [
  {
    id: "cand-101",
    name: "John Doe",
    email: "john.doe@techgrad.edu",
    college: "ABC University of Technology",
    branch: "Computer Science & Engg",
    graduationYear: "2026",
    assessmentStatus: "Completed",
    overallScore: 78,
    readiness: "Job Ready",
    readinessTag: "Job Ready — Improvement Areas",
    lastAssessment: "Aug 30, 2026",
    aptitude: 82,
    reasoning: 74,
    technical: 78
  },
  {
    id: "cand-102",
    name: "Sarah Chen",
    email: "sarah.chen@stanford.edu",
    college: "National Institute of Tech",
    branch: "Information Technology",
    graduationYear: "2026",
    assessmentStatus: "Completed",
    overallScore: 92,
    readiness: "Highly Ready",
    readinessTag: "Top Tier Candidate",
    lastAssessment: "Aug 29, 2026",
    aptitude: 94,
    reasoning: 90,
    technical: 92
  },
  {
    id: "cand-103",
    name: "Rohan Verma",
    email: "rohan.v@mitcollege.ac.in",
    college: "MIT College of Engineering",
    branch: "Electronics & Comm",
    graduationYear: "2025",
    assessmentStatus: "In Progress",
    overallScore: 68,
    readiness: "Developing",
    readinessTag: "Needs Aptitude Focus",
    lastAssessment: "Aug 28, 2026",
    aptitude: 62,
    reasoning: 70,
    technical: 72
  },
  {
    id: "cand-104",
    name: "Elena Rostova",
    email: "elena.r@globaltech.org",
    college: "State Engineering College",
    branch: "Computer Science",
    graduationYear: "2026",
    assessmentStatus: "Completed",
    overallScore: 85,
    readiness: "Job Ready",
    readinessTag: "Strong Technical",
    lastAssessment: "Aug 26, 2026",
    aptitude: 80,
    reasoning: 84,
    technical: 91
  },
  {
    id: "cand-105",
    name: "Marcus Vance",
    email: "marcus.vance@cityuniv.edu",
    college: "City University",
    branch: "Data Science",
    graduationYear: "2025",
    assessmentStatus: "Pending",
    overallScore: 54,
    readiness: "Needs Training",
    readinessTag: "Foundation Skills Required",
    lastAssessment: "Aug 18, 2026",
    aptitude: 52,
    reasoning: 58,
    technical: 52
  }
];

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
