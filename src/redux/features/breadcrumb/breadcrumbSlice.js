import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  breadcrumbs: [],
};

const breadcrumbSlice = createSlice({
  name: 'breadcrumb',
  initialState,
  reducers: {
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const { setBreadcrumbs } = breadcrumbSlice.actions;
export default breadcrumbSlice.reducer;
