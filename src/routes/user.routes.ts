import { Router } from "express";
import controllerRegistry from '../controllers/index';

const { userController } = controllerRegistry;

const router = Router();


router.get('/test', userController.testRoute);

export default router;
