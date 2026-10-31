# AI Interview Prep Kit 🎯

An intelligent, end-to-end interview preparation platform that transforms any **Job Description (JD)** and **Company Website** into a personalized, company-specific preparation curriculum in minutes.

---

## 📖 Table of Contents

- [What is AI Interview Prep Kit?](#-what-is-ai-interview-prep-kit)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Running the Application](#4-running-the-application)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 What is AI Interview Prep Kit?

Preparing for tech interviews is often overwhelming. Generic interview question banks (like standard LeetCode lists or generic behavioral templates) don't reflect the specific tech stack, architecture, culture, and interview expectations of the actual company you're interviewing with.

**AI Interview Prep Kit** bridges this gap:
1. You provide a **Job Description (JD)**, the **Company URL**, and **how many days** you have until the interview.
2. The AI crawls the company's real website to understand their business model, flagship products, tech stack, and values.
3. It decomposes the JD into distinct technical and behavioral requirements.
4. Using **Retrieval-Augmented Generation (RAG)**, it generates real-world scenario questions tailored to that exact company.
5. It schedules everything into a day-by-day study roadmap with interactive flashcards.

---

## ✨ Key Features

- **🏢 Company Intelligence Brief**: Get a complete snapshot of the company before your interview, including their mission, core products, engineering culture, typical interview stages, and actionable candidate tips.
- **📋 Job Description Breakdown**: Breaks down complex JDs into clean lists of daily responsibilities, required technical skills, and core competencies ranked by priority (High, Medium, Low).
- **🎯 Company-Tailored Interview Questions**: Practice realistic, scenario-based interview questions built around the company's actual business domain and your role's requirements, complete with in-depth model answers and what interviewers look for.
- **📅 Personalized Day-by-Day Study Plan**: Automatically creates a daily preparation schedule mapped to your available days (e.g., 7, 14, or 30 days), letting you mark days as done and track your progress.
- **🗂️ Interactive Revision Flashcards**: Flip through high-yield concept cards generated from your question bank for quick last-minute recall before interview day.
- **📊 Multi-Kit Dashboard**: Create, organize, and manage separate interview prep kits for each company and role you are interviewing with.

---

## 🔄 How It Works

```
                   User Inputs
       (Job Description, Company URL, Days)
                        │
                        ▼
            ┌───────────────────────┐
            │   BullMQ Job Queue    │
            └───────────┬───────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌───────────────────┐         ┌───────────────────┐
│ Playwright Crawl  │         │  JD Requirement   │
│ (Company Website) │         │    Extraction     │
└───────┬───────────┘         └─────────┬─────────┘
        │                               │
        ▼                               │
┌───────────────────┐                   │
│   Company Brief   │                   │
│   & pgvector RAG  │                   │
└───────┬───────────┘                   │
        │                               │
        └───────────────┬───────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ RAG Question Gen &    │
            │  Study Schedule Plan  │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ Flashcard Generation  │
            └───────────┬───────────┘
                        │
                        ▼
             Complete Kit Ready in
                User Dashboard!
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Base UI](https://base-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with [Express 5](https://expressjs.com/) & TypeScript
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector) extension, powered by [Prisma ORM 7](https://www.prisma.io/)
- **AI & LLM**: [Google GenAI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) (`gemini-2.5-flash` / `gemini-1.5-pro`)
- **Embeddings & Text Splitters**: [@langchain/textsplitters](https://www.npmjs.com/package/@langchain/textsplitters) & `@langchain/google-genai`
- **Web Scraping**: [Playwright](https://playwright.dev/)
- **Queues & Jobs**: [BullMQ](https://bullmq.io/) with [Redis](https://redis.io/)
- **Validation**: [Zod v4](https://zod.dev/)

---

## 📂 Project Architecture

```
AI-interview-prep-kit/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (pgvector, Kit, Questions, Brief)
│   │   └── migrations/            # SQL migration history
│   ├── src/
│   │   ├── config/                # Redis and BullMQ queue definitions
│   │   ├── lib/                   # Prisma client, Gemini & Embedding providers
│   │   ├── middleware/            # JWT authentication & error handling
│   │   ├── modules/
│   │   │   ├── ai/                # LLM prompts and Gemini generation services
│   │   │   ├── auth/              # Signup, login, and refresh tokens
│   │   │   ├── flashcard/         # Flashcard generation and revision tracking
│   │   │   ├── interviewKit/      # Kit creation, retrieval, and deletion
│   │   │   ├── question/          # Interview question services and storage
│   │   │   ├── requirement/       # Job description decomposition
│   │   │   ├── research/          # Web crawler, company brief, ingestion & RAG
│   │   │   └── studySchedule/     # Study plan generation and day toggling
│   │   ├── utils/                 # Link scoring, pagination, and question capping
│   │   ├── worker/                # BullMQ worker process for background kit gen
│   │   └── index.ts               # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router (auth, dashboard, kit pages)
│   │   ├── components/
│   │   │   ├── dashboard/         # Kit cards and creation modals
│   │   │   ├── flashcard/         # Interactive flipping revision cards
│   │   │   ├── overview/          # Stats, breakdown, and Company Brief tabs
│   │   │   ├── study-plan/        # Daily study checklist cards
│   │   │   └── ui/                # Shadcn UI primitives (cards, tabs, badges)
│   │   ├── hooks/                 # Zustand store hooks (useKitStore, useAuthStore)
│   │   ├── lib/                   # API client and utility helpers
│   │   └── services/              # API caller services (auth, kit, flashcards)
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 📋 Prerequisites

Before running the project, make sure you have the following installed on your machine:

1. **Node.js**: v20 or higher ([Download](https://nodejs.org/))
2. **PostgreSQL**: Version 15+ with the **`pgvector`** extension enabled ([pgvector installation guide](https://github.com/pgvector/pgvector))
3. **Redis**: Running locally or via Docker ([Redis Download](https://redis.io/download))
4. **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Step-by-Step Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI-interview-prep-kit.git
cd AI-interview-prep-kit
```

---

### 2. Backend Setup

1. **Navigate to the backend directory and install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Playwright Browsers** (for website crawling):
   ```bash
   npx playwright install chromium
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5001
   FRONTEND_URL=http://localhost:3000

   # PostgreSQL connection string (must have pgvector extension installed)
   DATABASE_URL="postgresql://postgres:password@localhost:5432/interview_kit_db?schema=public"

   # Redis configuration
   REDIS_URL="redis://127.0.0.1:6379"

   # Authentication Secrets (generate random strings)
   ACCESS_TOKEN="your_jwt_access_secret_here"
   ACCESS_TOKEN_EXPIRY="15m"
   REFRESH_TOKEN="your_jwt_refresh_secret_here"
   REFRESH_TOKEN_EXPIRY="7d"

   # Google Gemini API
   GEMINI_API_KEY="AIzaSy..."
   GEMINI_MODEL="gemini-2.5-flash"
   EMBEDDING_MODEL="text-embedding-004"
   ```

4. **Enable pgvector and Run Database Migrations**:
   In your PostgreSQL database, ensure `pgvector` is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
   Then apply Prisma migrations and generate the client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

---

### 3. Frontend Setup

1. **Open a new terminal, navigate to the frontend directory, and install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

---

### 4. Running the Application

1. **Make sure your PostgreSQL and Redis services are running**:
   ```bash
   # If using docker for Redis:
   docker run -d -p 6379:6379 redis:latest
   ```

2. **Start the Backend Server (Express + Background Worker)**:
   ```bash
   cd backend
   npm run dev
   ```
   *The server will start at `http://localhost:5001` and initialize the BullMQ worker.*

3. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   *The web app will open at `http://localhost:3000`.*

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Log in and receive HTTP-only auth cookies |
| `POST` | `/api/auth/refresh` | Rotate access & refresh tokens |
| `POST` | `/api/auth/logout` | Revoke tokens and log out |
| `POST` | `/api/kits` | Create a new Interview Kit (triggers research & generation) |
| `GET` | `/api/kits` | List all kits created by the authenticated user |
| `GET` | `/api/kits/:kitId` | Fetch kit details (Role Breakdown, Company Brief, Stats) |
| `DELETE`| `/api/kits/:kitId` | Delete a kit and cascade remove all related data |
| `GET` | `/api/kits/:kitId/questions` | Get generated interview questions |
| `GET` | `/api/kits/:kitId/flashcards` | Get revision flashcards |
| `PATCH`| `/api/kits/:kitId/schedule/toggle` | Toggle completion status for a study day |

---

## 🤝 Contributing

Contributions, feedback, and feature requests are welcome!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

