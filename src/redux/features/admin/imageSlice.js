import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

// Async thunk for uploading gallery images
export const uploadGalleryImages = createAsyncThunk(
  'gallery/uploadImages',
  async (files, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(
        `${SERVER}/api/gallery/upload-multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Async thunk for fetching gallery images
export const fetchGalleryImages = createAsyncThunk(
  'gallery/fetchImages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/gallery');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  images: [],
  selectedFiles: [],
  uploadProgress: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setSelectedFiles: (state, action) => {
      state.selectedFiles = Array.isArray(action.payload)
        ? action.payload
        : Array.from(action.payload);
    },
    removeSelectedFile: (state, action) => {
      state.selectedFiles = state?.selectedFiles?.filter(
        (_, index) => index !== action.payload,
      );
    },
    clearSelectedFiles: (state) => {
      state.selectedFiles = [];
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Images
      .addCase(uploadGalleryImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadGalleryImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.images = [...state.images, ...action.payload.data];
        state.selectedFiles = [];
        state.uploadProgress = 100;
      })
      .addCase(uploadGalleryImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Images
      .addCase(fetchGalleryImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGalleryImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.images = action.payload.data;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedFiles,
  removeSelectedFile,
  clearSelectedFiles,
  setUploadProgress,
  resetUploadStatus,
} = gallerySlice.actions;

export default gallerySlice.reducer;

// Selectors
export const selectAllImages = (state) => state?.gallery?.images;
export const selectSelectedFiles = (state) => state?.gallery?.selectedFiles;
export const selectUploadProgress = (state) => state?.gallery?.uploadProgress;
export const selectGalleryStatus = (state) => state?.gallery?.status;
export const selectGalleryError = (state) => state?.gallery?.error;
