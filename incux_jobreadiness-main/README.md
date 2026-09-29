# ReadySetJob — AI-Powered Job Readiness & Assessment Platform MVP

A modern, production-grade SaaS MVP web application designed to evaluate candidate job readiness through standardized Aptitude, Reasoning, and Technical modules with real-time AI performance analysis, skill gap diagnostics, and verifiable job readiness reporting.

---

## 🌟 Key Features

### 1. 🎨 Professional SaaS Design System
- Modern, clean, and responsive UI built with Tailwind CSS, custom design tokens, and curated typography (**Inter** and **JetBrains Mono**).
- Reusable components: Radial Score Ring, Glassmorphic Topbar, Responsive Collapsible Sidebar, Toast Notification system, Accessible Modals, and Chart.js analytics.

### 2. 👤 Candidate Portal
- **Candidate Registration & Login**: Split-screen design with real-time validation, 10-digit phone checking, password strength meter, university/branch selectors, experience level toggles, optional resume dropzone, and 1-click demo logins.
- **Candidate Dashboard**: Prominent Overall Job Readiness Score (78/100), subscore breakdowns (Aptitude 82%, Reasoning 74%, Technical 78%), "Continue Assessment" active card, performance trend chart, strong areas vs needs improvement bars, AI career insights, and actionable recommendations.
- **Distraction-Free Live Assessment Runner**: Live countdown timer, Single-Choice / Multi-Choice / True-False / Code Snippet questions with syntax highlighting, Question Navigator matrix (1-20), review flags, and pre-submission confirmation modals.
- **Assessment Results Page**: Instant score breakdown (Score, Accuracy, Correct, Incorrect, Time Taken), celebratory confetti, module scores, and topic-level mastery bars.
- **AI Performance Analysis**: 6-dimension Radar Chart compared against industry hiring benchmarks, career readiness verdict with placement probability, skill gap matrix table, and 7-day prescriptive learning roadmap.
- **Official Job Readiness Report**: Verified digital credential with Report ID, verification QR seal, and print/PDF download capabilities.

### 3. 🛡️ Admin & Recruiter Portal
- **Admin Dashboard**: Top 5 KPI cards (Total Candidates, Active Candidates, Tests Completed, Avg Score, Job Ready Candidates), average score trend chart, and category performance breakdown.
- **Candidate Management**: Live candidate roster with multi-filters (University, Grad Year, Status, Readiness Level), `+ Add Candidate` modal, and detailed Candidate Profile drawer.
- **Question Bank Management**: Multi-filter by Category/Topic/Difficulty/Type, `+ Add Question` modal supporting code snippets and languages, live preview modal, and duplicate/delete actions.
- **Assessment Management**: Assessment catalog cards and a **7-Step Create Assessment Wizard** (*Details $\rightarrow$ Question Bank Selection $\rightarrow$ Configuration $\rightarrow$ Duration $\rightarrow$ Passing Score $\rightarrow$ Preview $\rightarrow$ Publish*).
- **Analytics & Reports Generator**: Deep-dive analytics charts, Weakest Topics matrix, CSV exports, and printable placement PDF summaries.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Charts & Visualizations**: Chart.js, React-Chartjs-2
- **Icons & Micro-interactions**: Lucide React, Canvas-Confetti
- **Document Export**: Print-to-PDF styles, CSV Data Exporter

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Harshavardhan1412/incux_jobreadiness.git
cd incux_jobreadiness

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```

---

## 🕹️ Demo Features & Quick Jumps
- **Role Switcher**: Click the **Candidate / Admin HR** toggle in the top header to seamlessly switch perspectives.
- **Floating Quick Jump Directory**: Use the **"MVP Quick Jumps"** floating pill in the bottom-left corner to jump directly to any candidate or admin screen.
