import { Request, Response } from 'express';
import Patient from '../models/Patient';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// Get patient profile
export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    
    const patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.status(200).json({ patient });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching patient profile' });
  }
};

// Update patient profile
export const updatePatientProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { 
      dateOfBirth, 
      gender, 
      phone, 
      address, 
      medicalHistory, 
      bloodType, 
      allergies, 
      medications, 
      emergencyContact 
    } = req.body;

    const patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Update fields
    if (dateOfBirth) patient.dateOfBirth = new Date(dateOfBirth);
    if (gender) patient.gender = gender;
    if (phone) patient.phone = phone;
    if (address) patient.address = address;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (bloodType) patient.bloodType = bloodType;
    if (allergies) patient.allergies = allergies;
    if (medications) patient.medications = medications;
    if (emergencyContact) patient.emergencyContact = emergencyContact;

    await patient.save();

    res.status(200).json({ 
      message: 'Patient profile updated successfully', 
      patient 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating patient profile' });
  }
};

// Get patient dashboard data
export const getPatientDashboard = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    
    const patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // This would be expanded with appointments, prescriptions, etc.
    const dashboardData = {
      patient,
      // Example data that would come from other collections
      upcomingAppointments: [],
      recentPrescriptions: [],
      medicalRecords: [],
      notifications: []
    };

    res.status(200).json(dashboardData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching dashboard data' });
  }
}; 