import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
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
      const response = await axios.get('http://localhost:5000/api/notifications', {
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
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
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
          `http://localhost:5000/api/notifications/${notification._id}/read`,
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
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar />

      <div className="flex-1 ml-64 py-6 px-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-600 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-2">When someone interacts with your posts, you'll see it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={notification.senderId.profilePicture}
                    alt={notification.senderId.username}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-semibold">{notification.senderId.fullName || notification.senderId.username}</span>
                      {' '}<span className="text-gray-600">{getNotificationText(notification)}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                  </div>
                  {notification.postId?.image && (
                    <img
                      src={notification.postId.image}
                      alt="Post"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;