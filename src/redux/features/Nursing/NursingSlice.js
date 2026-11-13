import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

export const fetchSingleAttendance = createAsyncThunk(
  'nursing/fetchSingleAttendance',
  async (nursingId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${SERVER}/api/nursing/nursing-attendance/${nursingId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const nursingSlice = createSlice({
  name: 'nursing',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSingleAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSingleAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default nursingSlice.reducer;
