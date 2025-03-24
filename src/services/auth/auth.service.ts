import crypto from 'crypto';
import { AuthDAO } from '../../dao/sql/auth.dao';
import AuthFactory from './factories/authFactory';
import { AuthStratergyInterface } from './interfaces/auth.interface';
import { AuthProviderService } from './authProvider.service';
import { Auth } from '../../entities/sql/Auth';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { RedisCache } from '../../boot/redisCache';
import { expireTime } from '../../utils/redisConstants';
import { isEmpty } from 'lodash';
import { LoggerRegistry } from '../../logger/loggerRegistry';
import { LogoutRequest, RefreshTokenRequest, VerifyJwtRes } from '../../types/auth.types';

const log = LoggerRegistry.getLogger();

export class AuthService {
    private static instance: AuthService | null = null;
    private authDAO: AuthDAO;
    private authProviderService: AuthProviderService;
    private redis: RedisCache;

    private constructor() {
        this.authDAO = new AuthDAO();
        this.authProviderService = AuthProviderService.getInstance();
        this.redis = RedisCache.getInstance();
    }


    static getInstance() {
        if (!this.instance) {
            this.instance = new AuthService();
        }
        return this.instance;
    }

    public async findOrCreate(data: { provider: string, userId: string, providerUserId: string }) {
        const functionName = "findOrCreateAuth"
        let authProvider: any = await this.redis.hgetall(`authProvider:${data.provider}`);
        log.info(functionName, "authProvider cache", authProvider);
        if (isEmpty(authProvider)) {
            authProvider = await this.authProviderService.findByName(data.provider);
            log.info(functionName, "authProvider", authProvider);
            if (!authProvider) {
                return Promise.reject({
                    success: false,
                    isCustomError: true,
                    message: "auth config missing"
                });
            }
            await this.redis.hset(`authProvider:${data.provider}`, authProvider);
        }

        const findAuth = await this.authDAO.findAuth(data.userId, Number(authProvider.id));
        if (findAuth) {
            log.info(functionName, "auth found");
            return findAuth;
        }

        const createAuth = await this.authDAO.createAuth(new Auth({
            userId: data.userId,
            authProviderId: authProvider.id,
            providerUserId: data.providerUserId
        }));

        log.info(functionName, "auth created");

        return createAuth;
    }

    public async refreshToken(refreshToken: string) {
        const tokenData: VerifyJwtRes = await this.verifyJwt(refreshToken);

        const strategy: AuthStratergyInterface = AuthFactory.getAuthService(tokenData.authorizationtype!);

        const newToken = await strategy.refreshToken(tokenData.refreshToken!);

        const jwtToken = await this.generateJwt({ userId: tokenData.userId }, expireTime.ACCESS_TOKEN);
        const refreshTokenJwt = await this.generateJwt({ 
            userId: tokenData.userId!, 
            authorizationtype: tokenData.authorizationtype, 
            refreshToken: newToken.refresh_token || tokenData.refreshToken
        }, expireTime.REFRESH_TOKEN);

        return {
            accessToken: jwtToken.accessToken,
            refreshToken: refreshTokenJwt.accessToken
        };
    }

    public async isTokenBlacklisted(token: string): Promise<boolean> {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const exists = await this.redis.get(`BLACKLIST-TOKEN-${tokenHash}`);
        return exists !== null;
    }


    public async generateJwt(data: Record<string, any>, duration: string = expireTime.ACCESS_TOKEN) {
        const privateKey = fs.readFileSync('private.pem', 'utf8');
        const token = jwt.sign({ ...data }, privateKey, {
            algorithm: 'RS256',
            expiresIn: duration as jwt.SignOptions['expiresIn']
        });

        return {
            accessToken: `Bearer ${token}`
        };
    }

    public async verifyJwt(token: string): Promise<VerifyJwtRes> {
        const functionName = "verifyJwtMiddleware"
        try {
            const jwtToken = token.split(" ")[1];
            const isBlacklisted = await this.isTokenBlacklisted(jwtToken);
            if (isBlacklisted) {
                throw new Error("TokenBlacklisted");
            }

            const publicKey = fs.readFileSync('public.pem', 'utf8');
            const decoded = jwt.verify(jwtToken, publicKey, { algorithms: ['RS256'] });

            return decoded as VerifyJwtRes;
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

    public async logout(data: LogoutRequest) {
        const functionName = "logout";
        const tokenHash = crypto.createHash("sha256").update(data.accessToken).digest("hex");
        try {
            const tokenData: VerifyJwtRes = await this.verifyJwt(data.refreshToken);
            await this.redis.setEx(`BLACKLIST-TOKEN-${tokenHash}`, "INVALID_TOKEN", expireTime.JWT_TOKEN);
            log.info(functionName, "token blacklisted");

            const authService = AuthFactory.getAuthService(tokenData.authorizationtype!);
            return await authService.invalidateRefreshToken(tokenData.refreshToken!);
        } catch (e) {
            log.info(functionName, e);
            return Promise.reject({
                success: false,
                message: "something went wrong"
            })
        }
    }
}