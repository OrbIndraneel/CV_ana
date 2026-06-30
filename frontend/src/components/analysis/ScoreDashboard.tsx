import React, { useState } from 'react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { 
  Award, 
  Activity, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import type { AnalysisReport } from '../../store/analysisSlice';
import { ATSReport } from './ATSReport';
import { GapTimeline } from './GapTimeline';
import { SemanticHeatmap } from './SemanticHeatmap';
import { BulletAnalysis } from './BulletAnalysis';

interface ScoreDashboardProps {
  report: AnalysisReport;
  resumeFilename?: string;
  jobTitle?: string;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({ 
  report, 
  resumeFilename = 'resume.pdf',
  jobTitle = 'Target Job Role'
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'keywords' | 'bullets'>('summary');

  if (report.status === 'pending' || report.status === 'processing') {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 p-12 text-center shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
          <Activity className="h-6 w-6 animate-spin" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">NLP Scan In Progress...</h3>
          <p className="text-xs text-slate-500 mt-1">Celery processes, similarity comparisons, and layout checkers are currently running.</p>
        </div>
      </div>
    );
  }

  if (report.status === 'failed') {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 p-12 text-center shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">NLP Evaluation Failed</h3>
          <p className="text-xs text-slate-500 mt-1">An error occurred during text extraction or sentence-transformer computations.</p>
        </div>
      </div>
    );
  }

  // Prepping chart data
  const chartData = [
    { name: 'ATS Layout', score: report.ats_score || 0, fill: '#6366f1' },
    { name: 'Keywords Match', score: report.keyword_score || 0, fill: '#a855f7' },
    { name: 'Semantic similarity', score: report.semantic_score || 0, fill: '#10b981' },
    { name: 'Bullet Quality', score: report.bullet_quality_score || 0, fill: '#f59e0b' },
    { name: 'Formatting check', score: report.formatting_score || 0, fill: '#ef4444' },
  ];

  const overallScoreVal = Math.round(report.overall_score || 0);

  const getTalentGrade = (score: number) => {
    if (score >= 85) return { label: 'Top Tier Talent', desc: 'Outstanding job alignment and bullet impact.', style: 'from-emerald-500 to-indigo-600' };
    if (score >= 70) return { label: 'Highly Compatible', desc: 'Solid credentials with minor gaps or layout issues.', style: 'from-indigo-500 to-purple-600' };
    if (score >= 50) return { label: 'Moderate Fit', desc: 'Qualifies but requires upskilling or bullet rewrites.', style: 'from-amber-500 to-orange-600' };
    return { label: 'Needs Optimization', desc: 'Missing critical keywords and requires layout adjustment.', style: 'from-rose-500 to-red-600' };
  };

  const grade = getTalentGrade(overallScoreVal);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
            Detailed Audit Report
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-800 mt-2 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-slate-400" />
            {resumeFilename}
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Compared against: <strong className="text-slate-700">{jobTitle}</strong></span>
            <span>•</span>
            <span>Role Category: <strong className="text-indigo-600">{report.role_detected || 'Unknown'}</strong></span>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'summary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`px-4.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'keywords' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Keywords Grid
          </button>
          <button
            onClick={() => setActiveTab('bullets')}
            className={`px-4.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'bullets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bullet Grader
          </button>
        </div>
      </div>

      {/* Main Grid: Talent Card + Chart Breakdown */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Top Gradient Talents Card */}
          <div className={`lg:col-span-2 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-lg shadow-indigo-600/10 bg-gradient-to-br ${grade.style}`}>
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_45%)]" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-full">
                  Compatibility Rating
                </span>
                <Award className="h-6 w-6 text-white/80" />
              </div>
              <div>
                <p className="text-6xl font-bold font-display tracking-tight">{overallScoreVal}%</p>
                <p className="text-lg font-bold font-display tracking-wide mt-2">{grade.label}</p>
                <p className="text-xs text-white/80 leading-relaxed mt-1">{grade.desc}</p>
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-8 border-t border-white/25 flex items-center justify-between text-[11px] font-medium text-white/90">
              <span>Classifier: AI Talent Scorer</span>
              <span>Score Weight Matrix active</span>
            </div>
          </div>

          {/* Sub-component Radar / Bar Breakdown Chart */}
          <div className="lg:col-span-3 bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Metrics Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Performance index across five critical evaluation sectors.</p>
            </div>

            {/* Recharts Bar representation */}
            <div className="h-60 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 550 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#f8fafc' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#cbd5e1' }}
                    itemStyle={{ fontSize: '11px', color: '#818cf8' }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={38}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Rendering of tabs */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <ATSReport issues={report.ats_issues || []} score={Math.round(report.ats_score || 0)} />
          <GapTimeline gaps={report.gap_analysis || []} />
        </div>
      )}

      {activeTab === 'keywords' && (
        <SemanticHeatmap keywords={report.keyword_matches || []} />
      )}

      {activeTab === 'bullets' && (
        <BulletAnalysis bullets={report.bullet_feedback || []} />
      )}
    </div>
  );
};
