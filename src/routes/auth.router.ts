import { Router } from "express";
import controllerRegistry from '../controllers/index';
import middlewareRegistry from '../middleware/index';
import { AuthValidator } from '../controllers/validators/auth.validator'

const router = Router();
const auth = middlewareRegistry.authMiddleware.authenticate;

const { authController } = controllerRegistry;

// router.post('/status', middlewareRegistry.authMiddleware.authenticate, controllerRegistry.authController.statusCheck);
router.post('/refresh', AuthValidator.validate("refresh"), authController.refreshToken);
router.post('/logout', auth, authController.logout);

export = router;
