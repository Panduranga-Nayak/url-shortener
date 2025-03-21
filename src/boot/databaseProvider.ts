import { Database } from "./database";
import { PostgresDatabase } from "./postgresDatabase";


//review this once
export class DatabaseProvider {
    private static instance: Database;

    static getDatabase(): Database {
        if (!this.instance) {
            const dbType = process.env.DB_TYPE || "postgres";
            switch (dbType) {
                case "postgres":
                    this.instance = PostgresDatabase.getInstance();
                    break;
                
                default:
                    throw new Error(`Unsupported database type: ${dbType}`);
            }
        }
        return this.instance;
    }
}
