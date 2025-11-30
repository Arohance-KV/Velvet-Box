import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Base URL
const BASE_URL = import.meta.env.VITE_BASE_URL;


const getAuthHeaders = (isFormData = false) => {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Create Job Listing - UPDATED TO REMOVE SLUG
export const createJobListing = createAsyncThunk(
  'job/createJobListing',
  async (jobData, { rejectWithValue }) => {
    try {
      // Remove slug from the payload if it exists - backend should generate it
      const { slug, shareableLink, ...cleanJobData } = jobData;
      
      const response = await fetch(`${BASE_URL}/joblist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cleanJobData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Publish Job Listing
export const publishJobListing = createAsyncThunk(
  'job/publishJobListing',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/joblist/${jobId}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Add Custom Section
export const addCustomSection = createAsyncThunk(
  'job/addCustomSection',
  async ({ jobId, sectionData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/joblist/${jobId}/sections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Upload Image
export const uploadImage = createAsyncThunk(
  'job/uploadImage',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${BASE_URL}/joblist/upload-image`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Upload Document
export const uploadDocument = createAsyncThunk(
  'job/uploadDocument',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${BASE_URL}/joblist/upload-document`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Upload Voice Recording
export const uploadVoiceRecording = createAsyncThunk(
  'job/uploadVoiceRecording',
  async ({ file, maxDuration }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('recording', file);
      
      if (maxDuration) {
        formData.append('maxDuration', maxDuration);
      }

      const response = await fetch(`${BASE_URL}/joblist/upload-voice-recording`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Upload Video Recording
export const uploadVideoRecording = createAsyncThunk(
  'job/uploadVideoRecording',
  async ({ file, quality = 'auto:low' }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('recording', file);
      formData.append('quality', quality);

      const response = await fetch(`${BASE_URL}/joblist/upload-video-recording`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Get Published Job Listings
export const getPublishedJobListings = createAsyncThunk(
  'job/getPublishedJobListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/joblist/published`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Get Job by Slug
export const getJobBySlug = createAsyncThunk(
  'job/getJobBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/joblist/slug/${slug}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Initial state
const initialState = {
  currentJob: null,
  jobListings: [],
  publishedJobs: {
    jobListings: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
  },
  uploadedFiles: {
    images: [],
    documents: [],
    voiceRecordings: [],
    videoRecordings: [],
  },
  loading: false,
  uploadLoading: false,
  error: null,
  uploadError: null,
};

// Job slice
const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
    clearUploadedFiles: (state) => {
      state.uploadedFiles = {
        images: [],
        documents: [],
        voiceRecordings: [],
        videoRecordings: [],
      };
    },
  },
  extraReducers: (builder) => {
    // Create Job Listing
    builder
      .addCase(createJobListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJobListing.fulfilled, (state, action) => {
        state.loading = false;
        const jobData = action.payload.data.jobListing || action.payload.data;
        state.currentJob = jobData;
        state.jobListings.push(jobData);
        state.error = null;
      })
      .addCase(createJobListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create job listing';
      });

    // Publish Job Listing
    builder
      .addCase(publishJobListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishJobListing.fulfilled, (state, action) => {
        state.loading = false;
        const jobData = action.payload.data.jobListing || action.payload.data;
        state.currentJob = jobData;
        
        const index = state.jobListings.findIndex((job) => job._id === jobData._id);
        if (index !== -1) {
          state.jobListings[index] = jobData;
        }
        
        state.error = null;
      })
      .addCase(publishJobListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to publish job listing';
      });

    // Add Custom Section
    builder
      .addCase(addCustomSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomSection.fulfilled, (state, action) => {
        state.loading = false;
        const jobData = action.payload.data.jobListing || action.payload.data;
        state.currentJob = jobData;
        
        const index = state.jobListings.findIndex((job) => job._id === jobData._id);
        if (index !== -1) {
          state.jobListings[index] = jobData;
        }
        
        state.error = null;
      })
      .addCase(addCustomSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add custom section';
      });

    // Get Job by Slug
    builder
      .addCase(getJobBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJobBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data.jobListing;
        state.error = null;
      })
      .addCase(getJobBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch job listing';
      });

    // Get Published Job Listings
    builder
      .addCase(getPublishedJobListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublishedJobListings.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedJobs = action.payload.data;
        state.error = null;
      })
      .addCase(getPublishedJobListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch published jobs';
      });

    // Upload Image
    builder
      .addCase(uploadImage.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadedFiles.images.push(...action.payload.data);
        state.uploadError = null;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload?.message || 'Failed to upload image';
      });

    // Upload Document
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadedFiles.documents.push(...action.payload.data);
        state.uploadError = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload?.message || 'Failed to upload document';
      });

    // Upload Voice Recording
    builder
      .addCase(uploadVoiceRecording.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadVoiceRecording.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadedFiles.voiceRecordings.push(action.payload.data);
        state.uploadError = null;
      })
      .addCase(uploadVoiceRecording.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload?.message || 'Failed to upload voice recording';
      });

    // Upload Video Recording
    builder
      .addCase(uploadVideoRecording.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadVideoRecording.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadedFiles.videoRecordings.push(action.payload.data);
        state.uploadError = null;
      })
      .addCase(uploadVideoRecording.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload?.message || 'Failed to upload video recording';
      });
  },
});

export const { clearCurrentJob, clearError, clearUploadedFiles } = jobSlice.actions;

// Selectors
export const selectCurrentJob = (state) => state.job.currentJob;
export const selectJobListings = (state) => state.job.jobListings;
export const selectPublishedJobs = (state) => state.job.publishedJobs;
export const selectUploadedFiles = (state) => state.job.uploadedFiles;
export const selectJobLoading = (state) => state.job.loading;
export const selectUploadLoading = (state) => state.job.uploadLoading;
export const selectJobError = (state) => state.job.error;
export const selectUploadError = (state) => state.job.uploadError;

export default jobSlice.reducer;
