export const mockColleges = [
  { id: 'CLG-001', name: 'Sri Venkateswara College of Engineering', location: 'Chennai', studentCount: 280 },
  { id: 'CLG-002', name: 'Anna University Regional Campus', location: 'Coimbatore', studentCount: 340 },
  { id: 'CLG-003', name: 'PSG Institute of Technology', location: 'Coimbatore', studentCount: 260 },
  { id: 'CLG-004', name: 'Madras Institute of Technology', location: 'Chennai', studentCount: 310 },
  { id: 'CLG-005', name: 'Vellore Institute of Technology', location: 'Vellore', studentCount: 420 },
  { id: 'CLG-006', name: 'Sathyabama Institute', location: 'Chennai', studentCount: 290 },
];

const makeTopics = (pairs) =>
  pairs.map(([name, score]) => ({ name, score, maxScore: 5 }));

function makeStudent(id, name, email, collegeId, scores) {
  const totalPossible = 100;
  const total = [...scores.aptitude, ...scores.reasoning, ...scores.technical, ...scores.english].reduce(
    (s, t) => s + t[1],
    0
  );

  const catScore = (arr) => arr.reduce((s, t) => s + t[1], 0);

  const overallScore = Math.round((total / totalPossible) * 100);

  return {
    id,
    name,
    email,
    collegeId,
    data: {
      id,
      name,
      email,
      overallScore,
      percentile: 40 + Math.round(total / 2),
      rank: Math.round(280 - (total / 100) * 260),
      totalStudents: 280,
      examAttempts: [
        {
          id: `${id}-ATT`,
          date: '2026-08-25',
          totalScore: total,
          categories: {
            aptitude: { score: catScore(scores.aptitude), maxScore: 25, topics: makeTopics(scores.aptitude) },
            reasoning: { score: catScore(scores.reasoning), maxScore: 25, topics: makeTopics(scores.reasoning) },
            technical: { score: catScore(scores.technical), maxScore: 25, topics: makeTopics(scores.technical) },
            english: { score: catScore(scores.english), maxScore: 25, topics: makeTopics(scores.english) },
          },
        },
      ],
    },
  };
}

