# Sequence Diagram — Learning Management System (LMS)

## Main Flow: Student Enrolls → Submits Assignment → Instructor Grades → Certificate Generated

This sequence diagram illustrates the complete lifecycle of a student interacting with the LMS system — from course enrollment to assignment submission, grading, progress update, and certificate generation.

The flow demonstrates interaction between:

- Student
- Instructor
- Frontend UI
- Controllers
- Services
- Repositories
- Database
- Notification System

---

## Sequence Diagram (Mermaid)

```mermaid
sequenceDiagram
autonumber

actor Student
actor Instructor

participant UI as Frontend UI
participant AuthC as AuthController
participant CourseC as CourseController
participant AssignC as AssignmentController
participant GradeC as GradingController

participant CourseS as CourseService
participant EnrollS as EnrollmentService
participant AssignS as AssignmentService
participant GradeS as GradingService
participant CertS as CertificateService

participant Repo as Repository Layer
participant DB as Database
participant Notify as NotificationService

%% =========================
%% Phase 1: Authentication
%% =========================

Student->>UI: Login Request
UI->>AuthC: POST /login
AuthC->>Repo: Validate User
Repo->>DB: Fetch User
DB-->>Repo: User Data
Repo-->>AuthC: Valid User
AuthC-->>UI: JWT Token
UI-->>Student: Login Success

%% =========================
%% Phase 2: Enrollment
%% =========================

Student->>UI: Enroll in Course
UI->>CourseC: POST /courses/:id/enroll
CourseC->>EnrollS: enrollStudent()
EnrollS->>Repo: Save Enrollment
Repo->>DB: Insert Enrollment
DB-->>Repo: Enrollment Created
Repo-->>EnrollS: Success
EnrollS-->>CourseC: Enrollment Confirmed
CourseC-->>UI: Enrollment Success
UI-->>Student: Enrollment Completed

%% =========================
%% Phase 3: Assignment Submission
%% =========================

Student->>UI: Submit Assignment
UI->>AssignC: POST /assignments/:id/submit
AssignC->>AssignS: createSubmission()
AssignS->>Repo: Save Submission
Repo->>DB: Insert Submission
DB-->>Repo: Submission Stored
Repo-->>AssignS: Success
AssignS-->>AssignC: Submission Recorded
AssignC-->>UI: Submission Success
UI-->>Student: Submitted

%% =========================
%% Phase 4: Instructor Grading
%% =========================

Instructor->>UI: Grade Submission
UI->>GradeC: POST /submissions/:id/grade
GradeC->>GradeS: evaluateSubmission()
GradeS->>Repo: Update Submission Marks
Repo->>DB: Update Submission
DB-->>Repo: Updated
Repo-->>GradeS: Success

GradeS->>EnrollS: updateProgress()
EnrollS->>Repo: Update Enrollment Progress
Repo->>DB: Update Progress
DB-->>Repo: Updated

GradeS->>CertS: checkCompletion()
CertS->>Repo: Verify Completion
Repo->>DB: Fetch Completion Status
DB-->>Repo: Completion True

alt Course Completed
    CertS->>Repo: Generate Certificate
    Repo->>DB: Insert Certificate
    DB-->>Repo: Certificate Created
    CertS->>Notify: Notify Student (Certificate Issued)
end

GradeS->>Notify: Notify Student (Assignment Graded)
Notify-->>Student: Real-time Notification

GradeS-->>GradeC: Grading Complete
GradeC-->>UI: Grade Updated
UI-->>Instructor: Success
```

---

## Flow Summary

| Phase | Description | Key Patterns Used |
|-------|-------------|-------------------|
| **1. Authentication** | Student logs in via Frontend UI. Credentials are validated through Controller → Repository → Database. JWT token is issued upon successful authentication. | Repository Pattern, Layered Architecture |
| **2. Enrollment** | Student enrolls in a course. Request flows through CourseController → EnrollmentService → Repository → Database. Enrollment record is created and confirmed. | Repository Pattern, Service Layer |
| **3. Assignment Submission** | Student submits an assignment. Submission flows through AssignmentController → AssignmentService → Repository → Database. Submission is stored and acknowledged. | Repository Pattern, Service Layer |
| **4. Grading & Certification** | Instructor grades the submission. GradingService updates marks, triggers progress update via EnrollmentService, checks completion via CertificateService, and generates certificate if course is completed. Notifications are sent to the student. | Strategy Pattern, Observer Pattern, Composite Pattern |
