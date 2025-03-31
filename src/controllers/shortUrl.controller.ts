import { Request, Response } from 'express';
import { ShortUrlService } from '../services/shortUrl.service';
import { handleErrorResponse } from '../utils/errorHandler';
import { convertKeysToCamelCase } from '../utils/utils';
import { AuthenticatedRequest } from '../types/request.types';

class ShortUrlController {
    private shortUrlService: ShortUrlService;

    constructor() {
        this.shortUrlService = ShortUrlService.getInstance();

        this.createShortUrl = this.createShortUrl.bind(this);
        this.redirectToOriginalUrl = this.redirectToOriginalUrl.bind(this);
        this.fetchUserUrls = this.fetchUserUrls.bind(this);
        this.deleteUserShortUrl = this.deleteUserShortUrl.bind(this);
        this.updateUserUrl = this.updateUserUrl.bind(this);
    }

    public async createShortUrl(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as AuthenticatedRequest).user.userId;
            const createUrl = await this.shortUrlService.createShortUrl({...req.body, userId});

            res.status(200).json(createUrl);

        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e);
            res.status(STATUS_CODE).json({
                success: false,
                message
            })
        }
        return;
    }

    public async redirectToOriginalUrl(req: Request, res: Response): Promise<void> {
        try {
            const { shortUrl, utmSource, utmCampaign } = req.query;

            const reqObj = {
                shortUrl: String(shortUrl),
                utmSource: String(utmSource || ""),
                utmCampaign: String(utmCampaign || ""),
                ipAddress: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown"),
                userAgent: String(req.headers["user-agent"] || "Unknown")
            };

            const redirect = await this.shortUrlService.redirectToOriginalUrl(reqObj);

            res.status(301).redirect(redirect.data.redirectUrl);
        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e);
            res.status(STATUS_CODE).json({
                success: false,
                message
            })
        }
        return;
    }

    public async fetchUserUrls(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as AuthenticatedRequest).user.userId;
            const fetchUserUrlsRes = await this.shortUrlService.getUserUrls({...req.body, userId});
            res.status(200).json(fetchUserUrlsRes);
        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e);
            res.status(STATUS_CODE).json({
                success: false,
                message
            })
        }
    }

    public async deleteUserShortUrl(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as AuthenticatedRequest).user.userId;

            await this.shortUrlService.deleteUserUrlService({...req.body, userId});

            res.status(200).json({
                success: true,
                message: "url deleted successfully"
            })
        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e);
            res.status(STATUS_CODE).json({
                success: false,
                message
            })
        }
    }

    public async updateUserUrl(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            const userId = (req as AuthenticatedRequest).user.userId;
            
            const updateObj = await this.shortUrlService.updateUserShortUrl({ id: body.shortUrlId, userId, isActive: true }, {
                originalUrl: body.update.originalUrl
            });
            res.status(200).json({
                success: true,
                data: convertKeysToCamelCase(updateObj),
            })
        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e);
            res.status(STATUS_CODE).json({
                success: false,
                message
            })
        }
        return
    }
}

export {
    ShortUrlController
}