import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';

function FollowRequests() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/follow/requests`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

 const handleAccept = async (requestId, senderId) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/follow/accept/${senderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setRequests(requests.filter(r => r._id !== requestId));
  } catch (error) {
    console.error('Error accepting request:', error);
  }
};

const handleReject = async (requestId, senderId) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/follow/reject/${senderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setRequests(requests.filter(r => r._id !== requestId));
  } catch (error) {
    console.error('Error rejecting request:', error);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      <Navbar />

      <div className="flex-1 ml-64 py-8 px-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Follow Requests</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No follow requests</h3>
            <p className="text-gray-500">When someone requests to follow you, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request._id} className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => navigate(`/profile/${request.senderId.username}`)}
                >
                  <img
                    src={request.senderId.profilePicture}
                    alt={request.senderId.username}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {request.senderId.fullName || request.senderId.username}
                    </h3>
                    <p className="text-gray-500">@{request.senderId.username}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(request._id , request.senderId._id)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all hover:shadow-lg"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request._id , request.senderId._id)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl font-medium transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowRequests;