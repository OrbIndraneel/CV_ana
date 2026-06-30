import React, { useState } from 'react';
import { useAppDispatch } from '../../store';
import { createJobDescription } from '../../store/analysisSlice';
import { Briefcase, Building, FileText, CheckCircle, RefreshCcw, X } from 'lucide-react';

interface JDInputProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const JDInput: React.FC<JDInputProps> = ({ onSuccess, onClose }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText) return;

    setLoading(true);
    setErrorMsg(null);

    const result = await dispatch(createJobDescription({
      title: title || undefined,
      company: company || undefined,
      raw_text: rawText,
    }));

    setLoading(false);
    if (createJobDescription.fulfilled.match(result)) {
      setSuccess(true);
      setTitle('');
      setCompany('');
      setRawText('');
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setErrorMsg('Failed to process job description. Please check formatting.');
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl ring-1 ring-gray-200/80 shadow-2xl p-6 max-w-xl w-full animate-slide-up relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}

      <div className="mb-5">
        <h2 className="text-xl font-bold font-display text-slate-800">Add Job Description</h2>
        <p className="text-xs text-slate-505 mt-1">
          Paste a target job opening. SpaCy will analyze requirements and extract core skills.
        </p>
      </div>

      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Opening Saved Successfully!</h3>
          <p className="text-xs text-slate-505 mt-1">Extracted skills and role mappings complete.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Job Title <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Senior React Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Company Name <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Stripe, Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Full Job Description Text <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute top-3.5 left-3.5 text-slate-400">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <textarea
                required
                rows={6}
                placeholder="Paste the job duties, requirements, keywords, tech stack, and background expectations here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10.5 pr-4 py-3 text-xs text-slate-705 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-500 animate-slide-up">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 border border-slate-200 hover:bg-slate-100/60 text-slate-600 text-xs font-bold rounded-full transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!rawText || loading}
              className="flex-1 h-11 bg-gray-900 hover:bg-indigo-650 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  <span>Processing requirements...</span>
                </>
              ) : (
                'Save Description'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
