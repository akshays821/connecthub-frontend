import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function CreatePost({ onPostCreated }) {
  const { token } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please write something');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/posts`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setContent('');
      setImage(null);
      setImagePreview('');
      setShowModal(false);

      onPostCreated(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Bottom Right */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-[0_0_40px_rgba(124,58,237,0.5)] flex items-center justify-center z-40 group border border-white/20"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel rounded-[32px] p-8 max-w-lg w-full shadow-2xl border border-white/10 relative overflow-hidden z-10"
            >
              {/* Gradient Glow */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none"></div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Create Post</h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {error && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 overflow-hidden">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="mb-6">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full px-6 py-5 bg-[#030712]/50 border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none text-white placeholder-slate-400 min-h-[140px] text-lg leading-relaxed shadow-inner"
                    maxLength="280"
                  />
                  <div className="flex justify-between items-center mt-2 px-2">
                    <p className="text-xs text-gray-500 font-medium">Max 280 characters</p>
                    <p className={`text-xs font-bold ${content.length > 250 ? 'text-red-400' : 'text-gray-600'}`}>
                      {content.length}/280
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="cursor-pointer group block">
                    <motion.div
                      whileHover={{ borderColor: 'rgba(139, 92, 246, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center transition-all duration-300"
                    >
                      {imagePreview ? (
                        <div className="relative group/preview">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl shadow-2xl"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setImage(null);
                                setImagePreview('');
                              }}
                              className="bg-red-500 text-white rounded-full p-3 shadow-lg"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4">
                          <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
                            <svg className="w-10 h-10 text-gray-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">Add Photo</p>
                          <p className="text-gray-600 text-sm mt-1">or drag and drop</p>
                        </div>
                      )}
                    </motion.div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all border border-white/5"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CreatePost;