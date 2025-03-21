import Redis from 'ioredis';
import { isEmpty } from 'lodash';
import { expireTime } from '../utils/redisConstants';

export class RedisCache {
    private static instance: RedisCache;
    public redis: Redis;

    private constructor() {
        this.redis = new Redis({
            port: Number(process.env.REDIS_PORT!),
            host: process.env.REDIS_HOST!,
            username: process.env.REDIS_USERNAME!,
            password: process.env.REDIS_PASSWORD!,
            db: Number(process.env.REDIS_DB!),
        });
        
        this.redis.on('error', (err) => {
            console.error("❌ Redis connection error:", err);
        });

        this.redis.on('connect', () => {
            console.log("✅ Redis connected successfully");
        });
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new RedisCache();
        }
        return this.instance;
    }

    public async get(key: string) {
        return this.redis.get(key);
    }

    public async setEx(key: string, value: string, ttl: number = expireTime.DEFAULT_TIME) {
        await this.redis.setex(key, ttl, value);
    }

    public async hset(hash: string, values: {[key: string]: any}, ttl: number = expireTime.DEFAULT_TIME) {
        await this.redis.hset(hash, values);
        await this.redis.expire(hash, ttl);
    }

    public async hgetall(hash: string) {
        return await this.redis.hgetall(hash);
    }

    public async hgetset(hash: string, ttl: number = expireTime.DEFAULT_TIME) {
        const getVal = await this.hgetall(hash);
        if(!isEmpty(getVal)) {
            await this.redis.expire(hash, ttl);
        }
        return getVal;
    }

    public async hget(hash: string, key: string, ttl: number = expireTime.DEFAULT_TIME) {
        const getVal = await this.redis.hget(hash, key);
        if(!isEmpty(getVal)) {
            await this.redis.expire(hash, ttl);
        }
        return getVal;
    }

    public async del(hash: string) {
        await this.redis.del(hash);
    }

}