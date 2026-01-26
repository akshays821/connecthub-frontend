import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Components/Sidebar';
import { resetNotificationCount } from '../Redux/Slices/notificationSlice';

function Notifications() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      dispatch(resetNotificationCount());
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notification._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }

    if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/post/${notification.postId._id}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.senderId.username}`);
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'follow_request':
        return 'requested to follow you';
      default:
        return '';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notifTime.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 pl-32 py-10 px-8 max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
          >
            Notifications
          </motion.h1>
          {notifications.some(n => !n.isRead) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleMarkAllRead}
              className="text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors hover:underline"
            >
              Mark all as read
            </motion.button>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 text-center rounded-[32px] border border-white/5"
          >
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-xl font-bold mb-2">No notifications yet</p>
            <p className="text-slate-500 text-sm">When someone interacts with your posts, you'll see it here.</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                onClick={() => handleNotificationClick(notification)}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                whileTap={{ scale: 0.99 }}
                className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-colors border ${!notification.isRead
                  ? 'bg-gradient-to-r from-violet-500/10 to-transparent border-l-4 border-l-violet-500 border-y-white/5 border-r-white/5'
                  : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
              >
                {!notification.isRead && (
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-violet-500 m-3 animate-pulse"></div>
                )}

                <div className="flex items-center gap-5 relative z-10">
                  <div className="relative">
                    <img
                      src={notification.senderId.profilePicture}
                      alt={notification.senderId.username}
                      className={`w-14 h-14 rounded-full object-cover shadow-lg ${!notification.isRead ? 'ring-2 ring-violet-500' : 'ring-2 ring-transparent group-hover:ring-white/10'}`}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#030712] rounded-full p-1 text-white shadow-sm border border-white/10">
                      {notification.type === 'like' && <svg className="w-3.5 h-3.5 text-pink-500 fill-current" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>}
                      {notification.type === 'comment' && <svg className="w-3.5 h-3.5 text-sky-500 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>}
                      {notification.type === 'follow' && <svg className="w-3.5 h-3.5 text-violet-500 fill-current" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-slate-200 text-lg leading-snug">
                      <span className="font-bold hover:text-violet-400 transition-colors">{notification.senderId.fullName || notification.senderId.username}</span>
                      {' '}<span className="text-slate-400 font-light">{getNotificationText(notification)}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium uppercase tracking-wide">{formatTime(notification.createdAt)}</p>
                  </div>

                  {notification.postId?.image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-sm group-hover:scale-105 transition-transform">
                      <img
                        src={notification.postId.image}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default Notifications;