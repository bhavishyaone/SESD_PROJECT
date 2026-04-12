import { Document, FilterQuery, Model, UpdateQuery, AnyKeys } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  public async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  public async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  public async save(data: AnyKeys<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  public async update(id: string, updateData: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  public async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
