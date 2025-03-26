import { KafkaTopics } from "../utils/kafkaTopics";
import { AbstractKafkaConsumer } from "./kafkaConsumer.abstract";
import { EmailService } from "../services/email.service";

export class KafkaEmailEvent extends AbstractKafkaConsumer {
    private static instance: KafkaEmailEvent;
    private emailService: EmailService;

    private constructor() {
        super("email-event-group", [KafkaTopics.EMAIL_EVENTS]);
        this.emailService = EmailService.getInstance();
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new KafkaEmailEvent();
        }
        return this.instance;
    }

    protected async processMessage(message: Record<string, any>): Promise<void> {
        await this.emailService.sendEmail({
            sendTo: message.sendTo,
            subject: message.subject,
            emailBody: message.emailBody,
        });
    }
}