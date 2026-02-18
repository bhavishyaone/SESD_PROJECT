# ER Diagram — Learning Management System (LMS)

## Overview

This Entity-Relationship (ER) diagram represents the database schema for the Learning Management System (LMS).

It defines all primary entities, attributes, primary keys, foreign keys, and relationships between tables required to support:

- User management
- Course structure
- Enrollment workflow
- Assignment and grading
- Progress tracking
- Certificate generation

The schema is designed to maintain data integrity, scalability, and structured academic workflows.

---

## ER Diagram (Mermaid)

```mermaid
erDiagram

USERS {
    string id PK
    string name
    string email
    string password
    string role
    datetime created_at
}

COURSES {
    string id PK
    string title
    string description
    string instructor_id FK
    string status
    datetime created_at
}

MODULES {
    string id PK
    string course_id FK
    string title
    int order_index
}

LESSONS {
    string id PK
    string module_id FK
    string title
    text content
}

ENROLLMENTS {
    string id PK
    string student_id FK
    string course_id FK
    float progress
    string status
    datetime enrolled_at
}

ASSIGNMENTS {
    string id PK
    string lesson_id FK
    string title
    int max_marks
    string grading_type
}

SUBMISSIONS {
    string id PK
    string assignment_id FK
    string student_id FK
    text content
    int marks
    string status
    datetime submitted_at
}

CERTIFICATES {
    string id PK
    string student_id FK
    string course_id FK
    datetime issued_at
}

%% =========================
%% Relationships
%% =========================

USERS ||--o{ COURSES : "instructor creates"
COURSES ||--o{ MODULES : "contains"
MODULES ||--o{ LESSONS : "contains"
LESSONS ||--o{ ASSIGNMENTS : "has"
ASSIGNMENTS ||--o{ SUBMISSIONS : "receives"

USERS ||--o{ ENROLLMENTS : "student enrolls"
COURSES ||--o{ ENROLLMENTS : "has"

USERS ||--o{ SUBMISSIONS : "submits"
USERS ||--o{ CERTIFICATES : "receives"
COURSES ||--o{ CERTIFICATES : "awards"
```

---

## Table Summary

| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| `USERS` | All platform users (students, instructors, admins) | → Courses, Enrollments, Submissions, Certificates |
| `COURSES` | Course metadata and publishing status | ← User (instructor), → Modules, Enrollments, Certificates |
| `MODULES` | Logical content groupings within a course | ← Course, → Lessons |
| `LESSONS` | Individual content units within modules | ← Module, → Assignments |
| `ENROLLMENTS` | Student-course enrollment records with progress | ← User (student), ← Course |
| `ASSIGNMENTS` | Tasks assigned within lessons for evaluation | ← Lesson, → Submissions |
| `SUBMISSIONS` | Student assignment submissions with grades | ← Assignment, ← User (student) |
| `CERTIFICATES` | Completion certificates issued to students | ← User (student), ← Course |
