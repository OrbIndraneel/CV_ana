import React, { useState } from 'react';
import { UploadCloud, FileJson, Loader2, Trophy, ArrowDownToLine, RefreshCw, Check } from 'lucide-react';
import { apiClient } from '../../api/client';

interface ChallengeCandidate {
  candidate_id: string;
  rank: number;
  score: string;
  reasoning: string;
}

export const ChallengeView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<ChallengeCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    if (!file.name.endsWith('.jsonl')) {
      setError("Please select a .jsonl file.");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/challenge/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000
      });
      
      setResults(response.data.top_candidates);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to process dataset.");
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setError(null);
  };

  const downloadCSV = () => {
    if (!results) return;
    const header = "candidate_id,rank,score,reasoning\n";
    const rows = results.map(r => `${r.candidate_id},${r.rank},${r.score},"${r.reasoning.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'team_indraneel.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="skeuo-panel p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center justify-center gap-3">
          <div className="h-10 w-10 skeuo-pressed rounded-full flex items-center justify-center">
            <Trophy className="h-5 w-5 text-indigo-600" />
          </div>
          AI Challenge Dataset Processor
        </h2>
        <p className="text-xs text-slate-600 max-w-2xl mx-auto font-medium">
          Upload your massive .jsonl candidate dataset. The system will heuristically score them against the target Senior AI Engineer role and return the top 100 results.
        </p>
      </div>

      {!results ? (
        <div className="skeuo-panel p-10">
          <div className="max-w-2xl mx-auto space-y-8">
            
            {error && (
              <div className="skeuo-pressed border-l-4 border-rose-500 text-rose-600 text-xs p-4 rounded-2xl font-bold">
                <strong>Error: </strong> {error}
              </div>
            )}
            
            <label 
              className={`rounded-[32px] p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                file ? 'skeuo-pressed' : 'skeuo-raised hover:skeuo-pressed'
              }`}
            >
              <input type="file" className="hidden" accept=".jsonl" onChange={handleFileChange} disabled={isUploading} />
              
              {file ? (
                <>
                  <div className="h-16 w-16 skeuo-raised rounded-2xl flex items-center justify-center mb-4">
                    <FileJson className="h-8 w-8 text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{file.name}</span>
                  <span className="text-xs text-slate-600 mt-1.5 font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 skeuo-pressed rounded-2xl flex items-center justify-center mb-4">
                    <UploadCloud className="h-8 w-8 text-slate-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">Drop your .jsonl file here</span>
                  <span className="text-xs text-slate-600 mt-1.5 font-medium">or click to browse local files</span>
                </>
              )}
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full text-white text-sm font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${
                !file || isUploading ? 'bg-[#2f2016] cursor-not-allowed opacity-50' : 'skeuo-raised-accent active:skeuo-pressed'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Dataset...
                </>
              ) : (
                "Start Processing Pipeline"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="skeuo-panel p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="h-8 w-8 skeuo-pressed rounded-full flex items-center justify-center text-emerald-600">
                <Check className="h-4 w-4" />
              </div>
              Top 100 Candidates
            </h3>
            <div className="flex items-center gap-4">
              <button onClick={downloadCSV} className="flex items-center gap-2 text-xs font-bold text-white skeuo-raised-accent px-5 py-2.5 rounded-full transition-all active:skeuo-pressed">
                <ArrowDownToLine className="h-4 w-4" />
                Download CSV
              </button>
              <button onClick={reset} className="flex items-center gap-2 text-xs font-bold text-slate-700 skeuo-raised px-5 py-2.5 rounded-full transition-all active:skeuo-pressed">
                <RefreshCw className="h-4 w-4" />
                Process Another
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto skeuo-pressed rounded-3xl p-2">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-bold">Rank</th>
                  <th className="px-5 py-4 font-bold">Candidate ID</th>
                  <th className="px-5 py-4 font-bold">Score</th>
                  <th className="px-5 py-4 font-bold">Reasoning Overview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {results.map((r) => (
                  <tr key={r.candidate_id} className="transition-colors hover:bg-[#fcfaf7]">
                    <td className="px-5 py-3 font-bold text-white">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full skeuo-raised text-[10px]">
                        #{r.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-indigo-600">{r.candidate_id}</td>
                    <td className="px-5 py-3 font-bold text-slate-800">{r.score}</td>
                    <td className="px-5 py-3 text-slate-700 truncate max-w-md font-medium" title={r.reasoning}>{r.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