export const mockCollegeStudents = [
  makeStudent('STU-101', 'Aarav Patel', 'aarav.patel@svce.edu', 'CLG-001', {
    aptitude: [['Number Systems', 5], ['Percentage', 4], ['Profit & Loss', 4], ['Time & Work', 4], ['Probability', 3]],
    reasoning: [['Coding-Decoding', 4], ['Syllogism', 4], ['Blood Relations', 3], ['Direction Sense', 3], ['Puzzles', 3]],
    technical: [['Data Structures', 5], ['Algorithms', 4], ['OOP Concepts', 4], ['DBMS', 4], ['OS Concepts', 3]],
    english: [['Reading Comprehension', 4], ['Error Detection', 3], ['Sentence Improvement', 3], ['Vocabulary', 3], ['Para Jumbles', 3]],
  }),
  makeStudent('STU-102', 'Sneha Reddy', 'sneha.reddy@svce.edu', 'CLG-001', {
    aptitude: [['Number Systems', 4], ['Percentage', 3], ['Profit & Loss', 2], ['Time & Work', 3], ['Probability', 2]],
    reasoning: [['Coding-Decoding', 3], ['Syllogism', 2], ['Blood Relations', 3], ['Direction Sense', 2], ['Puzzles', 2]],
    technical: [['Data Structures', 3], ['Algorithms', 3], ['OOP Concepts', 3], ['DBMS', 2], ['OS Concepts', 2]],
    english: [['Reading Comprehension', 2], ['Error Detection', 2], ['Sentence Improvement', 2], ['Vocabulary', 2], ['Para Jumbles', 2]],
  }),
  makeStudent('STU-103', 'Rahul Verma', 'rahul.verma@svce.edu', 'CLG-001', {
    aptitude: [['Number Systems', 5], ['Percentage', 5], ['Profit & Loss', 5], ['Time & Work', 4], ['Probability', 4]],
    reasoning: [['Coding-Decoding', 5], ['Syllogism', 5], ['Blood Relations', 4], ['Direction Sense', 4], ['Puzzles', 4]],
    technical: [['Data Structures', 5], ['Algorithms', 5], ['OOP Concepts', 5], ['DBMS', 5], ['OS Concepts', 4]],
    english: [['Reading Comprehension', 5], ['Error Detection', 4], ['Sentence Improvement', 4], ['Vocabulary', 4], ['Para Jumbles', 3]],
  }),
  makeStudent('STU-201', 'Karthik Kumar', 'karthik@anna.edu', 'CLG-002', {
    aptitude: [['Number Systems', 3], ['Percentage', 3], ['Profit & Loss', 2], ['Time & Work', 2], ['Probability', 2]],
    reasoning: [['Coding-Decoding', 3], ['Syllogism', 2], ['Blood Relations', 2], ['Direction Sense', 3], ['Puzzles', 1]],
    technical: [['Data Structures', 2], ['Algorithms', 2], ['OOP Concepts', 2], ['DBMS', 3], ['OS Concepts', 2]],
    english: [['Reading Comprehension', 2], ['Error Detection', 1], ['Sentence Improvement', 2], ['Vocabulary', 2], ['Para Jumbles', 1]],
  }),
  makeStudent('STU-202', 'Divya Nair', 'divya@anna.edu', 'CLG-002', {
    aptitude: [['Number Systems', 5], ['Percentage', 4], ['Profit & Loss', 4], ['Time & Work', 5], ['Probability', 4]],
    reasoning: [['Coding-Decoding', 4], ['Syllogism', 4], ['Blood Relations', 5], ['Direction Sense', 4], ['Puzzles', 4]],
    technical: [['Data Structures', 4], ['Algorithms', 4], ['OOP Concepts', 5], ['DBMS', 4], ['OS Concepts', 4]],
    english: [['Reading Comprehension', 4], ['Error Detection', 4], ['Sentence Improvement', 3], ['Vocabulary', 4], ['Para Jumbles', 3]],
  }),
  makeStudent('STU-301', 'Vikram Singh', 'vikram@psg.edu', 'CLG-003', {
    aptitude: [['Number Systems', 4], ['Percentage', 4], ['Profit & Loss', 3], ['Time & Work', 4], ['Probability', 3]],
    reasoning: [['Coding-Decoding', 4], ['Syllogism', 3], ['Blood Relations', 4], ['Direction Sense', 3], ['Puzzles', 3]],
    technical: [['Data Structures', 4], ['Algorithms', 3], ['OOP Concepts', 4], ['DBMS', 3], ['OS Concepts', 3]],
    english: [['Reading Comprehension', 3], ['Error Detection', 3], ['Sentence Improvement', 3], ['Vocabulary', 3], ['Para Jumbles', 2]],
  }),
  makeStudent('STU-302', 'Meera Iyer', 'meera@psg.edu', 'CLG-003', {
    aptitude: [['Number Systems', 3], ['Percentage', 3], ['Profit & Loss', 3], ['Time & Work', 2], ['Probability', 2]],
    reasoning: [['Coding-Decoding', 3], ['Syllogism', 3], ['Blood Relations', 2], ['Direction Sense', 2], ['Puzzles', 2]],
    technical: [['Data Structures', 3], ['Algorithms', 3], ['OOP Concepts', 2], ['DBMS', 2], ['OS Concepts', 2]],
    english: [['Reading Comprehension', 3], ['Error Detection', 2], ['Sentence Improvement', 2], ['Vocabulary', 2], ['Para Jumbles', 2]],
  }),
  makeStudent('STU-401', 'Ananya Gupta', 'ananya@mit.edu', 'CLG-004', {
    aptitude: [['Number Systems', 4], ['Percentage', 3], ['Profit & Loss', 3], ['Time & Work', 4], ['Probability', 3]],
    reasoning: [['Coding-Decoding', 3], ['Syllogism', 4], ['Blood Relations', 3], ['Direction Sense', 3], ['Puzzles', 2]],
    technical: [['Data Structures', 3], ['Algorithms', 3], ['OOP Concepts', 3], ['DBMS', 3], ['OS Concepts', 3]],
    english: [['Reading Comprehension', 2], ['Error Detection', 3], ['Sentence Improvement', 3], ['Vocabulary', 3], ['Para Jumbles', 2]],
  }),
  makeStudent('STU-501', 'Rohan Das', 'rohan@vit.edu', 'CLG-005', {
    aptitude: [['Number Systems', 5], ['Percentage', 5], ['Profit & Loss', 4], ['Time & Work', 5], ['Probability', 4]],
    reasoning: [['Coding-Decoding', 5], ['Syllogism', 4], ['Blood Relations', 5], ['Direction Sense', 4], ['Puzzles', 4]],
    technical: [['Data Structures', 5], ['Algorithms', 5], ['OOP Concepts', 4], ['DBMS', 5], ['OS Concepts', 4]],
    english: [['Reading Comprehension', 4], ['Error Detection', 4], ['Sentence Improvement', 4], ['Vocabulary', 4], ['Para Jumbles', 3]],
  }),
  makeStudent('STU-502', 'Pooja Shah', 'pooja@vit.edu', 'CLG-005', {
    aptitude: [['Number Systems', 3], ['Percentage', 2], ['Profit & Loss', 3], ['Time & Work', 2], ['Probability', 2]],
    reasoning: [['Coding-Decoding', 2], ['Syllogism', 3], ['Blood Relations', 2], ['Direction Sense', 2], ['Puzzles', 1]],
    technical: [['Data Structures', 2], ['Algorithms', 2], ['OOP Concepts', 3], ['DBMS', 2], ['OS Concepts', 2]],
    english: [['Reading Comprehension', 2], ['Error Detection', 2], ['Sentence Improvement', 2], ['Vocabulary', 1], ['Para Jumbles', 1]],
  }),
  makeStudent('STU-601', 'Aditya Menon', 'aditya@sathyabama.edu', 'CLG-006', {
    aptitude: [['Number Systems', 5], ['Percentage', 4], ['Profit & Loss', 4], ['Time & Work', 4], ['Probability', 4]],
    reasoning: [['Coding-Decoding', 4], ['Syllogism', 4], ['Blood Relations', 4], ['Direction Sense', 4], ['Puzzles', 3]],
    technical: [['Data Structures', 4], ['Algorithms', 4], ['OOP Concepts', 4], ['DBMS', 4], ['OS Concepts', 3]],
    english: [['Reading Comprehension', 4], ['Error Detection', 4], ['Sentence Improvement', 3], ['Vocabulary', 3], ['Para Jumbles', 3]],
  }),
  makeStudent('STU-602', 'Ishita Bansal', 'ishita@sathyabama.edu', 'CLG-006', {
    aptitude: [['Number Systems', 4], ['Percentage', 4], ['Profit & Loss', 3], ['Time & Work', 3], ['Probability', 3]],
    reasoning: [['Coding-Decoding', 4], ['Syllogism', 3], ['Blood Relations', 3], ['Direction Sense', 3], ['Puzzles', 2]],
    technical: [['Data Structures', 4], ['Algorithms', 3], ['OOP Concepts', 3], ['DBMS', 3], ['OS Concepts', 3]],
    english: [['Reading Comprehension', 3], ['Error Detection', 3], ['Sentence Improvement', 2], ['Vocabulary', 3], ['Para Jumbles', 2]],
  }),
];