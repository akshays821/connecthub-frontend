import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../Redux/Slices/authSlice';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors = {}
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(loginStart());
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/login`, {
        email,
        password
      });

      dispatch(loginSuccess({
        token: response.data.token,
        user: response.data.user
      }));

      navigate('/home');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030712]">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-30 animate-spin-slow"
          style={{ background: 'conic-gradient(from 0deg at 50% 50%, #7c3aed, #db2777, #030712, #7c3aed)', filter: 'blur(80px)', animationDuration: '20s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ width: Math.random() * 4 + 1, height: Math.random() * 4 + 1 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-md w-full glass-panel rounded-[2rem] p-10 relative z-10 border border-white/10 shadow-2xl backdrop-blur-3xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
              C
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black mb-3 text-white tracking-tight"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 font-medium"
          >
            Enter your credentials to access your account
          </motion.p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 overflow-hidden"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium w-full px-5 py-4"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium w-full px-5 py-4"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-premium py-4 text-lg rounded-xl mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : 'Sign In'}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative my-8"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#0f172a] text-slate-500 rounded-full">or continue with</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center"
        >
          <GoogleLogin
            theme="filled_black"
            shape="pill"
            width="100%"
            onSuccess={async (credentialResponse) => {
              dispatch(loginStart());
              try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/google`, {
                  credential: credentialResponse.credential
                });
                dispatch(loginSuccess({ token: response.data.token, user: response.data.user }));
                navigate('/home');
              } catch (error) {
                dispatch(loginFailure(error.response?.data?.message || 'Google login failed'));
              }
            }}
            onError={() => dispatch(loginFailure('Google login failed'))}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-slate-400 text-sm"
        >
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold hover:underline transition-all">
            Create an account
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Login;