import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${SERVER}/api/order/create`,
        orderData,
      );
      toast.success(response?.data?.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response.data);
    }
  },
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload.order;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
