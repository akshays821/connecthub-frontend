import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import SuggestedUsers from '../Components/SuggestedUsers';
import CreatePost from './CreatePost';
import PostCard from './postCard';
import { setPosts, addPost, removePost, setLoading } from '../Redux/Slices/postSlice.js';

function Home() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { posts, loading } = useSelector((state) => state.posts);

  useEffect(() => {
    // ✅ Only fetch if posts array is empty (prevents duplicate fetches)
    if (posts.length === 0) {
      fetchPosts();
    }
  }, []); // Remove posts from dependency

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

  const handlePostDeleted = (postId) => {
    dispatch(removePost(postId));
  };

  const handlePostCreated = (newPost) => {
    dispatch(addPost(newPost));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <div className="ml-64 mr-96 py-8 px-6 max-w-2xl">
        <CreatePost onPostCreated={handlePostCreated} />
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center backdrop-blur-sm bg-opacity-90">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something amazing!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </div>
      <div className="fixed right-0 top-0 w-96 h-screen overflow-y-auto p-8 bg-gradient-to-b from-white to-gray-50">
        <SuggestedUsers />
      </div>
    </div>
  );
}

export default Home;