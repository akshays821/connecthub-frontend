import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './Slices/authSlice';
import notificationReducer from './Slices/notificationSlice';
import messageReducer from './Slices/messageSlice';
import postsReducer from './Slices/postSlice.js';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Only persist auth, not posts (posts should reload fresh)
};

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationReducer,
  messages: messageReducer,
  posts: postsReducer // ADD THIS
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);