import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  AlertCircle, ShieldAlert, CheckCircle, Clock, MapPin, 
  MessageSquare, User, HeartPulse, Activity, Bell 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '../components/ChatWindow';
import socket from '../services/socket';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  
  // Floating Action Button states
  const [alerting, setAlerting] = useState(false);
  const [isGenericChatOpen, setIsGenericChatOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
    socket.connect();
    
    const joinWorkerRoom = () => {
      socket.emit('join_room', 'worker');
    };
    
    socket.on('connect', joinWorkerRoom);
    if (socket.connected) {
      joinWorkerRoom();
    }
    
    socket.on('new_emergency', handleNewAlert);
    socket.on('alert_resolved', handleAlertResolved);
    
    // Play alert sound logic could be initialized here

    return () => {
      socket.off('new_emergency');
      socket.off('alert_resolved');
      socket.disconnect();
    };
  }, []);

  const handleNewAlert = (alert) => {
    setAlerts(prev => [alert, ...prev]);
    // Optionally trigger a notification sound
    try {
      const audio = new Audio('/alert.mp3'); 
      audio.play().catch(e => console.log('Audio play failed silently', e));
    } catch(err) {}
  };

  const handleAlertResolved = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert._id !== alertId));
    if (activeChat?.id === alertId) {
      setActiveChat(null);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/emergency/active');
      setAlerts(data);
      setLoading(false);
    } catch(err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/emergency/${id}/resolve`);
      // Since we emit 'alert_resolved' from backend, it will be handled by the socket listener
      handleAlertResolved(id);
    } catch(err) {
      console.error('Failed to resolve alert');
    }
  };

  const handleEmergencyWorker = async () => {
    setAlerting(true);
    let location = { lat: null, lng: null };
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      location = { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch (err) {}
    
    try {
      await axios.post('http://localhost:5000/api/emergency', { location });
      // Reset pulsing state after brief duration
      setTimeout(() => setAlerting(false), 2000);
    } catch (err) {
      setAlerting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-600 font-medium tracking-wide drop-shadow-sm">Initializing Emergency Response Grid...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32 mt-20 relative z-10 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4 drop-shadow-sm">
            <div className="p-3 bg-red-600 rounded-2xl shadow-[0_0_20px_rgba(255,0,0,0.4)] text-white relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-50" />
              <ShieldAlert size={32} />
            </div>
            Active Response
          </h1>
          <p className="text-gray-600 mt-2 font-bold drop-shadow-sm">Monitoring real-time health emergencies across the network.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ scale: alerts.length > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg border border-white/20 backdrop-blur-md ${alerts.length > 0 ? 'bg-red-500/80 text-white shadow-[0_0_20px_rgba(255,0,0,0.5)]' : 'bg-white/30 text-gray-800 shadow-sm'}`}
          >
            {alerts.length > 0 ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            ) : null}
            <Bell size={18} className={alerts.length > 0 ? 'text-white' : 'text-gray-600'} />
            <span className="font-black tracking-widest text-sm uppercase drop-shadow-sm">{alerts.length} ALERTS</span>
          </motion.div>
        </div>
      </div>

      {/* Main Alert Feed */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-8">
          {alerts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 p-16 text-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-500/20 relative z-10 backdrop-blur-sm border border-green-500/30">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight drop-shadow-sm relative z-10">System Nominal</h3>
              <p className="text-gray-600 font-bold drop-shadow-sm relative z-10">All local sectors highlight zero active emergencies.</p>
            </div>
          ) : (
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={alert._id}
                  className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-6 sm:p-8 border border-white/20 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Subtle Red Glow for Urgency */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4 animate-pulse" />
                  
                  {/* Active Indicator Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />

                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                  {/* Patient Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-tr from-gray-200 to-white border border-white/40 shadow-inner rounded-full flex items-center justify-center text-gray-700 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                        <span className="text-2xl font-black uppercase drop-shadow-sm">{alert.patient.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-black text-2xl text-gray-900 tracking-tight flex items-center gap-3 drop-shadow-sm">
                          {alert.patient.name}
                          <span className="px-3 py-1 bg-red-500/20 backdrop-blur-md text-red-700 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm border border-red-500/30">
                            Priority 1
                          </span>
                        </h3>
                        <p className="text-sm text-gray-600 font-bold flex items-center gap-1.5 mt-1.5 drop-shadow-sm">
                          <Clock size={14} className="text-gray-500" />
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                      <p className="text-xs text-gray-600 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                         Blood Group
                      </p>
                      <p className="text-4xl font-black text-red-600 tracking-tight drop-shadow-[0_2px_4px_rgba(255,0,0,0.3)]">{alert.patientDetails?.bloodGroup || '?'}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                      <p className="text-xs text-gray-600 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                        Patient Age
                      </p>
                      <p className="text-4xl font-black text-gray-900 tracking-tight drop-shadow-sm">{alert.patientDetails?.age || '?'} <span className="text-base text-gray-600 font-bold uppercase tracking-widest -ml-1">Yrs</span></p>
                    </div>
                  </div>

                  {/* Medical Context */}
                  <div className="mb-8 relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-red-700 bg-red-500/10 backdrop-blur-md w-fit px-3 py-1.5 rounded-xl border border-red-500/20 shadow-sm">
                      <Activity size={16} />
                      <span className="text-xs font-black uppercase tracking-widest drop-shadow-sm">Medical Context</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/30 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm transition-shadow hover:shadow-md">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2 drop-shadow-sm">Condition History</p>
                        <p className="text-sm font-bold text-gray-900 leading-relaxed drop-shadow-sm">{alert.patientDetails?.medicalHistory || 'No records provided in database.'}</p>
                      </div>
                      <div className="bg-red-500/10 backdrop-blur-md p-5 rounded-2xl border border-red-500/20 shadow-sm transition-shadow hover:shadow-md">
                        <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mb-2 flex items-center gap-1 drop-shadow-sm">
                          Active Allergies
                        </p>
                        <p className="text-sm font-bold text-red-900 leading-relaxed drop-shadow-sm">{alert.patientDetails?.allergies || 'None reported by patient.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location Section */}
                  {alert.location && (alert.location.lat && alert.location.lng) && (
                    <div className="mb-8 bg-white/20 backdrop-blur-md p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/30 shadow-inner relative z-10">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center text-gray-700 shadow-sm shrink-0">
                          <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest drop-shadow-sm">Location Coordinates</p>
                          <p className="text-sm font-mono font-black text-gray-900 tracking-tight drop-shadow-sm">{alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}</p>
                        </div>
                      </div>
                      <a 
                        href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-2 shrink-0"
                      >
                        <MapPin size={14} /> Open Maps
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/20 relative z-10">
                    <button 
                      onClick={() => setActiveChat({ id: alert._id, name: alert.patient.name })}
                      className="flex-1 py-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-gray-900 rounded-2xl font-black text-sm shadow-sm hover:shadow-md hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/30 drop-shadow-sm"
                    >
                      <MessageSquare size={18} />
                      START CHAT
                    </button>
                    <button 
                      onClick={() => handleResolve(alert._id)}
                      className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-2xl font-black text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/10"
                    >
                      <CheckCircle size={18} />
                      RESOLVE
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden md:block md:col-span-4">
           {/* Future metrics or network status can go here */}
           <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 sticky top-32 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 shadow-inner rounded-xl flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 leading-tight drop-shadow-sm">Worker ID</h4>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest drop-shadow-sm">{user.workerId || 'EMP-XXXXX'}</p>
                </div>
             </div>
             <p className="text-sm font-bold text-gray-600 leading-relaxed drop-shadow-sm relative z-10">
               You are currently active and receiving network alerts. Maintain connection to ensure rapid deployment capabilities.
             </p>
           </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-6 pointer-events-none">
        
        {/* Generic Chat Button if no active chat */}
        {!activeChat && (
          <div className="pointer-events-auto mt-auto">
            <button
              onClick={() => setIsGenericChatOpen(!isGenericChatOpen)}
              className="w-16 h-16 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] active:scale-95 transition-all border border-gray-600"
            >
              <MessageSquare size={26} />
            </button>
          </div>
        )}

        <AnimatePresence>
          {/* Active Alert Chat Window */}
          {activeChat && (
            <motion.div 
              key="alert-chat"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="pointer-events-auto"
            >
               <ChatWindow 
                emergencyId={activeChat.id} 
                recipientName={activeChat.name} 
                onClose={() => setActiveChat(null)} 
              />
            </motion.div>
          )}

          {/* Placeholder Chat Window when no active alert is selected */}
          {isGenericChatOpen && !activeChat && (
            <motion.div 
              key="generic-chat"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="pointer-events-auto mb-20"
            >
               <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/20 w-[380px] h-[550px] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
                 <div className="w-20 h-20 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-blue-500/10 relative z-10">
                    <MessageSquare size={36} />
                 </div>
                 <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight drop-shadow-sm relative z-10">Comms Offline</h3>
                 <p className="text-gray-600 font-bold text-center text-sm leading-relaxed max-w-[250px] drop-shadow-sm relative z-10">
                    To start a localized secure communication session, please select <strong className="text-gray-900 border-b border-gray-500">START CHAT</strong> directly from an active patient alert card on your grid.
                 </p>
                 <button 
                  onClick={() => setIsGenericChatOpen(false)} 
                  className="mt-8 px-8 py-3 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm text-gray-900 rounded-xl font-black hover:bg-white/40 hover:shadow-md transition-all active:scale-95 uppercase tracking-widest text-xs relative z-10"
                 >
                   Acknowledge
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkerDashboard;
