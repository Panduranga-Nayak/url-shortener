import { Router } from "express";
import controllerRegistry from '../controllers/index';
import middlewareRegistry from '../middleware/index';

const router = Router();
const auth = middlewareRegistry.authMiddleware.authenticate;

const { authController } = controllerRegistry;

// router.post('/status', middlewareRegistry.authMiddleware.authenticate, controllerRegistry.authController.statusCheck);
router.post('/refresh', authController.refreshToken);
router.post('/logout', auth, authController.logout);

export = router;
