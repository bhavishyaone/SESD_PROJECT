import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import LearningPlayer from './pages/LearningPlayer';

import MyEnrollments from './pages/MyEnrollments';
import MyCertificates from './pages/MyCertificates';
import CourseBuilder from './pages/CourseBuilder';
import ManageAssignments from './pages/ManageAssignments';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/course/:id/play" element={<LearningPlayer />} />
              
              <Route path="/enrollments" element={<MyEnrollments />} />
              <Route path="/certificates" element={<MyCertificates />} />
              
              <Route path="/courses/new" element={<CourseBuilder />} />
              <Route path="/manage-assignments" element={<ManageAssignments />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
