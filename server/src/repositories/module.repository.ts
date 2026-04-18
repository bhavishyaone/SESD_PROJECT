import { BaseRepository } from './base.repository';
import { Module } from '../models/course.model';
import { IModule } from '../interfaces/course.interface';

export class ModuleRepository extends BaseRepository<IModule> {
  constructor() {
    super(Module);
  }
}
