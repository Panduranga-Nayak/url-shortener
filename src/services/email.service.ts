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

    public generateEmailBodyDataProcessing(userId: string, reportData: Record<string, any>) {
        let body = `This is the report for all the short URLs for the last 24 hours.\n\n`;

        for(const key in reportData[userId]) {
            const [shortUrl, utmSource, utmCampaign] = key.split("|");
            const interactionCount = reportData[userId][key];

            if (utmSource === "NA" && utmCampaign === "NA") {
                body += `${shortUrl} has had ${interactionCount} interaction(s).\n`;
            } else {
                body += `${shortUrl} on ${utmSource} in the ${utmCampaign} campaign has had ${interactionCount} interaction(s).\n`;
            }
        }
        return body;
    }
}