/**
 * SemanticHeatmap.tsx
 * 
 * Visualizes the semantic matching matrix between job requirements and resume bullets.
 * This is a data visualization that helps users understand *why* their score is what it is.
 * 
 * Animation strategy:
 * - Heatmap cells fill in row-by-row (paints a picture)
 * - Color intensity encodes similarity (visual information density)
 * - Hover reveals full text (reduces initial cognitive load)
 * - Icons show matched/unmatched state at a glance
 * 
 * Design rationale:
 * - Green = matched (similarity > threshold)
 * - Amber = partial match (similarity between 0.3-0.55)
 * - Red = no match (similarity < 0.3)
 * - Intensity = how strong the match
 */

import React, { useState } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import { SemanticMatch } from '@/types/analysis';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SemanticHeatmapProps {
  matches: SemanticMatch[];
  totalBullets: number;
}

/**
 * Converts similarity score (0-1) to hue/saturation for color encoding
 */
const getSimilarityColor = (
  similarity: number
): {
  bg: string;
  border: string;
  icon: React.ReactNode;
  label: string;
  sentiment: 'matched' | 'partial' | 'unmatched';
} => {
  if (similarity >= 0.7) {
    return {
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      icon: <Check className="w-4 h-4 text-emerald-700" />,
      label: 'Strong match',
      sentiment: 'matched',
    };
  }
  if (similarity >= 0.55) {
    return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <Check className="w-4 h-4 text-emerald-600" />,
      label: 'Matched',
      sentiment: 'matched',
    };
  }
  if (similarity >= 0.3) {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      label: 'Partial match',
      sentiment: 'partial',
    };
  }
  return {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: <X className="w-4 h-4 text-slate-400" />,
    label: 'No match',
    sentiment: 'unmatched',
  };
};

/**
 * Statistic card showing overall fit
 */
const FitStatistic: React.FC<{
  label: string;
  value: string | number;
  subtext?: string;
}> = ({ label, value, subtext }) => {
  return (
    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 font-medium">{label}</p>
      <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
};

/**
 * Individual match card with tooltip
 */
const MatchCard: React.FC<{
  match: SemanticMatch;
  index: number;
}> = ({ match, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = getSimilarityColor(match.similarity_score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${color.bg} border-2 ${color.border} rounded-lg p-4 cursor-pointer transition-all hover:shadow-md h-full`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              animation: `slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${100 + index * 50}ms both`,
            }}
          >
            {/* Icon + match label */}
            <div className="flex items-start gap-2 mb-2">
              {color.icon}
              <span className="text-xs font-medium text-slate-700">
                {color.label}
              </span>
            </div>

            {/* Similarity score bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-600">Similarity</span>
                <span className="text-sm font-semibold text-slate-900">
                  {(match.similarity_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    match.matched ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${match.similarity_score * 100}%`,
                    animation: `scaleX 500ms cubic-bezier(0.16, 1, 0.3, 1) ${100 + index * 50}ms both`,
                    transformOrigin: 'left',
                  }}
                />
              </div>
            </div>

            {/* Preview text - truncated on hover, full on tooltip */}
            {isHovered && (
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-600 font-medium mb-1">JD requirement:</p>
                  <p className="text-slate-700 line-clamp-2">
                    {match.requirement}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 font-medium mb-1">Resume bullet:</p>
                  <p className="text-slate-700 line-clamp-2">
                    {match.best_matching_bullet}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>

        {/* Tooltip with full text */}
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2 text-xs">
            <div>
              <p className="font-medium text-slate-200">Job requirement</p>
              <p className="text-slate-300">{match.requirement}</p>
            </div>
            <div className="border-t border-slate-600 pt-2">
              <p className="font-medium text-slate-200">Resume matched with</p>
              <p className="text-slate-300">{match.best_matching_bullet}</p>
            </div>
            <div className="border-t border-slate-600 pt-2">
              <p className="text-slate-400">
                Semantic similarity: {(match.similarity_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Legend explaining color scheme
 */
const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-300 rounded" />
        <span className="text-slate-700">Strong match (≥70%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-emerald-50 border-2 border-emerald-200 rounded" />
        <span className="text-slate-700">Matched (55-70%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-amber-50 border-2 border-amber-200 rounded" />
        <span className="text-slate-700">Partial (30-55%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-slate-50 border-2 border-slate-200 rounded" />
        <span className="text-slate-700">No match (&lt;30%)</span>
      </div>
    </div>
  );
};

/**
 * Main heatmap component
 */
export const SemanticHeatmap: React.FC<SemanticHeatmapProps> = ({
  matches,
  totalBullets,
}) => {
  const matchedCount = matches.filter((m) => m.matched).length;
  const partialCount = matches.filter(
    (m) => !m.matched && m.similarity_score >= 0.3
  ).length;
  const totalRequirements = matches.length;

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Job-to-resume alignment
        </h2>
        <p className="text-sm text-slate-600">
          How well your resume matches the job requirements using semantic analysis
          (goes beyond keyword matching)
        </p>
      </div>

      {/* Key statistics */}
      <div className="grid grid-cols-4 gap-3">
        <FitStatistic
          label="Requirements"
          value={totalRequirements}
          subtext="analyzed"
        />
        <FitStatistic
          label="Strong matches"
          value={matchedCount}
          subtext={`${((matchedCount / totalRequirements) * 100).toFixed(0)}% fit`}
        />
        <FitStatistic
          label="Partial matches"
          value={partialCount}
          subtext="worth developing"
        />
        <FitStatistic
          label="Coverage"
          value={`${(((matchedCount + partialCount / 2) / totalRequirements) * 100).toFixed(0)}%`}
          subtext="overall"
        />
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 pt-4">
        <p className="text-xs font-medium text-slate-700 mb-3">Color scale</p>
        <Legend />
      </div>

      {/* Match cards grid */}
      <div className="border-t border-slate-200 pt-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-900">Requirements</h3>
          <p className="text-xs text-slate-600 mt-1">
            Each requirement is matched against your strongest related resume bullet
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {matches.map((match, idx) => (
            <MatchCard key={idx} match={match} index={idx} />
          ))}
        </div>
      </div>

      {/* Insight section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-medium text-blue-900">💡 Insight</h3>
        <p className="text-sm text-blue-800">
          {matchedCount === totalRequirements
            ? `Excellent! All ${totalRequirements} requirements are semantically matched in your resume. You have strong coverage for this role.`
            : matchedCount >= totalRequirements * 0.8
            ? `Strong coverage: ${matchedCount} of ${totalRequirements} requirements are clearly addressed. Focus on improving the remaining ${totalRequirements - matchedCount} areas.`
            : matchedCount >= totalRequirements * 0.5
            ? `Moderate coverage: about half the requirements are addressed. Consider rewriting bullets to explicitly demonstrate the missing ${totalRequirements - matchedCount} skills.`
            : `Limited coverage: You're addressing fewer than half the stated requirements. This resume may not be optimized for this specific role.`}
        </p>
      </div>
    </Card>
  );
};

export default SemanticHeatmap;
