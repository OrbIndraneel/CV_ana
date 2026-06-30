import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  version_number: number;
  parent_resume_id: string | null;
  uploaded_at: string;
}

export interface ResumeDetail extends Resume {
  raw_text: string;
  parsed_sections: Record<string, any> | null;
}

export interface DiffSegment {
  type: 'insert' | 'delete' | 'equal';
  value: string;
}

interface ResumeState {
  resumes: Resume[];
  currentResume: ResumeDetail | null;
  versions: Resume[];
  diffResult: any[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  resumes: [],
  currentResume: null,
  versions: [],
  diffResult: null,
  loading: false,
  error: null,
};

export const fetchResumes = createAsyncThunk(
  'resume/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Resume[]>('/resumes/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch resumes');
    }
  }
);

export const fetchResumeDetails = createAsyncThunk(
  'resume/fetchDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ResumeDetail>(`/resumes/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch resume details');
    }
  }
);

export const fetchResumeVersions = createAsyncThunk(
  'resume/fetchVersions',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Resume[]>(`/resumes/${id}/versions`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch resume versions');
    }
  }
);

export const uploadResume = createAsyncThunk(
  'resume/upload',
  async (
    payload: { file: File; parentResumeId?: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.parentResumeId) {
        formData.append('parent_resume_id', payload.parentResumeId);
      }

      const response = await apiClient.post<ResumeDetail>('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Resume upload failed');
    }
  }
);

export const deleteResume = createAsyncThunk(
  'resume/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/resumes/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete resume');
    }
  }
);

export const diffResumeVersions = createAsyncThunk(
  'resume/diff',
  async (
    payload: { id1: string; id2: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get<any[]>(`/resumes/${payload.id1}/diff/${payload.id2}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to diff resume versions');
    }
  }
);

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    clearCurrentResume: (state) => {
      state.currentResume = null;
      state.versions = [];
      state.diffResult = null;
    },
    clearDiff: (state) => {
      state.diffResult = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Root Resumes
    builder.addCase(fetchResumes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchResumes.fulfilled, (state, action: PayloadAction<Resume[]>) => {
      state.loading = false;
      state.resumes = action.payload;
    });
    builder.addCase(fetchResumes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Details
    builder.addCase(fetchResumeDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchResumeDetails.fulfilled, (state, action: PayloadAction<ResumeDetail>) => {
      state.loading = false;
      state.currentResume = action.payload;
    });
    builder.addCase(fetchResumeDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Versions
    builder.addCase(fetchResumeVersions.fulfilled, (state, action: PayloadAction<Resume[]>) => {
      state.versions = action.payload;
    });

    // Upload Resume
    builder.addCase(uploadResume.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadResume.fulfilled, (state, action: PayloadAction<ResumeDetail>) => {
      state.loading = false;
      state.currentResume = action.payload;
      
      // If parent_resume_id is null, it's a new root resume
      if (!action.payload.parent_resume_id) {
        state.resumes.unshift(action.payload);
      }
    });
    builder.addCase(uploadResume.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Resume
    builder.addCase(deleteResume.fulfilled, (state, action: PayloadAction<string>) => {
      state.resumes = state.resumes.filter((r) => r.id !== action.payload);
      if (state.currentResume?.id === action.payload) {
        state.currentResume = null;
      }
    });

    // Diff
    builder.addCase(diffResumeVersions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(diffResumeVersions.fulfilled, (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.diffResult = action.payload;
    });
    builder.addCase(diffResumeVersions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentResume, clearDiff } = resumeSlice.actions;
export default resumeSlice.reducer;
