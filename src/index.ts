import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import express, { Application } from 'express';
import { BootInitializer } from './boot';
import userRouter from './routes/user.routes';


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
