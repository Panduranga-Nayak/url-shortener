import { Request, Response } from 'express';
import { handleErrorResponse } from '../utils/errorHandler';


class AuthController {
    constructor() { }

    public async authErrorHandler(err: any, req: Request, res: Response): Promise<void> {
        const functionName = "oauthHandler"
        const { STATUS_CODE } = handleErrorResponse(err, functionName);
        res.status(STATUS_CODE).json({ success: false, message: 'oauth failed', error: err.message });
        return;
    }
}

export {
    AuthController
}