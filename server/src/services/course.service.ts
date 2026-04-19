import { CourseRepository } from '../repositories/course.repository';
import { ICourse, IModule, ILesson } from '../interfaces/course.interface';
import ApiError from '../utils/ApiError';
import { ModuleRepository } from '../repositories/module.repository';
import { LessonRepository } from '../repositories/lesson.repository';
import { AssignmentRepository } from '../repositories/assignment.repository';

export class CourseService {
  private courseRepository: CourseRepository;
  private moduleRepository: ModuleRepository;
  private lessonRepository: LessonRepository;
  private assignmentRepository: AssignmentRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
    this.moduleRepository = new ModuleRepository();
    this.lessonRepository = new LessonRepository();
    this.assignmentRepository = new AssignmentRepository();
  }

  public async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return this.courseRepository.save(courseData as any);
  }

  public async getAllCourses(filter: Record<string, any> = {}): Promise<ICourse[]> {
    return this.courseRepository.findAll(filter);
  }

  public async getCourseById(id: string): Promise<ICourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  }

  public async updateCourse(id: string, data: Partial<ICourse>): Promise<ICourse> {
    const course = await this.courseRepository.update(id, data as any);
    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  }

  public async publishCourse(id: string): Promise<ICourse> {
    const course = await this.courseRepository.update(id, { status: 'published' } as any);
    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  }

  public async deleteCourse(id: string): Promise<void> {
    await this.courseRepository.delete(id);
  }

  public async createModule(moduleData: Partial<IModule>): Promise<IModule> {
    return this.moduleRepository.save(moduleData as any);
  }

  public async getCourseModules(courseId: string): Promise<IModule[]> {
    return this.moduleRepository.findAll({ courseId } as any);
  }

  public async deleteModule(moduleId: string): Promise<void> {
    await this.moduleRepository.delete(moduleId);
  }

  public async createLesson(lessonData: Partial<ILesson>): Promise<ILesson> {
    return this.lessonRepository.save(lessonData as any);
  }

  public async getModuleLessons(moduleId: string): Promise<ILesson[]> {
    return this.lessonRepository.findAll({ moduleId } as any);
  }

  public async deleteLesson(lessonId: string): Promise<void> {
    await this.lessonRepository.delete(lessonId);
  }

  public async getCourseAssignments(courseId: string): Promise<any[]> {
    const modules = await this.moduleRepository.findAll({ courseId } as any);
    const moduleIds = modules.map((m: any) => m._id.toString());
    const lessons = await this.lessonRepository.findAll({ moduleId: { $in: moduleIds } } as any);
    const lessonIds = lessons.map((l: any) => l._id.toString());
    return this.assignmentRepository.findAll({ lessonId: { $in: lessonIds } } as any);
  }

  public async getInstructorDashboardStats(instructorId: string): Promise<any[]> {
    const { Enrollment } = await import('../models/enrollment.model');
    const { Assignment, Submission } = await import('../models/assignment.model');

    const courses = await this.courseRepository.findAll({ instructorId } as any);
    const result: any[] = [];

    for (const course of courses) {
      const courseIdStr = course._id!.toString();
      const enrollments = await Enrollment.find({ courseId: courseIdStr }).populate('studentId', 'name email').lean();
      const totalEnrolled = enrollments.length;
      const totalCourseCompleted = enrollments.filter((e: any) => e.status === 'completed' || e.progress === 100).length;
      let totalLectureCompletions = 0;
      let totalVideoWatched = 0;
      let totalNotesDownloaded = 0;
      let totalQuizAttempted = 0;

      for (const enr of enrollments) {
        const tracking = (enr as any).progressTracking || [];
        totalLectureCompletions += tracking.filter((t: any) => t.isCompleted).length;
        totalVideoWatched += tracking.filter((t: any) => t.videoWatched).length;
        totalNotesDownloaded += tracking.filter((t: any) => t.notesDownloaded).length;
        totalQuizAttempted += tracking.filter((t: any) => t.quizAttempted).length;
      }
      const modules = await this.moduleRepository.findAll({ courseId: courseIdStr } as any);
      const moduleIds = modules.map((m: any) => m._id.toString());
      const lessons = await this.lessonRepository.findAll({ moduleId: { $in: moduleIds } } as any);
      const lessonIds = lessons.map((l: any) => l._id.toString());
      const assignments = await Assignment.find({ lessonId: { $in: lessonIds } }).lean();

      const assignmentStats: any[] = [];
      for (const assignment of assignments) {
        const submissions = await Submission.find({ assignmentId: assignment._id }).lean();
        const uniqueSubmitters = new Set(submissions.map((s: any) => s.studentId.toString()));
        const passingMark = assignment.maxMarks * 0.5;
        const correctSubmissions = submissions.filter((s: any) => (s.marks || 0) >= passingMark);
        const uniqueCorrect = new Set(correctSubmissions.map((s: any) => s.studentId.toString()));

        assignmentStats.push({
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          maxMarks: assignment.maxMarks,
          totalSubmitted: uniqueSubmitters.size,
          totalCorrect: uniqueCorrect.size,
        });
      }

      result.push({
        courseId: course._id,
        courseTitle: course.title,
        courseStatus: (course as any).status,
        totalEnrolled,
        totalCourseCompleted,
        totalLectureCompletions,
        totalVideoWatched,
        totalNotesDownloaded,
        totalQuizAttempted,
        assignments: assignmentStats,
      });
    }

    return result;
  }
}
