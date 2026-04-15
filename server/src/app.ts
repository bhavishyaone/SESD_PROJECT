import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';

class App {
  public app: Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 5000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/courses', courseRoutes);
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({ message: 'Welcome to LMS API' });
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public listen() {
    this.app.listen(this.port, () => {
    console.log(` App listening on the port ${this.port}`);

    });
  }
}

export default App;
