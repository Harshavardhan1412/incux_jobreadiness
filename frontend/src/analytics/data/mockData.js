export const COLORS = {
  aptitude: '#3B82F6',
  reasoning: '#10B981',
  technical: '#F59E0B',
  english: '#8B5CF6',
};

export const COLORS_LIGHT = {
  aptitude: '#93C5FD',
  reasoning: '#6EE7B7',
  technical: '#FCD34D',
  english: '#C4B5FD',
};

export const mockStudent = {
  id: 'STU-2024-001',
  name: 'Priya Sharma',
  email: 'priya.sharma@college.edu',
  overallScore: 72.5,
  percentile: 85,
  rank: 42,
  totalStudents: 280,
  examAttempts: [
    {
      id: 'ATT-001',
      date: '2026-06-15',
      totalScore: 58,
      categories: {
        aptitude: {
          score: 16,
          maxScore: 25,
          topics: [
            { name: 'Number Systems', score: 5, maxScore: 5 },
            { name: 'Percentage', score: 4, maxScore: 5 },
            { name: 'Profit & Loss', score: 3, maxScore: 5 },
            { name: 'Time & Work', score: 2, maxScore: 5 },
            { name: 'Probability', score: 2, maxScore: 5 },
          ],
        },
        reasoning: {
          score: 14,
          maxScore: 25,
          topics: [
            { name: 'Coding-Decoding', score: 4, maxScore: 5 },
            { name: 'Syllogism', score: 3, maxScore: 5 },
            { name: 'Blood Relations', score: 3, maxScore: 5 },
            { name: 'Direction Sense', score: 2, maxScore: 5 },
            { name: 'Puzzles', score: 2, maxScore: 5 },
          ],
        },
        technical: {
          score: 15,
          maxScore: 25,
          topics: [
            { name: 'Data Structures', score: 4, maxScore: 5 },
            { name: 'Algorithms', score: 3, maxScore: 5 },
            { name: 'OOP Concepts', score: 3, maxScore: 5 },
            { name: 'DBMS', score: 3, maxScore: 5 },
            { name: 'OS Concepts', score: 2, maxScore: 5 },
          ],
        },
        english: {
          score: 13,
          maxScore: 25,
          topics: [
            { name: 'Reading Comprehension', score: 3, maxScore: 5 },
            { name: 'Error Detection', score: 3, maxScore: 5 },
            { name: 'Sentence Improvement', score: 3, maxScore: 5 },
            { name: 'Vocabulary', score: 2, maxScore: 5 },
            { name: 'Para Jumbles', score: 2, maxScore: 5 },
          ],
        },
      },
    },
    {
      id: 'ATT-002',
      date: '2026-07-20',
      totalScore: 68,
      categories: {
        aptitude: {
          score: 19,
          maxScore: 25,
          topics: [
            { name: 'Number Systems', score: 5, maxScore: 5 },
            { name: 'Percentage', score: 4, maxScore: 5 },
            { name: 'Profit & Loss', score: 4, maxScore: 5 },
            { name: 'Time & Work', score: 3, maxScore: 5 },
            { name: 'Probability', score: 3, maxScore: 5 },
          ],
        },
        reasoning: {
          score: 16,
          maxScore: 25,
          topics: [
            { name: 'Coding-Decoding', score: 5, maxScore: 5 },
            { name: 'Syllogism', score: 3, maxScore: 5 },
            { name: 'Blood Relations', score: 4, maxScore: 5 },
            { name: 'Direction Sense', score: 2, maxScore: 5 },
            { name: 'Puzzles', score: 2, maxScore: 5 },
          ],
        },
        technical: {
          score: 18,
          maxScore: 25,
          topics: [
            { name: 'Data Structures', score: 5, maxScore: 5 },
            { name: 'Algorithms', score: 4, maxScore: 5 },
            { name: 'OOP Concepts', score: 4, maxScore: 5 },
            { name: 'DBMS', score: 3, maxScore: 5 },
            { name: 'OS Concepts', score: 2, maxScore: 5 },
          ],
        },
        english: {
          score: 15,
          maxScore: 25,
          topics: [
            { name: 'Reading Comprehension', score: 4, maxScore: 5 },
            { name: 'Error Detection', score: 3, maxScore: 5 },
            { name: 'Sentence Improvement', score: 3, maxScore: 5 },
            { name: 'Vocabulary', score: 3, maxScore: 5 },
            { name: 'Para Jumbles', score: 2, maxScore: 5 },
          ],
        },
      },
    },
    {
      id: 'ATT-003',
      date: '2026-08-25',
      totalScore: 76,
      categories: {
        aptitude: {
          score: 21,
          maxScore: 25,
          topics: [
            { name: 'Number Systems', score: 5, maxScore: 5 },
            { name: 'Percentage', score: 5, maxScore: 5 },
            { name: 'Profit & Loss', score: 4, maxScore: 5 },
            { name: 'Time & Work', score: 4, maxScore: 5 },
            { name: 'Probability', score: 3, maxScore: 5 },
          ],
        },
        reasoning: {
          score: 18,
          maxScore: 25,
          topics: [
            { name: 'Coding-Decoding', score: 5, maxScore: 5 },
            { name: 'Syllogism', score: 4, maxScore: 5 },
            { name: 'Blood Relations', score: 4, maxScore: 5 },
            { name: 'Direction Sense', score: 3, maxScore: 5 },
            { name: 'Puzzles', score: 2, maxScore: 5 },
          ],
        },
        technical: {
          score: 20,
          maxScore: 25,
          topics: [
            { name: 'Data Structures', score: 5, maxScore: 5 },
            { name: 'Algorithms', score: 4, maxScore: 5 },
            { name: 'OOP Concepts', score: 4, maxScore: 5 },
            { name: 'DBMS', score: 4, maxScore: 5 },
            { name: 'OS Concepts', score: 3, maxScore: 5 },
          ],
        },
        english: {
          score: 17,
          maxScore: 25,
          topics: [
            { name: 'Reading Comprehension', score: 4, maxScore: 5 },
            { name: 'Error Detection', score: 4, maxScore: 5 },
            { name: 'Sentence Improvement', score: 4, maxScore: 5 },
            { name: 'Vocabulary', score: 3, maxScore: 5 },
            { name: 'Para Jumbles', score: 2, maxScore: 5 },
          ],
        },
      },
    },
  ],
};

