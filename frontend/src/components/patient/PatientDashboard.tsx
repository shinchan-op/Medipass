import React, { useState, useEffect } from 'react';
import {Container,Typography,
Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  AppBar,
  InputAdornment,
  IconButton,
  Avatar,
  CardHeader,
  Switch,
  MenuItem,
  CircularProgress,
  Alert,
  Badge,
  Fab,
  FormControlLabel,
  InputLabel,
  Select,
  RadioGroup,
  FormControl,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Radio,
  InputBase,
  ListItem,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Theme,
  useMediaQuery,
  useTheme
} from '@mui/material';

import {
  Search,
  Notifications,
  Settings,
  CalendarMonth,
  LocalHospital,
  MedicalInformation,
  Assignment,
  Share,
  Download,
  ArrowForward,
  ExpandMore,
  Visibility,
  VisibilityOff,
  Edit,
  Save,
  NightsStay,
  LightMode,
  PhoneAndroid,
  Fingerprint,
  Logout,
  Help,
  Email,
  ContactPhone,
  Article,
  Computer,
  VpnKey,
  Security,
  Language,
  Delete,
  Add,
  Block,
  Warning,
  QrCode,
  Upload,
  Event as EventIcon,
  Person,
  ContentCopy,
  Print,
  Check,
  FileUpload,
  AccessTime,
  History,
  Vaccines,
  Biotech,
  Lock,
  LockOpen,
  PersonAdd,
  Timer,
  Medication,
  Description,
  MoreVert,
  ViewList,
  ViewModule,
  Event,
  Cancel,
  Autorenew,
  MarkunreadOutlined,
  VerifiedUser,
  DarkMode,
  Sms,
  SupportAgent,
  Api,
  Lock as PasswordIcon,
  DeleteOutline,
  AddCircleOutline,
  CloudUpload,
  Delete as DeleteIcon,
  AttachFile,
  PictureAsPdf,
  Image,
  InsertDriveFile,
  Close as CloseIcon
} from '@mui/icons-material';

import { patientAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Define interfaces for the dashboard data
interface PatientData {
  id: string;
  medipassId: string;
  firstName: string;
  lastName: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  profileImage?: string;
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
  diagnosis?: string;
  type: 'in-person' | 'online';
  reasonForVisit?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  linkedRecords?: string[]; // IDs of linked medical records
  location?: string;
  reminderSent?: boolean;
}

interface MedicalRecord {
  id: string;
  type: 'prescription' | 'labReport' | 'doctorNote' | 'vaccination' | 'surgery' | 'allergy';
  title: string;
  date: string;
  doctorName: string;
  hospitalName: string;
  fileUrl: string;
  fileType?: 'pdf' | 'image' | 'text';
  description?: string;
  isImportant?: boolean;
  tags?: string[];
  testType?: string; // For lab reports
  vaccineName?: string;
  vaccineDose?: string;
  nextDueDate?: string;
  surgeryType?: string;
  postCareInstructions?: string;
}

interface MedicalRecordStats {
  totalRecords: number;
  lastUpdatedRecord: {
    date: string;
    type: string;
    title: string;
  };
  totalDoctorsConsulted: number;
  pendingTests: number;
}

interface AccessRequest {
  id: string;
  doctorName: string;
  hospitalName: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied';
}

interface AccessLog {
  id: string;
  doctorName: string;
  hospitalName: string;
  accessDate: string;
  accessType: 'full' | 'emergency' | 'limited';
}

interface AppointmentStats {
  totalUpcoming: number;
  nextAppointment: {
    date: string;
    time: string;
    doctorName: string;
    doctorSpecialty: string;
  } | null;
  pendingFollowUps: number;
  recentAppointments: Appointment[];
}

interface DashboardData {
  patient: PatientData;
  appointments: Appointment[];
  appointmentStats: AppointmentStats;
  medicalRecords: MedicalRecord[];
  medicalRecordStats: MedicalRecordStats;
  accessRequests: AccessRequest[];
  accessLogs: AccessLog[];
  notifications: {
    id: string;
    type: 'appointment' | 'medication' | 'record' | 'access';
    message: string;
    date: string;
    read: boolean;
  }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
      style={{ 
        padding: 0,
        height: '100%'
      }}
    >
      {value === index && (
        <Box sx={{ 
          height: '100%', 
          backgroundColor: 'background.paper',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          pt: 1,
          pb: 3
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Add additional interfaces for data sharing features
interface SharedAccess {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'doctor' | 'hospital' | 'pharmacy' | 'lab' | 'family';
  accessType: 'read-only' | 'editable';
  dateShared: string;
  expiryDate: string;
  sharedRecords: string[]; // IDs of shared records
  accessScope: 'complete' | 'specific' | 'latest' | 'appointments';
}

// Update the MedicalRecordCard component for better responsiveness
const MedicalRecordCard = ({ 
  record, 
  onEdit,
  onDelete 
}: { 
  record: MedicalRecord; 
  onEdit: (record: MedicalRecord) => void;
  onDelete: (record: MedicalRecord) => void;
}) => {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-4px)' },
          boxShadow: { xs: '0 2px 8px rgba(0, 0, 0, 0.1)', sm: '0 5px 15px rgba(0, 0, 0, 0.15)' }
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 1 
        }}>
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              flex: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mb: { xs: 1, sm: 0 },
              wordBreak: 'break-word'
            }}
          >
            {record.title}
            {record.isImportant && (
              <Chip 
                size="small" 
                color="error" 
                label="Important"
                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
              />
            )}
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <IconButton 
              color="primary" 
              size="small" 
              onClick={() => onEdit(record)}
              sx={{ ml: 0.5 }}
              aria-label="Edit record"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              color="error" 
              size="small" 
              onClick={() => onDelete(record)}
              sx={{ ml: 0.5 }}
              aria-label="Delete record"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Type:</strong> {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Date:</strong> {new Date(record.date).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Doctor:</strong> {record.doctorName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Hospital:</strong> {record.hospitalName}
            </Typography>
          </Grid>
        </Grid>
        
        {record.description && (
          <Typography variant="body2" sx={{ mt: 1.5, mb: 1.5 }}>
            {record.description}
          </Typography>
        )}
        
        {record.tags && record.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {record.tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                sx={{ 
                  backgroundColor: '#e3f2fd', 
                  color: '#1976d2',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  mb: 0.5
                }} 
              />
            ))}
          </Box>
        )}
        
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
          gap: 1
        }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Download />}
            sx={{ textTransform: 'none', minWidth: { xs: '45%', sm: 'auto' } }}
          >
            Download
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Share />}
            sx={{ textTransform: 'none', minWidth: { xs: '45%', sm: 'auto' } }}
          >
            Share
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Create a new AppointmentCard component
interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
}

