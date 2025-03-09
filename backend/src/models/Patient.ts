import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  dateOfBirth: Date;
  gender: string;
  phone: string;
  address: string;
  medicalHistory: string;
  bloodType: string;
  allergies: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const patientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    medicalHistory: {
      type: String,
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    allergies: [{
      type: String,
    }],
    medications: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
    }],
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', patientSchema); 