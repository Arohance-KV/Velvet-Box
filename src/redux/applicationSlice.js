// applicationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Async thunk for submitting application
export const submitApplication = createAsyncThunk(
  'application/submit',
  async (applicationData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/application/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error.message || 'Failed to submit application',
      });
    }
  }
);

const initialState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
  submitStatus: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    resetSubmitStatus: (state) => {
      state.submitStatus = 'idle';
      state.error = null;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Application
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
        state.submitStatus = 'pending';
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.submitStatus = 'succeeded';
        state.currentApplication = action.payload.data;
        state.applications.push(action.payload.data);
        state.error = null;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.submitStatus = 'failed';
        state.error = action.payload || {
          message: 'Something went wrong',
        };
      });
  },
});

export const { resetSubmitStatus, clearCurrentApplication, clearError } = 
  applicationSlice.actions;

// Selectors
export const selectApplications = (state) => state.application.applications;
export const selectCurrentApplication = (state) => state.application.currentApplication;
export const selectApplicationLoading = (state) => state.application.loading;
export const selectApplicationError = (state) => state.application.error;
export const selectSubmitStatus = (state) => state.application.submitStatus;

export default applicationSlice.reducer;
