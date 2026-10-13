# ReadySetJob — AI-Powered Job Readiness & Assessment Platform

ReadySetJob is a full-stack job readiness and assessment platform designed to help organizations evaluate candidates through aptitude, reasoning, and technical assessments. The platform combines a modern React frontend, a secure Express API, a PostgreSQL data layer, and Redis-based rate limiting and queue support to deliver a production-style recruitment workflow.

This repository is structured as a monorepo and contains the main application logic for the candidate experience, admin panel, assessment engine, code execution support, and analytics dashboards.

## Project overview

The application enables:

- Candidate sign-up and login flows
- Role-based access for candidates and recruiters/admins
- Assessment creation and management
- Aptitude, reasoning, coding, and technical evaluation modules
- Candidate analytics and readiness scoring
- Administrative tools for managing candidates, assessments, and questions
- Secure backend APIs with validation, auth, and rate limiting

## Core features

### Candidate experience
- Clean onboarding and role-based login experience
- Candidate dashboard with readiness score and progress tracking
- Assessment listing and attempt flow
- Timed assessments with structured question types
- Results and performance analytics
- Career readiness insights and score breakdowns

### Admin & recruiter experience
- Candidate management interface
- Question bank and assessment administration
- Assessment configuration and filtering
- Analytics dashboard for performance review
- Candidate readiness reporting

### Technical capabilities
- React + Vite frontend for a fast interactive UI
- Express backend for REST API services
- PostgreSQL for persistent data storage
- Redis for caching / rate limiting / worker support
- JWT-based authentication and protected endpoints
- Code execution support via Judge0/Piston patterns in backend design

## Architecture

```text
incux_jobreadiness/
├── frontend/              # React + Vite app
│   ├── src/
│   ├── package.json
│   └── vite.config.*
├── backend/               # Express API + business logic
│   ├── src/
│   ├── scripts/
│   ├── prisma/
│   ├── package.json
│   └── .env.example
├── .env.example           # Root env template
├── package.json           # Monorepo scripts
├── README.md              # Project overview
├── ai mock interview/     # Additional AI interview prototype work
└── verify_fixes.mjs       # Validation/helper script
```

## Tech stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Chart.js / React Chart.js
- Lucide icons
- Material UI and custom UI components

### Backend
- Node.js
- Express
- PostgreSQL via pg
- Redis
- JWT auth
- Helmet + CORS + rate limiting
- BullMQ-ready worker architecture

## Getting started

### Prerequisites
- Node.js 18+
- npm
- PostgreSQL database
- Redis instance

### 1) Clone the repository

```bash
git clone https://github.com/Harshavardhan1412/incux_jobreadiness.git
cd incux_jobreadiness
```

### 2) Install dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3) Configure environment variables

Copy the example env file and fill in your database and auth credentials:

```bash
cp .env.example backend/.env
```

Then update the values in `backend/.env`:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `PORT`
- `NODE_ENV`

### 4) Start the application

From the root:

```bash
npm run dev
```

This project includes monorepo scripts for running backend and frontend together.

### 5) Build production assets

```bash
npm run build
```

## Available scripts

Root `package.json` includes convenience scripts:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run build
npm run seed
```

## Backend notes

The backend is designed around a modular REST API structure and includes:

- authentication routes
- candidate routes
- assessment routes
- question management routes
- submissions processing
- admin APIs
- code execution middleware and integrations

The app is built to support scalable hiring workflows while keeping the codebase organized by feature and service responsibility.

## Important project notes

- This repo is intended as a job-readiness SaaS platform MVP and not a single-page demo only.
- The `ai mock interview/` folder contains an additional interview-related prototype that complements the main platform.
- The project uses environment-specific secrets and should not be committed directly in production.

## License

This project currently does not declare an explicit license in the repository metadata. Please check the repository settings before commercial use or redistribution.

## Contact

For questions, collaboration, or deployment support, connect with the repository owner on GitHub:

https://github.com/Harshavardhan1412

