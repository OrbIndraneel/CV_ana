import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCcw, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { uploadResume } from '../../store/resumeSlice';

interface ResumeUploaderProps {
  parentResumeId?: string;
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ 
  parentResumeId: initialParentId, 
  onUploadSuccess,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { loading, error, resumes } = useAppSelector((state) => state.resume);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parentResumeId, setParentResumeId] = useState<string>(initialParentId || '');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'docx') {
      setFile(selectedFile);
    } else {
      alert('Invalid file format. Only PDF and DOCX files are supported.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const result = await dispatch(uploadResume({
      file,
      parentResumeId: parentResumeId || undefined,
    }));

    if (uploadResume.fulfilled.match(result)) {
      setSuccess(true);
      setFile(null);
      setTimeout(() => {
        setSuccess(false);
        if (onUploadSuccess) onUploadSuccess();
      }, 1500);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl ring-1 ring-gray-200/80 shadow-2xl p-6 max-w-lg w-full animate-slide-up relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}

      <div className="mb-5">
        <h2 className="text-xl font-bold font-display text-slate-800">Upload Candidate Resume</h2>
        <p className="text-xs text-slate-505 mt-1">
          Select or drag a document to begin structural extraction and AI NLP evaluations.
        </p>
      </div>

      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Upload Succeeded!</h3>
          <p className="text-xs text-slate-500 mt-1">Starting async segment parsing worker...</p>
        </div>
      ) : (
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* Drag and drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-48 ${
              dragActive 
                ? 'border-indigo-650 bg-indigo-50/20' 
                : file 
                ? 'border-emerald-500/50 bg-emerald-50/5' 
                : 'border-slate-300 hover:border-indigo-650 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Drag and drop file here, or <span className="text-indigo-650 hover:underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                    Supports PDF, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Optional parent version linking */}
          {!initialParentId && resumes.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Upload as revision of existing resume (Optional)
              </label>
              <select
                value={parentResumeId}
                onChange={(e) => setParentResumeId(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-750 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
              >
                <option value="">-- Upload as new candidate entry --</option>
                {resumes
                  .filter((r) => !r.parent_resume_id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.filename} (v{r.version_number})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-xs text-rose-500 animate-slide-up">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Upload failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
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
              disabled={!file || loading}
              className="flex-1 h-11 bg-gray-900 hover:bg-indigo-650 disabled:bg-slate-200 disabled:text-slate-405 active:bg-gray-955 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  <span>Processing document...</span>
                </>
              ) : (
                'Upload and Extract'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
