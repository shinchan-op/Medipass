import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Mock data for development when server is not available
const mockData = {
  patientDashboard: {
    patient: {
      id: '1',
      medipassId: 'MP12345',
      bloodGroup: 'O+',
      allergies: ['Peanuts', 'Penicillin'],
      chronicConditions: ['Asthma'],
      profileImage: 'https://via.placeholder.com/150',
      emergencyContacts: [
        {
          name: 'Mary Doe',
          relationship: 'Spouse',
          phone: '555-123-4567'
        }
      ],
      phone: '555-987-6543',
      gender: 'Male',
      dateOfBirth: '1985-05-15',
      address: '123 Main St, Anytown, USA'
    },
    appointments: [
      {
        id: '1',
        date: '2023-04-15',
        time: '10:30',
        doctorName: 'Dr. Jane Smith',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'General Hospital',
        status: 'upcoming',
        type: 'in-person',
        reasonForVisit: 'Annual checkup',
        location: 'General Hospital, Room 302'
      },
      {
        id: '2',
        date: '2023-03-01',
        time: '14:00',
        doctorName: 'Dr. Jane Smith',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'General Hospital',
        status: 'completed',
        diagnosis: 'Seasonal allergies',
        type: 'in-person',
        followUpRequired: true,
        followUpDate: '2023-06-01'
      }
    ],
    appointmentStats: {
      totalUpcoming: 1,
      nextAppointment: {
        date: '2023-04-15',
        time: '10:30',
        doctorName: 'Dr. Jane Smith',
        doctorSpecialty: 'Cardiology'
      },
      pendingFollowUps: 1,
      recentAppointments: [
        {
          id: '2',
          date: '2023-03-01',
          time: '14:00',
          doctorName: 'Dr. Jane Smith',
          doctorSpecialty: 'Cardiology',
          hospitalName: 'General Hospital',
          status: 'completed',
          diagnosis: 'Seasonal allergies',
          type: 'in-person',
          followUpRequired: true,
          followUpDate: '2023-06-01'
        }
      ]
    },
    medicalRecords: [
      {
        id: '1',
        type: 'prescription',
        title: 'Allergy Medication',
        date: '2023-03-01',
        doctorName: 'Dr. Jane Smith',
        hospitalName: 'General Hospital',
        fileUrl: '/files/prescription_1.pdf',
        fileType: 'pdf',
        description: 'Allergy medication prescription',
        isImportant: true
      },
      {
        id: '2',
        type: 'labReport',
        title: 'Blood Test Results',
        date: '2023-03-05',
        doctorName: 'Dr. Jane Smith',
        hospitalName: 'General Hospital',
        fileUrl: '/files/lab_report_1.pdf',
        fileType: 'pdf',
        description: 'Comprehensive blood panel',
        testType: 'Blood Panel'
      },
      {
        id: '3',
        type: 'doctorNote',
        title: 'Consultation Notes',
        date: '2023-03-01',
        doctorName: 'Dr. Jane Smith',
        hospitalName: 'General Hospital',
        fileUrl: '/files/notes_1.pdf',
        fileType: 'pdf',
        description: 'Notes from initial consultation'
      }
    ],
    medicalRecordStats: {
      totalRecords: 3,
      lastUpdatedRecord: {
        date: '2023-03-05',
        type: 'labReport',
        title: 'Blood Test Results'
      },
      totalDoctorsConsulted: 1,
      pendingTests: 0
    },
    accessRequests: [
      {
        id: '1',
        doctorName: 'Dr. Michael Johnson',
        hospitalName: 'City Medical Center',
        requestDate: '2023-03-10',
        status: 'pending'
      }
    ],
    accessLogs: [
      {
        id: '1',
        doctorName: 'Dr. Jane Smith',
        hospitalName: 'General Hospital',
        accessDate: '2023-03-02',
        accessType: 'full'
      }
    ],
    notifications: [
      {
        id: '1',
        type: 'appointment',
        message: 'Upcoming appointment with Dr. Jane Smith on April 15, 2023',
        date: '2023-03-15',
        read: false
      },
      {
        id: '2',
        type: 'record',
        message: 'New lab report added to your records',
        date: '2023-03-05',
        read: true
      },
      {
        id: '3',
        type: 'access',
        message: 'Dr. Michael Johnson has requested access to your records',
        date: '2023-03-10',
        read: false
      }
    ]
  },
  
  doctorDashboard: {
    // Similar structure for doctor dashboard
  }
};

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add an error handler that shows mock data for development
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If server is not available, use mock data in development
    if (process.env.NODE_ENV === 'development' && 
        (error.code === 'ECONNABORTED' || error.message.includes('Network Error'))) {
      console.log('API server not available, using mock data');
      
      // If this is a login request, return mock login data
      if (error.config.url === '/auth/login') {
        const requestData = JSON.parse(error.config.data);
        if (requestData.email === 'patient@example.com' && requestData.password === 'password123') {
          return Promise.resolve({
            data: {
              token: 'mock-token-patient',
              user: {
                id: '1',
                name: 'John Doe',
                email: 'patient@example.com',
                role: 'patient'
              }
            }
          });
        }
        if (requestData.email === 'doctor@example.com' && requestData.password === 'password123') {
          return Promise.resolve({
            data: {
              token: 'mock-token-doctor',
              user: {
                id: '2',
                name: 'Dr. Jane Smith',
                email: 'doctor@example.com',
                role: 'doctor'
              }
            }
          });
        }
      }
      
      // Handle other endpoints with mock data
      if (error.config.url.includes('/patients/dashboard')) {
        return Promise.resolve({
          data: mockData.patientDashboard
        });
      }
      
      if (error.config.url.includes('/patients/appointments')) {
        return Promise.resolve({
          data: mockData.patientDashboard.appointments
        });
      }
      
      if (error.config.url.includes('/patients/medical-records')) {
        return Promise.resolve({
          data: mockData.patientDashboard.medicalRecords
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: async (userData: any) => {
    return api.post('/auth/register', userData);
  },
  login: async (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },
};

// Patient API calls
export const patientAPI = {
  getDashboard: async () => {
    return api.get('/patients/dashboard');
  },
  getProfile: async () => {
    return api.get('/patients/profile');
  },
  updateProfile: async (profileData: any) => {
    return api.put('/patients/profile', profileData);
  },
  getAppointments: async () => {
    return api.get('/patients/appointments');
  },
  getAppointment: async (id: string) => {
    return api.get(`/patients/appointments/${id}`);
  },
  bookAppointment: async (appointmentData: any) => {
    return api.post('/patients/appointments', appointmentData);
  },
  rescheduleAppointment: async (id: string, appointmentData: any) => {
    return api.put(`/patients/appointments/${id}`, appointmentData);
  },
  cancelAppointment: async (id: string) => {
    return api.delete(`/patients/appointments/${id}`);
  },
  getMedicalRecords: async () => {
    return api.get('/patients/medical-records');
  },
  getMedicalRecord: async (id: string) => {
    return api.get(`/patients/medical-records/${id}`);
  },
  shareRecord: async (recordId: string, shareData: any) => {
    return api.post(`/patients/medical-records/${recordId}/share`, shareData);
  },
  getSharedAccess: async () => {
    return api.get('/patients/shared-access');
  },
  revokeAccess: async (accessId: string) => {
    return api.delete(`/patients/shared-access/${accessId}`);
  },
};

// Doctor API calls
export const doctorAPI = {
  getDashboard: async () => {
    return api.get('/doctors/dashboard');
  },
  getProfile: async () => {
    return api.get('/doctors/profile');
  },
  updateProfile: async (profileData: any) => {
    return api.put('/doctors/profile', profileData);
  },
  getAppointments: async () => {
    return api.get('/doctors/appointments');
  },
  getAppointment: async (id: string) => {
    return api.get(`/doctors/appointments/${id}`);
  },
  updateAppointment: async (id: string, appointmentData: any) => {
    return api.put(`/doctors/appointments/${id}`, appointmentData);
  },
  getPatients: async () => {
    return api.get('/doctors/patients');
  },
  getPatient: async (id: string) => {
    return api.get(`/doctors/patients/${id}`);
  },
  getPatientRecords: async (patientId: string) => {
    return api.get(`/doctors/patients/${patientId}/records`);
  },
  addMedicalRecord: async (patientId: string, recordData: any) => {
    return api.post(`/doctors/patients/${patientId}/records`, recordData);
  },
};

export default api; 