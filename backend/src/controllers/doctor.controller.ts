import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import User, { IUser } from '../models/User';

// Get doctor profile
export const getDoctorProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.status(200).json({ doctor });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching doctor profile' });
  }
};

// Update doctor profile
export const updateDoctorProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { 
      specialty,
      licenseNumber,
      hospitalAffiliation,
      education,
      yearsOfExperience,
      officeHours,
      phone,
      address,
      bio
    } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Update fields
    if (specialty) doctor.specialty = specialty;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;
    if (hospitalAffiliation) doctor.hospitalAffiliation = hospitalAffiliation;
    if (education) doctor.education = education;
    if (yearsOfExperience) doctor.yearsOfExperience = yearsOfExperience;
    if (officeHours) doctor.officeHours = officeHours;
    if (phone) doctor.phone = phone;
    if (address) doctor.address = address;
    if (bio) doctor.bio = bio;

    await doctor.save();

    res.status(200).json({ 
      message: 'Doctor profile updated successfully', 
      doctor 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating doctor profile' });
  }
};

// Get doctor dashboard data
export const getDoctorDashboard = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // This would be expanded with appointments, patients, etc.
    const dashboardData = {
      doctor,
      // Example data that would come from other collections
      todayAppointments: [],
      patients: [],
      recentPrescriptions: [],
      notifications: []
    };

    res.status(200).json(dashboardData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching dashboard data' });
  }
}; 