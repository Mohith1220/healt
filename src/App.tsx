import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/about/About';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import HealthTracker from './pages/health/HealthTracker';
import QuizPage from './pages/quiz/QuizPage';
import Features from './pages/features/Features';
import Contact from './pages/contact/Contact';
import LearningTopics from './pages/learning/LearningTopics';
import LearningContent from './pages/learning/LearningContent';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Dashboard router based on user role
const DashboardRouter = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role || 'student';
  
  switch (userRole) {
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    default:
      return <StudentDashboard />;
  }
};

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Learning routes */}
            <Route path="/learn" element={<LearningTopics />} />
            <Route path="/learn/:topicId" element={<LearningContent />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            <Route path="/health-tracker" element={
              <ProtectedRoute>
                <HealthTracker />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;