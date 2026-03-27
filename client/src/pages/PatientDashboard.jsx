import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Save, HeartPulse, User, MessageSquare, ClipboardList, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '../components/ChatWindow';
import socket from '../services/socket';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState({
    age: '',
    bloodGroup: '',
    medicalHistory: '',
    allergies: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(true);
  const [alerting, setAlerting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hasDetails, setHasDetails] = useState(false);
  const [activeEmergencyId, setActiveEmergencyId] = useState(null);

  useEffect(() => {
    fetchDetails();
    fetchActiveAlert();
    socket.connect();
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (activeEmergencyId) {
      socket.emit('join_emergency', activeEmergencyId);
    }
    
    socket.on('alert_resolved', (alertId) => {
      if (activeEmergencyId === alertId) {
        setAlerting(false);
        setActiveEmergencyId(null);
      }
    });

    return () => {
      socket.off('alert_resolved');
    };
  }, [activeEmergencyId]);

  const fetchActiveAlert = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/emergency/my-active`);
      if (data) {
        setAlerting(true);
        setActiveEmergencyId(data._id);
      }
    } catch (err) {
      console.log('No active alert found');
    }
  };

  const fetchDetails = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/patient`);
      if (data && data.age) {
        setDetails(data);
        setHasDetails(true);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_URL}/api/patient`, details);
      setHasDetails(true);
      setSuccess('Health records updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update records');
    }
  };

  const handleEmergency = async () => {
    if (!hasDetails) {
      setError('Please fill in your health details first. An active profile is required to dispatch an emergency alert.');
      return;
    }

    setAlerting(true);
    setError('');
    
    // Get location
    let location = { lat: null, lng: null };
    try {
      const position = await Promise.race([
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      location = { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch (err) {
      console.log('Location access denied or timed out, proceeding with blank coordinates');
    }

    try {
      const { data } = await axios.post(`${API_URL}/api/emergency`, { location });
      setActiveEmergencyId(data._id);
      setSuccess('EMERGENCY ALERT SENT! Help is on the way.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send alert');
      setAlerting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-600 font-medium drop-shadow-sm">Loading your profile...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 mt-20 relative z-10 px-4">
      {error && <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-4 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/30 text-red-600 rounded-2xl shadow-[0_8px_32px_rgba(255,0,0,0.1)] font-bold flex items-center gap-3"><AlertTriangle size={20} className="animate-pulse shadow-sm" />{error}</motion.div>}
      {success && <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-4 p-4 bg-green-500/10 backdrop-blur-md border border-green-500/30 text-green-700 rounded-2xl shadow-[0_8px_32px_rgba(34,197,94,0.1)] font-bold flex items-center gap-3"><HeartPulse size={20} className="animate-pulse shadow-sm" />{success}</motion.div>}

      {!activeEmergencyId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4 animate-pulse" />
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-red-600 to-red-400" />
          
          <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
            <div className="w-14 h-14 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20 shadow-inner backdrop-blur-sm">
               <AlertTriangle size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight drop-shadow-sm">Need Immediate Assistance?</h2>
              <p className="text-gray-600 font-medium mt-1 drop-shadow-sm">Dispatch an emergency signal to hospital staff immediately.</p>
            </div>
          </div>
          <button
            onClick={handleEmergency}
            className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 relative z-10 border border-white/20"
          >
            <Activity size={22} className="animate-pulse" />
            DISPATCH HELP NOW
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Status */}
        <div className="md:col-span-4 space-y-8">
          
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
            className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 p-8 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="w-28 h-28 bg-gradient-to-tr from-gray-200 to-white rounded-full flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(0,0,0,0.1)] border-[4px] border-white/40 ring-1 ring-white/20 placeholder:select-none relative z-10">
              <span className="text-5xl font-black text-gray-600 uppercase tracking-tighter drop-shadow-sm">{user.name.charAt(0)}</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight relative z-10 drop-shadow-sm">{user.name}</h3>
            <p className="text-sm text-gray-600 mt-1 font-bold relative z-10 drop-shadow-sm">{user.email}</p>
            <div className="mt-5 px-4 py-1.5 bg-white/30 backdrop-blur-md text-gray-800 text-[10px] font-black rounded-full uppercase tracking-widest border border-white/40 shadow-inner relative z-10">
              {user.role}
            </div>
          </motion.div>
          
          {/* Status & Info Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} 
            className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
            <h4 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 tracking-tight drop-shadow-sm relative z-10">
              <div className="p-2 bg-red-500/10 backdrop-blur-sm rounded-xl text-red-500 border border-red-500/20 shadow-inner">
                <HeartPulse size={20} />
              </div>
              Status & Info
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-inner">
                <span className="text-sm text-gray-700 font-bold tracking-wide drop-shadow-sm">Blood Group</span>
                <span className="px-3 py-1 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-600 rounded-xl font-black text-lg shadow-sm">{details.bloodGroup || '—'}</span>
              </div>
              <div className="flex justify-between items-center bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-inner">
                <span className="text-sm text-gray-700 font-bold tracking-wide drop-shadow-sm">Age</span>
                <span className="font-black text-gray-900 text-xl tracking-tight drop-shadow-sm">{details.age || '—'} <span className="text-xs text-gray-600 font-black uppercase tracking-widest bg-white/30 px-1.5 py-0.5 rounded-md ml-1 border border-white/20 shadow-sm">Yrs</span></span>
              </div>
              <div className="flex flex-col bg-white/20 backdrop-blur-md p-4 rounded-2xl gap-1 border border-white/30 shadow-inner">
                <span className="text-sm text-gray-700 font-bold tracking-wide drop-shadow-sm">Emergency Contact</span>
                <span className="font-black text-blue-700 text-lg tracking-tight drop-shadow-sm">{details.emergencyContact || '—'}</span>
              </div>
            </div>
            {hasDetails && (
              <button 
                onClick={() => setHasDetails(false)}
                className="w-full mt-6 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-white/30 active:scale-95 transition-all py-3 flex items-center justify-center rounded-2xl border border-transparent hover:border-white/40 shadow-sm relative z-10"
              >
                Edit Medical Records
              </button>
            )}
          </motion.div>

        </div>

        {/* Right Column: Medical Repository */}
        <div className="md:col-span-8">
          {!hasDetails ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
              className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/20 relative z-10">
                <div className="w-14 h-14 bg-red-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-red-500 shadow-inner border border-red-500/20">
                  <ClipboardList size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight drop-shadow-sm">Medical Repository</h3>
                  <p className="text-sm text-gray-600 mt-1 font-bold drop-shadow-sm">Update your central health records to save time in emergencies</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-8 relative z-10">
                {/* Personal Info */}
                <div className="space-y-5">
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 drop-shadow-sm">
                    <User size={16} className="text-gray-500" />
                    Personal Info
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 ml-1 drop-shadow-sm">Patient Age</label>
                      <input type="number" className="w-full px-5 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-bold placeholder-gray-500 outline-none shadow-inner" value={details.age} onChange={(e) => setDetails({...details, age: e.target.value})} required placeholder="e.g. 25" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 ml-1 drop-shadow-sm">Blood Group</label>
                      <select className="w-full px-5 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-bold outline-none appearance-none shadow-inner" value={details.bloodGroup} onChange={(e) => setDetails({...details, bloodGroup: e.target.value})} required>
                        <option value="" disabled className="text-gray-500">Select Type</option>
                        <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 ml-1 drop-shadow-sm">Primary Emergency Contact</label>
                    <input type="tel" className="w-full px-5 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-bold placeholder-gray-500 outline-none shadow-inner" value={details.emergencyContact} onChange={(e) => setDetails({...details, emergencyContact: e.target.value})} required placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                {/* Medical History */}
                <div className="pt-6 border-t border-white/20 space-y-5">
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 drop-shadow-sm">
                    <Activity size={16} className="text-gray-500" />
                    Condition History
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 ml-1 drop-shadow-sm">Pre-existing Medical Conditions</label>
                    <textarea className="w-full px-5 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-bold placeholder-gray-500 outline-none min-h-[120px] resize-none leading-relaxed shadow-inner" value={details.medicalHistory} onChange={(e) => setDetails({...details, medicalHistory: e.target.value})} placeholder="Describe existing medical conditions..."></textarea>
                  </div>
                </div>

                {/* Allergies */}
                <div className="pt-6 border-t border-white/20 space-y-5">
                   <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 drop-shadow-sm">
                    <AlertTriangle size={16} className="text-gray-500" />
                    Allergies
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 ml-1 drop-shadow-sm">Substance Allergy Index</label>
                    <textarea className="w-full px-5 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all text-gray-900 font-bold placeholder-gray-500 outline-none min-h-[100px] resize-none leading-relaxed shadow-inner" value={details.allergies} onChange={(e) => setDetails({...details, allergies: e.target.value})} placeholder="Specify known substance allergies..."></textarea>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] active:scale-95 transition-all border border-gray-700">
                    SAVE REPOSITORY
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
              className="bg-green-500/10 backdrop-blur-2xl border border-green-500/30 rounded-[2.5rem] p-12 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(34,197,94,0.1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
              <div className="w-24 h-24 bg-gradient-to-tr from-green-600 to-green-400 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-green-300/40 relative z-10">
                <HeartPulse size={48} className="animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-green-900 mb-3 tracking-tight drop-shadow-sm relative z-10">Biometric Shield Active</h3>
              <p className="text-green-800/80 max-w-md text-lg font-bold leading-relaxed drop-shadow-sm relative z-10">
                Your medical data is encrypted and synced. Real-time assistance is authorized with your current data profile.
              </p>
              <div className="mt-10 relative z-10">
                <button onClick={() => setHasDetails(false)} className="px-10 py-4 bg-white/40 backdrop-blur-md hover:bg-white/50 text-green-900 rounded-2xl font-black shadow-lg shadow-green-900/10 transition-all active:scale-95 border border-white/50">
                  RECONFIGURE DATA
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-6 pointer-events-none">
        {/* Emergency Dispatch Button */}
        <div className="pointer-events-auto">
          <button
            onClick={handleEmergency}
            className="w-16 h-16 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center border-4 border-white/40 backdrop-blur-md hover:scale-110 active:scale-95 transition-all relative overflow-hidden group bg-gradient-to-tr from-red-600 to-red-400 animate-[pulse_2s_ease-in-out_infinite]"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <AlertTriangle size={28} className="text-white drop-shadow-md" />
          </button>
        </div>

        {/* Live Chat Window */}
        <AnimatePresence>
          {activeEmergencyId && (
            <motion.div 
              key="chat-window"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="pointer-events-auto"
            >
               <ChatWindow 
                emergencyId={activeEmergencyId} 
                recipientName="Hospital Response Team" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientDashboard;
