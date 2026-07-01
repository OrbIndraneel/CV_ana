import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { compareResumeScores } from '../../store/analysisSlice';
import { Layers, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export const MultiJDComparison: React.FC = () => {
  const dispatch = useAppDispatch();
  const { resumes } = useAppSelector((state) => state.resume);
  const { jobDescriptions, comparisonResults, loading, error } = useAppSelector((state) => state.analysis);

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJDIds, setSelectedJDIds] = useState<string[]>([]);

  const handleJDCheckboxChange = (jdId: string) => {
    if (selectedJDIds.includes(jdId)) {
      setSelectedJDIds(selectedJDIds.filter((id) => id !== jdId));
    } else {
      if (selectedJDIds.length >= 5) {
        alert('You can compare a maximum of 5 job openings at once.');
        return;
      }
      setSelectedJDIds([...selectedJDIds, jdId]);
    }
  };

  const handleCompare = () => {
    if (selectedResumeId && selectedJDIds.length > 0) {
      dispatch(compareResumeScores({
        resumeId: selectedResumeId,
        jobDescriptionIds: selectedJDIds,
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Configuration Header Card */}
      <div className="skeuo-panel p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold font-display text-slate-900">Role Compatibility Matrix</h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Compare a single resume across multiple job openings to identify the best structural alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {/* Resume Selection */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">
              Select Candidate Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full h-12 px-5 skeuo-pressed rounded-full text-xs text-slate-900 font-bold focus:outline-none transition-all"
            >
              <option value="">-- Choose Resume --</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.filename} (v{r.version_number})
                </option>
              ))}
            </select>
          </div>

          {/* Job Openings Checklist */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">
              Select Job Openings ({selectedJDIds.length} chosen)
            </label>
            <div className="skeuo-pressed rounded-3xl p-3 max-h-[140px] overflow-y-auto space-y-1.5 hide-scrollbar">
              {jobDescriptions.length === 0 ? (
                <span className="text-xs text-slate-500 p-2 block font-bold text-center mt-4">No jobs configured yet.</span>
              ) : (
                jobDescriptions.map((jd) => (
                  <label key={jd.id} className="flex items-center gap-3 px-3 py-2 hover:bg-[#5C432E]/50 rounded-full cursor-pointer text-xs text-slate-800 font-bold transition-all">
                    <input
                      type="checkbox"
                      checked={selectedJDIds.includes(jd.id)}
                      onChange={() => handleJDCheckboxChange(jd.id)}
                      className="rounded border-[#3a281c] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="truncate">{jd.title} ({jd.company})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Trigger Button */}
          <div className="md:col-span-1">
            <button
              onClick={handleCompare}
              disabled={!selectedResumeId || selectedJDIds.length === 0 || loading}
              className={`w-full h-12 text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 ${
                !selectedResumeId || selectedJDIds.length === 0 || loading
                  ? 'bg-[#2f2016] opacity-50 cursor-not-allowed'
                  : 'skeuo-raised-accent cursor-pointer active:skeuo-pressed'
              }`}
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Layers className="h-4.5 w-4.5" />
                  Compare Roles
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="skeuo-pressed border-l-4 border-rose-500 rounded-2xl p-5 text-xs text-rose-600 flex items-center gap-3 font-bold animate-slide-up">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparisons Matrix Grid */}
      {comparisonResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch animate-slide-up">
          {comparisonResults.map((result) => {
            const matchedJD = jobDescriptions.find((jd) => jd.id === result.job_description_id);
            const scoreVal = Math.round(result.overall_score || 0);
            
            return (
              <div 
                key={result.id} 
                className="skeuo-panel p-8 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                  scoreVal >= 80 
                    ? 'from-emerald-400 to-indigo-500' 
                    : scoreVal >= 60 
                    ? 'from-amber-400 to-indigo-500' 
                    : 'from-rose-400 to-amber-500'
                }`} />

                <div>
                  <div className="mb-6">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest skeuo-pressed px-3 py-1.5 rounded-full inline-block">
                      {result.role_detected || 'Software Role'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-4 truncate">
                      {matchedJD?.title || 'Job Opening'}
                    </h4>
                    <p className="text-xs text-slate-600 font-bold mt-1">{matchedJD?.company || 'Company'}</p>
                  </div>

                  {/* Compatibility Circle */}
                  <div className="my-8 flex items-center gap-5 skeuo-pressed p-4 rounded-3xl">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center font-display font-bold text-xl skeuo-raised ${
                      scoreVal >= 80 
                        ? 'text-emerald-600' 
                        : scoreVal >= 60 
                        ? 'text-amber-600' 
                        : 'text-rose-600'
                    }`}>
                      {scoreVal}%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Talent Alignment</p>
                      <p className="text-[10px] text-slate-600 mt-1 font-bold">Weighted average across dimensions.</p>
                    </div>
                  </div>

                  {/* Sector Scores progress lists */}
                  <div className="space-y-4 pt-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Sector Scores</h5>
                    
                    <div className="space-y-3">
                      {/* Keywords Match */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-700 font-bold mb-1.5 pl-2">
                          <span>Keywords Match</span>
                          <span>{Math.round(result.keyword_score || 0)}%</span>
                        </div>
                        <div className="h-2 w-full skeuo-pressed rounded-full overflow-hidden p-0.5">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                            style={{ width: `${result.keyword_score || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Semantic Similarity */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-700 font-bold mb-1.5 pl-2">
                          <span>Semantic Fit</span>
                          <span>{Math.round(result.semantic_score || 0)}%</span>
                        </div>
                        <div className="h-2 w-full skeuo-pressed rounded-full overflow-hidden p-0.5">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                            style={{ width: `${result.semantic_score || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Bullet Quality */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-700 font-bold mb-1.5 pl-2">
                          <span>Bullet Quality</span>
                          <span>{Math.round(result.bullet_quality_score || 0)}%</span>
                        </div>
                        <div className="h-2 w-full skeuo-pressed rounded-full overflow-hidden p-0.5">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                            style={{ width: `${result.bullet_quality_score || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-[#4a3424]/50 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Audited
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 cursor-pointer skeuo-pressed px-3 py-1.5 rounded-full group-hover:skeuo-raised transition-all">
                    View full report
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
