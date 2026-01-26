import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Components/Sidebar';
import { resetMessageCount, setConversations, updateConversation } from '../Redux/Slices/messageSlice';
import { getSocket } from '../socket';

function Messages() {
  const { token, user: currentUser } = useSelector((state) => state.auth);
  const { conversations } = useSelector((state) => state.messages);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    fetchConversations();

    const socket = getSocket();
    if (socket) {
      const handleReceiveMessage = (message) => {
        const currentActiveChat = activeChatRef.current;

        // ✅ ONLY add to messages if this chat is currently open
        if (currentActiveChat && message.senderId._id === currentActiveChat._id) {
          setMessages(prev => {
            const exists = prev.some(m => m._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });

          // Mark as read immediately since chat is open
          axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/messages/read/${message.senderId._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        // Always refresh conversation list to update badges and bolding
        fetchConversations();
      };

      socket.on('receive-message', handleReceiveMessage);

      return () => {
        socket.off('receive-message', handleReceiveMessage);
      };
    }

    if (location.state?.selectedUser) {
      setActiveChat(location.state.selectedUser);
    }
  }, [token, dispatch, location.state?.selectedUser]);

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
      console.log('Conversations:', response.data); // DEBUG - check unread counts
      dispatch(setConversations(response.data));
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

      // Mark as read when opening chat
      const markAsReadPromise = axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages/read/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ IMPORTANT: Wait for the read status to be updated, THEN refresh conversations
      await Promise.all([markAsReadPromise, fetchConversations()]);
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
        { receiverId: activeChat._id, content: messageToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sentMessage = response.data;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', {
          ...sentMessage,
          receiverId: activeChat._id
        });
      }

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
    <div className="h-screen bg-dark-900 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 pl-32 flex overflow-hidden p-6 gap-6">
        {/* Chat list - Clear separation */}
        <div className="w-[420px] bg-dark-800/80 backdrop-blur-xl border border-white/5 rounded-[32px] flex flex-col overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-gradient-to-r from-dark-800 to-dark-700">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Messages
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-24 h-24 mx-auto bg-dark-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-300 font-bold text-lg mb-2">No conversations yet</p>
                <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Connect with people to start chatting!</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {conversations.map(conv => {
                  const isActive = activeChat?._id === conv.user._id;
                  const hasUnread = conv.unreadCount > 0 && !isActive;

                  return (
                    <div
                      key={conv.user._id}
                      onClick={() => setActiveChat(conv.user)}
                      className={`p-4 cursor-pointer rounded-2xl transition-all duration-300 group ${isActive
                        ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                        : 'hover:bg-white/5 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={conv.user.profilePicture}
                            alt={conv.user.username}
                            className={`w-14 h-14 rounded-full object-cover transition-all duration-300 ${isActive ? 'ring-2 ring-primary-500' : 'ring-2 ring-transparent group-hover:ring-white/10'}`}
                          />
                          {hasUnread && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full border-2 border-dark-800 flex items-center justify-center animate-pulse shadow-lg shadow-accent-500/50">
                              <span className="text-white text-[10px] font-bold">
                                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className={`truncate text-lg ${hasUnread ? 'font-bold text-white' : isActive ? 'font-bold text-white' : 'font-semibold text-gray-300 group-hover:text-white'}`}>
                              {conv.user.fullName || conv.user.username}
                            </h3>
                            <span className={`text-xs ${hasUnread ? 'text-accent-400 font-bold' : 'text-gray-500 group-hover:text-gray-400'}`}>
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          </div>

                          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                            {conv.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-dark-800/80 backdrop-blur-xl border border-white/5 rounded-[32px] flex flex-col overflow-hidden shadow-2xl relative">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>

              <div className="text-center relative z-10 p-8 glass-dark rounded-3xl border border-white/5 max-w-md">
                <div className="w-24 h-24 mx-auto bg-dark-700/50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                  <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Select a conversation</h3>
                <p className="text-gray-400">Choose from your existing messages or start a new one to begin connecting.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/5 bg-dark-800/50 backdrop-blur-md flex-shrink-0 flex items-center gap-5 z-20">
                <img
                  src={activeChat.profilePicture}
                  alt={activeChat.username}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500/50 cursor-pointer hover:ring-primary-500 transition-all duration-300 shadow-lg shadow-primary-500/20"
                  onClick={() => navigate(`/profile/${activeChat.username}`)}
                />
                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/profile/${activeChat.username}`)}>
                  <h2 className="font-bold text-xl text-white hover:text-primary-400 transition-colors">
                    {activeChat.fullName || activeChat.username}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-sm text-gray-400">@{activeChat.username}</p>
                  </div>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-block p-4 rounded-full bg-white/5 mb-4"
                    >
                      <span className="text-4xl">👋</span>
                    </motion.div>
                    <p className="text-gray-400 font-medium">No messages yet. Say hi!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, index) => {
                      const isSender = message.senderId._id === currentUser.id;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          key={message._id || index}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div className={`
                            max-w-[70%] px-6 py-3.5 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300
                            ${isSender
                              ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white rounded-tr-sm shadow-violet-500/20'
                              : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-white/5 hover:bg-slate-700/80'}
                          `}>
                            <p className="leading-relaxed text-[15px] font-light tracking-wide">{message.content}</p>
                          </div>
                          <span className={`text-[10px] text-slate-500 self-end mb-1 mx-2 opacity-0 group-hover:opacity-100 transition-opacity ${isSender ? '-order-1' : ''}`}>
                            {formatTime(message.createdAt)}
                          </span>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/5 bg-dark-800/50 backdrop-blur-md z-20">
                <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                  <div className="flex-1 relative group">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full pl-6 pr-6 py-4 bg-dark-900/50 border border-white/10 rounded-2xl focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all text-white placeholder-gray-500 shadow-inner"
                      disabled={sending}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white p-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 group"
                  >
                    {sending ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
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