import { Request, Response } from 'express';
import { AuthService, RegisterDTO, LoginDTO } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: RegisterDTO = req.body;

      // Validate required fields
      if (!data.email || !data.password || !data.name) {
        res.status(400).json({ error: 'Email, password, and name are required' });
        return;
      }

      const result = await this.authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ error: errorMessage });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: LoginDTO = req.body;

      // Validate required fields
      if (!data.email || !data.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.login(data);
      res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: errorMessage });
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await this.authService.getUserById(req.userId);
      res.status(200).json({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(404).json({ error: 'User not found' });
    }
  };
}
