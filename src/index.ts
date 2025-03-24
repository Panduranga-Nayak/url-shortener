import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import express, { Application } from 'express';
import { BootInitializer } from './boot';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.router';
import WinstonLogger from "./logger/winston";
import { LoggerRegistry } from "./logger/loggerRegistry";


const app: Application = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());


app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

LoggerRegistry.setLogger(WinstonLogger.getInstance());



async function startServer() {
  try {
    await new BootInitializer().initialize();
    console.log('All services initialized successfully');

    app.listen(port, () => {
      console.log(`Server is live at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error initializing services:', error);
  }
}

startServer();
