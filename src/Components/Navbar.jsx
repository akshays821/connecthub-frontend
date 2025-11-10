import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { setNotificationCount } from '../Redux/Slices/notificationSlice';
import { logout } from '../Redux/Slices/authSlice';
import { resetMessageCount, setMessageCount } from '../Redux/Slices/messageSlice';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { unreadCount: messageUnreadCount } = useSelector((state) => state.messages);

  // 🔍 Search feature states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  // 🔔 Notifications + Messages
  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadMessages();

    const notifInterval = setInterval(fetchUnreadCount, 30000);
    const msgInterval = setInterval(fetchUnreadMessages, 2000);

    return () => {
      clearInterval(notifInterval);
      clearInterval(msgInterval);
    };
  }, [token]);

  // Reset message badge when on messages page
  useEffect(() => {
    if (location.pathname === '/messages') {
      dispatch(resetMessageCount());
    }
  }, [location.pathname]);

  // 🔍 Search debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 🔍 Hide dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔍 Fetch search results
  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    setSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?query=${searchQuery}`,
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

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = response.data.filter(n => !n.isRead).length;
      dispatch(setNotificationCount(unread));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      dispatch(setMessageCount(totalUnread));
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('persist:root');
    window.location.href = '/login';
  };

  const handleMessagesClick = () => {
    dispatch(resetMessageCount());
    navigate('/messages');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
        ConnectHub
      </h1>

      {/* 🔍 SEARCH BAR */}
      <div ref={searchRef} className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            placeholder="Search users..."
            className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searching && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Results dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50 animate-fade-in">
            {searchResults.map((u) => (
              <div
                key={u._id}
                onClick={() => handleUserClick(u.username)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition border-b border-gray-100 last:border-b-0"
              >
                <img
                  src={u.profilePicture}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">
                    {u.fullName || u.username}
                  </p>
                  <p className="text-gray-500 text-xs truncate">@{u.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 text-center">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        )}
      </div>

      {/* 🔹 NAVIGATION */}
      <nav className="space-y-2 flex-1">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
        >
          <svg className="w-6 h-6 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-lg font-medium">Home</span>
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group relative"
        >
          <div className="relative">
            <svg className="w-6 h-6 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-lg font-medium">Notifications</span>
        </button>

        <button
          onClick={() => navigate('/follow-requests')}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
        >
          <svg className="w-6 h-6 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-lg font-medium">Requests</span>
        </button>

        <button
          onClick={handleMessagesClick}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
        >
          <div className="relative">
            <svg className="w-6 h-6 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {messageUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
              </span>
            )}
          </div>
          <span className="text-lg font-medium">Messages</span>
        </button>

        <button
          onClick={() => navigate(`/profile/${user.username}`)}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
        >
          <svg className="w-6 h-6 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-lg font-medium">Profile</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
        >
          <svg className="w-6 h-6 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-lg font-medium">Settings</span>
        </button>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-4 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all group mt-auto"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="text-lg font-medium">Logout</span>
      </button>
    </div>
  );
}

export default Navbar;
