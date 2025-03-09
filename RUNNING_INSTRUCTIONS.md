# Medipass Running Instructions

## How to Run the Application

### Frontend Only (Recommended for now)

In Windows PowerShell, run these commands:

```powershell
# Go to the project root
cd C:\Users\DELL\Desktop\Medipass

# Run the frontend only
npm run frontend-dev
```

Then open your browser and navigate to: http://localhost:3001

### Backend (Optional, requires MongoDB)

To run the backend (which currently has MongoDB connection issues):

```powershell
# In a new PowerShell window
cd C:\Users\DELL\Desktop\Medipass
cd backend
npm run dev
```

## Fixes Applied

1. **Fixed React Hooks Rules in PatientDashboard.tsx**
   - Moved `useMediaQuery` hooks outside of conditional rendering
   - Created constants for media query results to use throughout the component

2. **Fixed Package.json Scripts**
   - Added a `frontend-dev` script to run only the frontend application

3. **PowerShell Commands**
   - PowerShell doesn't support the `&&` operator for chaining commands
   - Each command must be run separately or in a script file

## Known Issues

1. **Backend Connectivity**
   - MongoDB connection is failing - you may need to install and start MongoDB locally
   - You can still use the frontend with mock data while the backend connection is being fixed

2. **ESLint Warnings**
   - There are still some ESLint warnings about unused variables in both dashboard components
   - These warnings don't affect functionality but should be addressed for code cleanliness

## Next Steps for Optimization

1. Clean up unused variables and imports in both dashboard components
2. Install and configure MongoDB for backend connectivity
3. Fix backend type errors
4. Create proper TypeScript types for all component props and API responses 