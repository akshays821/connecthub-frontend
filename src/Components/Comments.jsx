import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function Comments({ postId }) {
  const { token, user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${postId}`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setComments([response.data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${deleteModal}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setComments(comments.filter(c => c._id !== deleteModal));
      setDeleteModal(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <>
      <div className="border-t border-white/5 my-4"></div>

      <div className="px-6 py-4">
        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="mb-8 relative z-10">
          <div className="flex gap-4 items-start">
            <img
              src={currentUser.profilePicture}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent transition hover:ring-violet-500"
            />
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-5 py-3.5 bg-[#030712]/50 border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-white placeholder-slate-400 pr-24 shadow-inner"
                  maxLength="500"
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-white/5 hover:bg-violet-600 hover:text-white text-slate-400 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-wide"
                >
                  {submitting ? '...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence>
              {comments.map(comment => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative"
                >
                  {/* User Info Row */}
                  <div className="flex gap-4">
                    <div
                      className="flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/profile/${comment.userId.username}`)}
                    >
                      <img
                        src={comment.userId.profilePicture}
                        alt={comment.userId.username}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-violet-500 transition-all duration-300"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="bg-white/5 rounded-2xl px-5 py-3 border border-white/5 hover:border-white/10 transition-colors group-hover:bg-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <div
                            className="cursor-pointer font-bold text-slate-200 hover:text-violet-400 transition-colors text-sm"
                            onClick={() => navigate(`/profile/${comment.userId.username}`)}
                          >
                            {comment.userId.fullName || comment.userId.username}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{formatTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-1 px-2">
                        <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Reply</button>
                        {comment.userId._id === currentUser.id && (
                          <button
                            onClick={() => setDeleteModal(comment._id)}
                            className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setDeleteModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f172a] rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl relative z-10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-500/5">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Comment?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">This action cannot be undone. Are you sure?</p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all border border-white/5"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Comments;