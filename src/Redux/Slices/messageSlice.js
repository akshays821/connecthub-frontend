import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    unreadCount: 0
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
    }
  }
});

export const { setMessageCount, incrementMessageCount, resetMessageCount } = messageSlice.actions;
export default messageSlice.reducer;