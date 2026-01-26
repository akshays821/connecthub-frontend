import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Components/Sidebar';

function FollowRequests() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/follow/requests`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (requestId, senderId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/follow/accept/${senderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId, senderId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/follow/reject/${senderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 pl-32 py-10 px-8 max-w-4xl mx-auto">
        <header className="mb-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
          >
            Follow Requests
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-2 font-medium"
          >
            Manage who can see your private content
          </motion.p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-[32px] p-16 text-center border border-white/5"
          >
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No pending requests</h3>
            <p className="text-slate-500">When people request to follow you, they'll show up here.</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            <AnimatePresence>
              {requests.map(request => (
                <motion.div
                  key={request._id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <div
                    className="flex items-center gap-5 cursor-pointer flex-1"
                    onClick={() => navigate(`/profile/${request.senderId.username}`)}
                  >
                    <img
                      src={request.senderId.profilePicture}
                      alt={request.senderId.username}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-transparent group-hover:ring-violet-500 transition-all duration-300 shadow-lg"
                    />
                    <div>
                      <h3 className="font-bold text-white text-xl group-hover:text-violet-400 transition-colors">
                        {request.senderId.fullName || request.senderId.username}
                      </h3>
                      <p className="text-slate-500 font-medium">@{request.senderId.username}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAccept(request._id, request.senderId._id)}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-violet-500/20"
                    >
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(request._id, request.senderId._id)}
                      className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold border border-white/5 transition-colors"
                    >
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default FollowRequests;