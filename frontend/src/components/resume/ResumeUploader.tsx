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
    <div className="skeuo-panel p-8 max-w-lg w-full animate-slide-up relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:text-slate-700 transition-all cursor-pointer skeuo-raised active:skeuo-pressed"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold font-display text-slate-900">Upload Candidate Resume</h2>
        <p className="text-xs text-slate-600 mt-1.5 font-medium pr-8">
          Select or drag a document to begin structural extraction and AI NLP evaluations.
        </p>
      </div>

      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in skeuo-pressed rounded-[24px]">
          <div className="h-16 w-16 rounded-full skeuo-raised text-emerald-600 flex items-center justify-center mb-5">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Upload Succeeded!</h3>
          <p className="text-xs text-slate-600 mt-1.5 font-bold">Starting async segment parsing worker...</p>
        </div>
      ) : (
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Drag and drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`rounded-[32px] p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-48 ${
              file || dragActive 
                ? 'skeuo-pressed' 
                : 'skeuo-raised hover:skeuo-pressed'
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
              <div className="space-y-4">
                <div className="h-14 w-14 rounded-2xl skeuo-raised text-emerald-600 flex items-center justify-center mx-auto">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 font-bold">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline inline-flex items-center gap-1 mt-2 cursor-pointer"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-14 w-14 rounded-2xl skeuo-pressed text-slate-500 flex items-center justify-center mx-auto">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Drag and drop file here, or <span className="text-indigo-600 hover:underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-bold">
                    Supports PDF, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Optional parent version linking */}
          {!initialParentId && resumes.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">
                Upload as revision of existing resume (Optional)
              </label>
              <select
                value={parentResumeId}
                onChange={(e) => setParentResumeId(e.target.value)}
                className="w-full h-12 px-5 skeuo-pressed rounded-full text-xs text-slate-900 focus:outline-none font-bold transition-all"
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
            <div className="skeuo-pressed border-l-4 border-rose-500 rounded-2xl p-5 flex gap-3 text-xs text-rose-600 animate-slide-up">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Upload failed</p>
                <p className="mt-1 font-medium">{error}</p>
              </div>
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
              disabled={!file || loading}
              className={`flex-1 h-12 text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 ${
                !file || loading 
                  ? 'bg-[#2f2016] opacity-50 cursor-not-allowed' 
                  : 'skeuo-raised-accent cursor-pointer active:skeuo-pressed'
              }`}
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
