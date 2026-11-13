import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('stopwatchState');
    if (serializedState === null) {
      return {
        startTime: null,
        endTime: null,
        elapsedTime: null,
        elapsedAmount: null,
        sessions: [],
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      startTime: null,
      endTime: null,
      elapsedTime: null,
      elapsedAmount: null,
      sessions: [],
    };
  }
};
const initialState = loadState();

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('stopwatchState', serializedState);
  } catch (err) {
    toast.error(err.data?.message || 'Something went wrong! Try again.');
  }
};

const stopwatchSlice = createSlice({
  name: 'timeTracker',
  initialState,
  reducers: {
    startTracking: (state) => {
      if (state) {
        state.startTime = new Date().toISOString();
        state.endTime = null;
        state.elapsedTime = null;

        saveState(state);
      }
      // state.isActive = true;
    },

    stopTracking: (state) => {
      state.endTime = new Date().toISOString();
      const start = new Date(state.startTime);
      const end = new Date(state.endTime);
      state.elapsedTime = Math.round((end - start) / 1000);
      state.elapsedAmount = state.elapsedTime * 0.0133527778; //calculate total amount
      // save the elapsed time and total amount to previousTimes
      state.sessions = (state.sessions || []).concat({
        startTime: state.startTime,
        endTime: state.endTime,
        elapsedTime: state.elapsedTime,
        elapsedAmount: state.elapsedAmount,
      });
      state.startTime = null;
      state.endTime = null;
      saveState(state);
    },
  },

  reset: (state) => {
    state.time = 0;
    state.isActive = false;
    state.startTime = null;
    state.endTime = null;
    saveState(state);
  },

  setState: (state, action) => {
    state.time = action.payload.time;
    state.isActive = action.payload.isActive;
    state.startTime = action.payload.startTime;
    state.endTime = action.payload.endTime;
    saveState(state);
  },
});

export const { startTracking, stopTracking } = stopwatchSlice.actions;

export default stopwatchSlice.reducer;
