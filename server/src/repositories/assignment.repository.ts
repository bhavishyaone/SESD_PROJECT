import { BaseRepository } from './base.repository';
import { Assignment, Submission } from '../models/assignment.model';
import { IAssignment, ISubmission } from '../interfaces/assignment.interface';

export class AssignmentRepository extends BaseRepository<IAssignment> {
  constructor() {
    super(Assignment);
  }
}

export class SubmissionRepository extends BaseRepository<ISubmission> {
  constructor() {
    super(Submission);
  }
}
