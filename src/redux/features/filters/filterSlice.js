import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filters: {
    batch: null,
    department: null,
    subject: null,
    startDate: null,
    endDate: null,
    status: null,
    paymentStatus: null,
    year: null,
    month: null,
  },
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    resetFilters: (state) => {
      state.filters = initialState?.filters;
    },
  },
});
export const { setFilter, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
