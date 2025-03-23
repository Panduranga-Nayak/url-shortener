import { Response } from 'express';
import { UserService } from '../services/user.service';
import { handleErrorResponse } from '../utils/errorHandler';


class UserController {
    private userService: UserService;

    constructor() {
        this.userService = UserService.getInstance();

        this.findOrCreate = this.findOrCreate.bind(this);
    }

    public async findOrCreate(req: any, res: Response): Promise<void> {
        const functionName = "findOrCreateController"
        const { refreshToken, profile } = req.user;
        try {
            const userInfo = await this.userService.findOrCreate({ profile, refreshToken });

            res.status(200).json({
                success: true,
                data: userInfo
            })
        } catch (e) {
            const { STATUS_CODE, message } = handleErrorResponse(e, functionName);
            res.status(STATUS_CODE).json({
                success: false,
                message: message
            });
        } finally {
            return;
        }
    }
}

export {
    UserController
}