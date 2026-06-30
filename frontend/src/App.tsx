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
        <>
          {!selectedResumeId ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Dashboard Left Side: Welcome banner & Candidate List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hero Greeting banner */}
                <div className="rounded-3xl p-8 bg-gradient-to-r from-gray-900 via-slate-950 to-indigo-950 text-white relative overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.12),transparent_45%)]" />
                  <div className="relative z-10 max-w-md space-y-2">
                    <h2 className="text-xl font-bold font-display">Candidate Sourcing Hub</h2>
                    <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
                      Verify compatibility, scan legacy format parameters, and grade structural experience bullets against hiring needs.
                    </p>
                  </div>
                </div>

                {/* Candidate Directory list */}
                <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Active Candidate Files</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Primary uploaded resumes ready for evaluation.</p>
                    </div>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-550 hover:underline cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add File
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {resumes.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        No resumes uploaded yet. Click "Add File" to start.
                      </div>
                    ) : (
                      resumes.map((resume) => (
                        <div key={resume.id} className="py-3.5 flex items-center justify-between group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-slate-50 text-slate-450 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50/50 group-hover:text-indigo-600 transition-colors">
                              <FileText className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-850 truncate group-hover:text-indigo-600 transition-colors">
                                {resume.filename}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                Version {resume.version_number} • Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSelectResume(resume.id)}
                              className="h-8 px-4 border border-slate-205/60 hover:border-indigo-600 hover:bg-indigo-50/10 text-xs font-bold rounded-full text-slate-700 hover:text-indigo-650 transition-all cursor-pointer flex items-center gap-1"
                            >
                              Open Profile
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => dispatch(deleteResume(resume.id))}
                              title="Delete Resume"
                              className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer border border-transparent hover:border-rose-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Dashboard Right Side: Active Job Openings */}
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Active Job Openings</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Configure requirements to analyze candidates against.</p>
                    </div>
                    <button
                      onClick={() => setShowJDModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-550 hover:underline cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Create Opening
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {jobDescriptions.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        No active openings. Click "Create Opening" to set one up.
                      </div>
                    ) : (
                      jobDescriptions.map((jd) => (
                        <div key={jd.id} className="border border-slate-200/60 hover:border-slate-350 bg-white/30 rounded-2xl p-4 space-y-3 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-850 text-xs truncate max-w-[180px]">{jd.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{jd.company}</p>
                            </div>
                            <button
                              onClick={() => dispatch(deleteJobDescription(jd.id))}
                              className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          {/* Extracted requirements tags */}
                          {jd.required_skills && jd.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {jd.required_skills.slice(0, 4).map((skill, i) => (
                                <span key={i} className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full">
                                  {skill}
                                </span>
                              ))}
                              {jd.required_skills.length > 4 && (
                                <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50/60 px-2.5 py-0.5 rounded-full">
                                  +{jd.required_skills.length - 4} more
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
            <div className="space-y-8">
              {/* Back CTA bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedResumeId(null)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                  <span>Back to directory</span>
                </button>
                
                {/* Trigger version history component for this resume */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Actions:</span>
                  <button 
                    onClick={() => {
                      // Toggle to show version diff section
                      setCurrentTab('resumes');
                    }}
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold px-4 py-2 rounded-full text-slate-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <History className="h-4 w-4 text-slate-450" />
                    Revisions & Diff
                  </button>
                </div>
              </div>

              {/* Layout splits: Sidebar setup & main Score report */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Profile panel side bar (linking jobs, triggering runs) */}
                <div className="lg:col-span-1 space-y-6 bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 p-6 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Scan Setup</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Select a role template to execute similarity checks.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-2">Target Job Openings</label>
                      <select
                        value={selectedJDId}
                        onChange={(e) => setSelectedJDId(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
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
                      className="w-full h-11 bg-gray-900 hover:bg-indigo-650 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Run History
                    </h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {analyses.length === 0 ? (
                        <span className="text-[10px] text-slate-405 block p-1 font-semibold">No scan reports run.</span>
                      ) : (
                        analyses.map((an) => (
                          <button
                             key={an.id}
                             onClick={() => dispatch(fetchAnalysisReport(an.id))}
                             className="w-full text-left p-2.5 rounded-xl border border-slate-200/50 hover:bg-slate-100/50 flex justify-between items-center text-xs font-bold text-slate-600 hover:text-slate-850 hover:border-slate-300 transition-all cursor-pointer"
                          >
                            <span>Report {an.id.slice(0, 8)}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${
                              an.status === 'complete' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'bg-amber-50 text-amber-600 animate-pulse font-bold'
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
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
                      <FileSearch className="h-10 w-10 text-slate-400" />
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Select Profile and Run Scan</h3>
                        <p className="text-xs text-slate-500 mt-1">Select one of your target jobs on the left panel to execute NLP grading checks.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. RESUME DIRECTORY & HISTORY VIEW */}
      {currentTab === 'resumes' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">Resume & Revisions Directory</h2>
            <p className="text-xs text-slate-500 mt-1">
              Analyze document revision trees and run side-by-side diff comparisons.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select candidate resume to explore</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {resumes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectResume(r.id)}
                  className={`border-2 p-4 rounded-2xl text-left hover:border-indigo-600 transition-all group cursor-pointer ${
                    selectedResumeId === r.id ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200/80 bg-white/40'
                  }`}
                >
                  <FileText className={`h-8 w-8 mb-3 ${selectedResumeId === r.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  <h4 className="font-bold text-slate-800 text-xs truncate">{r.filename}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">v{r.version_number} • {new Date(r.uploaded_at).toLocaleDateString()}</p>
                </button>
              ))}
              {resumes.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800">Job Descriptions Manager</h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload and inspect requirements, categories, and key skills compiled from target descriptions.
              </p>
            </div>
            <button
              onClick={() => setShowJDModal(true)}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-indigo-650 active:bg-gray-950 text-white text-xs font-semibold px-4.5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Description
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobDescriptions.map((jd) => (
              <div key={jd.id} className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-650 uppercase tracking-widest bg-indigo-50/80 px-2 py-0.5 rounded-full">
                        {jd.detected_role || 'General Role'}
                      </span>
                      <h4 className="font-bold text-slate-850 text-sm mt-2 truncate max-w-[200px]" title={jd.title || 'Job Opening'}>
                        {jd.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{jd.company}</p>
                    </div>
                    <button
                      onClick={() => dispatch(deleteJobDescription(jd.id))}
                      className="p-1.5 rounded-full text-slate-450 hover:text-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Skills tags list */}
                  {jd.required_skills && (
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {jd.required_skills.map((skill, i) => (
                          <span key={i} className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-150 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Saved: {new Date(jd.created_at).toLocaleDateString()}</span>
                  <span className="text-indigo-650 flex items-center gap-0.5 hover:underline cursor-pointer">
                    Explore matches
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
            
            {jobDescriptions.length === 0 && (
              <div className="col-span-full bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 p-12 text-center text-xs text-slate-400 shadow-sm">
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

      {/* 5. SETTINGS VIEW */}
      {currentTab === 'settings' && (
        <SettingsPage />
      )}

      {/* 6. PRICING VIEW */}
      {currentTab === 'pricing' && (
        <PricingPage />
      )}

      {/* MODALS */}
      {/* Upload resume modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
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
