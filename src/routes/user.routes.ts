import { Router } from "express";
import controllerRegistry from '../controllers/index';
import { DiscordStrategy } from '../services/auth/stratergies/discord.strategy';
import { GoogleStratergy } from '../services/auth/stratergies/google.strategy';

const discordStrategy = DiscordStrategy.getInstance();
const googleStratergy = GoogleStratergy.getInstance();

const router = Router();

const { userController, authController } = controllerRegistry;

//discord
router.get('/discord', discordStrategy.authenticate());
router.get('/discord/redirect', discordStrategy.authenticate(), userController.findOrCreate, authController.authErrorHandler);

//google
router.get('/google', googleStratergy.authenticate());
router.get('/google/redirect', googleStratergy.authenticate(), userController.findOrCreate, authController.authErrorHandler);

export = router;
