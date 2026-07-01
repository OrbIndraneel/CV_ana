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
    <div className="skeuo-panel p-8 max-w-xl w-full animate-slide-up relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:text-slate-700 transition-all cursor-pointer skeuo-raised active:skeuo-pressed"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold font-display text-slate-900">Add Job Description</h2>
        <p className="text-xs text-slate-600 mt-1.5 font-medium pr-8">
          Paste a target job opening. SpaCy will analyze requirements and extract core skills.
        </p>
      </div>

      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in skeuo-pressed rounded-[24px]">
          <div className="h-16 w-16 rounded-full skeuo-raised text-emerald-600 flex items-center justify-center mb-5">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Opening Saved Successfully!</h3>
          <p className="text-xs text-slate-600 mt-1.5 font-bold">Extracted skills and role mappings complete.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">
                Job Title <span className="text-indigo-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Senior React Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 skeuo-pressed rounded-full pl-11 pr-5 text-xs text-slate-900 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">
                Company Name <span className="text-indigo-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                  <Building className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Stripe, Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-12 skeuo-pressed rounded-full pl-11 pr-5 text-xs text-slate-900 focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">
              Full Job Description Text <span className="text-indigo-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute top-4 left-4 text-slate-500">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <textarea
                required
                rows={6}
                placeholder="Paste the job duties, requirements, keywords, tech stack, and background expectations here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full skeuo-pressed rounded-3xl pl-11 pr-5 py-4 text-xs text-slate-900 focus:outline-none resize-none leading-relaxed font-medium"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="skeuo-pressed border-l-4 border-rose-500 rounded-2xl p-5 text-xs text-rose-600 animate-slide-up font-bold">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 skeuo-raised text-slate-700 text-xs font-bold rounded-full transition-all cursor-pointer active:skeuo-pressed"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!rawText || loading}
              className={`flex-1 h-12 text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 ${
                !rawText || loading 
                  ? 'bg-[#2f2016] opacity-50 cursor-not-allowed' 
                  : 'skeuo-raised-accent cursor-pointer active:skeuo-pressed'
              }`}
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
