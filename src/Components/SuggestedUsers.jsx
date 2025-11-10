import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.get('http://localhost:5000/api/users/suggested', {
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
        `http://localhost:5000/api/follow/${userId}`,
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
      return 'bg-gray-200 text-gray-700 cursor-default';
    }
    if (state === 'loading') {
      return 'bg-blue-400 text-white cursor-wait opacity-70';
    }
    return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Suggested for you</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Suggested for you
        </h2>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No suggestions available</p>
      ) : (
        <div className="space-y-4">
          {users.map(user => (
            <div key={user._id} className="flex items-center justify-between group">
              <div 
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                <div className="relative">
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-500 transition"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                </div>
              </div>

              <button 
                onClick={() => handleFollow(user._id)}
                disabled={followingStates[user._id] === 'loading' || followingStates[user._id] === 'following' || followingStates[user._id] === 'requested'}
                className={`${getButtonStyle(user._id)} px-5 py-1.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed`}
              >
                {getButtonText(user._id)}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
          <a href="#" className="hover:text-gray-600">About</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600">Help</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600">Terms</a>
        </div>
        <p className="text-xs text-gray-400">© 2025 ConnectHub</p>
      </div>
    </div>
  );
}

export default SuggestedUsers;