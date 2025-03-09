// Mock data for testing when MongoDB is not available
export const mockData = {
  users: [
    {
      _id: '1',
      name: 'John Doe',
      email: 'patient@example.com',
      password: '$2a$10$Xs7.gWh1JZpJ3xj7t5cW9OdHoXIQGO.aimMQtqAJD7OTnQ.QT0fPC', // hashed 'password123'
      role: 'patient',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      _id: '2',
      name: 'Dr. Jane Smith',
      email: 'doctor@example.com',
      password: '$2a$10$Xs7.gWh1JZpJ3xj7t5cW9OdHoXIQGO.aimMQtqAJD7OTnQ.QT0fPC', // hashed 'password123'
      role: 'doctor',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }
  ],
  patients: [
    {
      _id: '1',
      user: '1',
      medipassId: 'MP12345',
      bloodGroup: 'O+',
      allergies: ['Peanuts', 'Penicillin'],
      chronicConditions: ['Asthma'],
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
    }
  ],
  doctors: [
    {
      _id: '1',
      user: '2',
      specialization: 'Cardiology',
      hospital: 'General Hospital',
      licenseNumber: 'MD12345',
      officeHours: [
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 'Wednesday',
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 'Friday',
          startTime: '09:00',
          endTime: '13:00'
        }
      ]
    }
  ],
  appointments: [
    {
      _id: '1',
      patient: '1',
      doctor: '1',
      date: '2023-04-15',
      time: '10:30',
      status: 'upcoming',
      type: 'in-person',
      reasonForVisit: 'Annual checkup',
      location: 'General Hospital, Room 302'
    },
    {
      _id: '2',
      patient: '1',
      doctor: '1',
      date: '2023-03-01',
      time: '14:00',
      status: 'completed',
      type: 'in-person',
      diagnosis: 'Seasonal allergies',
      followUpRequired: true,
      followUpDate: '2023-06-01'
    }
  ],
  medicalRecords: [
    {
      _id: '1',
      patient: '1',
      type: 'prescription',
      title: 'Allergy Medication',
      date: '2023-03-01',
      doctorName: 'Dr. Jane Smith',
      hospitalName: 'General Hospital',
      fileUrl: '/files/prescription_1.pdf',
      fileType: 'pdf',
      description: 'Allergy medication prescription'
    },
    {
      _id: '2',
      patient: '1',
      type: 'labReport',
      title: 'Blood Test Results',
      date: '2023-03-05',
      doctorName: 'Dr. Jane Smith',
      hospitalName: 'General Hospital',
      fileUrl: '/files/lab_report_1.pdf',
      fileType: 'pdf',
      description: 'Comprehensive blood panel'
    }
  ]
}; 