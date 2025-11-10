import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

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

      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setContent('');
      setImage(null);
      setImagePreview('');
      setShowModal(false);
      onPostCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Bottom Right */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Post</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition resize-none"
                  rows="4"
                  maxLength="280"
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-xs text-gray-400">Max 280 characters</p>
                  <p className={`text-xs font-medium ${content.length > 250 ? 'text-red-500' : 'text-gray-400'}`}>
                    {content.length}/280
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImage(null);
                            setImagePreview('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 font-medium">Click to upload image</p>
                        <p className="text-gray-400 text-sm mt-1"></p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;