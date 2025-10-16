import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  // Public routes
  router.post('/register', authController.register);
  router.post('/login', authController.login);

  // Protected routes
  router.get('/me', authenticateToken, authController.getCurrentUser);

  return router;
};
