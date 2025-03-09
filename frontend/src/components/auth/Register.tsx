import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Alert, CircularProgress, Link, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'doctor';
  specialty?: string;
  licenseNumber?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, role: e.target.value as 'patient' | 'doctor' });
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (formData.role === 'doctor') {
      if (!formData.specialty) {
        errors.specialty = 'Specialty is required for doctors';
        isValid = false;
      }
      if (!formData.licenseNumber) {
        errors.licenseNumber = 'License number is required for doctors';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (validateForm()) {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'doctor' && {
          specialty: formData.specialty,
          licenseNumber: formData.licenseNumber
        })
      };

      await register(userData);
      // If registration is successful, the user will be redirected based on their role
      // This is handled in the App.tsx component with protected routes
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register for Medipass
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">I am a</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={formData.role}
              label="I am a"
              onChange={handleRoleChange}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
            </Select>
          </FormControl>
          
          {formData.role === 'doctor' && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="specialty"
                label="Medical Specialty"
                name="specialty"
                value={formData.specialty || ''}
                onChange={handleChange}
                error={!!formErrors.specialty}
                helperText={formErrors.specialty}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="licenseNumber"
                label="Medical License Number"
                name="licenseNumber"
                value={formData.licenseNumber || ''}
                onChange={handleChange}
                error={!!formErrors.licenseNumber}
                helperText={formErrors.licenseNumber}
              />
            </>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 