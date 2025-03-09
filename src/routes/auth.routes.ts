import { Router } from 'express';
import { register, login, getUser } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get user data
router.get('/me', auth, getUser);

export default router; 