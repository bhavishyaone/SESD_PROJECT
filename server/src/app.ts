import express, { Application } from 'express';

class App {
  public app: Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 5000;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.app.get('/', (req, res) => {
      res.status(200).json({ message: 'Welcome to LMS API' });
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`=================================`);
      console.log(`======= ENV: ${this.env} =======`);
      console.log(`🚀 App listening on the port ${this.port}`);
      console.log(`=================================`);
    });
  }
}

export default App;
