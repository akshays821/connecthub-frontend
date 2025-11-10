import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      {/* Clear separator */}
      <div className="border-t-8 border-gray-100"></div>

      <div className="px-6 py-4 bg-white">
        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex gap-3">
            <img
              src={currentUser.profilePicture}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition"
                maxLength="500"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                {submitting ? '...' : 'Post'}
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {loading ? (
          <p className="text-gray-500 text-sm text-center py-8">Loading comments...</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map(comment => (
              <div key={comment._id} className="group">
                {/* User Info Row */}
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${comment.userId.username}`)}
                  >
                    <img
                      src={comment.userId.profilePicture}
                      alt={comment.userId.username}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 hover:ring-blue-500 transition"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition">
                        {comment.userId.fullName || comment.userId.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {comment.userId._id === currentUser.id && (
                    <button
                      onClick={() => setDeleteModal(comment._id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Comment Content */}
                <div className="ml-12 bg-gray-50 rounded-2xl px-4 py-3 hover:bg-gray-100 transition">
                  <p className="text-sm text-gray-800 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>

                {/* Separator between comments */}
                <div className="h-px bg-gray-100 mt-4"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Comment?</h3>
              <p className="text-gray-600 text-sm">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Comments;