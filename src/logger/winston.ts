import { map } from 'lodash';
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
        if (!this.instance) {
            this.instance = new WinstonLogger();
        }
        return this.instance;
    }

    public info(...params: any[]): void {
        this.logger.info(map(params, (p => typeof p === "object" ? JSON.stringify(p) : p)));
    }

    public error(...params: any[]): void {
        this.logger.error(map(params, (p => typeof p === "object" ? JSON.stringify(p) : p)));
    }
}

export default WinstonLogger;