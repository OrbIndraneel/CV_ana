import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchResumeVersions, diffResumeVersions, clearDiff } from '../../store/resumeSlice';
import { GitCommit, ArrowRight, RefreshCcw, FileText, Check, Plus, Minus } from 'lucide-react';

interface ResumeHistoryProps {
  resumeId: string;
}

export const ResumeHistory: React.FC<ResumeHistoryProps> = ({ resumeId }) => {
  const dispatch = useAppDispatch();
  const { versions, diffResult, loading } = useAppSelector((state) => state.resume);

  const [versionA, setVersionA] = useState('');
  const [versionB, setVersionB] = useState('');

  useEffect(() => {
    if (resumeId) {
      dispatch(fetchResumeVersions(resumeId));
      dispatch(clearDiff());
      setVersionA('');
      setVersionB('');
    }
  }, [resumeId, dispatch]);

  const handleDiffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (versionA && versionB) {
      dispatch(diffResumeVersions({ id1: versionA, id2: versionB }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
      {/* Left panel: Version chain timeline & Diff trigger */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-800">Version History</h3>
          <p className="text-xs text-slate-500 mt-1">
            Track document revisions and compare differences line-by-line.
          </p>
        </div>

        {/* Timeline representation */}
        <div className="relative border-l border-slate-200 pl-6 space-y-6 ml-2 py-2">
          {versions.map((ver) => (
            <div key={ver.id} className="relative">
              <span className="absolute -left-[31px] top-0.5 bg-white border-2 border-indigo-650 rounded-full h-4.5 w-4.5 flex items-center justify-center">
                <GitCommit className="h-2.5 w-2.5 text-indigo-650" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">
                    Version {ver.version_number}
                  </span>
                  <span className="text-[10px] text-slate-450 bg-slate-100/80 px-2 py-0.5 rounded-full font-bold">
                    {new Date(ver.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate max-w-xs font-semibold">{ver.filename}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Diff configuration form */}
        {versions.length >= 2 && (
          <form onSubmit={handleDiffSubmit} className="pt-4 border-t border-slate-200/60 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compare Revisions</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Base (A)</label>
                <select
                  value={versionA}
                  onChange={(e) => setVersionA(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-705 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                >
                  <option value="">Select v...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Compare (B)</label>
                <select
                  value={versionB}
                  onChange={(e) => setVersionB(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-705 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                >
                  <option value="">Select v...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!versionA || !versionB || loading}
              className="w-full h-10 bg-gray-900 hover:bg-indigo-650 disabled:bg-slate-200 disabled:text-slate-400 active:bg-gray-955 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>Compare Diff</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Right panel: Diff comparison board */}
      <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 h-[500px] flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-800">Changes Summary</h3>
            <p className="text-xs text-slate-505 mt-1">
              Line by line comparisons of textual revisions.
            </p>
          </div>
          {diffResult && (
            <button
              onClick={() => dispatch(clearDiff())}
              className="text-xs font-bold text-indigo-650 hover:text-indigo-550 transition-all cursor-pointer hover:underline"
            >
              Clear diff
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto border border-slate-900 rounded-2xl bg-slate-955 p-4 font-mono text-xs leading-relaxed text-slate-300">
          {!diffResult ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <FileText className="h-10 w-10 text-slate-600 mb-3" />
              <p className="font-semibold text-xs text-slate-405">Select base and comparison versions and hit "Compare Diff".</p>
              <p className="text-[10px] text-slate-500 mt-1">Requires at least two resume revisions.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {diffResult.map((seg, idx) => {
                const isAdd = seg.type === 'insert';
                const isDel = seg.type === 'delete';
                
                return (
                  <div 
                    key={idx} 
                    className={`flex items-start py-0.5 px-2 rounded ${
                      isAdd 
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                        : isDel 
                        ? 'bg-rose-500/10 text-rose-400 line-through font-medium' 
                        : 'text-slate-300 font-medium'
                    }`}
                  >
                    <span className="w-5 select-none opacity-50 flex items-center mt-1 flex-shrink-0">
                      {isAdd ? <Plus className="h-3 w-3" /> : isDel ? <Minus className="h-3 w-3" /> : <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="whitespace-pre-wrap">{seg.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
