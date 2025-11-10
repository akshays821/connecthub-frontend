import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import EditProfileModal from './EditProfileModal';
import PostCard from './postCard';
import Navbar from '../Components/Navbar';
import FollowModal from '../Components/FollowModal';

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');

  const [followStatus, setFollowStatus] = useState(null); // Changed to null initially
  const [followLoading, setFollowLoading] = useState(false);

  const [showFollowModal, setShowFollowModal] = useState(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const loadData = async () => {
      setFollowStatus(null); // Reset status when changing profiles
      await fetchProfile();
      await fetchUserPosts();
    };
    loadData();
  }, [username]);

  useEffect(() => {
    if (profile && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/user/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(response.data);
      setPostsLoading(false);
    } catch (error) {
      if (error.response?.status === 403) {
        setPostsError('This account is private');
      } else {
        setPostsError('Error loading posts');
      }
      setPostsLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (isOwnProfile || !profile) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/follow/check/${profile.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowStatus(response.data.status);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setFollowStatus('not_following'); // Fallback
    }
  };

  const handleFollowToggle = async () => {
    if (followLoading || !profile || followStatus === null) return;
    setFollowLoading(true);

    const previousStatus = followStatus;

    try {
      if (followStatus === 'following') {
        // Optimistic update
        setFollowStatus('not_following');
        setProfile((prev) => ({
          ...prev,
          followersCount: Math.max((prev.followersCount || 1) - 1, 0),
        }));

        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/follow/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (followStatus === 'pending') {
        // Optimistic update
        setFollowStatus('not_following');

        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/follow/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/follow/${profile.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === 'pending') {
          setFollowStatus('pending');
        } else {
          setFollowStatus('following');
          setProfile((prev) => ({
            ...prev,
            followersCount: (prev.followersCount || 0) + 1,
          }));
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert on error
      setFollowStatus(previousStatus);
      await fetchProfile();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageClick = () => {
    navigate('/messages', {
      state: {
        selectedUser: {
          _id: profile.id,
          username: profile.username,
          fullName: profile.fullName,
          profilePicture: profile.profilePicture,
        },
      },
    });
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  useEffect(() => {
    if (!showFollowModal) {
      fetchProfile();
    }
  }, [showFollowModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <div className="ml-64 py-8 px-8 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-start gap-8">
            <img
              src={profile.profilePicture}
              alt={profile.username}
              className="w-40 h-40 rounded-full object-cover ring-4 ring-blue-100 shadow-lg"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {profile.fullName || profile.username}
                  </h2>
                  <p className="text-gray-500 text-lg">@{profile.username}</p>
                </div>

                {isOwnProfile ? (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg active:scale-95"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    {/* Show loading or button based on status */}
                    {followStatus === null ? (
                      <div className="px-8 py-3 bg-gray-100 rounded-full">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`${
                          followStatus === 'following'
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : followStatus === 'pending'
                            ? 'bg-gray-100 text-gray-500 cursor-pointer'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                        } px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg active:scale-95 disabled:opacity-50`}
                      >
                        {followLoading
                          ? 'Loading...'
                          : followStatus === 'pending'
                          ? 'Requested'
                          : followStatus === 'following'
                          ? 'Following'
                          : 'Follow'}
                      </button>
                    )}

                    <button
                      onClick={handleMessageClick}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold transition-all hover:shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {profile.bio || 'No bio yet'}
              </p>

              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.postsCount}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">Posts</p>
                </div>
                <div
                  onClick={() => setShowFollowModal('followers')}
                  className="text-center cursor-pointer hover:scale-105 transition"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.followersCount}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">Followers</p>
                </div>
                <div
                  onClick={() => setShowFollowModal('following')}
                  className="text-center cursor-pointer hover:scale-105 transition"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.followingCount}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Posts
          </h2>

          {postsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : postsError ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center backdrop-blur-sm bg-opacity-90">
              <p className="text-gray-600 text-lg font-medium">{postsError}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center backdrop-blur-sm bg-opacity-90">
              <p className="text-gray-600 text-lg">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={fetchProfile}
        />
      )}

      {showFollowModal && (
        <FollowModal
          userId={profile.id}
          type={showFollowModal}
          onClose={() => setShowFollowModal(null)}
        />
      )}
    </div>
  );
}

export default Profile;