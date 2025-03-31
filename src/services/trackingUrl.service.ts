import { Types } from "mongoose";
import { TrackingUrlDAO } from "../dao/mongo/trackingUrl.dao";
import { ShortUrlService } from "./shortUrl.service";
import { ShortUrl } from "../entities/sql/ShortUrl";
import { CreateTrackingUrlRequest, DeleteTrackingUrlRequest, UpdateTrackingUrlRequest } from "../types/trackingUrl.types";

export class TrackingUrlService {
    private static instance: TrackingUrlService;
    private trackingUrlDAO: TrackingUrlDAO;
    private shortUrlService: ShortUrlService;

    private constructor() {
        this.trackingUrlDAO = new TrackingUrlDAO();
        this.shortUrlService = ShortUrlService.getInstance();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new TrackingUrlService();
        }
        return this.instance;
    }

    public async createTrackingUrl(data: CreateTrackingUrlRequest) {
        const { trackingUrl, shortUrl } =  await this.findOrCreate(data);

        const url = this.generateURLWithSourceAndCampaign(shortUrl!, trackingUrl);

        return {...trackingUrl, url};
    }

    public async findOrCreate(data: { userId: string, shortUrlId: string, utmSource: string, utmCampaign: string }) {
        const getShortUrl = await this.shortUrlService.getShortUrlById({shortUrlId: data.shortUrlId, userId: data.userId});
        if (!getShortUrl) {
            return Promise.reject({
                success: false,
                isCustomError: true,
                message: "short url doesnt exist"
            })
        }

        const findOne = await this.trackingUrlDAO.findTrackingUrl(data);
        if (!findOne) {
            const createTrackingUrl = await this.trackingUrlDAO.insertOne({
                userId: data.userId,
                shortUrlId: data.shortUrlId,
                utmSource: data.utmSource,
                utmCampaign: data.utmCampaign,
            })

            return { trackingUrl: createTrackingUrl.toObject(), shortUrl: getShortUrl };
        }
        return { trackingUrl: findOne.toObject(), shortUrl: getShortUrl };
    }

    public async updateTrackingUrlService(data: UpdateTrackingUrlRequest) {
        const { userId, trackingUrlId, update } = data;
        const findObj = { userId: userId, _id: trackingUrlId, isActive: true };
        const updateObj = {
            utmSource: update.newUtmSource,
            utmCampaign: update.newUtmCampaign,
        };

        const updateRes = await this.trackingUrlDAO.updateTrackingUrl(findObj, updateObj);
        if (!updateRes) {
            return Promise.reject({
                success: false,
                isCustomError: true,
                message: "Invalid tracking url"
            })
        }

        const getUrl = await this.shortUrlService.getShortUrlByIdBulk([updateRes?.shortUrlId!])
        const generateUrl = this.generateURLWithSourceAndCampaign(getUrl[0], updateRes);

        return Promise.resolve({
            success: true,
            data: {
                ...updateRes.toObject(),
                url: generateUrl
            }
        })
    }

    public async deleteTrackingUrlBulk(data: {userId: string, shortUrlId?: string}) {
        const delObj: any = {
            userId: data.userId
        }
        if(data.shortUrlId) {
            delObj.shortUrlId = data.shortUrlId;
        }

        return await this.trackingUrlDAO.deleteTrackingUrlBulk(delObj);
    }

    public async deleteTrackingUrlService(data: DeleteTrackingUrlRequest) {
        const findObj = { userId: data.userId, _id: data.trackingUrlId };
        const updateObj = { isActive: false };

        await this.trackingUrlDAO.updateTrackingUrl(findObj, updateObj);

        return;
    }

    public async findTrackingUrl(data: { shortUrlId: string, utmSource: string, utmCampaign: string, userId?: string }) {
        return await this.trackingUrlDAO.findTrackingUrl(data);
    }

    public async findTrackingUrlsByShortUrlIds(data: {shortUrlIds: string[]}) {
        return this.trackingUrlDAO.findTrackingUrlsByShortUrlIds(data);
    }

    public async findByTrackingUrlIds(trackingUrlIds: string[]) {
        return await this.trackingUrlDAO.findByTrackingUrlIds(trackingUrlIds);
    }

    public generateURLWithSourceAndCampaign(url: ShortUrl, trackingUrl: any) {
        let genUrl = `${process.env.URL_DOMAIN}/${process.env.SHORT_URL_DOMAIN}?shortUrl=${url.shortUrl}&utmSource=${trackingUrl.utmSource}`;
        if (trackingUrl.utmCampaign) {
            genUrl = genUrl + `&utmCampaign=${trackingUrl.utmCampaign}`
        }

        return genUrl;
    }
}