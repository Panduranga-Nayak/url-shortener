import { DataSource } from "typeorm";

//change file name to caps
export abstract class Database {
  abstract initialize(): Promise<void>;
  abstract getDataSource(): DataSource;
}
