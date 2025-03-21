import { Database } from "./database";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import * as path from "path";

export class PostgresDatabase extends Database {
    private static instance: PostgresDatabase | null = null;
    private dataSource: DataSource;

    private constructor() {
        super();
        this.dataSource = new DataSource({
            type: "postgres",
            host: process.env.HOST,
            port: Number(process.env.DBPORT),
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            synchronize: process.env.SYNCHRONIZE === 'true',
            logging: process.env.LOGGING === 'true',
            entities: [
                path.join(__dirname, "..", "entities/sql", "*.ts"),
            ],
            namingStrategy: new SnakeNamingStrategy(),
        });
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new PostgresDatabase();
        }
        return this.instance;
    }

    async initialize(): Promise<void> {
        await this.dataSource.initialize();
        console.log("✅ PostgreSQL database connected successfully");
    }

    getDataSource(): DataSource {
        return this.dataSource;
    }
}