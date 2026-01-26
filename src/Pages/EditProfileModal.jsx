import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../Redux/Slices/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function EditProfileModal({ profile, onClose, onUpdate }) {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    bio: profile.bio || '',
    isPrivate: profile.isPrivate || false
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('bio', formData.bio);
    formDataToSend.append('isPrivate', formData.isPrivate.toString());

    if (profilePicture) {
      formDataToSend.append('profilePicture', profilePicture);
    }

    const updatePromise = axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
      formDataToSend,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    toast.promise(updatePromise, {
      loading: 'Saving changes...',
      success: (response) => {
        dispatch(loginSuccess({ token, user: response.data.user }));
        onUpdate();
        onClose();
        return 'Profile updated successfully!';
      },
      error: (err) => err.response?.data?.message || 'Failed to update profile',
    }).finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="glass-panel rounded-[32px] p-8 max-w-lg w-full shadow-2xl border border-white/10 relative overflow-hidden z-10"
      >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Edit Profile
          </h2>
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2.5 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 overflow-hidden">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-4">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#0f172a] shadow-xl"
                />
                <div className="absolute inset-0 rounded-full bg-black/20 hidden group-hover:block transition-all"></div>
              </div>

              <label className="cursor-pointer group">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2.5 rounded-xl font-medium transition-all group-hover:border-white/20"
                >
                  Change Photo
                </motion.div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-[#030712]/50 border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-white placeholder-slate-400 shadow-inner"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              maxLength="150"
              className="w-full px-5 py-4 bg-[#030712]/50 border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none text-white placeholder-slate-400 shadow-inner leading-relaxed"
              placeholder="Tell us about yourself"
            />
            <div className="flex justify-between items-center mt-2 px-2">
              <p className="text-xs text-slate-500 font-medium">Max 150 characters</p>
              <p className={`text-xs font-bold ${formData.bio.length > 140 ? 'text-red-400' : 'text-slate-500'}`}>
                {formData.bio.length}/150
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                name="isPrivate"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border border-slate-500 bg-[#030712] transition-all checked:border-violet-500 checked:bg-violet-500"
              />
              <svg
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <label htmlFor="isPrivate" className="flex-1 cursor-pointer select-none">
              <span className="text-white font-bold text-sm block">
                Private Account
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Only followers can see your posts
              </p>
            </label>
          </motion.div>

          <div className="flex gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold transition-all border border-white/5"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default EditProfileModal;