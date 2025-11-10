import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../Redux/Slices/authSlice';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors , setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = ()=>{
    const newErrors = {}

    if(!email){
      newErrors.email = "please enter your email"
    }
    if (!password){
      newErrors.password = "please enter your password"
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()){
      return
    }

    dispatch(loginStart());

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });

      // Dispatch success action with token and user data
      dispatch(loginSuccess({
        token: response.data.token,
        user: response.data.user
      }));

      // Redirect to home
      navigate('/home');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-blue-600 mb-2">ConnectHub</h1>
          <p className="text-gray-500">Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-900 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="Enter your email"
            
            />

            {errors.email&& (
  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
)}


          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-900 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="Enter your password"
              
            />
             {errors.password&& (
  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
)}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Google Button */}
<div className="flex justify-center">
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      dispatch(loginStart());
      try {
        const response = await axios.post('http://localhost:5000/api/users/google', {
          credential: credentialResponse.credential
        });

        dispatch(loginSuccess({
          token: response.data.token,
          user: response.data.user
        }));

        navigate('/home');
      } catch (error) {
        dispatch(loginFailure(error.response?.data?.message || 'Google login failed'));
      }
    }}
    onError={() => {
      dispatch(loginFailure('Google login failed'));
    }}
  />
</div>
        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}


export default Login;