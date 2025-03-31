import { Router } from "express";
import controllerRegistry from '../controllers/index';
import middlewareRegistry from '../middleware/index';
import trackingUrlValidator from '../controllers/validators/trackingUrl.validator'


const auth = middlewareRegistry.authMiddleware.authenticate;
const { trackingUrlController } = controllerRegistry;

const router = Router();

router.post('/create', auth, trackingUrlValidator.validate("create"), trackingUrlController.createTrackingUrl);
router.patch('/update', auth, trackingUrlValidator.validate("update"), trackingUrlController.updateTrackingUrl);
router.post('/delete', auth, trackingUrlValidator.validate("delete"), trackingUrlController.deleteTrackingUrl);

export = router;
