import { mailTransport } from "../boot/email";
import { LoggerRegistry } from "../logger/loggerRegistry";

const log = LoggerRegistry.getLogger();

export class EmailService {
    private static instance: EmailService;

    private constructor() {};

    public static getInstance() {
        if(!this.instance) {
            this.instance = new EmailService();
        }
        return this.instance;
    }

    public async sendEmail(data: {sendTo: string, subject: string, emailBody: string}) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: data.sendTo,
            subject: data.subject,
            text: data.emailBody,
        };

        try {
            log.info(`Sending email to ${data.sendTo}`);
            await mailTransport.sendMail(mailOptions);
            log.info(`Email sent to ${data.sendTo}`);
        } catch (error) {
            log.error(`Error sending email to ${data.sendTo}:`, error);
        }
    }
}