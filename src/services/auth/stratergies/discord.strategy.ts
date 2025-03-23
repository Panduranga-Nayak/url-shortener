import passport from "passport";
import { Strategy } from "passport-discord";
import { AuthStratergyInterface } from '../interfaces/auth.interface';
import axios from "axios";
import { LoggerRegistry } from "../../../logger/loggerRegistry";

const log = LoggerRegistry.getLogger();

export class DiscordStrategy implements AuthStratergyInterface {
    private static instance: DiscordStrategy;

    private constructor() {
        this.configureDiscordStrategy();
    }

    public static getInstance(): DiscordStrategy {
        if (!this.instance) {
            this.instance = new DiscordStrategy();
        }
        return this.instance;
    }

    private configureDiscordStrategy() {
        const functionName = "configureDiscordStrategy";
        passport.use(
            "discord",
            new Strategy(
                {
                    clientID: process.env.DISCORD_CLIENT_ID!,
                    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
                    callbackURL: process.env.DISCORD_REDIRECT_URI!,
                    scope: ["identify", "email", "guilds"],
                },
                async (_accessToken, refreshToken, profile, done) => {
                    try {
                        //generate accessToken logic 
                        log.info(functionName, "discordUser verified");
                        done(null, { refreshToken, profile })
                    } catch (e) {
                        log.error(functionName, "discord error", e);
                        return done(e);
                    }
                }
            )
        );
    }

    //call in index, so this is initialized
    public initialize() {
        return passport.initialize();
    }

    public authenticate() {
        return passport.authenticate("discord", { session: false });
    }


    public async refreshToken(refreshToken: string) {
        const functionName = "refreshToken";
        const data = {
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            redirect_uri: process.env.DISCORD_REDIRECT_URI!,
        };

        try {
            const response = await axios.post(process.env.DISCORD_REFRESH_TOKEN_URL!, data, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            log.info(functionName, "discord refresh token success");

            return response.data;
        } catch (error: any) {
            return Promise.reject(error);
        }
    }

    public async invalidateRefreshToken(refreshToken: string) {
        const functionName = "invalidateRefreshToken";
        const payload = {
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            token: refreshToken,
        };
        try {
            await axios.post(process.env.DISCORD_INVALIDATE_TOKEN_URL!, payload, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            log.info(functionName, "DiscordToken revoked");
        } catch (e: any) {
            const errorMessage = e.response?.data?.error_description || e.response?.data || "Unknown error";
            log.error(`Failed to revoke Discord token: ${errorMessage}`);
            return Promise.reject({
                success: false,
                isCustomError: true,
                message: e.response?.data?.error_description || e.response?.data?.error
            })
        }
        return {
            success: true,
            message: "logged out successfully"
        };
    }
}

export default DiscordStrategy;