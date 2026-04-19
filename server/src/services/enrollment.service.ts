import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { LessonProgressRepository } from '../repositories/lessonProgress.repository';
import { LessonRepository } from '../repositories/lesson.repository';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { CourseService } from './course.service';
import { CertificateService } from './certificate.service';
import { IEnrollment } from '../interfaces/enrollment.interface';
import { ILessonProgress } from '../interfaces/lessonProgress.interface';
import ApiError from '../utils/ApiError';

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;
  private lessonProgressRepository: LessonProgressRepository;
  private courseService: CourseService;
  private certificateService: CertificateService;
  private lessonRepository: LessonRepository;
  private assignmentRepository: AssignmentRepository;

  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
    this.lessonProgressRepository = new LessonProgressRepository();
    this.courseService = new CourseService();
    this.certificateService = new CertificateService();
    this.lessonRepository = new LessonRepository();
    this.assignmentRepository = new AssignmentRepository();
  }

  public async enrollStudent(studentId: string, courseId: string): Promise<IEnrollment> {
    const existing = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) throw new ApiError(409, 'Already enrolled in this course');
    return this.enrollmentRepository.save({ studentId, courseId } as any);
  }

  public async getEnrollmentsByStudent(studentId: string): Promise<IEnrollment[]> {
    return this.enrollmentRepository.findByStudent(studentId);
  }

  public async getEnrollmentsByCourse(courseId: string): Promise<IEnrollment[]> {
    return this.enrollmentRepository.findByCourse(courseId);
  }

  public async getEnrollment(id: string): Promise<IEnrollment> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) throw new ApiError(404, 'Enrollment not found');
    return enrollment;
  }

  public async updateLessonProgress(studentId: string, courseId: string, lessonId: string, actionType: 'video' | 'notes' | 'quiz'): Promise<IEnrollment | null> {
      let enrollment = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId) as any;
      if (!enrollment) throw new ApiError(404, 'Enrollment not found');

      if (!enrollment.progressTracking) {
          enrollment.progressTracking = [];
      }

      let track = enrollment.progressTracking.find((t: any) => t.lessonId.toString() === lessonId.toString());
      if (!track) {
          track = { lessonId, videoWatched: false, notesDownloaded: false, quizAttempted: false, isCompleted: false };
          enrollment.progressTracking.push(track);
      }

      if (actionType === 'video') track.videoWatched = true;
      if (actionType === 'notes') track.notesDownloaded = true;
      if (actionType === 'quiz') track.quizAttempted = true;
      const lesson = await this.lessonRepository.findById(lessonId);
      const assignments = await this.assignmentRepository.findAll({ lessonId } as any);
      
      const requiresVideo = !!(lesson?.videoUrl);
      const requiresNotes = !!(lesson?.notesUrl);
      const requiresQuiz = assignments.length > 0;

      let complete = true;
      if (requiresVideo && !track.videoWatched) complete = false;
      if (requiresNotes && !track.notesDownloaded) complete = false;
      if (requiresQuiz && !track.quizAttempted) complete = false;
      track.isCompleted = complete;

      await enrollment.save();
      return this.updateProgress(studentId, courseId);
  }

  public async updateProgress(studentId: string, courseId: string, explicitProgress?: number): Promise<IEnrollment | null> {
    const enrollment = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId) as any;
    if (!enrollment) throw new ApiError(404, 'Enrollment not found');

    let progress = explicitProgress ?? 0;

    if (explicitProgress === undefined) {
        const completedCount = enrollment.progressTracking?.filter((t: any) => t.isCompleted).length || 0;
        const modules = await this.courseService.getCourseModules(courseId);
        let totalLessons = 0;
        for (const mod of modules) {
             const lessons = await this.courseService.getModuleLessons((mod as any)._id.toString());
             totalLessons += lessons.length;
        }

        if (totalLessons > 0) {
            progress = Math.round((completedCount / totalLessons) * 100);
        }
    }

    const status = progress >= 100 ? 'completed' : 'active';
    enrollment.progress = progress;
    enrollment.status = status;
    const updated = await enrollment.save();

    if (progress >= 100) {
        await this.certificateService.checkAndGenerate(studentId, courseId);
    }

    return updated;
  }

  public async completeLesson(studentId: string, lessonId: string, courseId: string): Promise<ILessonProgress> {
     const existing = await this.lessonProgressRepository.findByStudentAndLesson(studentId, lessonId);
     if (existing) return existing;

     const progressRecord = await this.lessonProgressRepository.save({ studentId, lessonId, courseId } as any);
     await this.updateProgress(studentId, courseId);

     return progressRecord;
  }

  public async getLessonProgressForStudent(studentId: string, courseId: string): Promise<ILessonProgress[]> {
      return this.lessonProgressRepository.findByStudentAndCourse(studentId, courseId);
  }

}
