import { Router } from 'express';
import { Request, Response } from 'express';
import { mockData } from '../mockData';

const router = Router();

// Get patient dashboard data
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    // In a real app, this would fetch from database
    // For now, return mock data
    const patientId = req.user?.id;
    
    // Find patient in mock data
    const patient = mockData.patients.find(p => p._id === patientId || p.user === patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Construct dashboard data
    const dashboardData = {
      patient,
      appointments: mockData.appointments.filter(a => a.patient === patientId),
      medicalRecords: mockData.medicalRecords.filter(r => r.patient === patientId),
      // Add other dashboard data as needed
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient appointments
router.get('/appointments', (req: Request, res: Response) => {
  try {
    const patientId = req.user?.id;
    const appointments = mockData.appointments.filter(a => a.patient === patientId);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient medical records
router.get('/medical-records', (req: Request, res: Response) => {
  try {
    const patientId = req.user?.id;
    const records = mockData.medicalRecords.filter(r => r.patient === patientId);
    res.json(records);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 