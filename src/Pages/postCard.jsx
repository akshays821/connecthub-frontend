import { useState ,useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        `http://localhost:5000/api/comments/${post._id}`,
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
        `http://localhost:5000/api/posts/${post._id}/like`,
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
        `http://localhost:5000/api/posts/${post._id}`,
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
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/profile/${post.userId.username}`)}
            >
              <img
                src={post.userId.profilePicture}
                alt={post.userId.username}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition">
                  {post.userId.fullName || post.userId.username}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatTime(post.createdAt)}
                </p>
              </div>
            </div>

            {isOwnPost && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-gray-400 hover:text-red-500 transition p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          <p className="text-gray-900 mb-3 leading-relaxed">{post.content}</p>
        </div>

        {post.image && (
          <img
            src={post.image}
            alt="Post"
            className="w-full object-cover cursor-pointer"
            onClick={() => navigate(`/post/${post._id}`)}
          />
        )}

        <div className="px-4 py-3">
          <div className="flex items-center gap-6 mb-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all ${
                liked ? 'text-red-500 scale-110' : 'text-gray-700 hover:text-red-500'
              }`}
            >
              <svg className="w-6 h-6" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button
              onClick={() => navigate(`/post/${post._id}`)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            <button className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition ml-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">{likesCount} likes</p>
            
            {!showFullComments && commentPreview.length > 0 && (
              <div className="space-y-1 mb-2">
                {commentPreview.map(comment => (
                  <p key={comment._id} className="text-gray-700">
                    <span className="font-semibold">{comment.userId.username}</span>{' '}
                    <span className="text-gray-600">{comment.content}</span>
                  </p>
                ))}
              </div>
            )}

            {post.comments.length > 0 && !showFullComments && (
              <button
                onClick={() => navigate(`/post/${post._id}`)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Post?</h3>
              <p className="text-gray-600">This action cannot be undone. Your post will be permanently deleted.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition"
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

export default PostCard;