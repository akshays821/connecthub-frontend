import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function FollowModal({ userId, type, onClose }) {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const endpoint = type === 'followers'
        ? `${import.meta.env.VITE_API_BASE_URL}/api/follow/followers/${userId}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/follow/following/${userId}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleUserClick = (username) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="glass-panel rounded-[32px] max-w-md w-full shadow-2xl border border-white/10 relative overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2.5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">
                {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              <AnimatePresence>
                {users.map(user => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    onClick={() => handleUserClick(user.username)}
                    className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-white/5 group"
                  >
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-200 truncate group-hover:text-violet-400 transition-colors">
                        {user.fullName || user.username}
                      </h3>
                      <p className="text-xs text-slate-500 truncate font-medium">@{user.username}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-violet-500 group-hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default FollowModal;