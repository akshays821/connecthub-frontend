import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileModal from './EditProfileModal';
import PostCard from './PostCard';
import Sidebar from '../Components/Sidebar';
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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-gray-400 text-xl font-medium">User not found</p>
      </div>
    );
  }

  const StatItem = ({ label, value, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`text-center group/stat ${onClick ? 'cursor-pointer' : 'cursor-default'} bg-white/5 px-6 py-4 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors`}
    >
      <motion.p
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-3xl font-bold text-white mb-1 bg-gradient-to-br from-white to-gray-400 bg-clip-text"
      >
        {value}
      </motion.p>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover/stat:text-primary-400 transition-colors">{label}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      <Sidebar />

      <main className="pl-32 py-8 px-8 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Profile Header Card */}
          <div className="glass-panel rounded-[40px] p-10 mb-8 overflow-hidden relative group">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-500/30 to-fuchsia-500/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/30 to-blue-500/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
              {/* Avatar Section */}
              <motion.div
                className="relative group/avatar"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full blur-md opacity-50 group-hover/avatar:opacity-75 transition-opacity duration-500"></div>
                <img
                  src={profile.profilePicture}
                  alt={profile.username}
                  className="w-40 h-40 rounded-full object-cover relative z-10 ring-4 ring-[#0f172a] shadow-2xl"
                />
                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-0 right-0 z-20 bg-dark-800 text-white p-2.5 rounded-full border border-white/10 shadow-lg hover:bg-dark-700 hover:text-primary-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </motion.button>
                )}
              </motion.div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-1 tracking-tight">
                      {profile.fullName || profile.username}
                      {/* Optional Verification Badge could go here */}
                    </h2>
                    <p className="text-gray-400 text-lg font-medium">@{profile.username}</p>
                  </div>

                  {!isOwnProfile && (
                    <div className="flex gap-3">
                      {followStatus === null ? (
                        <div className="w-32 h-12 bg-white/5 rounded-xl animate-pulse"></div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`
                            px-8 py-3 rounded-xl font-bold transition-all shadow-lg
                            ${followStatus === 'following'
                              ? 'bg-dark-800 border border-white/10 text-white hover:bg-dark-700 hover:text-red-400' // Destructive hover for unfollow
                              : followStatus === 'pending'
                                ? 'bg-dark-800/50 text-gray-500 cursor-not-allowed border border-white/5'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25 hover:shadow-violet-500/40'
                            }
                          `}
                        >
                          {followLoading
                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                            : followStatus === 'pending' ? 'Requested' : followStatus === 'following' ? 'Following' : 'Follow'
                          }
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMessageClick}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </motion.button>
                    </div>
                  )}
                </div>

                <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-2xl font-light mx-auto md:mx-0">
                  {profile.bio || <span className="text-gray-600 italic">No bio available</span>}
                </p>

                <div className="flex justify-center md:justify-start gap-4">
                  <StatItem label="Posts" value={profile.postsCount} />
                  <StatItem label="Followers" value={profile.followersCount} onClick={() => setShowFollowModal('followers')} />
                  <StatItem label="Following" value={profile.followingCount} onClick={() => setShowFollowModal('following')} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Posts</h3>
            <div className="h-px bg-white/10 flex-1 ml-4" />
          </div>

          <div className="space-y-6">
            {postsLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
              </div>
            ) : postsError ? (
              <div className="glass-panel p-12 text-center rounded-3xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <p className="text-gray-300 font-medium text-lg">{postsError}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="glass-panel p-16 text-center rounded-3xl">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                <p className="text-gray-500">When they share photos and videos, they'll appear here.</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

export default Profile;