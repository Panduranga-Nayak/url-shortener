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
import { LogoutRequest, RefreshTokenRequest } from '../../types/auth.types';

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

    public async refreshToken(data: RefreshTokenRequest) {
        const strategy: AuthStratergyInterface = AuthFactory.getAuthService(data.authorizationtype);
        //convert this to promise.all
        const newToken = await strategy.refreshToken(data.authorization);
        const jwtToken = await this.generateJwt({ userId: data.userId }, expireTime.ACCESS_TOKEN);

        return {
            accessToken: jwtToken.accessToken,
            refreshToken: newToken.refresh_token || data.authorization
        };
    }

    public async isTokenBlacklisted(token: string): Promise<boolean> {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const exists = await this.redis.get(`BLACKLIST-TOKEN-${tokenHash}`);
        return exists !== null;
    }


    public async generateJwt(data: { userId: string }, duration: string = expireTime.ACCESS_TOKEN) {
        const privateKey = fs.readFileSync('private.pem', 'utf8');
        const token = jwt.sign({ userId: data.userId }, privateKey, {
            algorithm: 'RS256',
            expiresIn: duration as jwt.SignOptions['expiresIn']
        });

        return {
            accessToken: `Bearer ${token}`
        };
    }

    public async logout(data: LogoutRequest) {
        const functionName = "logout";
        const tokenHash = crypto.createHash("sha256").update(data.accessToken).digest("hex");
        try {
            await this.redis.setEx(`BLACKLIST-TOKEN-${tokenHash}`, "INVALID_TOKEN", expireTime.JWT_TOKEN);
            log.info(functionName, "token blacklisted");
        } catch (e) {
            log.info(functionName, e);
        }
        const authService = AuthFactory.getAuthService(data.authType);
        return await authService.invalidateRefreshToken(data.refreshToken);
    }
}