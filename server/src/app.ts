import express, { Application, Request, Response } from 'express';
import cors from 'cors';

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
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({ message: 'Welcome to LMS API' });
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
    console.log(` App listening on the port ${this.port}`);

    });
  }
}

export default App;
