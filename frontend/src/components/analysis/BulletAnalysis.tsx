import React from 'react';
import { ThumbsUp, Star, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface BulletItem {
  original: string;
  score: number;
  impact: string;
  issues: string[];
  suggestions: string[];
}

interface BulletAnalysisProps {
  bullets: BulletItem[];
}

export const BulletAnalysis: React.FC<BulletAnalysisProps> = ({ bullets }) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-4 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          Bullet Point Grader
        </h3>
        <p className="text-xs text-slate-505 mt-1">
          Detailed NLP feedback and metrics-focused rewriting suggestions for your work experience.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {bullets.map((bullet, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-3">
              <div 
                onClick={() => toggleExpand(idx)}
                className="flex items-start justify-between gap-4 cursor-pointer hover:bg-[#5C432E]/70 p-1.5 rounded-xl transition-colors"
              >
                <div className="flex-1 text-sm text-slate-705 font-medium pr-2">
                  "{bullet.original}"
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 select-none">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide ${getScoreColor(bullet.score)}`}>
                    {bullet.score}/10
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4.5 w-4.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4.5 w-4.5 text-slate-500" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="bg-[#5C432E]/80 rounded-2xl border border-[#4a3424]/50 p-4 space-y-4 animate-slide-up ml-1 text-xs">
                  {/* Issues */}
                  {bullet.issues.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-550 uppercase tracking-widest text-[9px] mb-1.5">Identified Issues</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                        {bullet.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {bullet.suggestions.length > 0 && (
                    <div className="pt-3.5 border-t border-[#4a3424]/40">
                      <h4 className="font-bold text-slate-550 uppercase tracking-widest text-[9px] mb-1.5 flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        AI Rephrasing Recommendations
                      </h4>
                      <div className="space-y-2">
                        {bullet.suggestions.map((suggestion, i) => (
                          <div key={i} className="bg-white/95 rounded-xl border border-[#4a3424]/80 p-3.5 shadow-sm flex items-start gap-2.5">
                            <ThumbsUp className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <p className="font-bold text-slate-900 leading-relaxed">"{suggestion}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
