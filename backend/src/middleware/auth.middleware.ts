import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { mockData } from '../mockData';

let useMockData = false;

// Set mock data mode if MongoDB is not available
import mongoose from 'mongoose';
mongoose.connection.on('error', () => {
  useMockData = true;
  console.log('Auth middleware using mock data');
});

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Mock mode handling
    if (useMockData) {
      if (token === 'mock-token-patient' || token === 'mock-token-doctor') {
        // Set a mock user for testing based on token
        req.user = {
          id: token === 'mock-token-patient' ? '1' : '2', // '1' for patient, '2' for doctor
          role: token === 'mock-token-patient' ? 'patient' : 'doctor'
        };
        return next();
      }
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your_jwt_secret'
    ) as DecodedToken;
    
    // Set user data in request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    next();
  };
}; 