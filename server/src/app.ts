import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import assignmentRoutes from './routes/assignment.routes';
import certificateRoutes from './routes/certificate.routes';
import gradingRoutes from './routes/grading.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';

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
    // Support multiple CLIENT_URL values (comma-separated) or a wildcard for dev.
    // This handles cases where Vercel may serve under preview URLs.
    const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const allowedOrigins = rawClientUrl.split(',').map((u) => u.trim().replace(/\/$/, ''));

    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
          if (!origin) return callback(null, true);
          const normalized = origin.replace(/\/$/, '');
          if (allowedOrigins.includes(normalized)) {
            callback(null, true);
          } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error(`CORS: Origin not allowed — ${origin}`));
          }
        },
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  private initializeRoutes() {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/courses', courseRoutes);
    this.app.use('/api/enrollments', enrollmentRoutes);
    this.app.use('/api/assignments', assignmentRoutes);
    this.app.use('/api/certificates', certificateRoutes);
    this.app.use('/api/grading', gradingRoutes);
    this.app.use('/api/upload', uploadRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({ message: 'Welcome to LMS API' });
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;
