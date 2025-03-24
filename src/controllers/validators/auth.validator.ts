import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class AuthValidator {
    private static schemas = {
        refresh: z.object({
            authorizationtype: z.string(),
            authorization: z.string(),
            userId: z.string().uuid()
        })
    }

    public static validate(action: keyof typeof AuthValidator.schemas) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if(!AuthValidator.schemas[action]) {
                    throw Error("Validator not defined");
                }
                req.body = AuthValidator.schemas[action].parse(req.body);
                next();
            } catch (e: any) {
                res.status(400).json({ error: e.errors });
            }
        }
    }
}