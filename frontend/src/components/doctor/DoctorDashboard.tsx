import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  CircularProgress, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  Snackbar,
  Alert,
  Tooltip,
  Badge,
  Chip,
  Stack,
  SelectChangeEvent,
  Fab,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { 
  Person, 
  Event, 
  MedicalServices, 
  Notifications, 
  Dashboard, 
  CalendarMonth, 
  PeopleAlt, 
  Chat, 
  Medication, 
  Receipt, 
  BarChart,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DateRange as DateRangeIcon,
  VideoCameraFront as VideoCameraFrontIcon,
  LocalHospital as LocalHospitalIcon,
  MoreVert as MoreVertIcon,
  AttachFile,
} from '@mui/icons-material';
import { doctorAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface DashboardData {
  doctor: {
    specialty?: string;
    licenseNumber?: string;
    hospitalAffiliation?: string;
    yearsOfExperience?: number;
    officeHours?: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
  };
  todayAppointments: any[];
  patients: any[];
  recentPrescriptions: any[];
  notifications: any[];
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
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `doctor-tab-${index}`,
    'aria-controls': `doctor-tabpanel-${index}`,
  };
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  endTime: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'noShow';
  type: 'in-person' | 'video' | 'emergency';
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  medicalHistory: MedicalRecord[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  lastVisit: string;
  allergies: string[];
  medications: string[];
  bloodGroup: string;
}

interface MedicalRecord {
  id: string;
  type: string;
  title: string;
  date: string;
  description: string;
  doctorName: string;
  hospitalName: string;
  fileUrl?: string;
  tags?: string[];
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
}

const DoctorDashboard: React.FC = () => {
  // Comment out authentication
  // const { user } = useAuth();
  // Create mock user data
  const user = {
    id: "doc123",
    name: "Dr. Jane Smith",
    email: "dr.jane@example.com",
    role: "doctor"
  };
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [appointmentDialogMode, setAppointmentDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDeleteConfirm, setShowAppointmentDeleteConfirm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    patientId: '',
    date: new Date(),
    time: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    reason: '',
    status: 'scheduled',
    type: 'in-person',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [activeRecordTab, setActiveRecordTab] = useState(0);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [filteredChatThreads, setFilteredChatThreads] = useState<ChatThread[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatThread | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');

  // Replace the fetchDashboardData function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data instead of API call
      const mockDashboardData: DashboardData = {
        doctor: {
          specialty: 'Cardiology',
          licenseNumber: 'MD-12345-CA',
          hospitalAffiliation: 'City General Hospital',
          yearsOfExperience: 15,
          officeHours: [
            { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM' },
            { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM' },
            { day: 'Wednesday', startTime: '10:00 AM', endTime: '06:00 PM' },
            { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM' },
            { day: 'Friday', startTime: '09:00 AM', endTime: '03:00 PM' },
          ]
        },
        todayAppointments: [
          { id: '1', patientName: 'John Smith', time: '10:00 AM', type: 'check-up', status: 'scheduled' },
          { id: '2', patientName: 'Mary Johnson', time: '11:30 AM', type: 'follow-up', status: 'scheduled' },
          { id: '3', patientName: 'Robert Brown', time: '02:00 PM', type: 'consultation', status: 'scheduled' }
        ],
        patients: [
          { id: '101', name: 'Alice Williams', lastVisit: '2023-02-15', condition: 'Hypertension' },
          { id: '102', name: 'James Martinez', lastVisit: '2023-03-01', condition: 'Diabetes Type 2' },
          { id: '103', name: 'Sarah Miller', lastVisit: '2023-03-10', condition: 'Arrhythmia' }
        ],
        recentPrescriptions: [
          { id: '201', patientName: 'Alice Williams', medication: 'Lisinopril 10mg', date: '2023-03-01' },
          { id: '202', patientName: 'James Martinez', medication: 'Metformin 500mg', date: '2023-03-01' },
          { id: '203', patientName: 'Sarah Miller', medication: 'Amiodarone 200mg', date: '2023-03-10' }
        ],
        notifications: [
          { id: '301', message: 'New appointment request from John Smith', time: '2 hours ago', read: false },
          { id: '302', message: 'Lab results available for Sarah Miller', time: '1 day ago', read: true },
          { id: '303', message: 'Prescription refill request from James Martinez', time: '2 days ago', read: true }
        ]
      };
      
      setDashboardData(mockDashboardData);
    } catch (err: any) {
      setError('Error fetching dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Replace the fetchAppointments function
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Mock appointment data
      const mockAppointments: Appointment[] = [
        {
          id: 'appt1',
          patientId: 'pat1',
          patientName: 'John Smith',
          date: '2023-04-15',
          time: '09:00 AM',
          endTime: '09:30 AM',
          reason: 'Annual physical examination',
          status: 'scheduled',
          type: 'in-person',
          notes: 'Patient has history of high blood pressure'
        },
        {
          id: 'appt2',
          patientId: 'pat2',
          patientName: 'Mary Johnson',
          date: '2023-04-15',
          time: '10:00 AM',
          endTime: '10:30 AM',
          reason: 'Follow-up after medication change',
          status: 'scheduled',
          type: 'video',
          notes: 'Check effectiveness of new beta blocker'
        },
        {
          id: 'appt3',
          patientId: 'pat3',
          patientName: 'Robert Brown',
          date: '2023-04-15',
          time: '11:00 AM',
          endTime: '11:30 AM',
          reason: 'Chest pain consultation',
          status: 'scheduled',
          type: 'in-person',
          notes: 'Patient reports intermittent chest pain for 2 weeks'
        },
        {
          id: 'appt4',
          patientId: 'pat4',
          patientName: 'Lisa Garcia',
          date: '2023-04-16',
          time: '09:00 AM',
          endTime: '09:30 AM',
          reason: 'Pre-surgery evaluation',
          status: 'scheduled',
          type: 'in-person',
          notes: 'Scheduled for gallbladder removal next month'
        },
        {
          id: 'appt5',
          patientId: 'pat5',
          patientName: 'Michael Wilson',
          date: '2023-04-16',
          time: '10:00 AM',
          endTime: '10:30 AM',
          reason: 'New patient consultation',
          status: 'scheduled',
          type: 'in-person',
          notes: 'First visit, referred by Dr. Thompson'
        },
        {
          id: 'appt6',
          patientId: 'pat6',
          patientName: 'Emily Davis',
          date: '2023-04-17',
          time: '14:00 PM',
          endTime: '14:30 PM',
          reason: 'Medication review',
          status: 'scheduled',
          type: 'video',
          notes: 'Current medications: Lisinopril, Metformin, Atorvastatin'
        },
        {
          id: 'appt7',
          patientId: 'pat7',
          patientName: 'David Martinez',
          date: '2023-04-18',
          time: '11:00 AM',
          endTime: '11:30 AM',
          reason: 'Post-hospitalization follow-up',
          status: 'scheduled',
          type: 'in-person',
          notes: 'Discharged 1 week ago after heart attack'
        },
        {
          id: 'appt8',
          patientId: 'pat8',
          patientName: 'Susan Anderson',
          date: '2023-04-20',
          time: '15:00 PM',
          endTime: '15:30 PM',
          reason: 'ECG results review',
          status: 'scheduled',
          type: 'in-person',
          notes: 'Bring recent ECG reports'
        }
      ];
      
      setAppointments(mockAppointments);
      setFilteredAppointments(mockAppointments);
    } catch (err: any) {
      setError('Error fetching appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Replace the fetchPatients function
  const fetchPatients = async () => {
    try {
      // Mock patient data
      const mockPatients: Patient[] = [
        {
          id: 'pat1',
          name: 'John Smith',
          age: 45,
          gender: 'Male',
          medicalHistory: [
            {
              id: 'med1',
              type: 'Diagnosis',
              title: 'Hypertension',
              date: '2020-06-15',
              description: 'Stage 1 hypertension diagnosed. Prescribed Lisinopril 10mg.',
              doctorName: 'Dr. Jane Smith',
              hospitalName: 'City General Hospital'
            },
            {
              id: 'med2',
              type: 'Surgery',
              title: 'Appendectomy',
              date: '2018-03-20',
              description: 'Laparoscopic appendectomy performed due to acute appendicitis.',
              doctorName: 'Dr. Robert Johnson',
              hospitalName: 'Memorial Hospital'
            }
          ],
          contactInfo: {
            email: 'john.smith@email.com',
            phone: '555-123-4567',
            address: '123 Main St, Anytown, CA 90210'
          },
          lastVisit: '2023-03-15',
          allergies: ['Penicillin', 'Sulfa drugs'],
          medications: ['Lisinopril 10mg', 'Aspirin 81mg'],
          bloodGroup: 'O+'
        },
        {
          id: 'pat2',
          name: 'Mary Johnson',
          age: 62,
          gender: 'Female',
          medicalHistory: [
            {
              id: 'med3',
              type: 'Diagnosis',
              title: 'Type 2 Diabetes',
              date: '2015-09-10',
              description: 'Type 2 diabetes diagnosed. Started on Metformin 500mg.',
              doctorName: 'Dr. Jane Smith',
              hospitalName: 'City General Hospital'
            },
            {
              id: 'med4',
              type: 'Lab Report',
              title: 'HbA1c Test',
              date: '2023-02-01',
              description: 'HbA1c level: 7.2%. Improved from previous reading of 8.0%.',
              doctorName: 'Dr. Jane Smith',
              hospitalName: 'City General Hospital'
            }
          ],
          contactInfo: {
            email: 'mary.johnson@email.com',
            phone: '555-987-6543',
            address: '456 Oak St, Anytown, CA 90210'
          },
          lastVisit: '2023-03-01',
          allergies: ['Codeine'],
          medications: ['Metformin 500mg', 'Lisinopril 5mg', 'Atorvastatin 20mg'],
          bloodGroup: 'A+'
        },
        {
          id: 'pat3',
          name: 'Robert Brown',
          age: 58,
          gender: 'Male',
          medicalHistory: [
            {
              id: 'med5',
              type: 'Diagnosis',
              title: 'Atrial Fibrillation',
              date: '2021-11-05',
              description: 'Paroxysmal atrial fibrillation diagnosed. Started on anticoagulation therapy.',
              doctorName: 'Dr. Jane Smith',
              hospitalName: 'City General Hospital'
            }
          ],
          contactInfo: {
            email: 'robert.brown@email.com',
            phone: '555-456-7890',
            address: '789 Pine St, Anytown, CA 90210'
          },
          lastVisit: '2023-03-10',
          allergies: [],
          medications: ['Eliquis 5mg', 'Metoprolol 25mg'],
          bloodGroup: 'B-'
        }
      ];
      
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Replace the fetchChatThreads function
  const fetchChatThreads = async () => {
    try {
      // Mock messages data
      const mockMessages: Message[] = [
        {
          id: 'msg1',
          senderId: 'pat1',
          senderName: 'John Smith',
          recipientId: 'doc123',
          recipientName: 'Dr. Jane Smith',
          content: "Hello Dr. Smith, I've been experiencing some side effects from the new medication. Can I schedule a call to discuss?",
          timestamp: '2023-04-14T09:30:00',
          read: true
        },
        {
          id: 'msg2',
          senderId: 'doc123',
          senderName: 'Dr. Jane Smith',
          recipientId: 'pat1',
          recipientName: 'John Smith',
          content: "Hi John, I'm sorry to hear that. What symptoms are you experiencing? We can schedule a video call tomorrow if that works for you.",
          timestamp: '2023-04-14T10:15:00',
          read: true
        },
        {
          id: 'msg3',
          senderId: 'pat1',
          senderName: 'John Smith',
          recipientId: 'doc123',
          recipientName: 'Dr. Jane Smith',
          content: "I've been having headaches and dizziness, especially in the morning. Tomorrow works for me, anytime after 2pm.",
          timestamp: '2023-04-14T10:45:00',
          read: true
        },
        {
          id: 'msg4',
          senderId: 'pat2',
          senderName: 'Mary Johnson',
          recipientId: 'doc123',
          recipientName: 'Dr. Jane Smith',
          content: "Dr. Smith, my blood sugar readings have been higher than usual this week despite following the diet plan.",
          timestamp: '2023-04-13T14:20:00',
          read: false
        },
        {
          id: 'msg5',
          senderId: 'pat3',
          senderName: 'Robert Brown',
          recipientId: 'doc123',
          recipientName: 'Dr. Jane Smith',
          content: "Just wanted to let you know that the new medication seems to be working well. I haven't had any episodes of irregular heartbeat in the past week.",
          timestamp: '2023-04-12T11:05:00',
          read: false
        }
      ];
      
      const threads = createChatThreads(mockMessages);
      setChatThreads(threads);
      setFilteredChatThreads(threads);
    } catch (err: any) {
      console.error('Error fetching chat threads:', err);
    }
  };

  useEffect(() => {
    fetchChatThreads();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAppointmentSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    filterAppointments(term, statusFilter, typeFilter, selectedDate);
  };
  
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    const status = event.target.value;
    setStatusFilter(status);
    
    filterAppointments(searchTerm, status, typeFilter, selectedDate);
  };
  
  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    const type = event.target.value;
    setTypeFilter(type);
    
    filterAppointments(searchTerm, statusFilter, type, selectedDate);
  };
  
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    
    filterAppointments(searchTerm, statusFilter, typeFilter, date);
  };
  
  const filterAppointments = (search: string, status: string, type: string, date: Date | null) => {
    let filtered = [...appointments];
    
    if (search) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.reason.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(apt => apt.status === status);
    }
    
    if (type !== 'all') {
      filtered = filtered.filter(apt => apt.type === type);
    }
    
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      filtered = filtered.filter(apt => apt.date === dateStr);
    }
    
    setFilteredAppointments(filtered);
  };
  
  const handleOpenAddAppointment = () => {
    setAppointmentDialogMode('add');
    setAppointmentForm({
      patientName: '',
      patientId: '',
      date: new Date(),
      time: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
      reason: '',
      status: 'scheduled',
      type: 'in-person',
      notes: ''
    });
    setShowAppointmentDialog(true);
  };
  
  const handleOpenEditAppointment = (appointment: Appointment) => {
    setAppointmentDialogMode('edit');
    setSelectedAppointment(appointment);
    
    const [year, month, day] = appointment.date.split('-').map(Number);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
    
    const dateObj = new Date(year, month - 1, day);
    const timeObj = new Date(year, month - 1, day, hours, minutes);
    const endTimeObj = new Date(year, month - 1, day, endHours, endMinutes);
    
    setAppointmentForm({
      patientName: appointment.patientName,
      patientId: appointment.patientId,
      date: dateObj,
      time: timeObj,
      endTime: endTimeObj,
      reason: appointment.reason,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes || ''
    });
    
    setShowAppointmentDialog(true);
  };
  
  const handleCloseAppointmentDialog = () => {
    setShowAppointmentDialog(false);
    setSelectedAppointment(null);
  };
  
  const handleAppointmentFormChange = (field: string, value: any) => {
    setAppointmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveAppointment = () => {
    try {
      const formattedDate = format(appointmentForm.date, 'yyyy-MM-dd');
      const formattedTime = format(appointmentForm.time, 'HH:mm');
      const formattedEndTime = format(appointmentForm.endTime, 'HH:mm');
      
      const appointmentData = {
        patientName: appointmentForm.patientName,
        patientId: appointmentForm.patientId || `patient-${Math.floor(Math.random() * 1000)}`,
        date: formattedDate,
        time: formattedTime,
        endTime: formattedEndTime,
        reason: appointmentForm.reason,
        status: appointmentForm.status as 'scheduled' | 'completed' | 'cancelled' | 'noShow',
        type: appointmentForm.type as 'in-person' | 'video' | 'emergency',
        notes: appointmentForm.notes
      };
      
      if (appointmentDialogMode === 'add') {
        const newAppointment: Appointment = {
          id: `apt-${Date.now()}`,
          ...appointmentData
        };
        
        setAppointments(prev => [...prev, newAppointment]);
        setFilteredAppointments(prev => [...prev, newAppointment]);
        
        setSnackbar({
          open: true,
          message: 'Appointment added successfully',
          severity: 'success'
        });
      } else if (appointmentDialogMode === 'edit' && selectedAppointment) {
        const updatedAppointments = appointments.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, ...appointmentData } 
            : apt
        );
        
        setAppointments(updatedAppointments);
        setFilteredAppointments(updatedAppointments.filter(apt => 
          apt.date === formattedDate
        ));
        
        setSnackbar({
          open: true,
          message: 'Appointment updated successfully',
          severity: 'success'
        });
      }
      
      handleCloseAppointmentDialog();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setSnackbar({
        open: true,
        message: 'Error saving appointment',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      try {
        const updatedAppointments = appointments.filter(apt => apt.id !== selectedAppointment.id);
        setAppointments(updatedAppointments);
        setFilteredAppointments(updatedAppointments);
        
        setSnackbar({
          open: true,
          message: 'Appointment deleted successfully',
          severity: 'success'
        });
        
        setShowAppointmentDeleteConfirm(false);
        handleCloseAppointmentDialog();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting appointment',
          severity: 'error'
        });
      }
    }
  };
  
  const handleOpenDeleteConfirm = () => {
    setShowAppointmentDeleteConfirm(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setShowAppointmentDeleteConfirm(false);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let label = status;
    
    switch (status) {
      case 'scheduled':
        color = 'primary';
        label = 'Scheduled';
        break;
      case 'completed':
        color = 'success';
        label = 'Completed';
        break;
      case 'cancelled':
        color = 'error';
        label = 'Cancelled';
        break;
      case 'noShow':
        color = 'warning';
        label = 'No Show';
        break;
    }
    
    return <Chip size="small" color={color} label={label} />;
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in-person':
        return <LocalHospitalIcon fontSize="small" color="primary" />;
      case 'video':
        return <VideoCameraFrontIcon fontSize="small" color="secondary" />;
      case 'emergency':
        return <LocalHospitalIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  const handlePatientSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setPatientSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(term.toLowerCase()) ||
        patient.id.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
    setActiveRecordTab(0);
  };

  const handleClosePatientDetails = () => {
    setShowPatientDetails(false);
    setSelectedPatient(null);
  };

  const handleRecordTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveRecordTab(newValue);
  };

  const createChatThreads = (messages: Message[]): ChatThread[] => {
    const messagesByParticipant: { [key: string]: Message[] } = {};
    
    // Group messages by participants
    messages.forEach(message => {
      const participantId = message.senderId === 'doctor-1' ? message.recipientId : message.senderId;
      
      if (!messagesByParticipant[participantId]) {
        messagesByParticipant[participantId] = [];
      }
      
      messagesByParticipant[participantId].push(message);
    });
    
    // Create chat threads
    const threads: ChatThread[] = [];
    Object.keys(messagesByParticipant).forEach(participantId => {
      const participantMessages = messagesByParticipant[participantId];
      // Sort by timestamp
      participantMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const lastMessage = participantMessages[0];
      const unreadCount = participantMessages.filter(
        msg => msg.recipientId === 'doctor-1' && !msg.read
      ).length;
      
      threads.push({
        id: `thread-${participantId}`,
        participantId,
        participantName: participantId === lastMessage.senderId ? lastMessage.senderName : lastMessage.recipientName,
        lastMessage,
        unreadCount
      });
    });
    
    // Sort threads by latest message timestamp
    return threads.sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  };

  const handleChatSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatSearchTerm(event.target.value);
  };

  const handleSelectChat = (thread: ChatThread) => {
    setSelectedChat(thread);
    
    // Simulate fetching chat messages
    const mockChatMessages = [
      {
        id: 'msg-1',
        senderId: 'patient-1',
        senderName: 'John Smith',
        recipientId: 'doctor-1',
        recipientName: 'Dr. Jane Smith',
        content: 'Good morning Dr. Smith. I wanted to ask if I should continue taking the medication as my blood pressure has improved considerably.',
        timestamp: '2023-07-10T09:30:00',
        read: true
      },
      {
        id: 'msg-2',
        senderId: 'doctor-1',
        senderName: 'Dr. Jane Smith',
        recipientId: 'patient-1',
        recipientName: 'John Smith',
        content: "Hello John, yes please continue with the prescribed dosage. We'll review it during your next appointment next week.",
        timestamp: '2023-07-10T10:15:00',
        read: true
      },
      {
        id: 'msg-3',
        senderId: 'patient-1',
        senderName: 'John Smith',
        recipientId: 'doctor-1',
        recipientName: 'Dr. Jane Smith',
        content: "Thank you, Doctor. I'll continue as advised.",
        timestamp: '2023-07-10T10:30:00',
        read: true
      }
    ];
    
    setChatMessages(mockChatMessages);
    
    // Mark messages as read
    if (thread.unreadCount > 0) {
      const updatedThreads = chatThreads.map(t => 
        t.id === thread.id ? { ...t, unreadCount: 0 } : t
      );
      setChatThreads(updatedThreads);
    }
  };

  const handleMessageTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(event.target.value);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'doctor-1',
      senderName: 'Dr. Jane Smith',
      recipientId: selectedChat.participantId,
      recipientName: selectedChat.participantName,
      content: messageText,
      timestamp: new Date().toISOString(),
      read: true
    };
    
    // Add to current chat
    setChatMessages([...chatMessages, newMessage]);
    
    // Update thread with new last message
    const updatedThreads = chatThreads.map(thread => 
      thread.id === selectedChat.id 
        ? { ...thread, lastMessage: newMessage }
        : thread
    );
    
    setChatThreads(updatedThreads);
    setMessageText('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome,{user?.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Doctor Dashboard
      </Typography>
      
      <Box sx={{ width: '100%', mt: 3 }}>
        <Paper elevation={3}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : undefined}
            allowScrollButtonsMobile
            centered={!isMobile}
            aria-label="doctor dashboard tabs"
          >
            <Tab icon={<Dashboard />} label="Overview" {...a11yProps(0)} />
            <Tab icon={<CalendarMonth />} label="Appointments" {...a11yProps(1)} />
            <Tab icon={<PeopleAlt />} label="Patients" {...a11yProps(2)} />
            <Tab icon={<Chat />} label="Messages" {...a11yProps(3)} />
            <Tab icon={<Medication />} label="Prescriptions" {...a11yProps(4)} />
            <Tab icon={<Receipt />} label="Billing" {...a11yProps(5)} />
            <Tab icon={<BarChart />} label="Reports" {...a11yProps(6)} />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" component="div" sx={{ mb: 2 }}>
              Dashboard Overview
            </Typography>
            <Grid container spacing={3}>
              {/* Doctor Information */}
              <Grid item xs={12} md={6} lg={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Profile Information</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      <strong>Specialty:</strong> {dashboardData?.doctor?.specialty || 'Not provided'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>License:</strong> {dashboardData?.doctor?.licenseNumber || 'Not provided'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Hospital:</strong> {dashboardData?.doctor?.hospitalAffiliation || 'Not provided'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Experience:</strong> {dashboardData?.doctor?.yearsOfExperience || 0} years
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Summary Statistics */}
              <Grid item xs={12} md={6} lg={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Dashboard color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Today's Summary</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                          <Typography variant="h4">{dashboardData?.todayAppointments?.length || 0}</Typography>
                          <Typography variant="body2">Appointments</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'secondary.light', borderRadius: 1, color: 'white' }}>
                          <Typography variant="h4">{dashboardData?.notifications?.filter(n => n.unread)?.length || 0}</Typography>
                          <Typography variant="body2">Notifications</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1, color: 'white' }}>
                          <Typography variant="h4">{dashboardData?.patients?.length || 0}</Typography>
                          <Typography variant="body2">Patients</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1, color: 'white' }}>
                          <Typography variant="h4">{dashboardData?.recentPrescriptions?.length || 0}</Typography>
                          <Typography variant="body2">Prescriptions</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Office Hours */}
              <Grid item xs={12} md={6} lg={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Event color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Office Hours</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {dashboardData?.doctor?.officeHours && dashboardData.doctor.officeHours.length > 0 ? (
                      dashboardData.doctor.officeHours.map((hours, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1" fontWeight="bold">{hours.day}:</Typography>
                          <Typography variant="body1">{hours.startTime} - {hours.endTime}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1">No office hours provided</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Today's Appointments */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarMonth color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Today's Appointments</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {dashboardData?.todayAppointments && dashboardData.todayAppointments.length > 0 ? (
                      <List disablePadding>
                        {dashboardData.todayAppointments.map((appointment, index) => (
                          <ListItem key={index} divider={index < dashboardData.todayAppointments.length - 1} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <Person />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={appointment.patientName}
                              secondary={
                                <React.Fragment>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {appointment.time}
                                  </Typography>
                                  {" — "}{appointment.reason}
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body1" sx={{ py: 2 }}>No appointments scheduled for today</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Notifications */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Notifications color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Recent Notifications</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
                      <List disablePadding>
                        {dashboardData.notifications.slice(0, 5).map((notification, index) => (
                          <ListItem 
                            key={index} 
                            divider={index < Math.min(dashboardData.notifications.length, 5) - 1} 
                            sx={{ px: 0, bgcolor: notification.unread ? 'action.hover' : 'transparent' }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={notification.unread ? 'bold' : 'normal'}>
                                  {notification.title}
                                </Typography>
                              }
                              secondary={notification.message}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body1" sx={{ py: 2 }}>No new notifications</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="div">
                Appointment Management
              </Typography>
              <Fab
                color="primary"
                size="medium"
                onClick={handleOpenAddAppointment}
                aria-label="add appointment"
              >
                <AddIcon />
              </Fab>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    label="Filter by date"
                    type="date"
                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      handleDateChange(date);
                    }}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <FormControl fullWidth>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      id="status-filter"
                      value={statusFilter}
                      label="Status"
                      onChange={handleStatusFilterChange}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="noShow">No Show</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <FormControl fullWidth>
                    <InputLabel id="type-filter-label">Type</InputLabel>
                    <Select
                      labelId="type-filter-label"
                      id="type-filter"
                      value={typeFilter}
                      label="Type"
                      onChange={handleTypeFilterChange}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="in-person">In-Person</MenuItem>
                      <MenuItem value="video">Video</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={5}>
                  <TextField
                    fullWidth
                    placeholder="Search appointments"
                    value={searchTerm}
                    onChange={handleAppointmentSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Card>
              <List>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      divider
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenEditAppointment(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: appointment.type === 'emergency' ? 'error.main' : 'primary.main' }}>
                          {getTypeIcon(appointment.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" component="span" fontWeight="medium">
                              {appointment.patientName}
                            </Typography>
                            {getStatusChip(appointment.status)}
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {new Date(appointment.date).toLocaleDateString()} | {appointment.time} - {appointment.endTime}
                            </Typography>
                            {" — "}{appointment.reason}
                            {appointment.notes && (
                              <Typography component="div" variant="caption" sx={{ mt: 0.5 }}>
                                <strong>Notes:</strong> {appointment.notes}
                              </Typography>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No appointments found"
                      secondary="Try changing your search criteria or add a new appointment"
                    />
                  </ListItem>
                )}
              </List>
            </Card>

            {/* Add/Edit Appointment Dialog */}
            <Dialog open={showAppointmentDialog} onClose={handleCloseAppointmentDialog} maxWidth="md" fullWidth>
              <DialogTitle>
                {appointmentDialogMode === 'add' ? 'Add New Appointment' : 'Edit Appointment'}
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      value={appointmentForm.patientName}
                      onChange={(e) => handleAppointmentFormChange('patientName', e.target.value)}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Patient ID (optional)"
                      value={appointmentForm.patientId}
                      onChange={(e) => handleAppointmentFormChange('patientId', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Appointment Date"
                      type="date"
                      value={format(appointmentForm.date, 'yyyy-MM-dd')}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        handleAppointmentFormChange('date', date);
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={format(appointmentForm.time, 'HH:mm')}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const time = new Date(appointmentForm.date);
                        time.setHours(hours, minutes);
                        handleAppointmentFormChange('time', time);
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      margin="normal"
                      required
                      inputProps={{ step: 300 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="End Time"
                      type="time"
                      value={format(appointmentForm.endTime, 'HH:mm')}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const time = new Date(appointmentForm.date);
                        time.setHours(hours, minutes);
                        handleAppointmentFormChange('endTime', time);
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      margin="normal"
                      required
                      inputProps={{ step: 300 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reason for Visit"
                      value={appointmentForm.reason}
                      onChange={(e) => handleAppointmentFormChange('reason', e.target.value)}
                      margin="normal"
                      required
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Appointment Type</InputLabel>
                      <Select
                        value={appointmentForm.type}
                        onChange={(e) => handleAppointmentFormChange('type', e.target.value)}
                        label="Appointment Type"
                        required
                      >
                        <MenuItem value="in-person">In-Person</MenuItem>
                        <MenuItem value="video">Video Conference</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={appointmentForm.status}
                        onChange={(e) => handleAppointmentFormChange('status', e.target.value)}
                        label="Status"
                        required
                      >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="noShow">No Show</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes (optional)"
                      value={appointmentForm.notes}
                      onChange={(e) => handleAppointmentFormChange('notes', e.target.value)}
                      margin="normal"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                {appointmentDialogMode === 'edit' && (
                  <Button 
                    onClick={handleOpenDeleteConfirm} 
                    color="error" 
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                )}
                <Box flexGrow={1} />
                <Button onClick={handleCloseAppointmentDialog}>Cancel</Button>
                <Button 
                  onClick={handleSaveAppointment} 
                  variant="contained" 
                  disabled={!appointmentForm.patientName || !appointmentForm.reason}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showAppointmentDeleteConfirm} onClose={handleCloseDeleteConfirm}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete this appointment with {selectedAppointment?.patientName}?
                  This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
                <Button onClick={handleDeleteAppointment} color="error" variant="contained">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                onClose={handleCloseSnackbar} 
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="div">
                Patient Records & Medical History
              </Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search patients by name or ID"
                value={patientSearchTerm}
                onChange={handlePatientSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>

            <Card>
              <List>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <ListItem
                      key={patient.id}
                      divider
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewPatient(patient)}
                        >
                          View Details
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={patient.name}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {patient.age} years • {patient.gender} • {patient.bloodGroup}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              Last visit: {new Date(patient.lastVisit).toLocaleDateString()} • {patient.medicalHistory.length} records
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No patients found"
                      secondary="Try changing your search criteria"
                    />
                  </ListItem>
                )}
              </List>
            </Card>

            {/* Patient Details Dialog */}
            <Dialog 
              open={showPatientDetails && selectedPatient !== null} 
              onClose={handleClosePatientDetails}
              maxWidth="lg"
              fullWidth
            >
              {selectedPatient && (
                <>
                  <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6">{selectedPatient.name}</Typography>
                      <Chip 
                        label={`ID: ${selectedPatient.id}`} 
                        variant="outlined" 
                        size="small" 
                      />
                    </Box>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>Personal Information</Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Typography variant="body1" gutterBottom>
                              <strong>Age:</strong> {selectedPatient.age} years
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              <strong>Gender:</strong> {selectedPatient.gender}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              <strong>Blood Group:</strong> {selectedPatient.bloodGroup}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              <strong>Last Visit:</strong> {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                            </Typography>

                            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Contact Information</Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Typography variant="body1" gutterBottom>
                              <strong>Email:</strong> {selectedPatient.contactInfo.email}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              <strong>Phone:</strong> {selectedPatient.contactInfo.phone}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              <strong>Address:</strong> {selectedPatient.contactInfo.address}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={8}>
                        <Card variant="outlined" sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>Medical Information</Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Typography variant="subtitle1" gutterBottom>Allergies</Typography>
                            {selectedPatient.allergies.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {selectedPatient.allergies.map((allergy, index) => (
                                  <Chip key={index} label={allergy} color="error" size="small" />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No known allergies
                              </Typography>
                            )}
                            
                            <Typography variant="subtitle1" gutterBottom>Current Medications</Typography>
                            {selectedPatient.medications.length > 0 ? (
                              <Box sx={{ mb: 2 }}>
                                {selectedPatient.medications.map((medication, index) => (
                                  <Chip key={index} label={medication} color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No current medications
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card variant="outlined">
                          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={activeRecordTab} onChange={handleRecordTabChange} aria-label="medical records tabs">
                              <Tab label="Medical Records" />
                              <Tab label="Visit History" />
                              <Tab label="Prescriptions" />
                            </Tabs>
                          </Box>
                          <CardContent>
                            <TabPanel value={activeRecordTab} index={0}>
                              {selectedPatient.medicalHistory.length > 0 ? (
                                selectedPatient.medicalHistory.map((record) => (
                                  <Card key={record.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Typography variant="subtitle1" fontWeight="bold">
                                        {record.title}
                                      </Typography>
                                      <Chip label={record.type} size="small" color="primary" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      {new Date(record.date).toLocaleDateString()} • {record.doctorName} • {record.hospitalName}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                      {record.description}
                                    </Typography>
                                    {record.tags && record.tags.length > 0 && (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {record.tags.map((tag, index) => (
                                          <Chip key={index} label={tag} size="small" variant="outlined" />
                                        ))}
                                      </Box>
                                    )}
                                    {record.fileUrl && (
                                      <Button 
                                        variant="text" 
                                        size="small" 
                                        startIcon={<AttachFile />}
                                        href={record.fileUrl}
                                        target="_blank"
                                        sx={{ mt: 1 }}
                                      >
                                        View Attachment
                                      </Button>
                                    )}
                                  </Card>
                                ))
                              ) : (
                                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                                  No medical records available
                                </Typography>
                              )}
                            </TabPanel>
                            <TabPanel value={activeRecordTab} index={1}>
                              <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                                Visit history will be displayed here
                              </Typography>
                            </TabPanel>
                            <TabPanel value={activeRecordTab} index={2}>
                              <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                                Prescription history will be displayed here
                              </Typography>
                            </TabPanel>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClosePatientDetails}>Close</Button>
                    <Button variant="contained" color="primary">
                      Add New Record
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" component="div" sx={{ mb: 3 }}>
              Messages & Notifications
            </Typography>

            <Grid container spacing={2} sx={{ height: '70vh' }}>
              {/* Chat List */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <TextField
                      fullWidth
                      placeholder="Search conversations"
                      value={chatSearchTerm}
                      onChange={handleChatSearch}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Box>
                  
                  <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {chatThreads.filter(thread => 
                      thread.participantName.toLowerCase().includes(chatSearchTerm.toLowerCase())
                    ).map((thread) => (
                      <ListItem 
                        key={thread.id} 
                        divider 
                        onClick={() => handleSelectChat(thread)}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: selectedChat?.id === thread.id ? 'action.selected' : 'transparent'
                        }}
                      >
                        <ListItemAvatar>
                          <Badge 
                            badgeContent={thread.unreadCount} 
                            color="error"
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            invisible={thread.unreadCount === 0}
                          >
                            <Avatar>
                              {thread.participantName.charAt(0)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={thread.participantName}
                          secondary={
                            <Typography
                              sx={{ display: 'inline', color: thread.unreadCount > 0 ? 'text.primary' : 'text.secondary' }}
                              component="span"
                              variant="body2"
                              noWrap
                            >
                              {thread.lastMessage.content.length > 40 
                                ? `${thread.lastMessage.content.substring(0, 40)}...` 
                                : thread.lastMessage.content}
                            </Typography>
                          }
                          primaryTypographyProps={{
                            fontWeight: thread.unreadCount > 0 ? 'bold' : 'normal'
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ ml: 2, alignSelf: 'flex-start' }}
                        >
                          {new Date(thread.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              {/* Chat Messages */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {selectedChat ? (
                    <>
                      {/* Chat Header */}
                      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{selectedChat.participantName.charAt(0)}</Avatar>
                        <Typography variant="h6">{selectedChat.participantName}</Typography>
                      </Box>
                      
                      {/* Messages */}
                      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {chatMessages.map((message) => (
                          <Box
                            key={message.id}
                            sx={{
                              display: 'flex',
                              justifyContent: message.senderId === 'doctor-1' ? 'flex-end' : 'flex-start',
                              mb: 2
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth: '70%',
                                p: 2,
                                borderRadius: 2,
                                bgcolor: message.senderId === 'doctor-1' ? 'primary.light' : 'grey.100',
                                color: message.senderId === 'doctor-1' ? 'white' : 'inherit'
                              }}
                            >
                              <Typography variant="body1">{message.content}</Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                      
                      {/* Message Input */}
                      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={handleMessageTextChange}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          multiline
                          maxRows={3}
                          sx={{ mr: 2 }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                        >
                          Send
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        color: 'text.secondary',
                        p: 3
                      }}
                    >
                      <Chat sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>No conversation selected</Typography>
                      <Typography variant="body2" textAlign="center">
                        Select a conversation from the list to view messages or start a new conversation.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="div">
                Prescription & Treatment Plans
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {/* TODO: Implement new prescription */}}
              >
                New Prescription
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Recent Prescriptions */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Recent Prescriptions</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField 
                          placeholder="Search prescriptions"
                          size="small"
                          sx={{ width: 200 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <FormControl size="small" sx={{ width: 150 }}>
                          <InputLabel>Filter</InputLabel>
                          <Select label="Filter" defaultValue="all">
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="recent">Recent</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="expired">Expired</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    
                    <List>
                      {[1, 2, 3, 4].map((item) => (
                        <ListItem
                          key={item}
                          divider
                          secondaryAction={
                            <Box>
                              <IconButton size="small" color="primary">
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small">
                                <MoreVertIcon />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <MedicalServices />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" fontWeight="medium">
                                  {item === 1 ? 'Lisinopril 10mg' : 
                                   item === 2 ? 'Metformin 500mg' : 
                                   item === 3 ? 'Atorvastatin 20mg' : 'Levothyroxine 50mcg'}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  color={item < 3 ? "success" : item === 3 ? "warning" : "error"} 
                                  label={item < 3 ? "Active" : item === 3 ? "Refill Required" : "Expired"} 
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="text.primary">
                                  Patient: {item === 1 ? 'John Smith' : 
                                            item === 2 ? 'Michael Brown' : 
                                            item === 3 ? 'John Smith' : 'Sarah Johnson'}
                                </Typography>
                                <Typography variant="body2">
                                  {item === 1 ? 'Take 1 tablet daily for high blood pressure.' : 
                                   item === 2 ? 'Take 1 tablet twice daily with meals.' : 
                                   item === 3 ? 'Take 1 tablet at bedtime.' : 'Take 1 tablet daily on empty stomach.'}
                                  {' · '}
                                  Issued: {new Date(2023, 6, 10 - item).toLocaleDateString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>

                {/* Prescription Templates */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Prescription Templates</Typography>
                    <Grid container spacing={2}>
                      {['Hypertension', 'Type 2 Diabetes', 'High Cholesterol', 'Common Cold', 'Allergies'].map((template) => (
                        <Grid item xs={12} sm={6} md={4} key={template}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <MedicalServices color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="body1" fontWeight="medium">{template}</Typography>
                            <Typography variant="body2" color="text.secondary">Standard treatment</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Treatment Plans */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Treatment Plans</Typography>
                    
                    <List>
                      {['Hypertension Management', 'Diabetes Care Plan', 'Post-Surgery Recovery'].map((plan, index) => (
                        <ListItem
                          key={plan}
                          divider={index < 2}
                        >
                          <ListItemText
                            primary={plan}
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Patients: {5 - index}</span>
                                  <span>Last updated: {new Date(2023, 6, 15 - index * 2).toLocaleDateString()}</span>
                                </Typography>
                              </Box>
                            }
                          />
                          <IconButton size="small" edge="end">
                            <EditIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />} 
                      fullWidth 
                      sx={{ mt: 2 }}
                      onClick={() => {/* TODO: Implement new treatment plan */}}
                    >
                      New Treatment Plan
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="div">
                Billing & Payments
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {/* TODO: Implement new invoice */}}
              >
                Create Invoice
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Billing Summary */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Monthly Summary</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Total Invoiced:</Typography>
                      <Typography variant="body1" fontWeight="bold">$12,450.00</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Payments Received:</Typography>
                      <Typography variant="body1" fontWeight="bold">$8,320.00</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Pending Payments:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="warning.main">$4,130.00</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Overdue:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="error.main">$1,250.00</Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight="bold">Collection Rate:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">67%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Payment Method Breakdown */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Payment Methods</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Placeholder for Payment Method chart */}
                    <Box 
                      sx={{ 
                        height: 200, 
                        bgcolor: 'action.hover', 
                        borderRadius: 1,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" align="center">
                        Payment Method Distribution Chart
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">Insurance (65%)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'secondary.main', borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">Credit Card (20%)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">Bank Transfer (10%)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">Other (5%)</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Recent Transactions */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <List disablePadding>
                      {[
                        { date: '2023-07-18', amount: 150, patient: 'John Smith', status: 'completed' },
                        { date: '2023-07-15', amount: 250, patient: 'Sarah Johnson', status: 'completed' },
                        { date: '2023-07-12', amount: 125, patient: 'Michael Brown', status: 'pending' },
                        { date: '2023-07-10', amount: 200, patient: 'Emma Wilson', status: 'completed' }
                      ].map((transaction, index) => (
                        <ListItem
                          key={index}
                          divider={index < 3}
                          sx={{ px: 0 }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" fontWeight="medium">{transaction.patient}</Typography>
                                <Typography variant="body2" fontWeight="bold">${transaction.amount}</Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption">{new Date(transaction.date).toLocaleDateString()}</Typography>
                                <Chip 
                                  size="small" 
                                  label={transaction.status === 'completed' ? 'Paid' : 'Pending'} 
                                  color={transaction.status === 'completed' ? 'success' : 'warning'}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Button fullWidth variant="text" sx={{ mt: 1 }}>
                      View All Transactions
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Invoice List */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Recent Invoices</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField 
                          placeholder="Search invoices"
                          size="small"
                          sx={{ width: 200 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <FormControl size="small" sx={{ width: 150 }}>
                          <InputLabel>Status</InputLabel>
                          <Select label="Status" defaultValue="all">
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="overdue">Overdue</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { id: 'INV-001', patient: 'John Smith', date: '2023-07-18', amount: 150, status: 'paid' },
                            { id: 'INV-002', patient: 'Sarah Johnson', date: '2023-07-15', amount: 250, status: 'paid' },
                            { id: 'INV-003', patient: 'Michael Brown', date: '2023-07-12', amount: 125, status: 'pending' },
                            { id: 'INV-004', patient: 'Emma Wilson', date: '2023-07-10', amount: 200, status: 'paid' },
                            { id: 'INV-005', patient: 'Robert Davis', date: '2023-07-05', amount: 175, status: 'overdue' }
                          ].map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.id}</TableCell>
                              <TableCell>{invoice.patient}</TableCell>
                              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                              <TableCell>${invoice.amount}</TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={invoice.status === 'paid' ? 'Paid' : invoice.status === 'pending' ? 'Pending' : 'Overdue'} 
                                  color={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'error'}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small">
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={6}>
            <Typography variant="h6" component="div" sx={{ mb: 3 }}>
              Analytics & Reports
            </Typography>

            <Grid container spacing={3}>
              {/* Key Metrics */}
              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Appointments</Typography>
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <Typography variant="h2" color="primary">24</Typography>
                      <Typography variant="body2" color="text.secondary">This Week</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Last Week:</Typography>
                      <Typography variant="body2" fontWeight="bold">19</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Change:</Typography>
                      <Typography variant="body2" color="success.main">+26%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>New Patients</Typography>
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <Typography variant="h2" color="secondary">8</Typography>
                      <Typography variant="body2" color="text.secondary">This Month</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Last Month:</Typography>
                      <Typography variant="body2" fontWeight="bold">6</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Change:</Typography>
                      <Typography variant="body2" color="success.main">+33%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Prescriptions</Typography>
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <Typography variant="h2" color="info.main">42</Typography>
                      <Typography variant="body2" color="text.secondary">This Month</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Last Month:</Typography>
                      <Typography variant="body2" fontWeight="bold">38</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Change:</Typography>
                      <Typography variant="body2" color="success.main">+10%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Avg. Visit Duration</Typography>
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <Typography variant="h2" color="warning.main">22</Typography>
                      <Typography variant="body2" color="text.secondary">Minutes</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Last Month:</Typography>
                      <Typography variant="body2" fontWeight="bold">25 min</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Change:</Typography>
                      <Typography variant="body2" color="success.main">-12%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Appointment Trends */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Appointment Trends</Typography>
                      <FormControl size="small" sx={{ width: 150 }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select label="Time Range" defaultValue="week">
                          <MenuItem value="week">This Week</MenuItem>
                          <MenuItem value="month">This Month</MenuItem>
                          <MenuItem value="quarter">This Quarter</MenuItem>
                          <MenuItem value="year">This Year</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    
                    {/* Placeholder for chart */}
                    <Box 
                      sx={{ 
                        height: 300, 
                        bgcolor: 'action.hover', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: 1,
                        p: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" align="center">
                        Chart visualization for appointment trends would be displayed here.
                        <br />
                        Showing weekly/monthly appointment counts by type.
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">In-Person</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'secondary.main', borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">Video</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">Emergency</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Diagnoses */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Top Diagnoses</Typography>
                    
                    <List disablePadding>
                      {[
                        { name: 'Hypertension', count: 18, increase: true },
                        { name: 'Type 2 Diabetes', count: 14, increase: true },
                        { name: 'Respiratory Infection', count: 9, increase: false },
                        { name: 'Hyperlipidemia', count: 7, increase: false },
                        { name: 'Anxiety Disorder', count: 5, increase: true }
                      ].map((diagnosis, index) => (
                        <ListItem
                          key={diagnosis.name}
                          divider={index < 4}
                          sx={{ px: 0 }}
                        >
                          <ListItemText
                            primary={diagnosis.name}
                            primaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                              {diagnosis.count}
                            </Typography>
                            {diagnosis.increase ? (
                              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                                +{Math.floor(Math.random() * 30)}%
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                                -{Math.floor(Math.random() * 20)}%
                              </Typography>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Button variant="text" fullWidth sx={{ mt: 2 }}>
                      View Complete Report
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Patient Demographics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Patient Demographics</Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>Age Distribution</Typography>
                        {/* Placeholder for age distribution chart */}
                        <Box 
                          sx={{ 
                            height: 200, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" align="center">
                            Age distribution chart would be displayed here
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>Gender Distribution</Typography>
                        {/* Placeholder for gender distribution chart */}
                        <Box 
                          sx={{ 
                            height: 200, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" align="center">
                            Gender distribution chart would be displayed here
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Generated Reports */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Generated Reports</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {/* TODO: Implement generate new report */}}
                      >
                        Generate New
                      </Button>
                    </Box>
                    
                    <List>
                      {[
                        { name: 'Monthly Patient Summary', date: '2023-07-01', type: 'PDF' },
                        { name: 'Quarterly Prescription Analysis', date: '2023-04-01', type: 'XLSX' },
                        { name: 'Annual Practice Review', date: '2023-01-10', type: 'PDF' }
                      ].map((report) => (
                        <ListItem
                          key={report.name}
                          divider
                          secondaryAction={
                            <IconButton size="small">
                              <MoreVertIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={report.name}
                            secondary={`Generated on ${new Date(report.date).toLocaleDateString()}`}
                          />
                          <Chip 
                            label={report.type} 
                            color={report.type === 'PDF' ? 'error' : 'primary'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default DoctorDashboard; 
