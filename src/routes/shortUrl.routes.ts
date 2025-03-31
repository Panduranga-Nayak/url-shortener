import { Router } from "express";
import { ShortUrlValidator } from '../controllers/validators/shortUrl.validator';
import controllerRegistry from '../controllers/index';
import middlewareRegistry from '../middleware/index';

const auth = middlewareRegistry.authMiddleware.authenticate;
const { shortUrlController } = controllerRegistry;

const router = Router();

router.post('/', auth, ShortUrlValidator.validate("createShortUrl"), shortUrlController.createShortUrl);
router.get('/', shortUrlController.redirectToOriginalUrl);

router.post('/fetchUrls', auth, ShortUrlValidator.validate("fetchUrls"), shortUrlController.fetchUserUrls);
router.post('/delete', auth, ShortUrlValidator.validate("deleteShortUrl"), shortUrlController.deleteUserShortUrl);
router.patch('/update', auth, ShortUrlValidator.validate("updateShortUrl"), shortUrlController.updateUserUrl);

export = router;
