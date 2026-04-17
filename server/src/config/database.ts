import mongoose from 'mongoose';

class Database {
  private static instance: Database;
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY_MS = 3000;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    let retries = 0;

    while (retries < this.MAX_RETRIES) {
      try {
        console.log(`Connecting to MongoDB... (Attempt ${retries + 1}/${this.MAX_RETRIES})`);
        await mongoose.connect(uri);
        console.log('Successfully connected to MongoDB');
        return;
      } catch (error) {
        retries++;
        console.error(`MongoDB connection failed: ${(error as Error).message}`);
        if (retries >= this.MAX_RETRIES) {
          console.error('Max connection retries reached. Exiting...');
          process.exit(1);
        }
        console.log(`Retrying in ${this.RETRY_DELAY_MS / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
      }
    }
  }
}

export default Database;
