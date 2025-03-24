import { Request, Response, NextFunction } from "express";
import { JWTMiddleware } from './jwt.middleware';
import { isEmpty } from "lodash";

export default class AuthMiddleware {
    private jwtMiddleware: JWTMiddleware;

    public constructor() {
        this.jwtMiddleware = new JWTMiddleware();

        this.authenticate = this.authenticate.bind(this);
    }

    public async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
        // const authType = req.headers.authorizationtype as string;
        const accessToken = req.headers.authorization;

        if (!accessToken || isEmpty(accessToken)) {
            res.status(401).json({ message: "Missing authorization headers" });
            return;
        }

        try {
            const userVerify: any = await this.jwtMiddleware.verifyJwt(accessToken);

            req.user = { userId: userVerify.userId };

            next();
        } catch (error: any) {
            res.status(401).json({ message: "Authentication failed", error: error.message });
            return;
        }
    }
};
