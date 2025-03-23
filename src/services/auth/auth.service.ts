import { AuthDAO } from '../../dao/sql/auth.dao';
import { AuthProviderService } from './authProvider.service';
import { Auth } from '../../entities/sql/Auth';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { RedisCache } from '../../boot/redisCache';
import { isEmpty } from 'lodash';
import { LoggerRegistry } from '../../logger/loggerRegistry';

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


    public async generateJwt(data: { userId: string }) {
        const privateKey = fs.readFileSync('private.pem', 'utf8');
        const token = jwt.sign({ userId: data.userId }, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h'
        });

        return {
            accessToken: `Bearer ${token}`
        };
    }
}