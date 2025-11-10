import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />

        {/* Auth routes - redirect to home if already logged in */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/home" /> : <Register />} 
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />

        <Route 
          path="/profile/:username" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/post/:postId" 
          element={isAuthenticated ? <PostDetail /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/notifications" 
          element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/follow-requests" 
          element={isAuthenticated ? <FollowRequests /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/messages" 
          element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} 
        />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
