import { groupBy, isEmpty, keyBy, map, mapValues } from "lodash";
import { AbstractCron } from "./cron.abstract";
import { User } from "../entities/sql/User";
import { ClickEventService } from "../services/clickEvent.service";
import { TrackingUrlService } from "../services/trackingUrl.service";
import { ShortUrlService } from "../services/shortUrl.service";
import { UserService } from "../services/user.service";
import { EmailService } from "../services/email.service";
import { KafkaTopics } from "../utils/kafkaTopics";
import { KafkaProducer } from "../kafka/kafkaProducer";

export class ClickDataProcessingCron extends AbstractCron {
    private static instance: ClickDataProcessingCron
    private clickEventService: ClickEventService;
    private trackingUrlService: TrackingUrlService;
    private shortUrlService: ShortUrlService;
    private userService: UserService;
    private emailService: EmailService;
    private kafkaProducer: KafkaProducer;


    private constructor() {
        super("0 0 * * *", "Data Processing");

        this.clickEventService = ClickEventService.getInstance();
        this.trackingUrlService = TrackingUrlService.getInstance();
        this.shortUrlService = ShortUrlService.getInstance();
        this.userService = UserService.getInstance();
        this.emailService = EmailService.getInstance();
        this.kafkaProducer = KafkaProducer.getInstance();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ClickDataProcessingCron();
        }
        return this.instance;
    }

    public async execute(): Promise<void> {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        const toDate = new Date();

        let getClickEvents = await this.clickEventService.getRecordsBetweenDates(fromDate, toDate);
        if (isEmpty(getClickEvents)) {
            return;
        }

        const trackingUrlIds = [
            ...new Set(
                map(getClickEvents, e => e.toObject().trackingUrlId?.toString())
                .filter(Boolean)
            )
          ];
        
        const shortUrlIds = [
            ...new Set(
                map(getClickEvents, e => e.toObject().shortUrlId?.toString())
                .filter(Boolean)
            )
        ] as string[]

        const [fetchTrackingDetails, shortUrlInfo] = await Promise.all([
            this.trackingUrlService.findByTrackingUrlIds(trackingUrlIds),
            this.shortUrlService.getShortUrlByIdBulk(shortUrlIds)
        ]);

        //check what mapValues does
        const clickCountByTrackingUrl: any = mapValues(
            groupBy(getClickEvents,
                (event) => `${event.trackingUrlId}|${event.shortUrlId}`), (events: any) => events.length);

        const shortUrlMap = keyBy(shortUrlInfo, "id");
        const trackingUrlMap = keyBy(fetchTrackingDetails, "_id");

        const reportData: any = {}
        for (const [k, count] of Object.entries(clickCountByTrackingUrl)) {
            const [trackingUrlId, shortUrlId] = k.split("|");

            const trackingUrl = trackingUrlMap[trackingUrlId] || null;
            const shortUrl = shortUrlMap[shortUrlId] || null;

            const key = `${shortUrl.shortUrl}|${trackingUrl?.utmSource || "NA"}|${trackingUrl?.utmCampaign || "NA"}`;
            if (!reportData[shortUrl.userId]) {
                reportData[shortUrl.userId] = {};
            }
            reportData[shortUrl.userId][key] = count;
        }

        const userIds = [...new Set(map(shortUrlInfo, 'userId').filter(Boolean))];
        const userInfo: User[] = await this.userService.findByIds(userIds);

        for (const user of userInfo) {
            const body = this.emailService.generateEmailBodyDataProcessing(user.id!, reportData)

            //call kafka producer which implements the email service
            await this.kafkaProducer.sendMessage(KafkaTopics.EMAIL_EVENTS, {
                //user.email
                sendTo: user.email,
                subject: "Your Short URL Report",
                emailBody: body
            });
        }

        return;
    }
}