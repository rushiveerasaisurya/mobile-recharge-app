import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import NavbarComponent from './components/NavbarComponent';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/user/Dashboard';
import PlanSelection from './pages/user/PlanSelection';
import PaymentConfirmation from './pages/user/PaymentConfirmation';
import AdminDashboard from './pages/admin/Dashboard';
import UserRechargeHistory from './pages/user/RechargeHistory';
import AdminRechargeHistory from './pages/admin/RechargeHistory';
import PlanManagement from './pages/admin/PlanManagement';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
 

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <NavbarComponent />
      <main className="page-transition">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          
          {/* User Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plans/:category" 
            element={
              <ProtectedRoute>
                <PlanSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/:planId" 
            element={
              <ProtectedRoute>
                <PaymentConfirmation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/history" 
            element={
              <ProtectedRoute requiredRole="user">
                <UserRechargeHistory />
              </ProtectedRoute>
            } 
          />
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/history" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminRechargeHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/plans" 
            element={
              <ProtectedRoute requiredRole="admin">
                <PlanManagement />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;