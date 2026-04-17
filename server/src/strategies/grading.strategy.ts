import { ISubmission } from '../interfaces/assignment.interface';

export interface GradingStrategy {
  calculate(submission: Partial<ISubmission>, maxMarks: number): number;
}

export class PercentageStrategy implements GradingStrategy {
  calculate(submission: Partial<ISubmission>, maxMarks: number): number {
    if (!submission.marks) return 0;
    return (submission.marks / maxMarks) * 100;
  }
}

export class PassFailStrategy implements GradingStrategy {
  calculate(submission: Partial<ISubmission>, maxMarks: number): number {
    if (!submission.marks) return 0;
    return (submission.marks / maxMarks) >= 0.5 ? 1 : 0;
  }
}
