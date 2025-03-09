import { Router } from 'express';
import { Request, Response } from 'express';
import { mockData } from '../mockData';

const router = Router();

// Get doctor dashboard data
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    // In a real app, this would fetch from database
    // For now, return mock data
    const doctorId = req.user?.id;
    
    // Find doctor in mock data
    const doctor = mockData.doctors.find(d => d._id === doctorId || d.user === doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Find appointments for this doctor
    const appointments = mockData.appointments.filter(a => a.doctor === doctorId);
    
    // Construct dashboard data
    const dashboardData = {
      doctor,
      appointments,
      todaysAppointments: appointments.filter(a => {
        const today = new Date().toISOString().split('T')[0];
        return a.date === today;
      }),
      // Add other dashboard data as needed
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor appointments
router.get('/appointments', (req: Request, res: Response) => {
  try {
    const doctorId = req.user?.id;
    const appointments = mockData.appointments.filter(a => a.doctor === doctorId);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 