import { isEmpty } from "lodash";
import { RedisCache } from "../boot/redisCache";
import { KafkaTopics } from "../utils/kafkaTopics";
import { ClickEventService } from '../services/clickEvent.service';
import { expireTime } from "../utils/redisConstants";
import { AbstractKafkaConsumer } from "./kafkaConsumer.abstract";
import { TrackingUrlService } from "../services/trackingUrl.service";

export class KafkaClickEvent extends AbstractKafkaConsumer {
    private static instance: KafkaClickEvent;
    private redis: RedisCache;
    private trackingUrlService: TrackingUrlService;
    private clickEventService: ClickEventService;

    private constructor() {
        super("click-event-group", [KafkaTopics.CLICK_EVENTS]);
        this.redis = RedisCache.getInstance();
        this.clickEventService = ClickEventService.getInstance();

        this.trackingUrlService = TrackingUrlService.getInstance();
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new KafkaClickEvent();
        }
        return this.instance;
    }

    protected async processMessage(message: Record<string, any>): Promise<void> {
        const { shortUrlId, utmSource, utmCampaign, ipAddress, userAgent, clickedAt } = message;
        let getTrackingUrl: any = await this.redis.hgetall(`trackingUrl-${shortUrlId}-${utmSource}-${utmCampaign}`);
        let trackingUrlId;
        if(isEmpty(getTrackingUrl)) {
            if(!isEmpty(utmSource)) {
                getTrackingUrl = await this.trackingUrlService.findTrackingUrl({ shortUrlId, utmSource, utmCampaign });
                if(isEmpty(getTrackingUrl)) {
                    trackingUrlId=null;
                } else {
                    trackingUrlId = getTrackingUrl._id.toString();
                }
                await this.redis.hset(`trackingUrl-${shortUrlId}-${utmSource}-${utmCampaign}`, {
                    trackingUrlId: trackingUrlId || null
                }, expireTime.URL_EXPIRY);
            } else {
                trackingUrlId = null;
            }
        } else {
            trackingUrlId = getTrackingUrl.trackingId
        }

        const insertObj = { trackingUrlId, shortUrlId, ipAddress, userAgent, clickedAt };

        await this.clickEventService.create(insertObj);
    }
}