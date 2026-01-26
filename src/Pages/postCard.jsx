import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function PostCard({ post, onDelete, showFullComments = false }) {
  const { token, user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [liked, setLiked] = useState(post.likes.includes(currentUser.id));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [commentPreview, setCommentPreview] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwnPost = post.userId._id === currentUser.id;

  // Fetch comment preview (only 2 comments)
  useEffect(() => {
    if (!showFullComments) {
      fetchCommentPreview();
    }
  }, []);

  const fetchCommentPreview = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${post._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCommentPreview(response.data.slice(0, 2));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${post._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setLiked(!liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${post._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShowDeleteModal(false);
      onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <>
      <motion.div
        className="glass-card rounded-[24px] p-6 group relative overflow-hidden"
      >
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/profile/${post.userId.username}`)}
            >
              <div className="relative">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={post.userId.profilePicture}
                  alt={post.userId.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-violet-500 transition-all duration-300"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-300">
                  {post.userId.fullName || post.userId.username}
                </h3>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  {formatTime(post.createdAt)}
                </p>
              </div>
            </div>

            {isOwnPost && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDeleteModal(true)}
                className="text-slate-500 hover:text-red-500 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            )}
          </div>

          <p className="text-slate-200 mb-4 leading-relaxed text-[15px] font-light tracking-wide">{post.content}</p>

          {post.image && (
            <motion.div
              className="rounded-2xl overflow-hidden mb-5 border border-white/5 shadow-2xl relative bg-[#030712]"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={post.image}
                alt="Post"
                className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate(`/post/${post._id}`)}
                loading="lazy"
              />
            </motion.div>
          )}

          <div className="flex items-center gap-6 mb-4 px-2">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${liked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
            >
              <motion.div
                initial={false}
                animate={{ scale: liked ? [1, 1.5, 1] : 1 }}
                className={`p-2 rounded-full ${liked ? 'bg-pink-500/10' : 'hover:bg-white/5'}`}
              >
                <svg className={`w-6 h-6 ${liked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
              <span className="text-sm font-medium">{likesCount}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/post/${post._id}`)}
              className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
            >
              <div className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{post.comments.length}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors ml-auto"
            >
              <div className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </motion.button>
          </div>

          <div className="px-2">
            {!showFullComments && commentPreview.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                {commentPreview.map(comment => (
                  <p key={comment._id} className="text-slate-300 text-sm">
                    <span className="font-bold text-white mr-2">{comment.userId.username}</span>
                    <span className="opacity-80 font-light">{comment.content}</span>
                  </p>
                ))}
              </div>
            )}

            {post.comments.length > 0 && !showFullComments && (
              <button
                onClick={() => navigate(`/post/${post._id}`)}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium mt-3 transition-colors"
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modern Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f172a] rounded-[32px] p-8 max-w-sm w-full border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10 text-center mb-8">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/30">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Delete Post?</h3>
                <p className="text-slate-400 leading-relaxed">This action cannot be undone. Your post will be permanently deleted.</p>
              </div>

              <div className="flex gap-4 relative z-10">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PostCard;