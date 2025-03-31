import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export default class TrackingUrlValidator {
    private static schemas = {
        create: z.object({
            shortUrlId: z.string().uuid(),
            utmSource: z.string(),
            utmCampaign: z.string().optional(),
        }),
        update: z.object({
            trackingUrlId: z.string(),
            update: z.object({
                newUtmSource: z.string().optional(),
                newUtmCampaign: z.string().optional(),
            }).refine(data => Object.keys(data).length > 0, {
                message: "At least one field in 'update' is required, newUtmSource or newUtmCampaign",
            })
        }),
        delete: z.object({
            trackingUrlId: z.string(),
        })
    }

    public static validate(action: keyof typeof TrackingUrlValidator.schemas) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!TrackingUrlValidator.schemas[action]) {
                    throw new Error("Validator not defined");
                }
                req.body = TrackingUrlValidator.schemas[action].parse(req.body);
                next();
            } catch (e: any) {
                res.status(400).json({ error: e.errors });
            }
        }
    }
}