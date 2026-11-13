// src/features/visitorSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axios from "axios";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

export const fetchStats = async () => {
  const response = await fetch(`${SERVER}/api/visitors/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
};

// Async thunk for fetching visitor stats
export const getStats = createAsyncThunk('stats/getStats', async () => {
  const response = await fetchStats();
  return response;
});

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    totalVisitors: 0,
    onlineVisitors: 0,
    totalPageviews: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { totalVisitors, onlineVisitors, totalPageviews } =
          action.payload;
        state.totalVisitors = totalVisitors;
        state.onlineVisitors = onlineVisitors;
        state.totalPageviews = totalPageviews;
      })
      .addCase(getStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default statsSlice.reducer;
