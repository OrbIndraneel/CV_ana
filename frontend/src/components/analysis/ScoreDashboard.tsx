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
      <div className="skeuo-panel p-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-5 animate-pulse">
        <div className="h-16 w-16 rounded-2xl skeuo-pressed text-amber-500 flex items-center justify-center">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">NLP Scan In Progress...</h3>
          <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed max-w-xs">Celery processes, similarity comparisons, and layout checkers are currently running.</p>
        </div>
      </div>
    );
  }

  if (report.status === 'failed') {
    return (
      <div className="skeuo-panel p-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-5">
        <div className="h-16 w-16 rounded-2xl skeuo-pressed text-rose-500 flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">NLP Evaluation Failed</h3>
          <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed max-w-xs">An error occurred during text extraction or sentence-transformer computations.</p>
        </div>
      </div>
    );
  }

  // Prepping chart data
  const chartData = [
    { name: 'ATS Layout', score: report.ats_score || 0, fill: '#6366f1' },
    { name: 'Keywords', score: report.keyword_score || 0, fill: '#a855f7' },
    { name: 'Semantic', score: report.semantic_score || 0, fill: '#10b981' },
    { name: 'Bullet Quality', score: report.bullet_quality_score || 0, fill: '#f59e0b' },
    { name: 'Formatting', score: report.formatting_score || 0, fill: '#ef4444' },
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
    <div className="space-y-10 animate-fade-in pb-8">
      {/* Report Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 skeuo-panel p-8">
        <div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest skeuo-pressed px-3 py-1.5 rounded-full inline-block">
            Detailed Audit Report
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-4 flex items-center gap-3">
            <div className="h-10 w-10 skeuo-raised rounded-full flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            {resumeFilename}
          </h2>
          <div className="text-xs text-slate-600 mt-3 flex items-center gap-2 font-bold bg-white/40 p-2 px-4 rounded-xl border border-white/20 inline-flex">
            <span>Compared against: <strong className="text-slate-900">{jobTitle}</strong></span>
            <span className="text-[#825D43] mx-1">•</span>
            <span>Role Category: <strong className="text-indigo-600">{report.role_detected || 'Unknown'}</strong></span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex skeuo-pressed p-2 rounded-[20px] shrink-0 w-full xl:w-auto overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'summary' ? 'skeuo-raised text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-[#5C432E]/50'
            }`}
          >
            Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`px-6 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'keywords' ? 'skeuo-raised text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-[#5C432E]/50'
            }`}
          >
            Keywords Grid
          </button>
          <button
            onClick={() => setActiveTab('bullets')}
            className={`px-6 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bullets' ? 'skeuo-raised text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-[#5C432E]/50'
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
          <div className={`lg:col-span-2 rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl bg-gradient-to-br ${grade.style}`}>
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.2),transparent_45%)]" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[32px]" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  Compatibility Rating
                </span>
                <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-7xl font-bold font-display tracking-tight drop-shadow-md">{overallScoreVal}%</p>
                <p className="text-xl font-bold font-display tracking-wide mt-3 drop-shadow-sm">{grade.label}</p>
                <p className="text-[13px] text-white/90 leading-relaxed mt-2 font-medium">{grade.desc}</p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-8 border-t border-white/20 flex items-center justify-between text-[10px] font-bold text-white/80 uppercase tracking-widest">
              <span>AI Talent Scorer</span>
              <span>Weight Matrix Active</span>
            </div>
          </div>

          {/* Sub-component Radar / Bar Breakdown Chart */}
          <div className="lg:col-span-3 skeuo-panel p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Metrics Breakdown</h3>
                <p className="text-[11px] text-slate-600 mt-1 font-bold">Performance index across five critical evaluation sectors.</p>
              </div>
              <div className="h-10 w-10 skeuo-pressed rounded-full flex items-center justify-center text-indigo-500">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            {/* Recharts Bar representation */}
            <div className="h-64 w-full mt-6 flex items-center justify-center skeuo-pressed rounded-3xl p-4 pt-8 border border-white/50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#F5F6FA', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a', boxShadow: '6px 6px 12px #D2D6DF, -6px -6px 12px #ffffff' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#64748b' }}
                    itemStyle={{ fontSize: '12px', color: '#6366f1', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={32}>
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
