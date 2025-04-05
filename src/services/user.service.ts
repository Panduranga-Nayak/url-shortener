import { UserDAO } from '../dao/sql/user.dao';
import { User } from '../entities/sql/User';
import { FindOrCreateRequest } from '../types/user.types';
import { AuthService } from './auth/auth.service';
import { LoggerRegistry } from '../logger/loggerRegistry';
import { expireTime } from '../utils/redisConstants';
import { KafkaProducer } from '../kafka/kafkaProducer';
import { KafkaTopics } from '../utils/kafkaTopics';


const log = LoggerRegistry.getLogger();

export class UserService {
    private static instance: UserService | null = null;
    private userDAO: UserDAO;
    private authService: AuthService;
    private kafkaProducer: KafkaProducer;

    private constructor() {
        this.userDAO = new UserDAO();
        this.authService = AuthService.getInstance();
        this.kafkaProducer = KafkaProducer.getInstance();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new UserService();
        }
        return this.instance;
    }

    private async findUserByEmail(email: string) {
        return await this.userDAO.findByEmail(email);
    }

    private async toggleUserStatus(userId: string, isActive: boolean) {
        return await this.userDAO.toggleUserStatus(userId, isActive);
    }

    private async create(user: { email: string, provider: string, providerUserId: string }, refreshToken: string) {
        const newUser = await this.userDAO.createUser(new User({ email: user.email }));

        //create auth
        await this.authService.findOrCreate({
            provider: user.provider,
            userId: newUser.id!,
            providerUserId: user.providerUserId
        });

        return {
            userId: newUser.id,
            refreshToken: refreshToken,
            authorizationType: user.provider,
        }

    }

    public async findOrCreate(data: FindOrCreateRequest) {
        const functionName = "findOrCreate";
        const { profile, refreshToken } = data;
        const email = profile.email;

        let findUser = await this.findUserByEmail(email);

        let user: any = findUser;
        if (!findUser) {
            user = await this.create({ email, provider: profile.provider, providerUserId: profile.id }, refreshToken);
            log.info(functionName, "createUser", user);
            
            await this.kafkaProducer.sendMessage(KafkaTopics.EMAIL_EVENTS, {
                sendTo: email,
                subject: "Welcome to URL Shortener!",
                emailBody: "Hi there 👋,\n\nThanks for signing up with URL Shortener!\nYou're all set to start creating and managing short links.\n\nHappy shortening!\n— The URL Shortener Team"
            });
        } else {
            log.info(functionName, "foundUser", findUser);
            if (!findUser.isActive) {
                await this.toggleUserStatus(findUser.id!, true);
            }

            //u could technically make a left join directly with findUser -> improvement ###
            await this.authService.findOrCreate({
                provider: profile.provider,
                userId: findUser.id!,
                providerUserId: profile.id
            })
        }

        const token = await this.authService.generateJwt({ userId: user.id! }, expireTime.ACCESS_TOKEN);
        const refreshTokenJwt = await this.authService.generateJwt({ userId: user.id!, authorizationtype: profile.provider, refreshToken }, expireTime.REFRESH_TOKEN);
        
        log.info(functionName, "token generated");

        return {
            userId: user.id,
            refreshToken: refreshTokenJwt.accessToken,
            accessToken: token.accessToken,
            authorizationType: profile.provider,
        }
    }

    public async findByIds(id: string[]){
        return await this.userDAO.findByIds(id);
    }
}