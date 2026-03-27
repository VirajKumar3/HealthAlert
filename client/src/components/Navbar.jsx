import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[9999] pointer-events-auto transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className={`mx-auto w-[95%] max-w-6xl transition-all duration-300 ${scrolled ? 'rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] px-8 py-4' : 'bg-transparent px-4 py-2'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-red-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.3)] group-hover:scale-105 transition-transform duration-300">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 drop-shadow-sm">
              Health<span className="text-red-500">Alert</span>
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              {/* User Info Glass Container */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 transition duration-200 shadow-sm">
                
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-white flex items-center justify-center shadow-inner border border-white/40 shrink-0">
                  <span className="text-sm font-black text-gray-700 uppercase drop-shadow-sm">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </span>
                </div>

                {/* Username & Role */}
                <div className="flex items-center gap-3 pr-1 md:pr-2">
                  <span className="text-sm font-semibold text-gray-800 tracking-wide drop-shadow-sm whitespace-nowrap">
                    {user.name}
                  </span>
                  <span className="hidden md:block text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100/90 text-blue-700 font-bold shadow-inner border border-blue-200/50">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                  window.location.href = '/login';
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:scale-105 text-gray-900 rounded-full font-bold transition-all shadow-sm active:scale-95 z-[999999] shrink-0"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline uppercase text-xs tracking-wider">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors drop-shadow-sm">
                Login
              </Link>
              <Link to="/signup" className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-bold text-sm hover:scale-105 hover:shadow-lg transition-all border border-gray-700 shadow-md">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
