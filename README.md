# LMS — Learning Management System

A structured, role-based **Learning Management System** designed to manage, deliver, and track educational content and academic activities.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript (Class-Based) |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh Tokens) |

---

## Project Structure

```
lms/
├── client/     # React + Vite + TypeScript frontend
└── server/     # Express + TypeScript backend (class-based)
```

---

## User Roles

| Role | Responsibilities |
|------|----------------|
| **Student** | Browse courses, enroll, submit assignments, track progress, download certificates |
| **Instructor** | Create and publish courses, manage modules/lessons, grade submissions |
| **Admin** | Manage users, approve courses, monitor platform |

---

## Core Features

- **User Management** — Secure authentication, role-based access control, user profiles
- **Course Management** — Course creation, modular structure (Course → Module → Lesson), publish workflow
- **Enrollment System** — Student enrollment, progress tracking, completion monitoring
- **Assignment & Evaluation** — Assignment creation, submission management, grading
- **Progress & Certification** — Lesson-level completion tracking, automatic certificate generation

---

## Architecture

The backend follows a strict **class-based layered architecture**:

```
Controller → Service → Repository → Model (Mongoose)
```

**Design Patterns used:**
- Repository Pattern (all data access)
- Strategy Pattern (grading: Percentage vs Pass/Fail)
- Composite Pattern (Course → Module → Lesson hierarchy)
- Singleton Pattern (Database connection)

---

## Setup

> Detailed setup instructions will be added as the project progresses.

```bash
# Clone the repository
git clone <repo-url>
cd lms

# Server setup
cd server
npm install
cp .env.example .env
npm run dev

# Client setup
cd ../client
npm install
cp .env.example .env
npm run dev
```

---

## License

MIT
