import { Router } from 'express';
import authRoutes from './auth.routes';
import { auth, authorize } from '../middleware/auth.middleware';

const router = Router();

// Auth routes (public)
router.use('/auth', authRoutes);

// Use these if you have patient and doctor routes
// router.use('/patients', auth, authorize(['patient']), patientRoutes);
// router.use('/doctors', auth, authorize(['doctor']), doctorRoutes);

export default router; 