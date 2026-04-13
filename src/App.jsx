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
import Users from './pages/Users';
import WaitingApproval from './pages/WaitingApproval';
import Distribution from './pages/Distribution';
import Mosaic from './pages/Mosaic';



import Colaborador from './pages/Colaborador';
import Reports from './pages/Reports';
import DashboardLayout from './layouts/DashboardLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, status, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  
  if (status === 'pending' || status === 'blocked') {
    return <WaitingApproval />;
  }
  
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

  if (role === 'gestor') {
    return (
      <DashboardLayout>
        <Distribution />
      </DashboardLayout>
    );
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
            
            {/* Rota de acesso público ao mosaico */}
            <Route path="/mapa" element={<Mosaic />} />

            {/* Authenticated Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'gestor', 'porteiro']}>
                <DashboardLayout>
                  <Admin />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Link para o Mosaico dentro do layout para usuários logados */}
             <Route path="/admin/mosaic" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Mosaic />
                </DashboardLayout>
              </ProtectedRoute>
            } />



            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <Users />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/distribution" element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <DashboardLayout>
                  <Distribution />
                </DashboardLayout>
              </ProtectedRoute>
            } />


            <Route path="/admin/departments" element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <DashboardLayout>
                  <Departments />
                </DashboardLayout>
              </ProtectedRoute>
            } />


            <Route path="/admin/subjects" element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <DashboardLayout>
                  <Subjects />
                </DashboardLayout>
              </ProtectedRoute>
            } />



            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <DashboardLayout>
                  <Reports />
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
