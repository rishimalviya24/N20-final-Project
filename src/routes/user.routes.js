import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.post('/register', userController.createUserController); // Assuming 'register' is a function in user.controller.js

export default router;
