// features/sliderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

// Async thunk to fetch sliders
export const fetchSliders = createAsyncThunk(
  'sliders/fetchSliders',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER}/api/hero/get/sliders`);

      return response?.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

// Async thunk to post a new slider
export const postSlider = createAsyncThunk(
  'sliders/postSlider',
  async (sliderData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${SERVER}/api/hero/post/slider`,
        sliderData,
      );

      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

const sliderSlice = createSlice({
  name: 'sliders',
  initialState: {
    sliders: [],
    status: 'idle',
    message: '',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSliders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSliders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sliders = action.payload;
      })
      .addCase(fetchSliders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(postSlider.pending, (state) => {
        state.status = 'loading'; // Add the new slider to the state
      })
      .addCase(postSlider.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.sliders.push(action.payload.slider); // Add the new slider to the state
      })
      .addCase(postSlider.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.message; // Add the new slider to the state
      });
  },
});

export default sliderSlice.reducer;
