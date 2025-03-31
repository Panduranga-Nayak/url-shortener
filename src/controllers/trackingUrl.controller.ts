import { Request, Response } from 'express'
import { TrackingUrlService } from '../services/trackingUrl.service';
import { handleErrorResponse } from '../utils/errorHandler';
import { LoggerRegistry } from '../logger/loggerRegistry';
import { AuthenticatedRequest } from '../types/request.types';

const log = LoggerRegistry.getLogger();


export class TrackingUrlController {
    private trackingUrlService: TrackingUrlService

    constructor() {
        this.trackingUrlService = TrackingUrlService.getInstance();

        this.createTrackingUrl = this.createTrackingUrl.bind(this);
        this.updateTrackingUrl = this.updateTrackingUrl.bind(this);
        this.deleteTrackingUrl = this.deleteTrackingUrl.bind(this);
    }

    public async createTrackingUrl(req: Request, res: Response): Promise<void> {
        const functionName = "createTrackingUrlController"
        try {
            const userId = (req as AuthenticatedRequest).user.userId;
            const createUrl = await this.trackingUrlService.createTrackingUrl({...req.body, userId});
            
            res.status(200).send({
                success: true,
                data: createUrl
            })

        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e, functionName);
            res.status(STATUS_CODE).json({
                success: false,
                message
            })
        }
    }

    public async updateTrackingUrl(req: Request, res: Response): Promise<void> {
        const functionName = "updateTrackingUrlController";
        try {
            const userId = (req as AuthenticatedRequest).user.userId;
            const updateRes = await this.trackingUrlService.updateTrackingUrlService({...req.body, userId});

            res.status(200).send({
                success: true,
                data: updateRes
            })
        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e, functionName);

            res.status(STATUS_CODE).send({
                success: false,
                message
            });
        }
    }

    public async deleteTrackingUrl(req: Request, res: Response): Promise<void> {
        const functionName = "deleteTrackingUrlController";
        try {
            const userId = (req as AuthenticatedRequest).user.userId;
            await this.trackingUrlService.deleteTrackingUrlService({...req.body, userId});

            res.status(200).send({
                success: true,
                message: "deleted successfully"
            })
        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e, functionName);
            res.status(STATUS_CODE).send({
                success: false,
                message: message
            });
        }
        return
    }
}