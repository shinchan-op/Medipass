import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import doctorRoutes from './doctor.routes';
import { auth, authorize } from '../middleware/auth.middleware';

const router = Router();

// Auth routes (public)
router.use('/auth', authRoutes);

// Patient routes (protected)
router.use('/patients', auth, authorize(['patient']), patientRoutes);

// Doctor routes (protected)
router.use('/doctors', auth, authorize(['doctor']), doctorRoutes);

export default router; 