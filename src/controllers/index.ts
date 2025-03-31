import { AuthController } from './auth.controller';
import { ShortUrlController } from './shortUrl.controller';
import { TrackingUrlController } from './trackingUrl.controller';
import { UserController } from './user.controller';

export default {
    userController: new UserController(),
    authController: new AuthController(),
    shortUrlController: new ShortUrlController(),
    trackingUrlController: new TrackingUrlController(),
}