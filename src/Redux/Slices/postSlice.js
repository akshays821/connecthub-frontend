import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
      state.loading = false;
    },
    addPost: (state, action) => {
      // ✅ NORMALIZE: Ensure post has all required fields
      const newPost = {
        ...action.payload,
        // Add default values if missing from API response
        likes: action.payload.likes || [],
        comments: action.payload.comments || [],
        // If userId is just an ID string, convert to object
        userId: typeof action.payload.userId === 'string' 
          ? { 
              _id: action.payload.userId,
              username: action.payload.username || 'You',
              fullName: action.payload.fullName || '',
              profilePicture: action.payload.profilePicture || ''
            }
          : action.payload.userId
      };
      
      state.posts.unshift(newPost);
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter(post => post._id !== action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setPosts, addPost, removePost, updatePost, setLoading } = postsSlice.actions;
export default postsSlice.reducer;