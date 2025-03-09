import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  specialty: string;
  licenseNumber: string;
  hospitalAffiliation: string;
  education: {
    institution: string;
    degree: string;
    year: number;
  }[];
  yearsOfExperience: number;
  officeHours: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  phone: string;
  address: string;
  bio: string;
}

const doctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
    },
    hospitalAffiliation: {
      type: String,
    },
    education: [{
      institution: { type: String },
      degree: { type: String },
      year: { type: Number },
    }],
    yearsOfExperience: {
      type: Number,
    },
    officeHours: [{
      day: { type: String },
      startTime: { type: String },
      endTime: { type: String },
    }],
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDoctor>('Doctor', doctorSchema); 