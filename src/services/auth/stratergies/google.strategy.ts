import passport, { Profile } from "passport";
import { Strategy } from "passport-google-oauth20";
import { AuthStratergyInterface } from '../interfaces/auth.interface';
import axios from "axios";
import { LoggerRegistry } from "../../../logger/loggerRegistry";

const log = LoggerRegistry.getLogger();


export class GoogleStratergy implements AuthStratergyInterface {
    private static instance: GoogleStratergy;

    private constructor() {
        this.configureDiscordStrategy();
    }

    public static getInstance(): GoogleStratergy {
        if (!this.instance) {
            this.instance = new GoogleStratergy();
        }
        return this.instance;
    }

    private configureDiscordStrategy() {
        passport.use(
            "google",
            new Strategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    callbackURL: process.env.GOOGLE_REDIRECT_URI,
                    scope: ["openid", "email", "profile"],
                },
                async (_accessToken, refreshToken, profile, done) => {
                    try {
                        //generate accessToken logic 
                        if (!profile.emails) {
                            throw Error("No Email Found, use a different account");
                        }
                        const googleProfile = { ...profile, email: profile?.emails[0].value }
                        done(null, { refreshToken, profile: googleProfile })
                    } catch (e) {
                        return done(e);
                    }
                }
            )
        );
    }

    public initialize() {
        return passport.initialize();
    }

    public authenticate() {
        return passport.authenticate("google", { session: false, accessType: "offline", prompt: "consent", });
    }

    public async refreshToken(refreshToken: string) {
        const data = {
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };

        try {
            const response = await axios.post(process.env.GOOGLE_REFRESH_TOKEN_URL!, data, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            return response.data;
        } catch (error: any) {
            return Promise.reject({
                success: false,
                isCustomError: true,
                message: error.response?.data?.error_description || error.message
            });
        }
    }

    public async invalidateRefreshToken(refreshToken: string) {
        const payload = {
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            token: refreshToken,
        };
        try {
            await axios.post(process.env.GOOGLE_INVALIDATE_TOKEN_URL!, payload, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
        } catch (e: any) {
            const errorMessage = e.response?.data?.error_description || e.response?.data || "Unknown error";
            log.error(`Failed to revoke Google token: ${errorMessage}`);
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

export default GoogleStratergy;