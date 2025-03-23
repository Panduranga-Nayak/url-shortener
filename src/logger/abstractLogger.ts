export abstract class AbstractLogger {
    abstract info(...params: any[]): void;
    abstract error(...params: any[]): void;
}