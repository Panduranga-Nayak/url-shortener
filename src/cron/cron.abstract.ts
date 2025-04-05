import cron from 'node-cron';
import { LoggerRegistry } from '../logger/loggerRegistry';

const log = LoggerRegistry.getLogger();

export abstract class AbstractCron {
    private cronExpression: string;
    private task!: cron.ScheduledTask | null;
    private name: string;

    constructor(expression: string, name: string) {
        this.cronExpression = expression;
        this.name = name;
    }

    public abstract execute(): Promise<void>;
    
    public start() {
        if(this.task) {
            console.warn("⚠️ Cron job already running.");
            return;
        }
        this.task= cron.schedule(this.cronExpression, async () => {
            log.info(`⏳ Running cron job: ${this.constructor.name}`);
            try {
                await this.execute();
                log.info(`✅ ${this.constructor.name} completed.`);
            } catch (e) {
                log.error(`❌ Error in ${this.constructor.name}:`, e);
            }
        });
        log.info(`✅ Cron job started: ${this.name} (${this.cronExpression})`);
    }

    public stop() {
        this.task?.stop();
        this.task = null;
        console.log("🛑 Cron Stopped")
    }

}