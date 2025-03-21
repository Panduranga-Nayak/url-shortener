import mongoose from "mongoose";

export class MongoDatabase {
    private static instance: MongoDatabase;
    private mongoURI: string;

    private constructor() {
        const { MONGO_HOST, MONGO_PORT, MONGO_DB, MONGO_USER, MONGO_PASS } = process.env;
        this.mongoURI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new MongoDatabase();
        }
        return this.instance;
    }
  
    async initialize(): Promise<void> {
        try {
          await mongoose.connect(this.mongoURI);
          console.log("✅ MongoDB Connected Successfully");
        } catch (error) {
          console.error("❌ MongoDB Connection Failed:", error);
          process.exit(1);
        }
      }
}