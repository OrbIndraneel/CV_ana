import React from 'react';
import { Target, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface KeywordMatch {
  keyword: string;
  found: boolean;
  synonyms_used: string[];
  importance: string;
}

interface SemanticHeatmapProps {
  keywords: KeywordMatch[];
}

export const SemanticHeatmap: React.FC<SemanticHeatmapProps> = ({ keywords }) => {
  const getImportanceBadge = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'high':
      case 'required':
        return 'bg-indigo-900/10 text-indigo-700 border-indigo-200/50';
      case 'medium':
        return 'bg-amber-900/10 text-amber-700 border-amber-200/50';
      default:
        return 'bg-[#4a3424] text-slate-600 border-[#4a3424]/50';
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-6 space-y-5 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" />
          Keyword Coverage & Synonym Match
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Identifies critical job description terms found directly or through semantically similar terms.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {keywords.map((kw, idx) => {
          const isExact = kw.found && kw.synonyms_used.length === 0;
          const isSynonym = kw.found && kw.synonyms_used.length > 0;
          
          return (
            <div 
              key={idx}
              className={`border-2 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all ${
                isExact 
                  ? 'bg-emerald-50/20 border-emerald-200/60 hover:bg-emerald-50/40 hover:border-emerald-350' 
                  : isSynonym 
                  ? 'bg-purple-50/20 border-purple-200/60 hover:bg-purple-50/40 hover:border-purple-350' 
                  : 'bg-rose-50/20 border-rose-200/40 hover:bg-rose-50/40 hover:border-rose-350'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-850 truncate max-w-[130px]" title={kw.keyword}>
                  {kw.keyword}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getImportanceBadge(kw.importance)}`}>
                  {kw.importance}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] mt-2">
                {isExact ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Exact Match
                  </span>
                ) : isSynonym ? (
                  <span className="flex items-center gap-1 text-purple-600 font-bold" title={`Synonym matches: ${kw.synonyms_used.join(', ')}`}>
                    <Layers className="h-3.5 w-3.5" />
                    Synonym Match
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-500 font-bold">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Missing
                  </span>
                )}
                
                {isSynonym && (
                  <span className="text-slate-500 max-w-[80px] truncate font-medium">
                    ({kw.synonyms_used[0]})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-3 border-t border-[#5C432E] text-[10px] font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-emerald-500/20 border border-emerald-400" />
          <span>Exact Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-purple-500/20 border border-purple-400" />
          <span>Synonym Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-rose-500/20 border border-rose-400" />
          <span>Missing Core Skill</span>
        </div>
      </div>
    </div>
  );
};
