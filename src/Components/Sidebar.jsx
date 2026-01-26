import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setNotificationCount } from '../Redux/Slices/notificationSlice';
import { logout } from '../Redux/Slices/authSlice';
import { resetMessageCount } from '../Redux/Slices/messageSlice';
import { getSocket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { unreadCount: messageUnreadCount } = useSelector((state) => state.messages);

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const sidebarRef = useRef(null); // Ref for hover detection

  // Floating Sidebar Variants
  const sidebarVariants = {
    collapsed: { width: '88px', transition: { type: 'spring', damping: 20, stiffness: 300 } },
    expanded: { width: '320px', transition: { type: 'spring', damping: 20, stiffness: 300 } }
  };

  const itemVariants = {
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    expanded: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.3 } }
  };

  const NavLink = ({ to, children, icon: IconComponent, badge }) => {
    const isActive = location.pathname === to || (to === '/home' && location.pathname === '/');

    const handleClick = () => {
      if (isActive && to !== '/home' && location.pathname !== '/') {
        window.location.reload();
      } else {
        navigate(to);
      }
    };

    return (
      <motion.button
        onClick={handleClick}
        className={`relative flex items-center w-full p-4 my-2 rounded-2xl transition-colors duration-300 group overflow-hidden ${isActive ? 'bg-primary-500/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'
          }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute left-0 w-1 h-8 bg-gradient-to-b from-primary-400 to-accent-400 rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        <div className={`relative z-10 flex items-center justify-center min-w-[24px] ${isActive ? 'text-primary-400' : ''}`}>
          {IconComponent && <IconComponent className="w-6 h-6" />}
          {badge > 0 && !isExpanded && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500"></span>
            </span>
          )}
        </div>

        <motion.span
          variants={itemVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          className="ml-4 font-medium whitespace-nowrap overflow-hidden flex items-center justify-between w-full"
        >
          {children}
          {badge > 0 && (
            <span className="bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-accent-500/20">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </motion.span>
      </motion.button>
    );
  };

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = response.data.filter(n => !n.isRead).length;
      dispatch(setNotificationCount(unread));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchUnreadCount();
    const socket = getSocket();
    if (socket) {
      socket.on('new-notification', fetchUnreadCount);
      return () => {
        socket.off('new-notification', fetchUnreadCount);
      };
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (location.pathname === '/messages') {
      dispatch(resetMessageCount());
    }
  }, [location.pathname]);

  // Search Logic (Debounced)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/search?query=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleUserClick = (username) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    navigate(`/profile/${username}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('persist:root');
    window.location.href = '/login';
  };

  // Icons
  const Icons = {
    Home: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
    Notifications: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>),
    Requests: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    Messages: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>),
    Profile: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
    Settings: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    Logout: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>),
    Search: (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>)
  };

  return (
    <motion.div
      ref={sidebarRef}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed left-6 top-6 bottom-6 rounded-[32px] flex flex-col glass-panel z-50"
    >
      {/* Brand */}
      <div className="p-6 mb-2 flex items-center h-20">
        <motion.div
          animate={{ scale: isExpanded ? 1.2 : 1 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30"
        >
          <span className="text-white font-bold text-xl">C</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-2xl font-bold ml-4 text-white tracking-tight whitespace-nowrap"
        >
          ConnectHub
        </motion.h1>
      </div>

      {/* Search Bar - Collapses to Icon */}
      <div className="px-4 mb-6 relative" ref={searchRef}>
        <motion.div
          className="relative bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/10"
          animate={{ padding: isExpanded ? "12px" : "12px" }}
        >
          <div className="flex items-center justify-center">
            <Icons.Search className={`w-6 h-6 text-gray-400 ${isExpanded ? 'absolute left-3 top-3.5' : ''}`} />

            <motion.input
              variants={itemVariants}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-white placeholder-slate-400 w-full ml-8"
              style={{ display: isExpanded ? 'block' : 'none' }}
            />
          </div>
        </motion.div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isExpanded && showResults && (searchResults.length > 0 || searchQuery.length >= 2) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-[calc(100%+20px)] top-0 w-80 bg-[#0f172a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[60]"
            >
              {searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Users</div>
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => handleUserClick(u.username)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition"
                    >
                      <img src={u.profilePicture} alt={u.username} className="w-10 h-10 rounded-full bg-dark-700" />
                      <div>
                        <p className="font-medium text-gray-200">{u.fullName}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <NavLink to="/home" icon={Icons.Home}>Home</NavLink>
        <NavLink to="/notifications" icon={Icons.Notifications} badge={unreadCount}>Notifications</NavLink>
        <NavLink to="/messages" icon={Icons.Messages} badge={messageUnreadCount}>Messages</NavLink>
        <NavLink to="/follow-requests" icon={Icons.Requests}>Requests</NavLink>
        <NavLink to={`/profile/${user?.username}`} icon={Icons.Profile}>Profile</NavLink>
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center w-full p-4 rounded-2xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 group transition-all"
        >
          <div className="flex items-center justify-center min-w-[24px]">
            <Icons.Logout className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <motion.span
            variants={itemVariants}
            className="ml-4 font-medium"
          >
            Logout
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Sidebar;