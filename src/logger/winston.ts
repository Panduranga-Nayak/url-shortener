import { AbstractLogger } from '../logger/abstractLogger'
import { createLogger, format, transports } from "winston";
const { combine, timestamp, json } = format;

class WinstonLogger extends AbstractLogger {
    private static instance: WinstonLogger;
    private logger;

    private constructor() {
        super();
        this.logger = createLogger({
            level: "info",
            format: combine(
                json(),
                timestamp({ format: "HH:MM:SS" }),
            ),
            transports: [
                new transports.Console(),
            ]
        });
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new WinstonLogger();
        }
        return this.instance;
    }

    public info(message: string, meta = {}): void {
        this.logger.info(message, meta);
    }

    public error(message: string, meta = {}): void {
        this.logger.error(message, meta);
    }
}

export default WinstonLogger;