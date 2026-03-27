import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      navigate(data.role === 'Patient' ? '/patient-dashboard' : '/worker-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 relative w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-red-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.4)] ring-1 ring-white/20">
            <Activity className="text-white" size={32} />
          </div>
          <div>
             <h2 className="text-3xl font-black text-gray-900 tracking-tight drop-shadow-sm">Welcome Back</h2>
             <p className="text-gray-600 mt-2 font-medium">Log in to your secure account</p>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="relative z-10 mb-6 bg-red-500/10 backdrop-blur-md text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-500/20 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-semibold placeholder-gray-500 outline-none shadow-inner"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1 pr-1">
              <label className="block text-sm font-bold text-gray-700">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-semibold placeholder-gray-500 outline-none shadow-inner"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_25px_rgba(255,0,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 border border-white/10"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AUTHENTICATING
              </span>
            ) : (
              <>
                CONTINUE
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 font-medium relative z-10 drop-shadow-sm">
          New to HealthAlert?{' '}
          <Link to="/signup" className="text-red-500 hover:text-red-600 font-bold hover:underline transition-all drop-shadow-sm">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
