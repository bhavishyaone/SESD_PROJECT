# Class Diagram — Learning Management System (LMS)

## Overview

This class diagram illustrates the core domain model, service layer structure, and key relationships within the Learning Management System (LMS).  

The design follows a clean layered architecture:

Controller → Service → Repository  

It demonstrates strong Object-Oriented Programming principles and proper separation of concerns.

---

## Class Diagram (Mermaid)

```mermaid
classDiagram

%% =========================
%% Abstract User
%% =========================

class User {
    <<abstract>>
    - id: string
    - name: string
    - email: string
    - password: string
    + login()
    + logout()
    + getRole()
}

class Student {
    + enroll(courseId)
    + submitAssignment()
    + viewProgress()
}

class Instructor {
    + createCourse()
    + addModule()
    + createAssignment()
    + gradeSubmission()
}

class Admin {
    + manageUsers()
    + approveCourse()
}

User <|-- Student
User <|-- Instructor
User <|-- Admin

%% =========================
%% Course Structure (Composite)
%% =========================

class Course {
    - id: string
    - title: string
    - description: string
    - status: string
    + publish()
    + addModule()
}

class Module {
    - id: string
    - title: string
    + addLesson()
}

class Lesson {
    - id: string
    - title: string
    - content: string
}

Course "1" --> "many" Module
Module "1" --> "many" Lesson

%% =========================
%% Enrollment
%% =========================

class Enrollment {
    - id: string
    - progress: number
    - status: string
    + updateProgress()
    + completeCourse()
}

Student "1" --> "many" Enrollment
Course "1" --> "many" Enrollment

%% =========================
%% Assignment System
%% =========================

class Assignment {
    - id: string
    - maxMarks: number
    - gradingType: string
}

class Submission {
    - id: string
    - content: string
    - marks: number
    - status: string
    + evaluate()
}

Lesson "1" --> "many" Assignment
Assignment "1" --> "many" Submission
Student "1" --> "many" Submission

%% =========================
%% Grading Strategy (Strategy Pattern)
%% =========================

class GradingStrategy {
    <<interface>>
    + calculate(submission)
}

class PercentageStrategy {
    + calculate(submission)
}

class PassFailStrategy {
    + calculate(submission)
}

GradingStrategy <|.. PercentageStrategy
GradingStrategy <|.. PassFailStrategy

Submission --> GradingStrategy

%% =========================
%% Certificate
%% =========================

class Certificate {
    - id: string
    - issueDate: Date
    + generate()
}

Student "1" --> "many" Certificate
Course "1" --> "many" Certificate

%% =========================
%% Service Layer
%% =========================

class AuthService {
    + login()
    + register()
}

class CourseService {
    + createCourse()
    + publishCourse()
}

class EnrollmentService {
    + enrollStudent()
    + updateProgress()
}

class AssignmentService {
    + createAssignment()
    + submitAssignment()
}

class GradingService {
    + evaluateSubmission()
}

class CertificateService {
    + generateCertificate()
}

%% =========================
%% Repository Layer
%% =========================

class UserRepository {
    + findById()
    + save()
}

class CourseRepository {
    + findById()
    + save()
}

class EnrollmentRepository {
    + save()
}

class AssignmentRepository {
    + save()
}

class SubmissionRepository {
    + save()
}

%% =========================
%% Layered Relationships
%% =========================

AuthService --> UserRepository
CourseService --> CourseRepository
EnrollmentService --> EnrollmentRepository
AssignmentService --> AssignmentRepository
GradingService --> SubmissionRepository
CertificateService --> EnrollmentRepository
```

