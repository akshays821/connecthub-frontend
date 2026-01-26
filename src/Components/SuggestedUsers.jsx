import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function SuggestedUsers() {
  const { token, user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState({}); // Track each user's follow state

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/suggested`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    // Optimistically update UI
    setFollowingStates(prev => ({ ...prev, [userId]: 'loading' }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/follow/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'pending') {
        // Follow request sent (private account)
        setFollowingStates(prev => ({ ...prev, [userId]: 'requested' }));
      } else {
        // Following (public account)
        setFollowingStates(prev => ({ ...prev, [userId]: 'following' }));
      }
    } catch (error) {
      console.error('Error following user:', error);
      setFollowingStates(prev => ({ ...prev, [userId]: 'error' }));
    }
  };

  const getButtonText = (userId) => {
    const state = followingStates[userId];
    if (state === 'loading') return 'Loading...';
    if (state === 'following') return 'Following';
    if (state === 'requested') return 'Requested';
    return 'Follow';
  };

  const getButtonStyle = (userId) => {
    const state = followingStates[userId];
    if (state === 'following' || state === 'requested') {
      return 'bg-dark-700 text-slate-400 cursor-default border border-white/5';
    }
    if (state === 'loading') {
      return 'bg-violet-600/50 text-white cursor-wait opacity-70 border border-transparent';
    }
    return 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 border-transparent';
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-[32px] p-6 backdrop-blur-md border border-white/5 shadow-2xl">
        <h2 className="text-xl font-black text-slate-100 mb-6">Suggested for you</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                <div className="h-3 bg-white/5 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[32px] p-6 backdrop-blur-md border border-white/5 shadow-2xl sticky top-28">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Suggested for you
        </h2>
      </div>

      {users.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No suggestions available</p>
      ) : (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {users.map(user => (
            <motion.div
              key={user._id}
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 }
              }}
              className="flex items-center justify-between group"
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                <div className="relative">
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt={user.username}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-violet-500 transition-all duration-300"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#030712]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-200 truncate group-hover:text-violet-400 transition-colors">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFollow(user._id)}
                disabled={followingStates[user._id] === 'loading' || followingStates[user._id] === 'following' || followingStates[user._id] === 'requested'}
                className={`${getButtonStyle(user._id)} px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide`}
              >
                {getButtonText(user._id)}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-600 mb-3 justify-center">
          <a href="#" className="hover:text-slate-400 transition-colors">About</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400 transition-colors">Help</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
        </div>
        <p className="text-[11px] text-slate-700 text-center uppercase tracking-widest">© 2025 ConnectHub</p>
      </div>
    </div>
  );
}

export default SuggestedUsers;