import { configureStore } from '@reduxjs/toolkit';
import jobReducer from '../redux/jobSlice';
import applicationReducer from '../redux/applicationSlice';
export const store = configureStore({
  reducer: {
    job: jobReducer,
    application: applicationReducer,
  },
});
