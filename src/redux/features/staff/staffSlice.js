import { createSlice } from '@reduxjs/toolkit';

const staffSlice = createSlice({
  name: 'time',
  initialState: {
    startTime: '',
    endTime: '',
    totalHours: 0,
    salaryPerHour: 48.07,
    totalSalary: 0,
  },
  reducers: {
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },
    setEndTime: (state, action) => {
      state.endTime = action.payload;
    },
    calculateTotalHours: (state) => {
      const [startHours, startMinutes] = state.startTime.split(':');
      const [endHours, endMinutes] = state.endTime.split(':');

      const totalMinutes =
        (endHours - startHours) * 60 + (endMinutes - startMinutes);
      const calculatedHours = Math.max(0, totalMinutes / 60); // Ensure non-negative hours

      state.totalHours = calculatedHours;

      return calculatedHours;
    },
    setSalaryPerHour: (state, action) => {
      state.salaryPerHour = action.payload;
    },
    setTotalSalary: (state, action) => {
      state.totalSalary = action.payload;
    },
  },
});

export const {
  setStartTime,
  setEndTime,
  calculateTotalHours,
  setSalaryPerHour,
  setTotalSalary,
} = staffSlice.actions;
export default staffSlice.reducer;
