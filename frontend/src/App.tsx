import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { AIAssistantProvider } from './contexts/AIAssistantContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import ProjectCreationPage from './pages/ProjectCreationPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmRegistrationPage from './pages/ConfirmRegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BuilderDashboardPageNew from './pages/BuilderDashboardPageNew';
import BuilderProjectViewPage from './pages/BuilderProjectViewPage';
import ProfilePage from './pages/ProfilePage';
import SoWReviewPage from './pages/SoWReviewPage';
import QuoteSubmissionPage from './pages/QuoteSubmissionPage';
import QuoteDetailsPage from './pages/QuoteDetailsPage';
import BuilderProfilePage from './pages/BuilderProfilePage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SmartDashboard from './components/SmartDashboard';
import AIAssistantChat from './components/AIAssistant/AIAssistantChat';

// Initialize Amplify configuration
import './config/amplify';

function App() {
  return (
    <AuthProvider>
      <AIAssistantProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Skip to main content link for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <Routes>
            {/* Redirect root to app */}
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="/projects/types" element={<Navigate to="/app" replace />} />
            
            {/* Authentication routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirm-registration" element={<ConfirmRegistrationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Application routes (with layout) */}
            <Route path="/app" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route 
                path="projects/create" 
                element={
                  <ProtectedRoute requiredRole="homeowner">
                    <ProjectCreationPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="projects" 
                element={
                  <ProtectedRoute requiredRole="homeowner">
                    <ProjectDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="projects/:projectId" 
                element={
                  <ProtectedRoute requiredRole="homeowner">
                    <ProjectDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute requiredRole="homeowner">
                    <SmartDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Builder Routes - New Invitation System */}
              <Route 
                path="builder/dashboard" 
                element={
                  <ProtectedRoute requiredRole="builder">
                    <BuilderDashboardPageNew />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="builder/projects/:projectId" 
                element={
                  <ProtectedRoute requiredRole="builder">
                    <BuilderProjectViewPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="builder/projects/:projectId/quote" 
                element={
                  <ProtectedRoute requiredRole="builder">
                    <BuilderProjectViewPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Legacy Builder Routes */}
              <Route 
                path="builder/sow/:sowId" 
                element={
                  <ProtectedRoute>
                    <SoWReviewPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="builder/quote/:sowId" 
                element={
                  <ProtectedRoute>
                    <QuoteSubmissionPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="builder/quotes/:quoteId" 
                element={
                  <ProtectedRoute>
                    <QuoteDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="builder/quotes/:quoteId/edit" 
                element={
                  <ProtectedRoute>
                    <QuoteSubmissionPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="builder/profile" 
                element={
                  <ProtectedRoute requiredRole="builder">
                    <BuilderProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect unknown app routes to app home */}
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>
            
            {/* Legacy routes - redirect to new structure */}
            <Route path="/onboarding" element={<Navigate to="/app/onboarding" replace />} />
            <Route path="/projects/*" element={<Navigate to="/app/projects/create" replace />} />
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/builder/*" element={<Navigate to="/app/builder/dashboard" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            
            {/* Catch all - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* AI Assistant Chat - Available on all pages */}
          <AIAssistantChat />
        </Box>
      </AIAssistantProvider>
    </AuthProvider>
  );
}

export default App;
