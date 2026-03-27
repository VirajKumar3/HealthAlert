import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Activity, User as UserIcon, Mail, Lock, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Patient',
    workerId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Quick validation
    if (formData.role === 'Hospital Worker' && !formData.workerId) {
      setError('Professional ID is required for Hospital Staff.');
      return;
    }

    setLoading(true);
    try {
      const data = await signup(formData);
      navigate(data.role === 'Patient' ? '/patient-dashboard' : '/worker-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative w-full py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[2.5rem]" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/20 ring-1 ring-white/20">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <div>
             <h2 className="text-3xl font-black text-gray-900 tracking-tight drop-shadow-sm">Create Account</h2>
             <p className="text-gray-600 mt-2 font-medium">Join the HealthAlert secure network</p>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="relative z-10 mb-8 bg-red-500/10 backdrop-blur-md text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-500/20 flex items-center gap-2 overflow-hidden"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)] shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Role Toggle Tabs */}
          <div className="flex bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-2xl mb-8 relative shadow-inner">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'Patient', workerId: '' })}
              className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all z-10 flex items-center justify-center gap-2 ${
                formData.role === 'Patient'
                  ? 'bg-white/40 text-gray-900 shadow-sm border border-white/30'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserIcon size={16} />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'Hospital Worker' })}
              className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all z-10 flex items-center justify-center gap-2 ${
                formData.role === 'Hospital Worker'
                  ? 'bg-white/40 text-gray-900 shadow-sm border border-white/30'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Activity size={16} />
              Hospital Staff
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-semibold placeholder-gray-500 outline-none shadow-inner"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
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

            <AnimatePresence>
              {formData.role === 'Hospital Worker' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-1.5"
                >
                  <label className="block text-sm font-bold text-red-600 ml-1 flex items-center justify-between">
                    Professional ID
                    <span className="text-[10px] bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-600 px-2 py-0.5 rounded uppercase tracking-wider">Required</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-500">
                      <Briefcase size={18} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3.5 bg-red-500/5 backdrop-blur-md border border-red-500/30 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all text-gray-900 font-semibold placeholder-red-400/60 outline-none shadow-inner"
                      value={formData.workerId}
                      onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                      required={formData.role === 'Hospital Worker'}
                      placeholder="EMP-XXXXX"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-bold text-lg shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 border border-white/10"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                INITIALIZING
              </span>
            ) : (
              <>
                AUTHORIZE & ENTER
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 font-medium relative z-10 drop-shadow-sm">
          Already registered?{' '}
          <Link to="/login" className="text-red-500 hover:text-red-600 font-bold hover:underline transition-all drop-shadow-sm">
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
