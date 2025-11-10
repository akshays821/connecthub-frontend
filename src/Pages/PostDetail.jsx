import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Comments from '../Components/Comments';

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useSelector((state) => state.auth);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-600">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar />

      <div className="flex-1 ml-64 py-6 px-8 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.userId.profilePicture}
                alt={post.userId.username}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {post.userId.fullName || post.userId.username}
                </h3>
                <p className="text-sm text-gray-500">@{post.userId.username}</p>
              </div>
            </div>

            <p className="text-gray-900 text-lg mb-4 leading-relaxed">{post.content}</p>
          </div>

          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="w-full object-cover"
            />
          )}

          <Comments postId={post._id} />
        </div>
      </div>
    </div>
  );
}

export default PostDetail;