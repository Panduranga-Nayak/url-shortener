import { Request, Response, NextFunction } from "express";
import { isEmpty } from "lodash";
import { AuthService } from "../services/auth/auth.service";
import { VerifyJwtRes } from "../types/auth.types";

export default class AuthMiddleware {
    private authService: AuthService;

    public constructor() {
        this.authService = AuthService.getInstance();

        this.authenticate = this.authenticate.bind(this);
    }

    public async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
        const accessToken = req.headers.authorization;

        if (!accessToken || isEmpty(accessToken)) {
            res.status(401).json({ message: "Missing authorization headers" });
            return;
        }

        try {
            const userVerify: VerifyJwtRes = await this.authService.verifyJwt(accessToken);

            req.user = { userId: userVerify.userId };

            next();
        } catch (error: any) {
            res.status(401).json({ message: "Authentication failed", error: error.message });
            return;
        }
    }
};
