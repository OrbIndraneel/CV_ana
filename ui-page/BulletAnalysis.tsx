/**
 * BulletAnalysis.tsx
 * 
 * Shows detailed quality feedback for each resume bullet point.
 * 
 * Animation strategy:
 * - Items expand/collapse smoothly (max-height transition)
 * - Suggestions fade in when expanded
 * - Color coding: green = strong, amber = needs work, red = weak
 * - Bullets are grouped by section for scanability
 * 
 * This is where users see *actionable* feedback, not just a score.
 */

import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { BulletFeedback } from '@/types/analysis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BulletAnalysisProps {
  feedback: BulletFeedback[];
  onSuggestRewrite?: (bullet: string) => void;
}

/**
 * Group bullets by section for easier scanning
 */
const groupBySection = (
  feedback: BulletFeedback[]
): Record<string, BulletFeedback[]> => {
  return feedback.reduce(
    (acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    },
    {} as Record<string, BulletFeedback[]>
  );
};

/**
 * Determines quality level based on score
 */
const getQualityLevel = (
  score: number
): 'strong' | 'fair' | 'weak' => {
  if (score >= 0.75) return 'strong';
  if (score >= 0.5) return 'fair';
  return 'weak';
};

const qualityConfig = {
  strong: {
    icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    label: 'Strong',
    color: 'text-emerald-900',
  },
  fair: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    label: 'Fair',
    color: 'text-amber-900',
  },
  weak: {
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    label: 'Weak',
    color: 'text-red-900',
  },
};

/**
 * Individual bullet feedback item
 */
const BulletItem: React.FC<{
  feedback: BulletFeedback;
  index: number;
  onSuggestRewrite?: (bullet: string) => void;
}> = ({ feedback, index, onSuggestRewrite }) => {
  const [isExpanded, setIsExpanded] = useState(feedback.quality_score < 0.5);
  const quality = getQualityLevel(feedback.quality_score);
  const config = qualityConfig[quality];

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${config.bg} ${config.border} border`}
      style={{
        animation: `slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${50 + index * 40}ms both`,
      }}
    >
      {/* Header - always visible, clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:opacity-75 transition-opacity"
      >
        {/* Quality icon */}
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>

        {/* Bullet text + metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <p className={`text-sm ${config.color} leading-relaxed flex-1`}>
              {feedback.text}
            </p>
            <Badge className={config.badge}>
              {Math.round(feedback.quality_score * 100)}%
            </Badge>
          </div>

          {/* Quality indicators */}
          <div className="flex flex-wrap gap-2 mt-2">
            {feedback.has_action_verb ? (
              <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                ✓ Action verb
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                ✗ No action verb
              </Badge>
            )}

            {feedback.has_quantified_result ? (
              <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                ✓ Quantified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                ✗ No metrics
              </Badge>
            )}
          </div>
        </div>

        {/* Expand indicator */}
        <ChevronDown
          className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable section - suggestion + action items */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isExpanded ? '500px' : '0px',
        }}
      >
        <div className={`border-t ${config.border} p-4 space-y-4`}>
          {/* Suggestion section */}
          {feedback.suggestion && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-medium text-slate-700">Suggestion</p>
              </div>
              <p className={`text-sm ${config.color} leading-relaxed`}>
                {feedback.suggestion}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {feedback.quality_score < 0.75 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSuggestRewrite?.(feedback.text)}
                className="text-xs"
              >
                Get AI rewrite
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Section heading with summary stats
 */
const SectionHeader: React.FC<{
  section: string;
  feedback: BulletFeedback[];
}> = ({ section, feedback }) => {
  const avgScore = feedback.reduce((sum, f) => sum + f.quality_score, 0) / feedback.length;
  const strong = feedback.filter((f) => f.quality_score >= 0.75).length;
  const weak = feedback.filter((f) => f.quality_score < 0.5).length;

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-slate-900 capitalize">
          {section}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">
            {feedback.length} bullet{feedback.length !== 1 ? 's' : ''}
          </span>
          <span className="text-slate-400">•</span>
          <span className={getQualityLevel(avgScore) === 'strong' ? 'text-emerald-600' : 'text-amber-600'}>
            {Math.round(avgScore * 100)}% avg
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-2 text-xs">
        {strong > 0 && (
          <div className="flex items-center gap-1 text-emerald-700">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            {strong} strong
          </div>
        )}
        {weak > 0 && (
          <div className="flex items-center gap-1 text-red-700">
            <div className="w-2 h-2 bg-red-600 rounded-full" />
            {weak} needs work
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Empty state
 */
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12 text-slate-500">
      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
      <p className="text-sm">No bullet points detected in your resume</p>
    </div>
  );
};

/**
 * Main component
 */
export const BulletAnalysis: React.FC<BulletAnalysisProps> = ({
  feedback,
  onSuggestRewrite,
}) => {
  const grouped = groupBySection(feedback);
  const avgScore = feedback.length > 0
    ? feedback.reduce((sum, f) => sum + f.quality_score, 0) / feedback.length
    : 0;
  const weakBullets = feedback.filter((f) => f.quality_score < 0.5).length;

  if (feedback.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header with overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Bullet point quality
        </h2>
        <p className="text-sm text-slate-600">
          Each bullet is analyzed for strong action verbs, quantified results, and impact clarity.
        </p>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">Overall quality</p>
            <p className={`text-xl font-semibold mt-1 ${
              avgScore >= 0.75 ? 'text-emerald-600' : avgScore >= 0.5 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {Math.round(avgScore * 100)}%
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">Total bullets</p>
            <p className="text-xl font-semibold mt-1 text-slate-900">
              {feedback.length}
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-600 font-medium">Need improvement</p>
            <p className="text-xl font-semibold mt-1 text-red-700">
              {weakBullets}
            </p>
          </div>
        </div>
      </div>

      {/* Bullets grouped by section */}
      <div className="space-y-8 border-t border-slate-200 pt-6">
        {Object.entries(grouped).map(([section, sectionFeedback]) => (
          <div key={section}>
            <SectionHeader section={section} feedback={sectionFeedback} />
            <div className="space-y-3">
              {sectionFeedback.map((item, idx) => (
                <BulletItem
                  key={idx}
                  feedback={item}
                  index={idx}
                  onSuggestRewrite={onSuggestRewrite}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      {weakBullets > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 mt-4">
          <p className="text-sm font-medium text-blue-900">
            💡 Tip: Improve your weak bullets
          </p>
          <p className="text-sm text-blue-800">
            Strong bullets follow this pattern: <strong>Action verb</strong> +
            <strong> specific task</strong> + <strong>quantified result</strong>.
            For example: "Reduced database query latency by 40% by optimizing
            PostgreSQL indexes, improving response time from 2s to 1.2s."
          </p>
        </div>
      )}
    </Card>
  );
};

export default BulletAnalysis;
