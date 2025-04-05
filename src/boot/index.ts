import { DatabaseProvider } from './databaseProvider';
import { Database } from './database';
import { RedisCache } from './redisCache';
import { MongoDatabase } from './mongoDatabase';
import { startKafkaConsumers } from './kafkaConsumers';
import { ClickDataProcessingCron } from '../cron/clickDataProcessingCron';

//change the file name to BootInitializer
export class BootInitializer {
    private pgDatabase: Database;
    private redis: RedisCache;
    private mongoDB: MongoDatabase;
    private clickDataProcessingCron: ClickDataProcessingCron;

    constructor() {
        this.pgDatabase = DatabaseProvider.getDatabase();
        this.redis = RedisCache.getInstance();
        this.mongoDB = MongoDatabase.getInstance();
        this.clickDataProcessingCron = ClickDataProcessingCron.getInstance();
    }

    public async initialize() {
        try {
            await this.pgDatabase.initialize();
            await this.mongoDB.initialize();
            await startKafkaConsumers();
            this.clickDataProcessingCron.start()

            console.log("Connected to Postgres Database Successfully");
        } catch (e) {
            console.log("Error during initialization", e);
            process.exit(1);
        }
    }
}