const AppointmentCard = ({ appointment, onReschedule, onCancel }: AppointmentCardProps) => {
  const isUpcoming = appointment.status === 'upcoming';
  
  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  mr: 1,
                  bgcolor: isUpcoming ? 'success.main' : 'text.disabled'
                }}
              />
              <Typography variant="subtitle1" fontWeight={600}>
                {isUpcoming ? 'Upcoming Appointment' : 'Past Appointment'} 
              </Typography>
              
              <Chip 
                size="small" 
                label={appointment.type} 
                sx={{ 
                  ml: 1.5, 
                  textTransform: 'capitalize', 
                  fontSize: '0.7rem', 
                  bgcolor: appointment.type === 'online' ? 'info.light' : 'primary.light',
                  color: appointment.type === 'online' ? 'info.dark' : 'primary.dark'
                }} 
              />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {appointment.doctorName} 
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({appointment.doctorSpecialty})
              </Typography>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {appointment.hospitalName} • {appointment.location}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarMonth fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                {appointment.date} at {appointment.time}
              </Typography>
            </Box>
            
            {appointment.reasonForVisit && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Reason:</strong> {appointment.reasonForVisit}
              </Typography>
            )}
            
            {appointment.status === 'completed' && appointment.diagnosis && (
              <Typography variant="body2">
                <strong>Diagnosis:</strong> {appointment.diagnosis}
              </Typography>
            )}
          </Box>
          
          {isUpcoming && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                variant="outlined"
                color="primary"
                onClick={() => onReschedule(appointment.id)}
                startIcon={<Event />}
              >
                Reschedule
              </Button>
              <Button 
                size="small" 
                variant="outlined"
                color="error"
                onClick={() => onCancel(appointment.id)}
                startIcon={<Cancel />}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [recordTypeFilter, setRecordTypeFilter] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentReason, setAppointmentReason] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState<boolean>(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showQRCodeDialog, setShowQRCodeDialog] = useState<boolean>(false);
  const [qrCodeExpiry, setQRCodeExpiry] = useState<string>('60'); // minutes
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [accessDuration, setAccessDuration] = useState<string>('24h');
  const [accessOTP, setAccessOTP] = useState<string>('');
  const [selectedAccessScope, setSelectedAccessScope] = useState<'complete' | 'specific' | 'latest' | 'appointments'>('specific');
  const [showAllAccessLogs, setShowAllAccessLogs] = useState<boolean>(false);
  const [showDirectorySearch, setShowDirectorySearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [recipientType, setRecipientType] = useState<'doctor' | 'hospital' | 'pharmacy' | 'lab' | 'family'>('doctor');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('english');
  const [notificationPreferences, setNotificationPreferences] = useState({
    appointments: true,
    medicalRecords: true,
    dataSharingRequests: true,
    securityAlerts: true
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(true);
  const [showContactDialog, setShowContactDialog] = useState<boolean>(false);
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<string | null>(null);
  const [showAddEmergencyContactDialog, setShowAddEmergencyContactDialog] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactRelationship, setNewContactRelationship] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [profileEditMode, setProfileEditMode] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: ''
  });
  const [recordsViewMode, setRecordsViewMode] = useState<'list' | 'grid'>('list');
  const [recordFilter, setRecordFilter] = useState<string | null>(null);
  const [recordSort, setRecordSort] = useState<string>('date');
  // Add API connection test state
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  // Inside the PatientDashboard component, add these state variables
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);
  const [showEditRecordDialog, setShowEditRecordDialog] = useState(false);
  const [editedRecordTitle, setEditedRecordTitle] = useState('');
  const [editedRecordDescription, setEditedRecordDescription] = useState('');
  const [editedRecordIsImportant, setEditedRecordIsImportant] = useState(false);
  const [editedRecordTags, setEditedRecordTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  // Add these state variables after the other state declarations
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordType, setNewRecordType] = useState<'prescription' | 'labReport' | 'doctorNote' | 'vaccination' | 'surgery' | 'allergy'>('prescription');
  const [newRecordDescription, setNewRecordDescription] = useState('');
  const [newRecordDate, setNewRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecordDoctorName, setNewRecordDoctorName] = useState('');
  const [newRecordHospitalName, setNewRecordHospitalName] = useState('');
  const [newRecordIsImportant, setNewRecordIsImportant] = useState(false);
  const [newRecordTags, setNewRecordTags] = useState<string[]>([]);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  // Add these state variables after the other state declarations
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Create mock data if user is not authenticated
        if (!user) {
          console.log('No authenticated user, using mock data');
          
          // Create mock dashboard data
          const mockDashboardData: DashboardData = {
            patient: {
              id: 'mock-patient-id',
              medipassId: 'MP12345',
              firstName: 'John',
              lastName: 'Doe',
              bloodGroup: 'O+',
              allergies: ['Peanuts', 'Penicillin'],
              chronicConditions: ['Asthma'],
              profileImage: 'https://via.placeholder.com/150',
              emergencyContacts: [
                {
                  name: 'Emergency Contact',
                  relationship: 'Family',
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
                id: 'mock-appointment-1',
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
                id: 'mock-appointment-2',
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
              recentAppointments: []
            },
            medicalRecords: [
              {
                id: 'mock-record-1',
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
                id: 'mock-record-2',
                type: 'labReport',
                title: 'Blood Test Results',
                date: '2023-03-05',
                doctorName: 'Dr. Jane Smith',
                hospitalName: 'General Hospital',
                fileUrl: '/files/lab_report_1.pdf',
                fileType: 'pdf',
                description: 'Comprehensive blood panel',
                testType: 'Blood Panel'
              }
            ],
            medicalRecordStats: {
              totalRecords: 2,
              lastUpdatedRecord: {
                date: '2023-03-05',
                type: 'labReport',
                title: 'Blood Test Results'
              },
              totalDoctorsConsulted: 1,
              pendingTests: 0
            },
            accessRequests: [],
            accessLogs: [],
            notifications: [
              {
                id: 'mock-notification-1',
                type: 'appointment',
                message: 'Upcoming appointment with Dr. Jane Smith on April 15, 2023',
                date: '2023-03-15',
                read: false
              }
            ]
          };
          
          setDashboardData(mockDashboardData);
          setLoading(false);
          return;
        }
        
        // Continue with the normal API call if user is authenticated
        const response = await patientAPI.getDashboard();
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle emergency mode
  const handleEmergencyModeToggle = () => {
    setEmergencyMode(!emergencyMode);
  };

  // Filter medical records by type
  const handleRecordTypeFilter = (type: string | null) => {
    setRecordTypeFilter(type);
  };

  // Get filtered medical records
  const getFilteredRecords = (): MedicalRecord[] => {
    if (!dashboardData || !dashboardData.medicalRecords) {
      return [];
    }

    let filtered = [...dashboardData.medicalRecords];
    
    // Apply type filter
    if (recordFilter && recordFilter !== 'all') {
      filtered = filtered.filter(record => record.type.toLowerCase().includes(recordFilter.toLowerCase()));
    }
    
    // Apply sorting
    if (recordSort) {
      switch (recordSort) {
        case 'date':
          filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          break;
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        case 'doctor':
          filtered.sort((a, b) => a.doctorName.localeCompare(b.doctorName));
          break;
        case 'hospital':
          filtered.sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
          break;
        default:
          break;
      }
    }
    
    return filtered;
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    if (!dashboardData) return 0;
    return dashboardData.notifications.filter(notification => !notification.read).length;
  };

  // Get pending access requests count
  const getPendingAccessRequestsCount = () => {
    if (!dashboardData) return 0;
    return dashboardData.accessRequests.filter(request => request.status === 'pending').length;
  };

  // Function to handle booking appointment
  const handleBookAppointment = () => {
    // First, navigate to the Appointments tab
    setTabValue(1);
    
    // Then show the appointment booking form
    setShowBookingForm(true);
    
    console.log('Opening appointment booking form');
    
    // In a real app with a backend API, this would display the form for the user to input their details
    // For now, alert the user as a fallback for the demo
    setTimeout(() => {
      alert('This would open an appointment booking form in a real app. For now, we just navigate to the Appointments tab.');
    }, 500);
  };

  // Function to reset appointment form
  const resetAppointmentForm = () => {
    setSelectedSpecialty('');
    setSelectedLocation('');
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentReason('');
  };

  // Function to handle appointment reschedule
  const handleRescheduleAppointment = (appointmentId: string) => {
    setAppointmentToReschedule(appointmentId);
    setShowRescheduleForm(true);
  };

  // Function to handle appointment cancellation
  const handleCancelAppointment = (appointmentId: string) => {
    // In a real app, this would call the API to cancel the appointment
    console.log('Cancelling appointment:', appointmentId, 'Reason:', cancelReason);
    setCancelReason('');
    // Refresh appointments data
  };

  // Function to confirm reschedule
  const confirmReschedule = () => {
    // In a real app, this would call the API to reschedule
    console.log('Rescheduling appointment:', appointmentToReschedule, 'to', selectedDate, selectedTime);
    
    // Reset and close form
    setAppointmentToReschedule(null);
    resetAppointmentForm();
    setShowRescheduleForm(false);
  };

  // Function to get available time slots (simplified for demo)
  const getAvailableTimeSlots = (): string[] => {
    return [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
      '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ];
  };

  // Function to get available specialties (simplified for demo)
  const getAvailableSpecialties = (): string[] => {
    return [
      'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
      'Pediatrics', 'Psychiatry', 'General Medicine', 'Gynecology'
    ];
  };

  // Function to get available doctors based on specialty (simplified for demo)
  const getAvailableDoctors = (): {id: string, name: string, specialty: string}[] => {
    return [
      {id: 'doc1', name: 'Dr. John Smith', specialty: 'Cardiology'},
      {id: 'doc2', name: 'Dr. Emily Johnson', specialty: 'Dermatology'},
      {id: 'doc3', name: 'Dr. Michael Brown', specialty: 'Neurology'},
      {id: 'doc4', name: 'Dr. Sarah Wilson', specialty: 'Orthopedics'},
    ];
  };

  // Function to get available locations (simplified for demo)
  const getAvailableLocations = (): string[] => {
    return [
      'Central Hospital', 'Westside Medical Center', 'Northpark Clinic', 
      'Downtown Healthcare', 'Virtual Consultation'
    ];
  };

  // Function to generate QR code
  const generateQRCode = () => {
    if (!dashboardData) return;
    
    // In a real app, this would make an API call to generate a secure, time-limited token
    const expiryMinutes = parseInt(qrCodeExpiry, 10);
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
    
    // Generate a random token (simplified for demo)
    const token = Math.random().toString(36).substring(2, 15);
    
    // Create QR code data
    const data = {
      patientId: dashboardData.patient.id,
      medipassId: dashboardData.patient.medipassId,
      token: token,
      expiryDate: expiryDate
    };
    
    // Set QR code data
    setQrCodeData(JSON.stringify(data));
    setShowQRCodeDialog(true);
  };

  // Function to share records with a recipient
  const shareRecords = () => {
    if (!selectedRecipient || selectedRecords.length === 0) {
      return;
    }

    // In a real app, this would make an API call to share records
    console.log('Sharing records:', {
      recipient: selectedRecipient,
      records: selectedRecords,
      accessDuration: accessDuration,
      accessScope: selectedAccessScope
    });

    // Reset form and close dialog
    setSelectedRecipient('');
    setSelectedRecords([]);
    setAccessDuration('24h');
    setSelectedAccessScope('specific');
    setShowShareDialog(false);

    // Show confirmation message (in a real app)
    // showNotification('Records shared successfully!');
  };

  // Function to revoke access
  const revokeAccess = (accessId: string) => {
    // In a real app, this would make an API call to revoke access
    console.log('Revoking access:', accessId);
    
    // Refresh access logs (in a real app)
    // fetchAccessLogs();
  };

  // Function to extend access
  const extendAccess = (accessId: string, newDuration: string) => {
    // In a real app, this would make an API call to extend access
    console.log('Extending access:', accessId, 'new duration:', newDuration);
    
    // Refresh access logs (in a real app)
    // fetchAccessLogs();
  };

  // Function to download medical record
  const downloadRecord = (recordId: string) => {
    // In a real app, this would make an API call to download the record
    console.log('Downloading record:', recordId);
    
    // Show download progress/success (in a real app)
    // showNotification('Download started');
  };

  // Function to export data for second opinion
  const exportForSecondOpinion = () => {
    // In a real app, this would package selected records into a secure format
    console.log('Exporting data for second opinion');
    
    // Show export progress/success (in a real app)
    // showNotification('Export completed');
  };

  // Function to toggle emergency sharing mode
  const toggleEmergencySharingMode = () => {
    // This is different from emergency mode - it's specifically for sharing
    console.log('Toggling emergency sharing mode');
    
    // In a real app, this would update user preferences and backend settings
    // updateEmergencySharingPreferences();
  };

  // Function to get verified recipients (simplified for demo)
  const getVerifiedRecipients = (): {id: string, name: string, type: 'doctor' | 'hospital' | 'pharmacy' | 'lab' | 'family'}[] => {
    return [
      {id: 'doc1', name: 'Dr. John Smith', type: 'doctor'},
      {id: 'doc2', name: 'Dr. Emily Johnson', type: 'doctor'},
      {id: 'hosp1', name: 'Central Hospital', type: 'hospital'},
      {id: 'pharm1', name: 'HealthPlus Pharmacy', type: 'pharmacy'},
      {id: 'lab1', name: 'MediLab Diagnostics', type: 'lab'},
      {id: 'fam1', name: 'Sarah (Spouse)', type: 'family'},
    ];
  };

  // Function to get active shared accesses (simplified for demo)
  const getActiveSharedAccesses = (): SharedAccess[] => {
    return [
      {
        id: 'access1',
        recipientId: 'doc1',
        recipientName: 'Dr. John Smith',
        recipientType: 'doctor',
        accessType: 'read-only',
        dateShared: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        sharedRecords: ['rec1', 'rec2', 'rec3'],
        accessScope: 'specific'
      },
      {
        id: 'access2',
        recipientId: 'hosp1',
        recipientName: 'Central Hospital',
        recipientType: 'hospital',
        accessType: 'read-only',
        dateShared: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        expiryDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), // 23 days from now
        sharedRecords: [],
        accessScope: 'complete'
      }
    ];
  };

  // Function to update notification preferences
  const handleNotificationPreferenceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [event.target.name]: event.target.checked
    });
  };

  // Function to change password
  const handleChangePassword = () => {
    // Validation
    if (newPassword !== confirmPassword) {
      // Show error - passwords don't match
      return;
    }
    
    // In a real app, this would make an API call to change the password
    console.log('Changing password');
    
    // Reset form and close dialog
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordDialog(false);
    
    // Show confirmation message (in a real app)
    // showNotification('Password changed successfully!');
  };

  // Function to toggle theme mode
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    // In a real app, this would update the theme context
  };

  // Function to change language
  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value);
    // In a real app, this would update the language context/i18n
  };

  // Function to toggle 2FA
  const handleToggle2FA = () => {
    // In a real app, this would initiate the 2FA setup process
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  // Function to toggle biometric login
  const handleToggleBiometric = () => {
    // In a real app, this would interact with device biometric APIs
    setBiometricEnabled(!biometricEnabled);
  };

  // Function to submit contact form
  const handleContactSubmit = () => {
    // In a real app, this would send the message to customer support
    console.log('Submitting contact form:', { contactSubject, contactMessage });
    
    // Reset form and close dialog
    setContactSubject('');
    setContactMessage('');
    setShowContactDialog(false);
    
    // Show confirmation message (in a real app)
    // showNotification('Your message has been sent. We will get back to you soon.');
  };

  // Function to add emergency contact
  const handleAddEmergencyContact = () => {
    // In a real app, this would make an API call to add the contact
    console.log('Adding emergency contact:', { 
      name: newContactName, 
      relationship: newContactRelationship, 
      phone: newContactPhone 
    });
    
    // Reset form and close dialog
    setNewContactName('');
    setNewContactRelationship('');
    setNewContactPhone('');
    setShowAddEmergencyContactDialog(false);
    
    // Show confirmation message (in a real app)
    // showNotification('Emergency contact added successfully!');
  };

  // Function to remove emergency contact
  const handleRemoveEmergencyContact = (contactId: string) => {
    // In a real app, this would make an API call to remove the contact
    console.log('Removing emergency contact:', contactId);
    
    // Show confirmation message (in a real app)
    // showNotification('Emergency contact removed successfully!');
  };

  // Function to toggle profile edit mode
  const handleToggleProfileEdit = () => {
    if (profileEditMode) {
      // Save profile changes
      // In a real app, this would make an API call to update the profile
      console.log('Saving profile changes:', profileData);
      
      // Show confirmation message (in a real app)
      // showNotification('Profile updated successfully!');
    } else {
      // Initialize profile data with current user data
      if (user) {
        setProfileData({
          name: user.name,
          email: user.email,
          phone: dashboardData?.patient?.phone || '',
          gender: dashboardData?.patient?.gender || '',
          dateOfBirth: dashboardData?.patient?.dateOfBirth ? new Date(dashboardData.patient.dateOfBirth).toISOString().split('T')[0] : '',
          address: dashboardData?.patient?.address || ''
        });
      }
    }
    
    setProfileEditMode(!profileEditMode);
  };

  // Function to handle profile data change
  const handleProfileDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  // Function to log out from all devices
  const handleLogoutAllDevices = () => {
    // In a real app, this would make an API call to invalidate all session tokens
    console.log('Logging out from all devices');
    
    // Show confirmation message (in a real app)
    // showNotification('You have been logged out from all devices.');
  };

  // Function to regenerate Medipass ID
  const handleRegenerateMedipassId = () => {
    // In a real app, this would make an API call to generate a new Medipass ID
    console.log('Regenerating Medipass ID');
    
    // Show confirmation message (in a real app)
    // showNotification('Your Medipass ID has been regenerated.');
  };

  // Add toggle for records view mode
  const toggleRecordsViewMode = () => {
    setRecordsViewMode(prevMode => prevMode === 'list' ? 'grid' : 'list');
  };

  // Add this function near the other utility functions
  const testApiConnection = async () => {
    try {
      setApiTestLoading(true);
      setApiTestResult(null);
      
      console.log('Testing API connection...');
      
      const response = await fetch('http://localhost:8000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setApiTestResult(`API Connection Successful! Response: ${JSON.stringify(data)}`);
        alert(`API Connection Successful! Response: ${JSON.stringify(data)}`);
      } else {
        setApiTestResult(`API Connection Error: ${response.status} ${response.statusText}`);
        alert(`API Connection Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('API Connection Error:', error);
      setApiTestResult(`API Connection Error: ${error instanceof Error ? error.message : String(error)}`);
      alert(`API Connection Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setApiTestLoading(false);
    }
  };

  // Add a function to handle opening the edit dialog
  const handleEditRecord = (record: MedicalRecord) => {
    setRecordToEdit(record);
    setEditedRecordTitle(record.title);
    setEditedRecordDescription(record.description || '');
    setEditedRecordIsImportant(record.isImportant || false);
    setEditedRecordTags(record.tags || []);
    setShowEditRecordDialog(true);
  };

  // Fix the save edited record function with null checks
  const handleSaveEditedRecord = () => {
    if (!recordToEdit || !dashboardData) return;
    
    // In a real app, this would call an API to update the record
    console.log('Saving edited record:', {
      ...recordToEdit,
      title: editedRecordTitle,
      description: editedRecordDescription,
      isImportant: editedRecordIsImportant,
      tags: editedRecordTags
    });
    
    // Update the record in the local state
    const updatedRecords = dashboardData.medicalRecords.map(record => 
      record.id === recordToEdit.id 
        ? {
            ...record,
            title: editedRecordTitle,
            description: editedRecordDescription,
            isImportant: editedRecordIsImportant,
            tags: editedRecordTags
          } 
        : record
    );
    
    // Update the dashboard data
    setDashboardData({
      ...dashboardData,
      medicalRecords: updatedRecords
    });
    
    // Close the dialog and reset the edit state
    setShowEditRecordDialog(false);
    setRecordToEdit(null);
    
    // Show success message
    alert('Medical record updated successfully!');
  };

  // Add a function to add a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (!editedRecordTags.includes(newTag)) {
      setEditedRecordTags([...editedRecordTags, newTag]);
    }
    setNewTag('');
  };

  // Add a function to remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setEditedRecordTags(editedRecordTags.filter(tag => tag !== tagToRemove));
  };

  // Add these handler functions for adding records
  const handleOpenAddRecordDialog = () => {
    setShowAddRecordDialog(true);
    setNewRecordTitle('');
    setNewRecordType('prescription');
    setNewRecordDescription('');
    setNewRecordDate(new Date().toISOString().split('T')[0]);
    setNewRecordDoctorName('');
    setNewRecordHospitalName('');
    setNewRecordIsImportant(false);
    setNewRecordTags([]);
    setNewTag('');
  };

  const handleCloseAddRecordDialog = () => {
    setShowAddRecordDialog(false);
  };

  const handleAddNewTag = () => {
    if (newTag.trim() !== '' && !newRecordTags.includes(newTag.trim())) {
      setNewRecordTags([...newRecordTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveNewTag = (tagToRemove: string) => {
    setNewRecordTags(newRecordTags.filter(tag => tag !== tagToRemove));
  };

  // Add this handler function for file uploads
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSnackbarMessage('File size exceeds 10MB limit');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      setUploadedFile(file);
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, set preview to null
        setFilePreview(null);
      }
      
      // Automatically detect record type based on file extension or mimetype
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'pdf') {
        setNewRecordType('prescription');
      } else if (['jpg', 'jpeg', 'png'].includes(fileExtension || '') || file.type.startsWith('image/')) {
        setNewRecordType('labReport');
      } else if (['doc', 'docx', 'txt'].includes(fileExtension || '')) {
        setNewRecordType('doctorNote');
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateFileUpload = () => {
    // Simulate file upload with progress
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            // Generate a fake URL for the uploaded file
            const fileType = uploadedFile?.type || '';
            let fileTypeForRecord: 'pdf' | 'image' | 'text' = 'pdf';
            
            if (fileType.startsWith('image/')) {
              fileTypeForRecord = 'image';
            } else if (fileType.includes('text') || fileType.includes('document')) {
              fileTypeForRecord = 'text';
            }
            
            // Update the Add Record function to include the file details
            handleAddRecordWithFile(fileTypeForRecord);
          }, 500);
        }
        
        return newProgress;
      });
    }, 300);
  };

  const handleAddRecordWithFile = (fileTypeForRecord: 'pdf' | 'image' | 'text') => {
    if (!newRecordTitle.trim()) {
      setSnackbarMessage('Record title is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (dashboardData) {
      // Generate a fake file URL based on the file type
      const fakeFileUrl = `/uploads/${Date.now()}-${uploadedFile?.name || 'record'}`;
      
      const newRecord: MedicalRecord = {
        id: `record-${Date.now()}`,
        type: newRecordType,
        title: newRecordTitle.trim(),
        date: newRecordDate,
        doctorName: newRecordDoctorName.trim(),
        hospitalName: newRecordHospitalName.trim(),
        description: newRecordDescription.trim(),
        isImportant: newRecordIsImportant,
        tags: [...newRecordTags],
        fileUrl: fakeFileUrl,
        fileType: fileTypeForRecord
      };

      // Update dashboard data with new record
      const updatedDashboardData = {
        ...dashboardData,
        medicalRecords: [newRecord, ...dashboardData.medicalRecords],
        medicalRecordStats: {
          ...dashboardData.medicalRecordStats,
          totalRecords: dashboardData.medicalRecordStats.totalRecords + 1,
          lastUpdatedRecord: {
            date: new Date().toISOString().split('T')[0],
            type: newRecordType,
            title: newRecordTitle.trim()
          }
        }
      };

      setDashboardData(updatedDashboardData);
      setShowAddRecordDialog(false);
      setUploadedFile(null);
      setFilePreview(null);
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSnackbarMessage('Medical record added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  // Add these handler functions for deleting records
  const handleDeleteRecord = (record: MedicalRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteRecord = () => {
    if (recordToDelete && dashboardData) {
      // Remove record from dashboard data
      const updatedRecords = dashboardData.medicalRecords.filter(
        record => record.id !== recordToDelete.id
      );
      
      const updatedDashboardData = {
        ...dashboardData,
        medicalRecords: updatedRecords,
        medicalRecordStats: {
          ...dashboardData.medicalRecordStats,
          totalRecords: dashboardData.medicalRecordStats.totalRecords - 1,
          // Update lastUpdatedRecord only if there are records remaining
          lastUpdatedRecord: updatedRecords.length > 0 
            ? {
                date: new Date().toISOString().split('T')[0],
                type: updatedRecords[0].type,
                title: updatedRecords[0].title
              } 
            : dashboardData.medicalRecordStats.lastUpdatedRecord
        }
      };
      
      setDashboardData(updatedDashboardData);
      setShowDeleteConfirmDialog(false);
      setRecordToDelete(null);
      setSnackbarMessage('Medical record deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleCloseDeleteConfirmDialog = () => {
    setShowDeleteConfirmDialog(false);
    setRecordToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Add this handler function after handleRemoveNewTag but before handleFileChange
  const handleAddRecord = () => {
    if (uploadedFile) {
      // If a file is being uploaded, use the file upload flow
      simulateFileUpload();
    } else {
      // If no file is uploaded, use the standard method
      if (!newRecordTitle.trim()) {
        setSnackbarMessage('Record title is required');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      if (dashboardData) {
        const newRecord: MedicalRecord = {
          id: `record-${Date.now()}`,
          type: newRecordType,
          title: newRecordTitle.trim(),
          date: newRecordDate,
          doctorName: newRecordDoctorName.trim(),
          hospitalName: newRecordHospitalName.trim(),
          description: newRecordDescription.trim(),
          isImportant: newRecordIsImportant,
          tags: [...newRecordTags],
          fileUrl: '/sample-record.pdf', // Default file URL
          fileType: 'pdf'
        };

        // Update dashboard data with new record
        const updatedDashboardData = {
          ...dashboardData,
          medicalRecords: [newRecord, ...dashboardData.medicalRecords],
          medicalRecordStats: {
            ...dashboardData.medicalRecordStats,
            totalRecords: dashboardData.medicalRecordStats.totalRecords + 1,
            lastUpdatedRecord: {
              date: new Date().toISOString().split('T')[0],
              type: newRecordType,
              title: newRecordTitle.trim()
            }
          }
        };

        setDashboardData(updatedDashboardData);
        setShowAddRecordDialog(false);
        setSnackbarMessage('Medical record added successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          mt: 4, 
          borderRadius: 2, 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">No dashboard data available</Typography>
      </Box>
    );
  }

  // Sample QR code URL (in a real app, generate this dynamically)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEDIPASS-${dashboardData.patient.medipassId}`;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 4, 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          {error}
        </Alert>
      ) : (
        <>
          {/* Enhanced Welcome Section with modern design */}
          <Box 
            sx={{ 
              mb: 4, 
              pb: 2, 
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              p: 3
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 200,
                height: 200,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                left: -20,
                width: 150,
                height: 150,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                zIndex: 0
              }}
            />
            
            <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: { xs: 60, md: 80 },
                      height: { xs: 60, md: 80 },
                      border: '3px solid white',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                      backgroundColor: 'primary.light'
                    }}
                    src={dashboardData?.patient?.profileImage}
                  >
                    {dashboardData?.patient?.firstName?.charAt(0) || "P"}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Welcome back, {user?.name || (dashboardData?.patient ? `${dashboardData.patient.firstName} ${dashboardData.patient.lastName}` : "Patient")}!
                    </Typography>
                    <Typography variant="subtitle1">
                      MediPass ID: {dashboardData?.patient?.medipassId || "MP12345"}
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 1 }}>
                      <Chip 
                        label={`Blood Group: ${dashboardData?.patient?.bloodGroup || "Not set"}`} 
                        size="small" 
                        sx={{ 
                          mr: 1, 
                          fontWeight: 500,
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white'
                        }} 
                      />
                      <Chip 
                        label={`${dashboardData?.patient?.allergies?.length || 0} Allergies`} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 500
                        }} 
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  gap: 2 
                }}>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    size="large"
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                    onClick={handleBookAppointment}
                  >
                    Book Appointment
                  </Button>
                  
                  {dashboardData?.appointmentStats?.nextAppointment && (
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      maxWidth: 220
                    }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Next Appointment
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {dashboardData.appointmentStats.nextAppointment.date} at {dashboardData.appointmentStats.nextAppointment.time}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        with {dashboardData.appointmentStats.nextAppointment.doctorName}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Enhanced Tabs Navigation with integrated quick actions */}
          <Box sx={{ 
            mb: 3, 
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            backgroundColor: 'background.paper'
          }}>
            <Grid container>
              <Grid item xs={12} md={8}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': { 
                      py: 2, 
                      px: 3,
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      minHeight: 64,
                      color: 'text.secondary'
                    },
                    '& .Mui-selected': { 
                      color: 'primary.main', 
                      fontWeight: 600 
                    },
                    '& .MuiTabs-indicator': { 
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  <Tab 
                    icon={<MedicalInformation sx={{ mb: 0.5 }} />} 
                    iconPosition="start"
                    label="Medical Records" 
                  />
                  <Tab 
                    icon={<CalendarMonth sx={{ mb: 0.5 }} />} 
                    iconPosition="start"
                    label="Appointments" 
                  />
                  <Tab 
                    icon={<Share sx={{ mb: 0.5 }} />} 
                    iconPosition="start"
                    label="Data Sharing" 
                  />
                  <Tab 
                    icon={<Notifications sx={{ mb: 0.5 }} />} 
                    iconPosition="start"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Notifications
                        {getUnreadNotificationsCount() > 0 && (
                          <Badge color="error" badgeContent={getUnreadNotificationsCount()} sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                  />
                  <Tab 
                    icon={<Settings sx={{ mb: 0.5 }} />} 
                    iconPosition="start"
                    label="Settings" 
                  />
                </Tabs>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<PersonAdd />}
                    onClick={handleBookAppointment}
                    sx={{ 
                      fontWeight: 'bold',
                      height: 40,
                      mt: 1.5
                    }}
                  >
                    Book Appointment
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    color="info"
                    startIcon={apiTestLoading ? <CircularProgress size={16} color="inherit" /> : <Api />}
                    onClick={apiTestLoading ? undefined : testApiConnection}
                    disabled={apiTestLoading}
                    sx={{ 
                      fontWeight: 'medium',
                      height: 40,
                      mt: 1.5,
                      ml: 1
                    }}
                  >
                    {apiTestLoading ? 'Testing...' : 'Test API'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Medical Records Tab - Update the filter controls to include view mode toggle */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography 
                variant="h5" 
                component="h2" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                Medical Records
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutline />}
                onClick={handleOpenAddRecordDialog}
                fullWidth={false}
                sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
              >
                Add Record
              </Button>
            </Box>
            
            {/* Records content */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  {getFilteredRecords().length > 0 ? (
                    getFilteredRecords().map((record) => (
                      <MedicalRecordCard 
                        key={record.id} 
                        record={record} 
                        onEdit={handleEditRecord} 
                        onDelete={handleDeleteRecord}
                      />
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No medical records found. Add your first record!
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Appointments Tab */}
          <TabPanel value={tabValue} index={1}>
            <Container>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Upcoming Appointments
              </Typography>
              
              {dashboardData.appointments.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    No upcoming appointments.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {dashboardData.appointments.map((appointment, index) => (
                    <Grid item xs={12} key={index}>
                      <AppointmentCard
                        appointment={appointment}
                        onReschedule={handleRescheduleAppointment}
                        onCancel={handleCancelAppointment}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Container>
          </TabPanel>

          {/* Data Sharing Tab */}
          <TabPanel value={tabValue} index={2}>
            <Container>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Quick Share
                      </Typography>
                      
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: 'background.default', 
                        borderRadius: 2, 
                        textAlign: 'center',
                        mb: 2
                      }}>
                        <Box 
                          component="img" 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEDIPASS-${dashboardData.patient.medipassId}`}
                          alt="QR Code"
                          sx={{ 
                            width: 150, 
                            height: 150, 
                            mb: 2
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Scan this QR code to access your latest medical records.
                          <br />Valid for 15 minutes.
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            startIcon={<Autorenew />}
                            onClick={() => {
                              console.log('Generating new QR code');
                              alert('New QR code would be generated in a real app');
                            }}
                          >
                            Regenerate
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            startIcon={<ContentCopy />}
                            onClick={() => {
                              navigator.clipboard.writeText(`https://medipass.com/patient/${dashboardData.patient.medipassId}`);
                              alert('Link copied to clipboard!');
                            }}
                          >
                            Copy Link
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Recent Access
                      </Typography>
                      
                      {dashboardData.accessLogs && dashboardData.accessLogs.length > 0 ? (
                        <List>
                          {dashboardData.accessLogs.slice(0, 3).map((log, index) => (
                            <React.Fragment key={log.id}>
                              <ListItemButton>
                                <ListItemIcon>
                                  {log.accessType === 'emergency' ? (
                                    <LocalHospital color="error" />
                                  ) : log.accessType === 'full' ? (
                                    <LockOpen color="primary" />
                                  ) : (
                                    <Lock color="action" />
                                  )}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={
                                    <Typography variant="body2" fontWeight={500}>
                                      {log.doctorName} - {log.hospitalName}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="caption" color="text.secondary">
                                      {log.accessDate} • {log.accessType === 'emergency' ? 'Emergency Access' : 
                                        log.accessType === 'full' ? 'Full Access' : 'Limited Access'}
                                    </Typography>
                                  }
                                />
                              </ListItemButton>
                              {index < dashboardData.accessLogs.slice(0, 3).length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No recent access logs found.
                          </Typography>
                        </Box>
                      )}
                      
                      <Button 
                        fullWidth 
                        variant="text" 
                        sx={{ mt: 1 }}
                        onClick={() => {
                          console.log('Viewing all access logs');
                          alert('This would show all access logs in a real app');
                        }}
                      >
                        View All Access Logs
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Share Records Directly
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Search for doctors or hospitals"
                        placeholder="Enter name or ID"
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Share Type</InputLabel>
                        <Select
                          value="all"
                          label="Share Type"
                        >
                          <MenuItem value="all">All Records</MenuItem>
                          <MenuItem value="recent">Recent Records Only</MenuItem>
                          <MenuItem value="specific">Specific Records</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Expiry</InputLabel>
                        <Select
                          value="1d"
                          label="Expiry"
                        >
                          <MenuItem value="1d">24 Hours</MenuItem>
                          <MenuItem value="7d">7 Days</MenuItem>
                          <MenuItem value="30d">30 Days</MenuItem>
                          <MenuItem value="never">No Expiry</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                          console.log('Sharing records directly');
                          alert('Records would be shared in a real app');
                        }}
                        sx={{ mt: 1 }}
                      >
                        Share Records
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Emergency Access
                        </Typography>
                        <Switch 
                          color="error" 
                          onChange={() => {
                            console.log('Toggling emergency access');
                            alert('Emergency access would be toggled in a real app');
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Emergency access allows healthcare providers to access your critical medical information in emergency situations.
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        <strong>Currently DISABLED</strong>
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Checkbox 
                            size="small" 
                            checked={true}
                            onChange={() => {}}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            Notify me when emergency access is used
                          </Typography>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={3}>
            <Container>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Notifications
              </Typography>
              
              {dashboardData.notifications.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    No notifications to display.
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ 
                  bgcolor: 'background.paper', 
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}>
                  {dashboardData.notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItemButton 
                        sx={{ 
                          py: 1.5,
                          px: 2, 
                          bgcolor: notification.read ? 'transparent' : 'action.hover'
                        }}
                      >
                        <ListItemIcon>
                          {notification.type === 'appointment' ? (
                            <CalendarMonth color="primary" />
                          ) : notification.type === 'medication' ? (
                            <Medication color="secondary" />
                          ) : notification.type === 'record' ? (
                            <MedicalInformation color="info" />
                          ) : (
                            <Lock color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                                {notification.message}
                              </Typography>
                              {!notification.read && (
                                <Chip size="small" label="New" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {notification.date}
                            </Typography>
                          }
                        />
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Marking notification ${notification.id} as read`);
                            // In a real app, we would update the notification status
                            // For now, just alert
                            alert(`Notification marked as ${notification.read ? 'unread' : 'read'}`);
                          }}
                        >
                          {notification.read ? <MarkunreadOutlined /> : <Check />}
                        </IconButton>
                      </ListItemButton>
                      {index < dashboardData.notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="text" 
                  onClick={() => {
                    console.log('Marking all notifications as read');
                    alert('All notifications would be marked as read in a real app');
                  }}
                >
                  Mark all as read
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    console.log('Clearing all notifications');
                    alert('All notifications would be cleared in a real app');
                  }}
                >
                  Clear all
                </Button>
              </Box>
            </Container>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={tabValue} index={4}>
            <Container>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Account Settings
                      </Typography>
                      
                      <List disablePadding>
                        <ListItemButton onClick={() => {
                          console.log('Editing personal information');
                          alert('This would open personal information editor in a real app');
                        }}>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Personal Information" 
                            secondary="Name, Contact Details, Address" 
                          />
                          <Edit fontSize="small" />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton onClick={() => {
                          console.log('Changing password');
                          alert('This would open password change dialog in a real app');
                        }}>
                          <ListItemIcon>
                            <PasswordIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Change Password" 
                            secondary="Update your account password" 
                          />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton onClick={() => {
                          console.log('Updating emergency contacts');
                          alert('This would open emergency contacts editor in a real app');
                        }}>
                          <ListItemIcon>
                            <ContactPhone />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Emergency Contacts" 
                            secondary={`${dashboardData.patient.emergencyContacts.length} contacts added`} 
                          />
                        </ListItemButton>
                      </List>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Security Settings
                      </Typography>
                      
                      <List disablePadding>
                        <ListItemButton>
                          <ListItemIcon>
                            <VerifiedUser />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Two-Factor Authentication" 
                            secondary="Add an extra layer of security" 
                          />
                          <Switch 
                            onChange={() => {
                              console.log('Toggling 2FA');
                              alert('2FA would be toggled in a real app');
                            }}
                          />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton>
                          <ListItemIcon>
                            <Fingerprint />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Biometric Authentication" 
                            secondary="Use fingerprint or face recognition" 
                          />
                          <Switch 
                            onChange={() => {
                              console.log('Toggling biometric auth');
                              alert('Biometric auth would be toggled in a real app');
                            }}
                          />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton onClick={() => {
                          console.log('Logging out from all devices');
                          alert('This would log you out from all devices in a real app');
                        }}>
                          <ListItemIcon>
                            <Logout />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Logout from All Devices" 
                            secondary="Securely end all active sessions" 
                          />
                        </ListItemButton>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Notification Settings
                      </Typography>
                      
                      <List disablePadding>
                        <ListItemButton>
                          <ListItemIcon>
                            <CalendarMonth />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Appointment Reminders" 
                            secondary="Get notified about upcoming appointments" 
                          />
                          <Switch defaultChecked onChange={() => {}} />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton>
                          <ListItemIcon>
                            <Medication />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Medication Reminders" 
                            secondary="Get notified about medication schedules" 
                          />
                          <Switch defaultChecked onChange={() => {}} />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton>
                          <ListItemIcon>
                            <Email />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Email Notifications" 
                            secondary="Receive updates via email" 
                          />
                          <Switch defaultChecked onChange={() => {}} />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton>
                          <ListItemIcon>
                            <Sms />
                          </ListItemIcon>
                          <ListItemText 
                            primary="SMS Notifications" 
                            secondary="Receive updates via text message" 
                          />
                          <Switch onChange={() => {}} />
                        </ListItemButton>
                      </List>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        App Settings
                      </Typography>
                      
                      <List disablePadding>
                        <ListItemButton>
                          <ListItemIcon>
                            <DarkMode />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Dark Mode" 
                            secondary="Toggle between light and dark themes" 
                          />
                          <Switch onChange={() => {
                            console.log('Toggling dark mode');
                            alert('Dark mode would be toggled in a real app');
                          }} />
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton>
                          <ListItemIcon>
                            <Language />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Language" 
                            secondary="Choose your preferred language" 
                          />
                          <Select
                            size="small"
                            value="en"
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="es">Spanish</MenuItem>
                            <MenuItem value="fr">French</MenuItem>
                          </Select>
                        </ListItemButton>
                        
                        <Divider />
                        
                        <ListItemButton onClick={() => {
                          console.log('Opening contact support');
                          alert('This would open the contact support form in a real app');
                        }}>
                          <ListItemIcon>
                            <SupportAgent />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Contact Support" 
                            secondary="Get help with any issues" 
                          />
                        </ListItemButton>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </TabPanel>
        </>
      )}

      {/* Add appointment booking dialog */}
      <Dialog 
        open={showBookingForm} 
        onClose={() => setShowBookingForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          Book New Appointment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="specialty-label">Medical Specialty</InputLabel>
                <Select
                  labelId="specialty-label"
                  label="Medical Specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <MenuItem value="cardiology">Cardiology</MenuItem>
                  <MenuItem value="dermatology">Dermatology</MenuItem>
                  <MenuItem value="neurology">Neurology</MenuItem>
                  <MenuItem value="orthopedics">Orthopedics</MenuItem>
                  <MenuItem value="pediatrics">Pediatrics</MenuItem>
                  <MenuItem value="general">General Medicine</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="doctor-label">Select Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  label="Select Doctor"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  disabled={!selectedSpecialty}
                >
                  <MenuItem value="dr-smith">Dr. Smith (Cardiology)</MenuItem>
                  <MenuItem value="dr-johnson">Dr. Johnson (Dermatology)</MenuItem>
                  <MenuItem value="dr-williams">Dr. Williams (Neurology)</MenuItem>
                  <MenuItem value="dr-jones">Dr. Jones (Orthopedics)</MenuItem>
                  <MenuItem value="dr-brown">Dr. Brown (Pediatrics)</MenuItem>
                  <MenuItem value="dr-davis">Dr. Davis (General Medicine)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="location-label">Appointment Location</InputLabel>
                <Select
                  labelId="location-label"
                  label="Appointment Location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <MenuItem value="hospital-main">Main Hospital</MenuItem>
                  <MenuItem value="clinic-north">North Clinic</MenuItem>
                  <MenuItem value="clinic-south">South Clinic</MenuItem>
                  <MenuItem value="virtual">Virtual Appointment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="time-label">Time</InputLabel>
                <Select
                  labelId="time-label"
                  label="Time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <MenuItem value="09:00">9:00 AM</MenuItem>
                  <MenuItem value="10:00">10:00 AM</MenuItem>
                  <MenuItem value="11:00">11:00 AM</MenuItem>
                  <MenuItem value="13:00">1:00 PM</MenuItem>
                  <MenuItem value="14:00">2:00 PM</MenuItem>
                  <MenuItem value="15:00">3:00 PM</MenuItem>
                  <MenuItem value="16:00">4:00 PM</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Visit"
                multiline
                rows={3}
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => {
              resetAppointmentForm();
              setShowBookingForm(false);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // In a real app, this would call the API to book the appointment
              console.log('Booking appointment with:', {
                doctor: selectedDoctor,
                specialty: selectedSpecialty,
                location: selectedLocation,
                date: selectedDate,
                time: selectedTime,
                reason: appointmentReason
              });
              
              // Reset form and close dialog
              resetAppointmentForm();
              setShowBookingForm(false);
              
              // Show confirmation message
              alert('Appointment booked successfully!');
            }}
            variant="contained"
            disabled={!selectedDoctor || !selectedDate || !selectedTime}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog for editing medical records */}
      <Dialog 
        open={showEditRecordDialog} 
        onClose={() => setShowEditRecordDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          Edit Medical Record
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {recordToEdit && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={editedRecordTitle}
                  onChange={(e) => setEditedRecordTitle(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={editedRecordDescription}
                  onChange={(e) => setEditedRecordDescription(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedRecordIsImportant}
                      onChange={(e) => setEditedRecordIsImportant(e.target.checked)}
                      color="error"
                    />
                  }
                  label="Mark as Important"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {editedRecordTags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label="Add a tag"
                    size="small"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={handleAddTag}
                    size="medium"
                  >
                    Add
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Record Type: {recordToEdit.type} • Created: {recordToEdit.date} • 
                  Doctor: {recordToEdit.doctorName} • Hospital: {recordToEdit.hospitalName}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowEditRecordDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEditedRecord}
            variant="contained"
            color="primary"
            disabled={!editedRecordTitle}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Record Dialog */}
      <Dialog 
        open={showAddRecordDialog} 
        onClose={handleCloseAddRecordDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, sm: 3 }, 
          py: { xs: 1.5, sm: 2 } 
        }}>
          <Typography variant="h6" component="h2">
            Add New Medical Record
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseAddRecordDialog}
            aria-label="close"
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2} sx={{ mt: { xs: 0, sm: 0.5 } }}>
            {/* File Upload Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  mb: 2, 
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  backgroundColor: 'background.default',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(33, 150, 243, 0.04)'
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress variant="determinate" value={uploadProgress} size={60} thickness={4} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Uploading... {uploadProgress}%
                    </Typography>
                  </Box>
                ) : uploadedFile ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {filePreview ? (
                      <Box sx={{ maxWidth: '100%', maxHeight: { xs: 150, sm: 200 }, overflow: 'hidden', mb: 2 }}>
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                      </Box>
                    ) : (
                      <Box sx={{ mb: 2 }}>
                        {uploadedFile.type.includes('pdf') ? (
                          <PictureAsPdf sx={{ fontSize: { xs: 40, sm: 60 }, color: 'error.main' }} />
                        ) : uploadedFile.type.startsWith('image/') ? (
                          <Image sx={{ fontSize: { xs: 40, sm: 60 }, color: 'primary.main' }} />
                        ) : (
                          <InsertDriveFile sx={{ fontSize: { xs: 40, sm: 60 }, color: 'text.secondary' }} />
                        )}
                      </Box>
                    )}
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium', wordBreak: 'break-word' }}>
                      {uploadedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<DeleteIcon />} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
                      size={isMobile ? "small" : "medium"}
                    >
                      Remove File
                    </Button>
                  </Box>
                ) : (
                  <>
                    <CloudUpload sx={{ fontSize: { xs: 40, sm: 60 }, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Drag & Drop or Click to Upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports PDF, Images, and Text documents (Max 10MB)
                    </Typography>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Record Title"
                value={newRecordTitle}
                onChange={(e) => setNewRecordTitle(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="record-type-label">Record Type</InputLabel>
                <Select
                  labelId="record-type-label"
                  value={newRecordType}
                  label="Record Type"
                  onChange={(e) => setNewRecordType(e.target.value as any)}
                >
                  <MenuItem value="prescription">Prescription</MenuItem>
                  <MenuItem value="labReport">Lab Report</MenuItem>
                  <MenuItem value="doctorNote">Doctor Note</MenuItem>
                  <MenuItem value="vaccination">Vaccination</MenuItem>
                  <MenuItem value="surgery">Surgery</MenuItem>
                  <MenuItem value="allergy">Allergy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newRecordDate}
                onChange={(e) => setNewRecordDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Doctor Name"
                value={newRecordDoctorName}
                onChange={(e) => setNewRecordDoctorName(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hospital/Clinic Name"
                value={newRecordHospitalName}
                onChange={(e) => setNewRecordHospitalName(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newRecordDescription}
                onChange={(e) => setNewRecordDescription(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newRecordIsImportant}
                    onChange={(e) => setNewRecordIsImportant(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mark as Important"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'flex-start', 
                mb: 1.5
              }}>
                <TextField
                  size="small"
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewTag();
                    }
                  }}
                  sx={{ mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddNewTag}
                  disabled={!newTag.trim()}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {newRecordTags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveNewTag(tag)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 2, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch'
        }}>
          <Button 
            onClick={handleCloseAddRecordDialog}
            sx={{ 
              mb: { xs: 1, sm: 0 },
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddRecord} 
            variant="contained" 
            disabled={!newRecordTitle.trim() || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ 
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {isUploading ? 'Uploading...' : 'Add Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteConfirmDialog} 
        onClose={handleCloseDeleteConfirmDialog}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
            maxWidth: { xs: '100%', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 1 } }}>
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            Are you sure you want to delete the record <strong>"{recordToDelete?.title}"</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 2, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch'
        }}>
          <Button 
            onClick={handleCloseDeleteConfirmDialog}
            sx={{ 
              mb: { xs: 1, sm: 0 },
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteRecord} 
            color="error" 
            variant="contained"
            sx={{ 
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientDashboard; 