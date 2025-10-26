import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Submissions from './pages/Submissions';
import CreateSubmission from './pages/CreateSubmission';
import SubmissionDetail from './pages/SubmissionDetail';
import Reviews from './pages/Reviews';
import CreateReview from './pages/CreateReview';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import TestSubmission from './pages/TestSubmission';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/submissions" element={
              <ProtectedRoute>
                <Layout>
                  <Submissions />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/submissions/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateSubmission />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/submissions/:id" element={
              <ProtectedRoute>
                <Layout>
                  <SubmissionDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reviews" element={
              <ProtectedRoute>
                <Layout>
                  <Reviews />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reviews/create/:submissionId" element={
              <ProtectedRoute>
                <Layout>
                  <CreateReview />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/test-submission" element={
              <ProtectedRoute>
                <Layout>
                  <TestSubmission />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
