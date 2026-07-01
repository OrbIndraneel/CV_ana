import React from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface ATSIssue {
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface ATSReportProps {
  issues: ATSIssue[];
  score: number;
}

export const ATSReport: React.FC<ATSReportProps> = ({ issues, score }) => {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertOctagon className="h-5 w-5 text-rose-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-slate-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      default:
        return 'bg-[#5C432E] text-slate-700 border-[#4a3424]';
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900">ATS Layout & Diagnostics</h3>
          <p className="text-xs text-slate-600 mt-1">
            Structural analyzer checking compatibility with legacy parsing engines.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-widest">Layout Score</span>
          <span className="text-2xl font-bold font-display text-indigo-655">{score}%</span>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-2xl p-6 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 text-sm">Perfect Layout Compatibility!</h4>
          <p className="text-xs text-slate-600 mt-1">No layout blocks, table grids, or weird custom shapes were flagged.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, idx) => (
            <div 
              key={idx} 
              className="border border-[#4a3424]/60 bg-white/40 rounded-2xl p-4 flex items-start gap-3.5 hover:border-slate-350 transition-colors"
            >
              <div className="mt-0.5 flex-shrink-0">
                {getImpactIcon(issue.impact)}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs capitalize">
                    {issue.category} Issue
                  </span>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getImpactBadge(issue.impact)}`}>
                    {issue.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                  {issue.description}
                </p>
                <div className="bg-[#5C432E]/70 rounded-xl p-2.5 text-[11px] text-slate-600 leading-normal border border-[#513a28]/80">
                  <span className="font-bold text-slate-605">Action:</span> {issue.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
