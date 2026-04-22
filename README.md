# Academix - Modern Learning Management System

Academix is a structured, role-based **Learning Management System (LMS)** designed to manage, deliver, and track educational content and academic activities efficiently. It supports multiple roles intuitively, providing a comprehensive educational platform for students, instructors, and administrators.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue.svg?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-purple.svg?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-Express-green.svg?logo=node.js" alt="Node" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg?logo=mongodb" alt="MongoDB" />
</p>

---

## 🚀 Tech Stack

### Frontend Architecture
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM v7
- **Styling:** Custom CSS with Glassmorphism UI, Lucide React (Icons)
- **HTTP Client:** Axios (Interceptors for Auth)

### Backend Architecture
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js (Class-Based Architecture)
- **Database:** MongoDB + Mongoose
- **File Storage:** Cloudinary (via `multer-storage-cloudinary`)
- **Authentication:** JWT (Access + Refresh Tokens)
- **Security:** bcryptjs, CORS

---

## 🏗️ Project Structure

The repository is composed of two main workspaces (`client` and `server`):

```text
SESD_PROJECT/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── api/            # Axios configurations and API calls
│   │   ├── components/     # Reusable UI components (Layouts, Modals)
│   │   ├── context/        # React Context (Auth State)
│   │   ├── pages/          # Page-level components
│   │   └── index.css       # Global styles and design system variables
│   └── package.json
└── server/                 # Express backend application
    ├── src/
    │   ├── controllers/    # Request handling
    │   ├── models/         # Mongoose Schemas
    │   ├── routes/         # Express Router definitions
    │   ├── services/       # Business logic layer
    │   └── index.ts        # App entry point
    └── package.json
```

---

## 👥 User Roles & Responsibilities

| Role | Responsibilities |
|------|----------------|
| **🎓 Student** | Browse the course catalog, enroll in courses, view video lessons, submit assignments, track learning progress, and download completion certificates. |
| **👩‍🏫 Instructor** | Create and publish interactive courses, manage modules/lessons, review and grade student assignment submissions, and track course analytics. |
| **🛡️ Admin** | Manage platform users, approve/moderate courses, and monitor overall platform health. |

---

## ✨ Core Features

- **Robust User Management** — Secure authentication with JWT, role-based access control (RBAC), and dynamic user profiles.
- **Comprehensive Course Management** — Intuitive course creation tool for instructors, structured modular hierarchy (Course → Module → Lesson), and drafting/publishing workflows.
- **Dynamic Enrollment System** — Seamless student enrollment, real-time progress tracking, and automated completion monitoring.
- **Assignments & Evaluation** — Support for assignment creation, file uploading directly to Cloudinary, submission tracking, and instructor grading functionality.
- **Progress & Certification** — Granular lesson-level completion tracking with automatic dynamic certificate generation upon 100% course completion.
- **Interactive Multimedia** — Built-in Learning Player for seamless video ingestion.

---

## ⚙️ Backend Design Patterns

The backend follows a strict **class-based layered architecture** to ensure maintainability and scalability:

```text
Controller → Service → Repository → Model (Mongoose)
```

**Notable Design Patterns Implemented:**
- **Repository Pattern:** Centralizes all database queries and data access logic.
- **Strategy Pattern:** Supports various grading strategies and condition handling.
- **Composite Pattern:** Handles the complex hierarchical mapping of `Course → Module → Lesson`.
- **Singleton Pattern:** Manages Database configurations and external connection instances (e.g., Cloudinary).

---

## 🛠️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- [Cloudinary](https://cloudinary.com/) Account (for automated media uploads)

### 1. Clone the repository

```bash
git clone <repo-url>
cd SESD_PROJECT
```

### 2. Backend Setup

Configure your environment variables and start the REST API.

```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env and supply your MongoDB URI, JWT Secret, and Cloudinary configuration

npm run dev
```

### 3. Frontend Setup

Configure the client environment and start the Vite dev server.

```bash
cd ../client
npm install

# Create environment file
cp .env.example .env
# Ensure your API URL is correctly pointed
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

The application should now be accessible at `http://localhost:5173`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
