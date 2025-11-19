import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { initializeSocket, disconnectSocket } from './socket';
import { addPost } from './Redux/Slices/postSlice.js';
import { incrementMessageCount } from './Redux/Slices/messageSlice.js';
import { setNotificationCount } from './Redux/Slices/notificationSlice.js';

import Register from './Pages/Register';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import PostDetail from './Pages/PostDetail';
import Notifications from './Pages/Notifications';
import FollowRequests from './Pages/FollowRequests';
import Messages from './Pages/Messages';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = initializeSocket(user.id);

      // Listen for new posts from others
      socket.on('new-post', (post) => {
        // Don't add if it's your own post (already added locally)
        if (post.userId._id !== user.id) {
          dispatch(addPost(post));
        }
      });

      // Listen for new messages
      socket.on('receive-message', () => {
        dispatch(incrementMessageCount());
      });

      // Listen for new notifications
      socket.on('new-notification', () => {
        dispatch(setNotificationCount(unreadCount + 1));
      });

      return () => disconnectSocket();
    }
  }, [isAuthenticated, user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/post/:postId" element={isAuthenticated ? <PostDetail /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
        <Route path="/follow-requests" element={isAuthenticated ? <FollowRequests /> : <Navigate to="/login" />} />
        <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;