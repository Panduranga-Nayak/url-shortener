export abstract class AbstractLogger {
    abstract info(message: string, meta?: any): void;
    abstract error(message: string, meta?: any): void;
}