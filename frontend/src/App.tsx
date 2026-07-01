import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { fetchCurrentUser } from './store/authSlice';
import { fetchResumes, deleteResume, fetchResumeDetails } from './store/resumeSlice';
import { fetchJobDescriptions, deleteJobDescription, triggerAnalysis, fetchAnalysisReport, fetchAnalysisHistory } from './store/analysisSlice';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/layout/LandingPage';
import { ResumeUploader } from './components/resume/ResumeUploader';
import { ResumeHistory } from './components/resume/ResumeHistory';
import { ScoreDashboard } from './components/analysis/ScoreDashboard';
import { JDInput } from './components/jobs/JDInput';
import { MultiJDComparison } from './components/jobs/MultiJDComparison';
import { SettingsPage } from './components/settings/SettingsPage';
import { PricingPage } from './components/settings/PricingPage';
import { ChallengeView } from './components/challenge/ChallengeView';
import { 
  FileText, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Clock, 
  History, 
  FileSearch, 
  ArrowLeft
} from 'lucide-react';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { resumes, currentResume } = useAppSelector((state) => state.resume);
  const { jobDescriptions, currentAnalysis, analyses } = useAppSelector((state) => state.analysis);

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJDId, setSelectedJDId] = useState<string>('');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJDModal, setShowJDModal] = useState(false);
  const [pollingAnalysisId, setPollingAnalysisId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // Load initial lists on login
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
      dispatch(fetchResumes());
      dispatch(fetchJobDescriptions());
    }
  }, [isAuthenticated, dispatch]);

  // Handle polling when an analysis is in pending/processing state
  useEffect(() => {
    let intervalId: any;

    if (pollingAnalysisId) {
      intervalId = setInterval(async () => {
        const result = await dispatch(fetchAnalysisReport(pollingAnalysisId));
        if (fetchAnalysisReport.fulfilled.match(result)) {
          const report = result.payload;
          if (report.status === 'complete' || report.status === 'failed') {
            setPollingAnalysisId(null);
            // Refresh history for the resume
            if (selectedResumeId) {
              dispatch(fetchAnalysisHistory(selectedResumeId));
            }
          }
        } else {
          setPollingAnalysisId(null);
        }
      }, 2500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollingAnalysisId, dispatch, selectedResumeId]);

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    dispatch(fetchResumeDetails(id));
    dispatch(fetchAnalysisHistory(id));
    setSelectedJDId('');
  };

  const handleStartScan = async () => {
    if (!selectedResumeId || !selectedJDId) return;
    
    const result = await dispatch(triggerAnalysis({
      resumeId: selectedResumeId,
      jobDescriptionIds: [selectedJDId],
    }));

    if (triggerAnalysis.fulfilled.match(result) && result.payload.length > 0) {
      const pendingAnalysis = result.payload[0];
      setPollingAnalysisId(pendingAnalysis.id);
      dispatch(fetchAnalysisReport(pendingAnalysis.id));
    }
  };

  // If user is not authenticated, render landing page or login page
  if (!isAuthenticated) {
    if (showAuth) {
      return <AuthPage onClose={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <Layout 
      currentTab={currentTab} 
      setCurrentTab={(tab) => {
        setCurrentTab(tab);
        setSelectedResumeId(null); // Clear selected candidate when switching top tabs
      }}
      onQuickUpload={() => setShowUploadModal(true)}
    >
      {/* 1. TALENT DASHBOARD VIEW */}
      {currentTab === 'dashboard' && (
        <div className="pb-8">
          {!selectedResumeId ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
              {/* Dashboard Left Side: Welcome banner & Candidate List */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero Greeting banner */}
                <div className="rounded-[32px] p-10 bg-gradient-to-br from-slate-900 to-indigo-900 text-white relative overflow-hidden shadow-xl ring-1 ring-white/10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.1),transparent_45%)]" />
                  <div className="relative z-10 max-w-lg space-y-4">
                    <h2 className="text-2xl font-bold font-display">Candidate Sourcing Hub</h2>
                    <p className="text-[13px] text-indigo-100/90 leading-relaxed font-medium">
                      Verify compatibility, scan legacy format parameters, and grade structural experience bullets against hiring needs.
                    </p>
                  </div>
                </div>

                {/* Candidate Directory list */}
                <div className="skeuo-panel p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Active Candidate Files</h3>
                      <p className="text-[11px] text-slate-600 mt-1 font-medium">Primary uploaded resumes ready for evaluation.</p>
                    </div>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white skeuo-raised-accent px-5 py-2.5 rounded-full transition-all active:skeuo-pressed"
                    >
                      <Plus className="h-4 w-4" /> Add File
                    </button>
                  </div>

                  <div className="space-y-4 pt-2">
                    {resumes.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-600 font-bold skeuo-pressed rounded-3xl">
                        No resumes uploaded yet. Click "Add File" to start.
                      </div>
                    ) : (
                      resumes.map((resume) => (
                        <div key={resume.id} className="p-4 skeuo-pressed rounded-2xl flex items-center justify-between group transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-12 w-12 rounded-xl skeuo-raised text-slate-600 flex items-center justify-center flex-shrink-0 group-hover:text-indigo-600 transition-colors">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                {resume.filename}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-1 font-bold">
                                Version {resume.version_number} <span className="mx-1">•</span> {new Date(resume.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSelectResume(resume.id)}
                              className="h-10 px-5 skeuo-raised text-xs font-bold rounded-full text-slate-800 hover:text-indigo-600 transition-all cursor-pointer flex items-center gap-1.5 active:skeuo-pressed"
                            >
                              Open Profile
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                alert("Trash button clicked! ID: " + resume.id);
                                e.stopPropagation();
                                e.preventDefault();
                                dispatch(deleteResume(resume.id)).unwrap().catch(err => alert("Error deleting: " + err));
                              }}
                              title="Delete Resume"
                              className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all cursor-pointer relative z-50"
                            >
                              <Trash2 className="h-4.5 w-4.5 pointer-events-none" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Dashboard Right Side: Active Job Openings */}
              <div className="space-y-8">
                <div className="skeuo-panel p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Job Openings</h3>
                      <p className="text-[11px] text-slate-600 mt-1 font-medium">Configure roles to scan against.</p>
                    </div>
                    <button
                      onClick={() => setShowJDModal(true)}
                      className="flex items-center justify-center h-10 w-10 text-xs font-bold text-white skeuo-raised-accent rounded-full transition-all active:skeuo-pressed"
                      title="Create Opening"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4 pt-2">
                    {jobDescriptions.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-600 font-bold skeuo-pressed rounded-3xl">
                        No active openings.
                      </div>
                    ) : (
                      jobDescriptions.map((jd) => (
                        <div key={jd.id} className="skeuo-pressed rounded-[20px] p-5 space-y-4 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{jd.title}</h4>
                              <p className="text-[11px] text-slate-600 mt-1 font-bold truncate">{jd.company}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                dispatch(deleteJobDescription(jd.id)).unwrap().catch(err => alert("Error deleting: " + err));
                              }}
                              className="p-2 rounded-full text-slate-500 hover:text-rose-600 skeuo-raised active:skeuo-pressed transition-all cursor-pointer shrink-0 relative z-50"
                            >
                              <Trash2 className="h-4 w-4 pointer-events-none" />
                            </button>
                          </div>
                          
                          {/* Extracted requirements tags */}
                          {jd.required_skills && jd.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {jd.required_skills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-[9px] font-bold text-slate-700 skeuo-raised px-3 py-1 rounded-full">
                                  {skill}
                                </span>
                              ))}
                              {jd.required_skills.length > 3 && (
                                <span className="text-[9px] font-bold text-indigo-600 skeuo-pressed px-3 py-1 rounded-full flex items-center justify-center">
                                  +{jd.required_skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Candidate Profile Report Page */
            <div className="space-y-8 animate-fade-in">
              {/* Back CTA bar */}
              <div className="flex items-center justify-between skeuo-panel p-4 px-6">
                <button
                  onClick={() => setSelectedResumeId(null)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-white transition-colors cursor-pointer skeuo-raised px-5 py-2.5 rounded-full active:skeuo-pressed"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                  <span>Back to directory</span>
                </button>
                
                {/* Trigger version history component for this resume */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Actions:</span>
                  <button 
                    onClick={() => {
                      // Toggle to show version diff section
                      setCurrentTab('resumes');
                    }}
                    className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full text-indigo-600 transition-all cursor-pointer skeuo-raised active:skeuo-pressed"
                  >
                    <History className="h-4 w-4" />
                    Revisions & Diff
                  </button>
                </div>
              </div>

              {/* Layout splits: Sidebar setup & main Score report */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Profile panel side bar (linking jobs, triggering runs) */}
                <div className="lg:col-span-1 space-y-8 skeuo-panel p-8">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Scan Setup</h3>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">Select a role template to execute similarity checks.</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3 pl-2">Target Job Openings</label>
                      <select
                        value={selectedJDId}
                        onChange={(e) => setSelectedJDId(e.target.value)}
                        className="w-full h-12 px-5 skeuo-pressed rounded-[20px] text-xs font-bold text-slate-900 focus:outline-none transition-all"
                      >
                        <option value="">-- Choose opening --</option>
                        {jobDescriptions.map((jd) => (
                          <option key={jd.id} value={jd.id}>
                            {jd.title} ({jd.company})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleStartScan}
                      disabled={!selectedJDId || !!pollingAnalysisId}
                      className={`w-full h-12 text-white text-xs font-bold rounded-[20px] transition-all flex items-center justify-center gap-2 ${
                        !selectedJDId || !!pollingAnalysisId
                          ? 'bg-[#2f2016] opacity-50 cursor-not-allowed'
                          : 'skeuo-raised-accent cursor-pointer active:skeuo-pressed'
                      }`}
                    >
                      {pollingAnalysisId ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <FileSearch className="h-4 w-4" />
                          <span>Scan Compatibility</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary list of historical analyses for this resume */}
                  <div className="pt-8 border-t border-[#4a3424]/50 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 pl-2">
                      <Clock className="h-4 w-4" />
                      Run History
                    </h4>
                    
                    <div className="space-y-3 max-h-56 overflow-y-auto hide-scrollbar p-1">
                      {analyses.length === 0 ? (
                        <span className="text-[10px] text-slate-500 block font-bold text-center py-4">No scan reports run.</span>
                      ) : (
                        analyses.map((an) => (
                          <button
                             key={an.id}
                             onClick={() => dispatch(fetchAnalysisReport(an.id))}
                             className="w-full text-left p-4 rounded-2xl skeuo-pressed flex justify-between items-center text-xs font-bold text-slate-800 hover:text-white transition-all cursor-pointer hover:bg-[#5C432E]/50"
                          >
                            <span>Report {an.id.slice(0, 8)}</span>
                            <span className={`text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              an.status === 'complete' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-amber-100 text-amber-700 animate-pulse font-bold'
                            }`}>
                              {an.status}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Report Display Pane */}
                <div className="lg:col-span-3">
                  {currentAnalysis ? (
                    <ScoreDashboard 
                      report={currentAnalysis} 
                      resumeFilename={currentResume?.filename}
                      jobTitle={jobDescriptions.find((jd) => jd.id === currentAnalysis.job_description_id)?.title || 'Job Description'}
                    />
                  ) : (
                    <div className="skeuo-panel p-16 text-center shadow-sm flex flex-col items-center justify-center gap-6">
                      <div className="h-20 w-20 skeuo-pressed rounded-[24px] flex items-center justify-center text-slate-500">
                        <FileSearch className="h-10 w-10" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Select Profile and Run Scan</h3>
                        <p className="text-xs text-slate-600 mt-2 font-medium">Select one of your target jobs on the left panel to execute NLP grading checks.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. RESUME DIRECTORY & HISTORY VIEW */}
      {currentTab === 'resumes' && (
        <div className="space-y-8 animate-fade-in pb-8">
          <div className="skeuo-panel p-8">
            <h2 className="text-2xl font-bold font-display text-slate-900">Resume & Revisions Directory</h2>
            <p className="text-xs text-slate-600 mt-1.5 font-medium">
              Analyze document revision trees and run side-by-side diff comparisons.
            </p>
          </div>

          <div className="skeuo-panel p-8 space-y-6">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2">Select candidate resume to explore</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {resumes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectResume(r.id)}
                  className={`p-6 rounded-[24px] text-left transition-all group cursor-pointer ${
                    selectedResumeId === r.id ? 'skeuo-pressed' : 'skeuo-raised hover:skeuo-pressed'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${
                    selectedResumeId === r.id ? 'skeuo-raised text-indigo-600' : 'skeuo-pressed text-slate-500 group-hover:text-indigo-500'
                  }`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{r.filename}</h4>
                  <p className="text-[10px] text-slate-600 mt-1.5 font-bold">v{r.version_number} <span className="mx-1">•</span> {new Date(r.uploaded_at).toLocaleDateString()}</p>
                </button>
              ))}
              {resumes.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-slate-600 font-bold skeuo-pressed rounded-3xl">
                  No resumes found in database.
                </div>
              )}
            </div>
          </div>

          {selectedResumeId && (
            <ResumeHistory resumeId={selectedResumeId} />
          )}
        </div>
      )}

      {/* 3. JOB OPENINGS VIEW */}
      {currentTab === 'jobs' && (
        <div className="space-y-8 animate-fade-in pb-8">
          <div className="skeuo-panel p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900">Job Descriptions Manager</h2>
              <p className="text-xs text-slate-600 mt-1.5 font-medium">
                Upload and inspect requirements, categories, and key skills compiled from target descriptions.
              </p>
            </div>
            <button
              onClick={() => setShowJDModal(true)}
              className="flex items-center gap-2 text-white text-xs font-bold px-6 py-3.5 rounded-full transition-all cursor-pointer skeuo-raised-accent active:skeuo-pressed whitespace-nowrap"
            >
              <Plus className="h-4.5 w-4.5" /> Add Description
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobDescriptions.map((jd) => (
              <div key={jd.id} className="skeuo-panel p-8 flex flex-col justify-between transition-all group">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest skeuo-pressed px-3 py-1.5 rounded-full inline-block">
                        {jd.detected_role || 'General Role'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-4 truncate max-w-[200px]" title={jd.title || 'Job Opening'}>
                        {jd.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 font-bold">{jd.company}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        dispatch(deleteJobDescription(jd.id)).unwrap().catch(err => alert("Error deleting: " + err));
                      }}
                      className="h-10 w-10 rounded-full text-slate-500 hover:text-rose-600 transition-all cursor-pointer flex items-center justify-center skeuo-raised active:skeuo-pressed shrink-0 relative z-50"
                    >
                      <Trash2 className="h-4 w-4 pointer-events-none" />
                    </button>
                  </div>

                  {/* Skills tags list */}
                  {jd.required_skills && (
                    <div className="space-y-4 pt-4 border-t border-[#4a3424]/50">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block pl-1">Target Skills</span>
                      <div className="flex flex-wrap gap-2">
                        {jd.required_skills.map((skill, i) => (
                          <span key={i} className="text-[9px] font-bold text-slate-800 skeuo-raised px-3 py-1.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-5 border-t border-[#4a3424]/50 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span className="skeuo-pressed px-3 py-1.5 rounded-full">Saved: {new Date(jd.created_at).toLocaleDateString()}</span>
                  <span className="text-indigo-600 flex items-center gap-1 cursor-pointer skeuo-raised px-3 py-1.5 rounded-full active:skeuo-pressed">
                    Explore matches
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
            
            {jobDescriptions.length === 0 && (
              <div className="col-span-full skeuo-panel p-16 text-center text-xs text-slate-600 font-bold">
                No job descriptions uploaded. Create one above to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. COMPATIBILITY COMPARISON MATRIX VIEW */}
      {currentTab === 'comparisons' && (
        <MultiJDComparison />
      )}

      {/* 5. CHALLENGE DATASET PROCESSOR */}
      {currentTab === 'challenge' && (
        <ChallengeView />
      )}

      {/* 6. SETTINGS VIEW */}
      {currentTab === 'settings' && (
        <SettingsPage />
      )}

      {/* 7. PRICING VIEW */}
      {currentTab === 'pricing' && (
        <PricingPage />
      )}

      {/* MODALS */}
      {/* Upload resume modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[999] animate-fade-in">
          <ResumeUploader 
            onUploadSuccess={() => {
              setShowUploadModal(false);
              dispatch(fetchResumes());
            }} 
            onClose={() => setShowUploadModal(false)} 
          />
        </div>
      )}

      {/* Upload Job description modal */}
      {showJDModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[999] animate-fade-in">
          <JDInput 
            onSuccess={() => {
              setShowJDModal(false);
              dispatch(fetchJobDescriptions());
            }}
            onClose={() => setShowJDModal(false)}
          />
        </div>
      )}
    </Layout>
  );
}

export default App;
