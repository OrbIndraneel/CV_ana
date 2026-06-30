import React from 'react';
import { Calendar, AlertCircle, TrendingUp, Check } from 'lucide-react';

interface GapItem {
  gap_duration_days: number;
  description: string;
  severity: string;
  start_date: string;
  end_date: string;
}

interface GapTimelineProps {
  gaps: GapItem[];
}

export const GapTimeline: React.FC<GapTimelineProps> = ({ gaps }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'warning':
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-5 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold font-display text-slate-800">Timeline & Gap Analysis</h3>
        <p className="text-xs text-slate-505 mt-1">
          Algorithmic chronological audit checking for job-hopping and extended gaps.
        </p>
      </div>

      {gaps.length === 0 ? (
        <div className="bg-indigo-50/30 border border-indigo-200/40 rounded-2xl p-5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Check className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-850">Seamless Chronology</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Continuous experience chronology verified. No notable career gaps detected.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap, idx) => (
            <div 
              key={idx} 
              className={`border border-slate-200/60 bg-white/40 rounded-2xl p-4 flex gap-3.5 transition-all ${getSeverityStyles(gap.severity)}`}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">
                    {gap.gap_duration_days} Days Gap
                  </span>
                  <span className="text-[10px] opacity-75 font-semibold bg-white/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(gap.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {new Date(gap.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-relaxed opacity-90">
                  {gap.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Career highlights card */}
      <div className="bg-slate-50/60 border border-slate-200/60 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <TrendingUp className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          <span className="font-bold text-slate-700">Chronological Audit Tip:</span> Legitimate gaps like sabbaticals, maternity leave, or higher education are common; identify these in the interview.
        </div>
      </div>
    </div>
  );
};
