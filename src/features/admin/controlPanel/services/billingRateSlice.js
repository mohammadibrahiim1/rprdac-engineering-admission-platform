// store/billingRateSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────

export const fetchBillingRates = createAsyncThunk(
  'billingRate/fetchAll',
  async (userType, { rejectWithValue }) => {
    try {
      const url = userType
        ? `${BASE_URL}/billing/rate?userType=${encodeURIComponent(userType)}`
        : BASE_URL;
      const { data } = await axios.get(url);

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch billing rates.',
      );
    }
  },
);

export const createBillingRate = createAsyncThunk(
  'billingRate/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(BASE_URL, payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create billing rate.',
      );
    }
  },
);

export const updateBillingRate = createAsyncThunk(
  'billingRate/update',
  async ({ userType, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/${encodeURIComponent(userType)}`,
        payload,
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update billing rate.',
      );
    }
  },
);

export const deleteBillingRate = createAsyncThunk(
  'billingRate/delete',
  async (userType, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `${BASE_URL}/${encodeURIComponent(userType)}`,
      );
      return { ...data, deletedUserType: userType };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete billing rate.',
      );
    }
  },
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const billingRateSlice = createSlice({
  name: 'billingRate',
  initialState: {
    rates: [], // array when fetching all
    selectedRate: null, // single rate when fetching by userType
    loading: false,
    actionLoading: false, // for create / update / delete
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedRate(state) {
      state.selectedRate = null;
    },
  },
  extraReducers: (builder) => {
    // ── FETCH ──────────────────────────────────
    builder
      .addCase(fetchBillingRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingRates.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload.data;
        if (Array.isArray(responseData)) {
          state.rates = responseData;
          state.selectedRate = null;
        } else {
          state.selectedRate = responseData;
          state.rates = [];
        }
      })
      .addCase(fetchBillingRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── CREATE ─────────────────────────────────
    builder
      .addCase(createBillingRate.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBillingRate.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.rates.unshift(action.payload.data);
        state.successMessage = action.payload.message;
      })
      .addCase(createBillingRate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // ── UPDATE ─────────────────────────────────
    builder
      .addCase(updateBillingRate.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateBillingRate.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.data;
        state.rates = state.rates.map((r) =>
          r.userType === updated.userType ? updated : r,
        );
        if (state.selectedRate?.userType === updated.userType) {
          state.selectedRate = updated;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(updateBillingRate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // ── DELETE ─────────────────────────────────
    builder
      .addCase(deleteBillingRate.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteBillingRate.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.rates = state.rates.filter(
          (r) => r.userType !== action.payload.deletedUserType,
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteBillingRate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, clearSelectedRate } = billingRateSlice.actions;
export default billingRateSlice.reducer;
