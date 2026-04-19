import { AssignmentRepository, SubmissionRepository } from '../repositories/assignment.repository';
import { CourseRepository } from '../repositories/course.repository';
import { ModuleRepository } from '../repositories/module.repository';
import { LessonRepository } from '../repositories/lesson.repository';
import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { IAssignment, ISubmission } from '../interfaces/assignment.interface';
import { Course } from '../models/course.model';
import ApiError from '../utils/ApiError';

export class AssignmentService {
  private assignmentRepository: AssignmentRepository;
  private submissionRepository: SubmissionRepository;
  private courseRepository: CourseRepository;
  private moduleRepository: ModuleRepository;
  private lessonRepository: LessonRepository;
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.assignmentRepository = new AssignmentRepository();
    this.submissionRepository = new SubmissionRepository();
    this.courseRepository = new CourseRepository();
    this.moduleRepository = new ModuleRepository();
    this.lessonRepository = new LessonRepository();
    this.enrollmentRepository = new EnrollmentRepository();
  }

  public async createAssignment(data: Partial<IAssignment>): Promise<IAssignment> {
    return this.assignmentRepository.save(data as any);
  }

  public async submitAssignment(data: Partial<ISubmission>): Promise<ISubmission> {
    const assignment = await this.assignmentRepository.findById(data.assignmentId!.toString());
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    let totalMarks = 0;
    if (data.answers && Array.isArray(data.answers)) {
      assignment.questions.forEach((q, idx) => {
        if (q.correctOptionIndex === data.answers![idx]) {
          totalMarks += q.marks;
        }
      });
    }

    const payload = {
      ...data,
      marks: totalMarks,
      status: 'graded'
    };

    return this.submissionRepository.save(payload as any);
  }

  public async getSubmissions(filter: Record<string, any> = {}): Promise<ISubmission[]> {
    return this.submissionRepository.findAll(filter);
  }

  public async getSubmissionById(submissionId: string): Promise<ISubmission> {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) throw new ApiError(404, 'Submission not found');
    return submission;
  }

  public async getAssignmentById(assignmentId: string): Promise<IAssignment> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) throw new ApiError(404, 'Assignment not found');
    return assignment;
  }

  public async getAssignmentsByLesson(lessonId: string): Promise<IAssignment[]> {
    return this.assignmentRepository.findAll({ lessonId } as any);
  }

  public async getInstructorStats(instructorId: string): Promise<any[]> {
    const courses = await this.courseRepository.findAll({ instructorId } as any);
    if (!courses.length) return [];

    const stats: any[] = [];

    for (const course of courses) {
      const courseIdStr = course._id!.toString();
      
      const enrollments = await this.enrollmentRepository.findAll({ courseId: courseIdStr } as any);
      const totalEnrolled = enrollments.length;

      const modules = await this.moduleRepository.findAll({ courseId: courseIdStr } as any);
      if (!modules.length) continue;

      const moduleIds = modules.map(m => m._id!.toString());
      const lessons = await this.lessonRepository.findAll({ moduleId: { $in: moduleIds } } as any);
      if (!lessons.length) continue;

      const lessonIds = lessons.map(l => l._id!.toString());
      const assignments = await this.assignmentRepository.findAll({ lessonId: { $in: lessonIds } } as any);

      for (const assignment of assignments) {
        const submissions = await this.submissionRepository.findAll({ assignmentId: assignment._id!.toString() } as any);
        const uniqueStudents = new Set(submissions.map(s => s.studentId.toString()));

        stats.push({
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          courseName: course.title,
          totalEnrolled,
          totalCompleted: uniqueStudents.size,
          maxMarks: assignment.maxMarks
        });
      }
    }

    return stats;
  }
}
