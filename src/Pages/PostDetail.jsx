import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Components/Sidebar';
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
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}`,
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
      <div className="min-h-screen bg-[#030712] flex">
        <Sidebar />
        <div className="flex-1 pl-32 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#030712] flex">
        <Sidebar />
        <div className="flex-1 pl-32 flex items-center justify-center">
          <p className="text-slate-400 text-lg">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 pl-32 py-10 px-8 max-w-4xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-all group"
        >
          <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-medium">Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative"
        >
          {/* subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32"></div>

          <div className="p-8 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={post.userId.profilePicture}
                alt={post.userId.username}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-transparent hover:ring-violet-500 transition-all cursor-pointer shadow-lg"
                onClick={() => navigate(`/profile/${post.userId.username}`)}
              />
              <div>
                <h3
                  className="font-bold text-xl text-white hover:text-violet-400 cursor-pointer transition-colors"
                  onClick={() => navigate(`/profile/${post.userId.username}`)}
                >
                  {post.userId.fullName || post.userId.username}
                </h3>
                <p className="text-sm text-slate-400">@{post.userId.username}</p>
              </div>
            </div>

            <p className="text-slate-100 text-lg mb-6 leading-relaxed font-light whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.image && (
            <div className="px-8 pb-8 relative z-10">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                src={post.image}
                alt="Post"
                className="w-full h-auto object-cover rounded-2xl shadow-lg border border-white/5"
              />
            </div>
          )}

          <div className="border-t border-white/5 bg-[#0f172a]/50 backdrop-blur-md relative z-10">
            <Comments postId={post._id} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default PostDetail;