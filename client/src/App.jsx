import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'Patient' ? <Navigate to="/patient-dashboard" /> : <Navigate to="/worker-dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
          
          {/* Glassmorphism Parallax Background Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-400/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
          
          <Navbar />
          <main className="container mx-auto px-4 pt-40 pb-12 relative z-10">
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/patient-dashboard" 
                element={
                  <PrivateRoute role="Patient">
                    <PatientDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/worker-dashboard" 
                element={
                  <PrivateRoute role="Hospital Worker">
                    <WorkerDashboard />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
