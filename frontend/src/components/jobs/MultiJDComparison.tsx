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
    <div className="space-y-8 animate-fade-in">
      {/* Configuration Header Card */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-800">Role Compatibility Matrix</h3>
          <p className="text-xs text-slate-500 mt-1">
            Compare a single resume across multiple job openings to identify the best structural alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Resume Selection */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Select Candidate Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-205 rounded-full text-xs text-slate-700 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-105 transition-all"
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
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Select Job Openings ({selectedJDIds.length} chosen)
            </label>
            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-2.5 max-h-[120px] overflow-y-auto space-y-1.5">
              {jobDescriptions.length === 0 ? (
                <span className="text-xs text-slate-400 p-2 block font-semibold">No jobs configured yet.</span>
              ) : (
                jobDescriptions.map((jd) => (
                  <label key={jd.id} className="flex items-center gap-2 px-2.5 py-1 hover:bg-slate-100/60 rounded-full cursor-pointer text-xs text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedJDIds.includes(jd.id)}
                      onChange={() => handleJDCheckboxChange(jd.id)}
                      className="rounded border-slate-305 text-indigo-650 focus:ring-indigo-550 h-3.5 w-3.5"
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
              className="w-full h-11 bg-gray-900 hover:bg-indigo-650 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
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
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-550 flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparisons Matrix Grid */}
      {comparisonResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch animate-slide-up">
          {comparisonResults.map((result) => {
            const matchedJD = jobDescriptions.find((jd) => jd.id === result.job_description_id);
            const scoreVal = Math.round(result.overall_score || 0);
            
            return (
              <div 
                key={result.id} 
                className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  scoreVal >= 80 
                    ? 'from-emerald-400 to-indigo-500' 
                    : scoreVal >= 60 
                    ? 'from-amber-400 to-indigo-500' 
                    : 'from-rose-400 to-amber-500'
                }`} />

                <div>
                  <div className="mb-4">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                      {result.role_detected || 'Software Role'}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1.5 truncate">
                      {matchedJD?.title || 'Job Opening'}
                    </h4>
                    <p className="text-xs text-slate-500">{matchedJD?.company || 'Company'}</p>
                  </div>

                  {/* Compatibility Circle */}
                  <div className="my-6 flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center font-display font-bold text-xl ${
                      scoreVal >= 80 
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20' 
                        : scoreVal >= 60 
                        ? 'border-amber-500 text-amber-600 bg-amber-50/20' 
                        : 'border-rose-500 text-rose-500 bg-rose-50/20'
                    }`}>
                      {scoreVal}%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Talent Alignment</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Weighted average across all NLP dimensions.</p>
                    </div>
                  </div>

                  {/* Sector Scores progress lists */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sector Scores</h5>
                    
                    <div className="space-y-2">
                      {/* Keywords Match */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                          <span>Keywords Match</span>
                          <span>{Math.round(result.keyword_score || 0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all duration-300" 
                            style={{ width: `${result.keyword_score || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Semantic Similarity */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                          <span>Semantic Fit</span>
                          <span>{Math.round(result.semantic_score || 0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-300" 
                            style={{ width: `${result.semantic_score || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Bullet Quality */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                          <span>Bullet Quality</span>
                          <span>{Math.round(result.bullet_quality_score || 0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-300" 
                            style={{ width: `${result.bullet_quality_score || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Audited
                  </span>
                  <span className="flex items-center gap-0.5 text-indigo-600 hover:text-indigo-755 hover:underline cursor-pointer">
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
