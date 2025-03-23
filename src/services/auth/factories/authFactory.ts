import { AuthStratergyInterface } from "../interfaces/auth.interface";
import DiscordAuthService from "../stratergies/discord.strategy";
import GoogleAuthService from "../stratergies/google.strategy";

export class AuthFactory {
    public static getAuthService(authType: string): AuthStratergyInterface {
        switch (authType.toLowerCase()) {
            case "discord":
                return DiscordAuthService.getInstance();
            case "google":
                return GoogleAuthService.getInstance();

            default:
                throw new Error("Unsupported authentication type");
        }
    }
}

export default AuthFactory;