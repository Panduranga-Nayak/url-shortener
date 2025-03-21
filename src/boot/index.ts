import { DatabaseProvider } from './databaseProvider';
import { Database } from './database';
import { RedisCache } from './redisCache';
import { MongoDatabase } from './mongoDatabase';

//change the file name to BootInitializer
export class BootInitializer {
    private pgDatabase: Database;
    private redis: RedisCache;
    private mongoDB: MongoDatabase;

    constructor() {
        this.pgDatabase = DatabaseProvider.getDatabase();
        this.redis = RedisCache.getInstance();
        this.mongoDB = MongoDatabase.getInstance();
    }

    public async initialize() {
        try {
            await this.pgDatabase.initialize();
            await this.mongoDB.initialize();

            console.log("Connected to Postgres Database Successfully");
        } catch (e) {
            console.log("Error during initialization", e);
            process.exit(1);
        }
    }
}