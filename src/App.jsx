import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Departments from './pages/Departments';
import Subjects from './pages/Subjects';
import PorteiroDashboard from './pages/PorteiroDashboard';

import Colaborador from './pages/Colaborador';
import DashboardLayout from './layouts/DashboardLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {

  const { role } = useAuth();
  
  if (role === 'porteiro') {
    return <PorteiroDashboard />;
  }
  
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 font-sans">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/consulta" element={<Colaborador />} />

            {/* Authenticated Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <Admin />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/departments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <Departments />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/subjects" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <Subjects />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}


export default App;
