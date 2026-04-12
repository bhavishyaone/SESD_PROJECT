import dotenv from 'dotenv';
import App from './app';
import Database from './config/database';

dotenv.config();

const startServer = async () => {
  await Database.getInstance().connect();
  const server = new App();
  server.listen();
};

startServer();