export const mockCompanies = [
  { id: 'CMP-001', name: 'Tata Consultancy Services', cutoffScore: 65, categories: { aptitude: 60, reasoning: 60, technical: 70, english: 60 }, package: '₹4.5 LPA', role: 'Software Developer', tier: 'regular' },
  { id: 'CMP-002', name: 'Infosys', cutoffScore: 70, categories: { aptitude: 65, reasoning: 65, technical: 75, english: 65 }, package: '₹6.5 LPA', role: 'Systems Engineer', tier: 'regular' },
  { id: 'CMP-003', name: 'Wipro', cutoffScore: 60, categories: { aptitude: 55, reasoning: 55, technical: 65, english: 55 }, package: '₹4 LPA', role: 'Project Engineer', tier: 'regular' },
  { id: 'CMP-004', name: 'Amazon', cutoffScore: 85, categories: { aptitude: 80, reasoning: 85, technical: 90, english: 80 }, package: '₹28 LPA', role: 'SDE-1', tier: 'super_dream' },
  { id: 'CMP-005', name: 'Microsoft', cutoffScore: 90, categories: { aptitude: 85, reasoning: 90, technical: 95, english: 85 }, package: '₹42 LPA', role: 'Software Engineer', tier: 'super_dream' },
  { id: 'CMP-006', name: 'Google', cutoffScore: 92, categories: { aptitude: 88, reasoning: 92, technical: 95, english: 88 }, package: '₹52 LPA', role: 'SWE-1', tier: 'dream' },
  { id: 'CMP-007', name: 'Accenture', cutoffScore: 55, categories: { aptitude: 50, reasoning: 50, technical: 60, english: 50 }, package: '₹4.5 LPA', role: 'Application Developer', tier: 'regular' },
  { id: 'CMP-008', name: 'Cognizant', cutoffScore: 60, categories: { aptitude: 55, reasoning: 55, technical: 65, english: 55 }, package: '₹4 LPA', role: 'Programmer Analyst', tier: 'regular' },
  { id: 'CMP-009', name: 'Zoho', cutoffScore: 78, categories: { aptitude: 75, reasoning: 75, technical: 85, english: 70 }, package: '₹12 LPA', role: 'Software Developer', tier: 'dream' },
  { id: 'CMP-010', name: 'Samsung R&D', cutoffScore: 82, categories: { aptitude: 78, reasoning: 80, technical: 88, english: 78 }, package: '₹22 LPA', role: 'Software Engineer', tier: 'dream' },
];

