import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Components/Sidebar';
import SuggestedUsers from '../Components/SuggestedUsers';
import CreatePost from './CreatePost';
import PostCard from './postCard';
import { setPosts, addPost, removePost, setLoading } from '../Redux/Slices/postSlice.js';


function Home() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { posts, loading } = useSelector((state) => state.posts);

  useEffect(() => {
    fetchPosts();
  }, [dispatch, token]);

  const fetchPosts = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(setPosts(response.data));
    } catch (error) {
      console.error('Error fetching posts:', error);
      dispatch(setLoading(false));
    }
  };

  const handlePostCreated = (newPost) => {
    dispatch(addPost(newPost));
  };

  const handlePostDeleted = (postId) => {
    dispatch(removePost(postId));
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">

      <Sidebar />

      <main className="pl-32 pr-8 py-8 max-w-[1600px] mx-auto flex gap-8">
        {/* Feed Section */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          {/* Header */}
          <header className="flex items-center justify-between mb-8 sticky top-4 z-30 glass-panel rounded-2xl p-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              For You
            </h1>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-lg bg-white/10 text-sm font-medium hover:bg-white/20 transition">Trending</button>
              <button className="px-4 py-1.5 rounded-lg text-gray-400 text-sm font-medium hover:text-white transition">Latest</button>
            </div>
          </header>

          <CreatePost onPostCreated={handlePostCreated} />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl mt-8">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">It's quiet here</h3>
              <p className="text-gray-400">Be the first to post something amazing.</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="space-y-6 mt-8 pb-20"
            >
              <AnimatePresence mode='popLayout'>
                {posts.map(post => (
                  <motion.div
                    key={post._id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
                    }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <PostCard
                      post={post}
                      onDelete={handlePostDeleted}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Suggested Users */}
        <aside className="hidden xl:block w-96 relative">
          <div className="sticky top-8 space-y-6">
            <SuggestedUsers />

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 px-4">
              <a href="#" className="hover:text-gray-300 transition">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition">Terms</a>
              <a href="#" className="hover:text-gray-300 transition">Advertising</a>
              <a href="#" className="hover:text-gray-300 transition">Cookies</a>
              <span>© 2026 ConnectHub Inc.</span>
            </div>
          </div>
        </aside>
      </main>
    </div>

  );
}

export default Home;