import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { INVALID_URL_ERROR } from '../../utils/urlConstants';

export class ShortUrlValidator {
    private static schemas = {
        createShortUrl: z.object({
            originalUrl: z.string().url({ message: INVALID_URL_ERROR }),
        }),
        updateShortUrl: z.object({
            shortUrlId: z.string().uuid(),
            update: z.object({
                originalUrl: z.string().url({ message: INVALID_URL_ERROR })
            })
        }),
        deleteShortUrl: z.object({
            shortUrlId: z.string().uuid(),
        }),
        fetchUrls: z.object({
            pagination: z.object({
                itemsPerPage: z.number(),
                pageNo: z.number()
            })
        })
    }

    public static validate(action: keyof typeof ShortUrlValidator.schemas) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if(!ShortUrlValidator.schemas[action]) {
                    throw Error("Validator not defined");
                }
                req.body = ShortUrlValidator.schemas[action].parse(req.body);
                next();
            } catch (e: any) {
                res.status(400).json({ error: e.errors });
            }
        }
    }
}