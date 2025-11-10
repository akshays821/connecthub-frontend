import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import { resetMessageCount } from '../Redux/Slices/messageSlice';
import { io } from 'socket.io-client';

function Messages() {
  const { token, user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    dispatch(resetMessageCount());

    const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);
    socket.emit('register', currentUser.id);

    socket.on('receive-message', (message) => {
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });

      fetchConversations();
    });

    if (location.state?.selectedUser) {
      setActiveChat(location.state.selectedUser);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      dispatch(resetMessageCount());

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages/read/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeChat || sending) return;

    const messageToSend = newMessage.trim();
    setSending(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages`,
        {
          receiverId: activeChat._id,
          content: messageToSend
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const sentMessage = response.data;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);
      socket.emit('send-message', {
        ...sentMessage,
        receiverId: activeChat._id
      });

      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      });
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - messageTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return messageTime.toLocaleDateString();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex overflow-hidden">
      <Navbar />

      <div className="flex-1 ml-64 flex overflow-hidden">
        {/* Chat list column */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h1>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-6">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-600 font-medium mb-2">No messages yet</p>
                <p className="text-gray-400 text-sm">Start a conversation from a user's profile</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.user._id}
                  onClick={() => setActiveChat(conv.user)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${
                    activeChat?._id === conv.user._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={conv.user.profilePicture}
                        alt={conv.user.username}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {conv.user.fullName || conv.user.username}
                      </h3>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {!activeChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-32 h-32 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose from your existing messages or start a new one</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0 flex items-center gap-4">
                <img
                  src={activeChat.profilePicture}
                  alt={activeChat.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 cursor-pointer"
                  onClick={() => navigate(`/profile/${activeChat.username}`)}
                />
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${activeChat.username}`)}
                >
                  <h2 className="font-semibold text-gray-900 hover:text-blue-600 transition">
                    {activeChat.fullName || activeChat.username}
                  </h2>
                  <p className="text-sm text-gray-500">@{activeChat.username}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isSender = message.senderId._id === currentUser.id;
                      return (
                        <div
                          key={message._id || index}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md px-4 py-2 rounded-2xl ${
                              isSender
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isSender ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onBlur={() => {
                      setTimeout(() => {
                        if (document.activeElement.tagName !== 'BUTTON') {
                          inputRef.current?.focus();
                        }
                      }, 100);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !sending) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition"
                    disabled={sending}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
