import { AbstractLogger } from "./abstractLogger";
import WinstonLogger from "./winston";

export class LoggerRegistry {
    private static instance: AbstractLogger;

    public static setLogger(logger: AbstractLogger) {
        this.instance = logger;
    }

    public static getLogger(): AbstractLogger {
        if (!this.instance) {
            this.instance = WinstonLogger.getInstance();
        }
        return this.instance;
    }
}

