import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    unreadCount: 0,
    conversations: [] 
  },
  reducers: {
    setMessageCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    incrementMessageCount: (state) => {
      state.unreadCount += 1;
    },
    resetMessageCount: (state) => {
      state.unreadCount = 0;
    },
    // Store conversations with sender info
    setConversations: (state, action) => {
      state.conversations = action.payload;
      // Update unread count from conversations
      state.unreadCount = action.payload.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    },
    // Update specific conversation when new message arrives
    updateConversation: (state, action) => {
      const { userId, lastMessage, unreadCount } = action.payload;
      const index = state.conversations.findIndex(c => c.user._id === userId);
      
      if (index !== -1) {
        state.conversations[index].lastMessage = lastMessage;
        state.conversations[index].unreadCount = unreadCount;
        state.conversations[index].lastMessageTime = new Date();
        
        // Move to top
        const [updated] = state.conversations.splice(index, 1);
        state.conversations.unshift(updated);
      }
      
      // Recalculate total unread
      state.unreadCount = state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    }
  }
});

export const { 
  setMessageCount, 
  incrementMessageCount, 
  resetMessageCount,
  setConversations,
  updateConversation
} = messageSlice.actions;

export default messageSlice.reducer;