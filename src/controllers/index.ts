import { AuthController } from './auth.controller';
import { UserController } from './user.controller';

export default {
    userController: new UserController(),
    authController: new AuthController(),
}