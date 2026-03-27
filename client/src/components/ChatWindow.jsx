import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import { Send, X, ShieldAlert, HeartPulse, MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = ({ emergencyId, recipientName, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    socket.emit('join_emergency', emergencyId);

    const handleNewMessage = (message) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('receive_message', handleNewMessage);
    };
  }, [emergencyId]);

  useEffect(scrollToBottom, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/messages/${emergencyId}`);
      setMessages(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await axios.post(`${API_URL}/api/messages`, {
        emergencyId,
        content: newMessage
      });
      socket.emit('send_message', { ...data, emergencyId });
      setMessages((prev) => {
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        onClick={() => setIsMinimized(false)}
        className="w-16 h-16 bg-white/20 backdrop-blur-xl text-gray-900 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform border border-white/30"
      >
        <MessageCircle size={28} />
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="w-[360px] h-[500px] sm:w-[400px] sm:h-[580px] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-3xl flex flex-col p-0 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Chat Header */}
      <div className="px-5 py-4 bg-white/20 backdrop-blur-md border-b border-white/30 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-10 h-10 bg-gradient-to-tr from-gray-200 to-white border border-white/40 shadow-inner rounded-full flex items-center justify-center text-gray-700">
               <span className="text-xl font-black uppercase drop-shadow-sm">{recipientName?.charAt(0) || '?'}</span>
             </div>
             <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white/40 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 drop-shadow-sm">{recipientName || 'Unknown Patient'}</h3>
            <p className="text-[10px] text-green-700 font-bold tracking-widest uppercase items-center flex gap-1 bg-green-500/10 px-1.5 py-0.5 rounded backdrop-blur-sm border border-green-500/20 w-max mt-0.5">
              <HeartPulse size={10} className="animate-pulse" /> Secure Channel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMessages([])} 
            title="Clear Chat"
            className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-white/30 transition-all border border-transparent hover:border-white/40 shadow-sm hover:shadow"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsMinimized(true)} 
            title="Minimize"
            className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-white/30 transition-all border border-transparent hover:border-white/40 shadow-sm hover:shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          {onClose && (
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-white/30 transition-all border border-transparent hover:border-white/40 shadow-sm hover:shadow"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 border border-white/30 shadow-inner">
               <ShieldAlert size={32} className="text-gray-700" />
            </div>
            <p className="text-sm font-bold text-gray-800">End-to-End Encrypted</p>
            <p className="text-xs font-semibold text-gray-600 mt-2 max-w-[200px]">Send a message to securely coordinate with {recipientName}.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender._id === user._id || msg.sender === user._id || msg.sender?.name === user.name;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg._id || idx} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {!isMe && (
                     <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-gray-800 border border-white/40 mb-1 shadow-inner shrink-0 drop-shadow-sm">
                       {msg.sender?.name ? msg.sender.name.charAt(0) : recipientName.charAt(0)}
                     </div>
                  )}
                  <div 
                    className={`px-4 py-2.5 rounded-[1.2rem] shadow-[0_4px_15px_rgba(0,0,0,0.05)] font-medium border border-white/20 backdrop-blur-md ${
                      isMe 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm' 
                        : 'bg-white/40 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className={`text-sm ${isMe ? 'drop-shadow-sm' : ''}`}>{msg.content}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-600 mt-1 mx-8 tracking-wide drop-shadow-sm">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white/20 backdrop-blur-md border-t border-white/30 relative z-10 w-full">
        <div className="flex gap-2 relative z-10">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-gray-900 font-semibold placeholder-gray-600 shadow-inner overflow-hidden pr-12 transition-all"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] active:scale-95 absolute right-0.5 top-0.5 border border-white/20"
          >
            <Send size={16} className="-ml-0.5 translate-y-[1px]" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatWindow;