export const mockPeerComparison = [
  { category: 'Aptitude', studentScore: 84, classAverage: 62, topperScore: 96, classMedian: 60 },
  { category: 'Reasoning', studentScore: 72, classAverage: 58, topperScore: 92, classMedian: 56 },
  { category: 'Technical', studentScore: 80, classAverage: 55, topperScore: 96, classMedian: 52 },
  { category: 'English', studentScore: 68, classAverage: 60, topperScore: 88, classMedian: 58 },
];

export function computeEligibility(student, companies) {
  const latestAttempt = student.examAttempts[student.examAttempts.length - 1];
  if (!latestAttempt) return [];

  return companies.map((company) => {
    const categoryKeys = ['aptitude', 'reasoning', 'technical', 'english'];
    const categoryPercents = {};
    const gaps = [];

    categoryKeys.forEach((key) => {
      const cat = latestAttempt.categories[key];
      const percent = Math.round((cat.score / cat.maxScore) * 100);
      categoryPercents[key] = percent;

      const required = company.categories[key];
      if (percent < required) {
        gaps.push({
          category: key.charAt(0).toUpperCase() + key.slice(1),
          required,
          current: percent,
          deficit: required - percent,
        });
      }
    });

    const overallPercent = Math.round(
      categoryKeys.reduce((sum, k) => sum + categoryPercents[k], 0) / 4
    );
    const matchPercent = Math.min(100, Math.round(
      categoryKeys.reduce((sum, k) => {
        const ratio = Math.min(categoryPercents[k] / company.categories[k], 1.2);
        return sum + ratio * 25;
      }, 0)
    ));

    return {
      company,
      matchPercent,
      eligible: overallPercent >= company.cutoffScore && gaps.length === 0,
      borderline: overallPercent >= company.cutoffScore - 5 && overallPercent < company.cutoffScore,
      gaps,
    };
  });
}

export function computeImprovements(student) {
  const latestAttempt = student.examAttempts[student.examAttempts.length - 1];
  if (!latestAttempt) return [];

  const areas = [];
  const categoryKeys = ['aptitude', 'reasoning', 'technical', 'english'];

  categoryKeys.forEach((key) => {
    const cat = latestAttempt.categories[key];
    cat.topics.forEach((topic) => {
      const percent = (topic.score / topic.maxScore) * 100;
      let priority = 'low';
      let estimatedHours = 2;

      if (percent < 50) {
        priority = 'high';
        estimatedHours = 8;
      } else if (percent < 70) {
        priority = 'medium';
        estimatedHours = 4;
      }

      areas.push({
        category: key.charAt(0).toUpperCase() + key.slice(1),
        topic: topic.name,
        currentScore: topic.score,
        maxScore: topic.maxScore,
        priority,
        estimatedHours,
      });
    });
  });

  return areas.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getCategoryPercents(attempt) {
  return {
    aptitude: Math.round((attempt.categories.aptitude.score / attempt.categories.aptitude.maxScore) * 100),
    reasoning: Math.round((attempt.categories.reasoning.score / attempt.categories.reasoning.maxScore) * 100),
    technical: Math.round((attempt.categories.technical.score / attempt.categories.technical.maxScore) * 100),
    english: Math.round((attempt.categories.english.score / attempt.categories.english.maxScore) * 100),
  };
}