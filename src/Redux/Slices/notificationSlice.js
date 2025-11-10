import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 0
  },
  reducers: {
    setNotificationCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    decrementNotificationCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    resetNotificationCount: (state) => {
      state.unreadCount = 0;
    }
  }
});

export const { setNotificationCount, decrementNotificationCount, resetNotificationCount } = notificationSlice.actions;
export default notificationSlice.reducer;