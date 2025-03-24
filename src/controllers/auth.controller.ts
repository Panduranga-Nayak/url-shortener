import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { handleErrorResponse } from '../utils/errorHandler';
import { isEmpty } from 'lodash';


class AuthController {
    private authService: AuthService;
    constructor() {
        this.authService = AuthService.getInstance();

        this.logout = this.logout.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
    }

    public async logout(req: Request, res: Response): Promise<void> {
        const functionName = "logoutController"
        try {
            // const authType = req.headers.authorizationtype as string;
            let accessToken = req.headers.authorization!;
            accessToken = accessToken.split(" ")[1] || "";

            let refreshToken = req.headers.refreshtoken! as string;
            refreshToken = refreshToken.split(" ")[1] || "";

            const data = { refreshToken: req.headers.refreshtoken as string, accessToken };

            if(isEmpty(data.refreshToken)) {
                res.status(400).json({
                    success: false,
                    message: "refreshToken and authType must be sent in headers"
                })
            }


            await this.authService.logout(data);

            res.status(200).send({
                success: true,
                message: "logout successfuly"
            })


        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e, functionName);
            res.status(STATUS_CODE).send({
                success: false,
                message
            })
        }

        return
    }

    public async refreshToken(req: Request, res: Response): Promise<void> {
        const functionName = "refreshTokenController"
        try {
            const { refreshtoken } = req.headers;

            const newToken = await this.authService.refreshToken(refreshtoken as string);

            res.status(200).json({
                success: true,
                data: {
                    accessToken: newToken.accessToken,
                    refreshToken: newToken.refreshToken,
                }
            })
        } catch (e) {

            const { STATUS_CODE, message } = handleErrorResponse(e, functionName);
            res.status(STATUS_CODE).json({
                success: false,
                message,
            })
        }
        return;
    }

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