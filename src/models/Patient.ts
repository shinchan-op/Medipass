import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  medipassId: string;
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
}

const PatientSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medipassId: {
    type: String,
    required: true,
    unique: true
  },
  bloodGroup: {
    type: String
  },
  allergies: [{
    type: String
  }],
  chronicConditions: [{
    type: String
  }],
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient; 