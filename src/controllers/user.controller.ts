import { Response } from 'express';


class UserController {

    constructor() {
        this.testRoute = this.testRoute.bind(this);
    }

    public async testRoute(req: any, res: Response): Promise<void> {
        const functionName = "testRoute"
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