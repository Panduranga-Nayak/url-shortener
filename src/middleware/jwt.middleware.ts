import jwt from 'jsonwebtoken';
import fs from 'fs';
import { AuthService } from '../services/auth/auth.service';
import { LoggerRegistry } from '../logger/loggerRegistry';

const log = LoggerRegistry.getLogger();

export class JWTMiddleware {
    private authService: AuthService = AuthService.getInstance();
    public async verifyJwt(token: string) {
        const functionName = "verifyJwtMiddleware"
        try {
            const jwtToken = token.split(" ")[1];
            const isBlacklisted = await this.authService.isTokenBlacklisted(jwtToken)
            if(isBlacklisted) {
                throw new Error("TokenBlacklisted");
            }

            const publicKey = fs.readFileSync('public.pem', 'utf8');
            const decoded = jwt.verify(jwtToken, publicKey, { algorithms: ['RS256'] });

            return decoded;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                log.info(functionName, 'Token has expired');
            } else {
                log.info(functionName, 'Invalid token');
            }
            return Promise.reject({
                success: false,
                message: error.message
            });
        }
    }
}