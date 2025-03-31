import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import express, { Application } from 'express';
import { BootInitializer } from './boot';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.router';
import WinstonLogger from "./logger/winston";
import { LoggerRegistry } from "./logger/loggerRegistry";
import { KafkaProducer } from "./kafka/kafkaProducer";
import { stopKafkaConsumers } from "./boot/kafkaConsumers";
import discordStratergy from "./services/auth/stratergies/discord.strategy";
import googleStratergy from "./services/auth/stratergies/google.strategy";
import shortUrlRouter from './routes/shortUrl.routes';
import trackingUrlRouter from './routes/trackingUrl.routes';


const app: Application = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());


app.use(discordStratergy.getInstance().initialize());
app.use(googleStratergy.getInstance().initialize());

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/short-url", shortUrlRouter);
app.use("/api/tracking-url", trackingUrlRouter);

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

//shutdown kafka when shutting server
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down gracefully...");
  await KafkaProducer.getInstance().disconnect();
  await stopKafkaConsumers();
  process.exit(0);
});

startServer();
