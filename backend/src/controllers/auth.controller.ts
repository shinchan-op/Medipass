import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import mongoose from 'mongoose';
import { mockData } from '../mockData';

let useMockData = false;

// Set mock data mode if MongoDB is not available
mongoose.connection.on('error', () => {
  useMockData = true;
  console.log('Auth controller using mock data');
});

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'medipass_secure_secret_key';
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '30d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    if (useMockData) {
      const existingUser = mockData.users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // In a real app, we would create a new user here
      return res.status(201).json({ 
        message: 'User registered successfully',
        user: {
          id: '3', // Demo id
          name,
          email,
          role
        }
      });
    }

    // Regular MongoDB flow
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Create profile based on role
    if (role === 'patient') {
      await Patient.create({
        userId: newUser._id,
      });
    } else if (role === 'doctor') {
      await Doctor.create({
        userId: newUser._id,
        specialty: req.body.specialty || '',
        licenseNumber: req.body.licenseNumber || '',
      });
    }

    // Generate token
    const token = generateToken(newUser._id.toString(), newUser.role);

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (useMockData) {
      // Find user in mock data
      const user = mockData.users.find(user => user.email === email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password - in mock mode, we'll accept 'password123' for simplicity
      if (password !== 'password123') {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Regular MongoDB flow
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    if (useMockData) {
      // Get user ID from request (set by auth middleware)
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Find user in mock data
      const user = mockData.users.find(user => user._id === userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Regular MongoDB flow
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error getting current user' });
  }
}; 