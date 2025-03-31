import crypto from 'crypto';
import base62 from 'base62';
import { generateRandomSalt } from '../utils/saltUtils';
import { ShortUrlDAO } from '../dao/sql/shortUrl.dao';
import { ShortUrl } from '../entities/sql/ShortUrl';
import { MAX_URL_COLLISION_RETRIES } from '../utils/urlConstants';
import { RedisCache } from '../boot/redisCache';
import { forEach, groupBy, isEmpty, map } from 'lodash';
import { expireTime } from '../utils/redisConstants';
import { KafkaProducer } from '../kafka/kafkaProducer'
import { KafkaTopics } from '../utils/kafkaTopics';
import { TrackingUrlService } from './trackingUrl.service';
import { LoggerRegistry } from '../logger/loggerRegistry';
import { CreateShortUrlRequest, DeleteUserUrlRequest, GetUserUrlRequest } from '../types/shortUrl.types';
import { convertKeysToCamelCase } from '../utils/utils';

const log = LoggerRegistry.getLogger();

export class ShortUrlService {
    private static instance: ShortUrlService;
    private shortUrlDAO: ShortUrlDAO;
    private redis: RedisCache;
    private kafkaProducer: KafkaProducer;
    private trackingUrlService!: TrackingUrlService;

    private constructor(){
        this.shortUrlDAO = new ShortUrlDAO();

        this.kafkaProducer = KafkaProducer.getInstance();
        this.redis = RedisCache.getInstance();
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new ShortUrlService();
            this.instance.trackingUrlService = TrackingUrlService.getInstance();
        }
        return this.instance;
    }

    // private ensureUrlProtocol(originalUrl: string): string {
    //     if (!URL_PROTOCOL_PATTERN.test(originalUrl)) {
    //         throw new Error("Invalid originalUrl Format")
    //     }
    //     return originalUrl;
    // }

    public async getShortUrlById(data:  {shortUrlId: string, userId: string}) {
        return await this.shortUrlDAO.getShortUrlById(data);
    }
    
    //fix all of this data types later
    public async createShortUrl(data: CreateShortUrlRequest) {
        let collision = true;
        let retryCount = 0;
        const originalUrl = data.originalUrl;
        //add a check here to see if shortUrl exists or not so dups are not created... optional
        let shortUrlRes;
        let url = "";
        while(collision && retryCount < MAX_URL_COLLISION_RETRIES) {
            try {
                // let originalUrl = this.ensureUrlProtocol(data.originalUrl);
                
                const shortUrl = await this.generateShortUrlCode(originalUrl);
                shortUrlRes = await this.shortUrlDAO.create(new ShortUrl({ userId: data.userId, originalUrl, shortUrl}));
                url = this.generateUrl(shortUrlRes.shortUrl)
                collision = false;
            } catch (e) {
                log.info("collison occures, re-computing shorturl");
                retryCount++;
                if(retryCount==MAX_URL_COLLISION_RETRIES) {
                    return Promise.reject({
                        success: false,
                        isCustomError: true,
                        message: "Failed to create url"
                    })
                }
            }
        }

        return Promise.resolve({
            success: true,
            message: "URL created successfully",
            data: convertKeysToCamelCase({...shortUrlRes, url}),
        })
    }

    private async generateShortUrlCode(originalUrl: string) {
        const randomSalt = generateRandomSalt();
        const combined = `${randomSalt}:${Date.now}:${originalUrl}`;

        const hash = crypto.createHash('sha256').update(combined).digest('hex');
        const hashNumber = BigInt('0x' + hash.slice(0, 16));
        const shortUrl = base62.encode(Number(hashNumber));

        return shortUrl.substring(0, 8);
    }

    public async redirectToOriginalUrl(data: {shortUrl: string, utmSource: string, utmCampaign: string, ipAddress: string, userAgent: string}) {
        const shortUrl = data.shortUrl;
        let getUrl: any = await this.redis.hgetset(`redirectURL-${shortUrl}`, expireTime.URL_EXPIRY);
        if (isEmpty(getUrl)) {
            getUrl = await this.shortUrlDAO.getShortUrl(shortUrl);
            if (!getUrl) {
                return Promise.reject({
                    success: false,
                    statusCode: 404,
                    isCustomError: true,
                    message: "URL not found"
                })
            }
            await this.redis.hset(`redirectURL-${shortUrl}`, {originalUrl: getUrl.originalUrl, id: getUrl.id}, expireTime.URL_EXPIRY);
        }

        await this.kafkaProducer.sendMessage(KafkaTopics.CLICK_EVENTS, {
            shortUrlId: getUrl.id,
            utmSource: data.utmSource,
            utmCampaign: data.utmCampaign,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            clickedAt: new Date().toISOString(),
        });


        return Promise.resolve({
            success: true,
            statusCode: 301,
            data: {
                redirectUrl: getUrl.originalUrl
            }
        });
    }

    public async getShortUrlByIdBulk(shortUrlId: string[]) {
        return await this.shortUrlDAO.getShortUrlByIdBulk(shortUrlId);
    }

    public async getUserUrls(data: GetUserUrlRequest) {
        const{userId, pagination} = data;
        const daoObj = {
            userId: userId,
            itemsPerPage: pagination.itemsPerPage,
            skip: (pagination.pageNo-1)*pagination.itemsPerPage,
        }
        const shortUrls = await this.shortUrlDAO.getUserShortUrlPaginated(daoObj);
        //not populate all the id's and call the mongo and merge it with this
        if(isEmpty(shortUrls)) {
            return Promise.resolve({
                success: true,
                data: [],
                message: "All urls are returned to the user"
            });
        }
        const shortUrlIds: string[] = map(shortUrls, (shortUrl) => shortUrl.id).filter(Boolean) as string[];
        const trackingUrls = await this.trackingUrlService.findTrackingUrlsByShortUrlIds({shortUrlIds, });
        if (!isEmpty(trackingUrls)) {
            const trackingUrlsMap = groupBy(trackingUrls, 'shortUrlId')
            forEach(shortUrls, (shortUrl: any) => {
                if (trackingUrlsMap[shortUrl.id]) {
                    shortUrl.trackingUrls = trackingUrlsMap[shortUrl.id];
                    forEach(shortUrl.trackingUrls, (tracking) => {
                        tracking._doc.url = this.trackingUrlService.generateURLWithSourceAndCampaign(shortUrl, tracking.toObject());
                    })
                }
                shortUrl.url = this.generateUrl(shortUrl.shortUrl);
            });
        }
        return Promise.resolve({
            success: true,
            data: shortUrls,
            pagination: {
                pageNo: pagination.pageNo,
                totalItems: daoObj.skip + shortUrls.length
            }
        });
    }

    public async deleteUserUrlService(data: DeleteUserUrlRequest) {
        await Promise.all([
            this.updateUserShortUrl({ id: data.shortUrlId, userId: data.userId }, { isActive: false }),
            TrackingUrlService.getInstance().deleteTrackingUrlBulk({ userId: data.userId, shortUrlId: data.shortUrlId })
        ]);
    }

    public async updateUserShortUrl(findObj:Partial<ShortUrl>, updateObj: Partial<ShortUrl>) {
        const updateRes =  await this.shortUrlDAO.update(findObj, updateObj);
        if(!updateRes.affected) {
            return Promise.reject({
                success: false,
                isCustomError: true,
                message: "invalid url error"
            })
        }
        await this.redis.del(`redirectURL-${updateRes?.raw[0]?.short_url}`);
        return {...updateRes.raw[0], url: this.generateUrl(updateRes?.raw[0]?.short_url)};
    }

    private generateUrl(shortUrl: string) {
        return `${process.env.URL_DOMAIN}/${process.env.SHORT_URL_DOMAIN}?shortUrl=${shortUrl}`
    }
}