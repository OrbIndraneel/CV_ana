import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';

export interface JobDescription {
  id: string;
  user_id: string;
  title: string | null;
  company: string | null;
  raw_text: string;
  detected_role: string | null;
  required_skills: string[] | null;
  created_at: string;
}

export interface AnalysisStatus {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export interface AnalysisReport {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  created_at: string;
  completed_at: string | null;
  resume_id: string;
  job_description_id: string | null;
  overall_score: number | null;
  ats_score: number | null;
  keyword_score: number | null;
  semantic_score: number | null;
  bullet_quality_score: number | null;
  formatting_score: number | null;
  role_detected: string | null;
  ats_issues: Array<{
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }> | null;
  keyword_matches: Array<{
    keyword: string;
    found: boolean;
    synonyms_used: string[];
    importance: string;
  }> | null;
  bullet_feedback: Array<{
    original: string;
    score: number;
    impact: string;
    issues: string[];
    suggestions: string[];
  }> | null;
  gap_analysis: Array<{
    gap_duration_days: number;
    description: string;
    severity: string;
    start_date: string;
    end_date: string;
  }> | null;
  score_breakdown: Record<string, any> | null;
}

interface AnalysisState {
  jobDescriptions: JobDescription[];
  analyses: AnalysisStatus[];
  currentAnalysis: AnalysisReport | null;
  comparisonResults: AnalysisReport[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  jobDescriptions: [],
  analyses: [],
  currentAnalysis: null,
  comparisonResults: [],
  loading: false,
  error: null,
};

export const fetchJobDescriptions = createAsyncThunk(
  'analysis/fetchJDs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<JobDescription[]>('/jobs/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch job descriptions');
    }
  }
);

export const createJobDescription = createAsyncThunk(
  'analysis/createJD',
  async (
    payload: { title?: string; company?: string; raw_text: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post<JobDescription>('/jobs/', payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to create job description');
    }
  }
);

export const deleteJobDescription = createAsyncThunk(
  'analysis/deleteJD',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/jobs/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete job description');
    }
  }
);

export const triggerAnalysis = createAsyncThunk(
  'analysis/trigger',
  async (
    payload: { resumeId: string; jobDescriptionIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post<AnalysisStatus[]>('/analysis/start', {
        resume_id: payload.resumeId,
        job_description_ids: payload.jobDescriptionIds,
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to start resume analysis');
    }
  }
);

export const fetchAnalysisReport = createAsyncThunk(
  'analysis/fetchReport',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<AnalysisReport>(`/analysis/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch analysis report');
    }
  }
);

export const fetchAnalysisHistory = createAsyncThunk(
  'analysis/fetchHistory',
  async (resumeId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<AnalysisStatus[]>(`/analysis/resume/${resumeId}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch analysis history');
    }
  }
);

export const compareResumeScores = createAsyncThunk(
  'analysis/compare',
  async (
    payload: { resumeId: string; jobDescriptionIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post<AnalysisReport[]>('/analysis/compare', {
        resume_id: payload.resumeId,
        job_description_ids: payload.jobDescriptionIds,
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to compare resume scores');
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
      state.comparisonResults = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch JDs
    builder.addCase(fetchJobDescriptions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchJobDescriptions.fulfilled, (state, action: PayloadAction<JobDescription[]>) => {
      state.loading = false;
      state.jobDescriptions = action.payload;
    });
    builder.addCase(fetchJobDescriptions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create JD
    builder.addCase(createJobDescription.fulfilled, (state, action: PayloadAction<JobDescription>) => {
      state.jobDescriptions.unshift(action.payload);
    });

    // Delete JD
    builder.addCase(deleteJobDescription.fulfilled, (state, action: PayloadAction<string>) => {
      state.jobDescriptions = state.jobDescriptions.filter((jd) => jd.id !== action.payload);
    });

    // Trigger Analysis
    builder.addCase(triggerAnalysis.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(triggerAnalysis.fulfilled, (state, action: PayloadAction<AnalysisStatus[]>) => {
      state.loading = false;
      // Add the new analysis runs to status tracking
      state.analyses = [...action.payload, ...state.analyses];
    });
    builder.addCase(triggerAnalysis.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Report
    builder.addCase(fetchAnalysisReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAnalysisReport.fulfilled, (state, action: PayloadAction<AnalysisReport>) => {
      state.loading = false;
      state.currentAnalysis = action.payload;
      
      // Update individual status record in the list if present
      const index = state.analyses.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.analyses[index] = {
          id: action.payload.id,
          status: action.payload.status,
          created_at: action.payload.created_at,
          completed_at: action.payload.completed_at,
        };
      }
    });
    builder.addCase(fetchAnalysisReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch History
    builder.addCase(fetchAnalysisHistory.fulfilled, (state, action: PayloadAction<AnalysisStatus[]>) => {
      state.analyses = action.payload;
    });

    // Compare
    builder.addCase(compareResumeScores.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(compareResumeScores.fulfilled, (state, action: PayloadAction<AnalysisReport[]>) => {
      state.loading = false;
      state.comparisonResults = action.payload;
    });
    builder.addCase(compareResumeScores.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
