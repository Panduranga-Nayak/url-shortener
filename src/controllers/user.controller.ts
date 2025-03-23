import { Response } from 'express';

import { LoggerRegistry } from '../logger/loggerRegistry';

const log = LoggerRegistry.getLogger();


class UserController {

    constructor() {
        this.testRoute = this.testRoute.bind(this);
    }

    public async testRoute(req: any, res: Response): Promise<void> {
        const functionName = "testRoute"
        log.info(functionName, 'Token has expired');
        try {
            res.status(200).json({
                success: true,
                data: "hello"
            })
        } catch (e) {
            res.status(500).json({
                success: false,
                message: e
            });
        }
    }
}

export {
    UserController
}