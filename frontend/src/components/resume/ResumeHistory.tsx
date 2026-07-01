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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in pb-8">
      {/* Left panel: Version chain timeline & Diff trigger */}
      <div className="skeuo-panel p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold font-display text-slate-900">Version History</h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Track document revisions and compare differences line-by-line.
          </p>
        </div>

        {/* Timeline representation */}
        <div className="relative border-l-2 border-[#4a3424]/50 pl-8 space-y-8 ml-2 py-2">
          {versions.map((ver) => (
            <div key={ver.id} className="relative group">
              <span className="absolute -left-[45px] top-0 skeuo-raised h-6 w-6 flex items-center justify-center rounded-full text-indigo-600 transition-all group-hover:scale-110">
                <GitCommit className="h-3.5 w-3.5" />
              </span>
              <div className="skeuo-pressed p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-900">
                    Version {ver.version_number}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-[#4a3424]/50 px-2 py-1 rounded-lg">
                    {new Date(ver.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 truncate max-w-xs font-bold">{ver.filename}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Diff configuration form */}
        {versions.length >= 2 && (
          <form onSubmit={handleDiffSubmit} className="pt-6 border-t border-[#4a3424]/50 space-y-6">
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2">Compare Revisions</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2 pl-2 tracking-wider">Base (A)</label>
                <select
                  value={versionA}
                  onChange={(e) => setVersionA(e.target.value)}
                  className="w-full h-12 px-4 skeuo-pressed rounded-[20px] text-xs font-bold text-slate-900 focus:outline-none transition-all"
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
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2 pl-2 tracking-wider">Compare (B)</label>
                <select
                  value={versionB}
                  onChange={(e) => setVersionB(e.target.value)}
                  className="w-full h-12 px-4 skeuo-pressed rounded-[20px] text-xs font-bold text-slate-900 focus:outline-none transition-all"
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
              className={`w-full h-12 text-white text-xs font-bold rounded-[20px] transition-all flex items-center justify-center gap-2 ${
                !versionA || !versionB || loading 
                  ? 'bg-[#2f2016] opacity-50 cursor-not-allowed' 
                  : 'skeuo-raised-accent cursor-pointer active:skeuo-pressed'
              }`}
            >
              {loading ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Compare Diff</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Right panel: Diff comparison board */}
      <div className="lg:col-span-2 skeuo-panel p-8 h-[600px] flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900">Changes Summary</h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Line by line comparisons of textual revisions.
            </p>
          </div>
          {diffResult && (
            <button
              onClick={() => dispatch(clearDiff())}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all cursor-pointer hover:underline bg-indigo-50 px-4 py-2 rounded-full"
            >
              Clear diff
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto skeuo-pressed rounded-3xl p-6 font-mono text-[11px] leading-relaxed text-slate-800">
          {!diffResult ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-600">
              <div className="h-16 w-16 skeuo-raised rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                <FileText className="h-8 w-8" />
              </div>
              <p className="font-bold text-xs text-slate-700">Select base and comparison versions and hit "Compare Diff".</p>
              <p className="text-[10px] text-slate-600 mt-2 font-medium">Requires at least two resume revisions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {diffResult.map((seg, idx) => {
                const isAdd = seg.type === 'insert';
                const isDel = seg.type === 'delete';
                
                return (
                  <div 
                    key={idx} 
                    className={`flex items-start py-1.5 px-3 rounded-xl transition-all ${
                      isAdd 
                        ? 'bg-emerald-100 text-emerald-800 font-bold' 
                        : isDel 
                        ? 'bg-rose-100 text-rose-800 line-through font-bold' 
                        : 'text-slate-700 font-medium hover:bg-[#5C432E]/50'
                    }`}
                  >
                    <span className={`w-6 select-none flex items-center mt-0.5 flex-shrink-0 ${
                      isAdd ? 'text-emerald-600' : isDel ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {isAdd ? <Plus className="h-3.5 w-3.5" /> : isDel ? <Minus className="h-3.5 w-3.5" /> : <Check className="h-3 w-3" />}
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
