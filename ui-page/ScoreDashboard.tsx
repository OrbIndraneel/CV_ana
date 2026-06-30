/**
 * ScoreDashboard.tsx
 * 
 * The primary UI for showing analysis results. This is where users get the most
 * critical information: their score, what it means, and what to fix.
 * 
 * Animation strategy:
 * 1. Overall score is revealed first (0.5s delay, large impact)
 * 2. Category scores stagger in (100ms apart)
 * 3. Gap analysis and warnings appear last (lower urgency)
 * 4. All animations use easing that feels "natural" (reveals, not bounces)
 * 
 * Accessibility:
 * - All animated content is also available in static form (no info hidden in animation)
 * - Role="status" on score to announce changes to screen readers
 * - Tab order follows logical flow: score → categories → details
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, Target, Zap, Eye } from 'lucide-react';
import { AnalysisResult, CategoryScore } from '@/types/analysis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScoreDashboardProps {
  analysis: AnalysisResult;
  isLoading?: boolean;
  onExplainClick?: (category: string) => void;
}

/**
 * Determines color and sentiment of a score
 */
const getScoreSentiment = (
  score: number
): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
};

const sentimentConfig = {
  excellent: {
    color: 'bg-emerald-50 border-emerald-200',
    textColor: 'text-emerald-900',
    accentColor: '#10b981',
    icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
    label: 'Excellent',
  },
  good: {
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-900',
    accentColor: '#0ea5e9',
    icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
    label: 'Good',
  },
  fair: {
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-900',
    accentColor: '#f59e0b',
    icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
    label: 'Fair',
  },
  poor: {
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-900',
    accentColor: '#ef4444',
    icon: <AlertCircle className="w-6 h-6 text-red-600" />,
    label: 'Needs work',
  },
};

/**
 * Animated number display - counts from 0 to target
 * Used for score reveal to draw attention and feel celebratory
 */
const AnimatedScore: React.FC<{ value: number; delay?: number }> = ({
  value,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = value / 20; // 20 steps to reach target
      let current = 0;

      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.round(current));
        }
      }, 20);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <span className="font-medium tabular-nums">
      {displayValue}
    </span>
  );
};

/**
 * Main score card - the hero section
 * Reveals in sequence: color background → icon → score → grade
 */
const OverallScoreCard: React.FC<{
  score: number;
  summary: string;
}> = ({ score, summary }) => {
  const sentiment = getScoreSentiment(score);
  const config = sentimentConfig[sentiment];

  return (
    <div className="relative overflow-hidden">
      {/* Animated background reveal */}
      <div
        className={`${config.color} border rounded-xl p-8 animate-fadeIn`}
        style={{
          animation: 'fadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Decorative gradient background (subtle, doesn't distract) */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 pointer-events-none"
          style={{
            background: config.accentColor,
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-4">
            {/* Grade label with staggered entrance */}
            <div
              className="inline-flex items-center gap-2"
              style={{
                animation: 'slideInLeft 400ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both',
              }}
            >
              {config.icon}
              <span className={`text-sm font-medium ${config.textColor}`}>
                {config.label}
              </span>
            </div>

            {/* Score display - number animates in */}
            <div
              style={{
                animation: 'slideInLeft 400ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both',
              }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-medium text-slate-900">
                  <AnimatedScore value={score} delay={400} />
                </span>
                <span className="text-xl text-slate-600">/100</span>
              </div>
            </div>

            {/* Summary text - reveals last */}
            <p
              className={`max-w-sm text-sm ${config.textColor} leading-relaxed`}
              style={{
                animation: 'slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both',
              }}
            >
              {summary}
            </p>
          </div>

          {/* Visual breakdown of score composition */}
          <div
            className="flex-shrink-0"
            style={{
              animation: 'slideInRight 400ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both',
            }}
          >
            <div className="relative w-28 h-28">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ transform: 'rotate(-90deg)' }}
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth="8"
                />
                {/* Score circle - animated arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={config.accentColor}
                  strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 282.7} 282.7`}
                  strokeLinecap="round"
                  style={{
                    animation: 'strokeDraw 800ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {Math.round((score / 100) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Category score card - shows breakdown of final score
 * Each staggered by 100ms to create cascading reveal effect
 */
const CategoryScoreCard: React.FC<{
  score: CategoryScore;
  index: number;
  onClick?: () => void;
}> = ({ score, index, onClick }) => {
  const sentiment = getScoreSentiment(score.score);
  const config = sentimentConfig[sentiment];

  return (
    <div
      className="group cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
      style={{
        animation: `slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${150 + index * 100}ms both`,
      }}
    >
      <Card className="p-4 border-l-4 hover:border-l-opacity-100 transition-all" style={{
        borderLeftColor: config.accentColor,
      }}>
        <div className="space-y-3">
          {/* Header with name and weight indicator */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-slate-900">{score.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {(score.weight * 100).toFixed(0)}% weight
              </p>
            </div>
            <Badge variant="outline" className="text-lg font-semibold">
              {Math.round(score.score)}
            </Badge>
          </div>

          {/* Progress bar with animated fill */}
          <div className="space-y-2">
            <Progress
              value={score.score}
              className="h-2"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
              }}
            />
            <p className="text-xs text-slate-600 line-clamp-2">
              {score.explanation}
            </p>
          </div>

          {/* Hover hint */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-500">Click to see details</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Main component - orchestrates all reveals
 */
export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  analysis,
  isLoading = false,
  onExplainClick,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (isLoading) {
    return <ScoreDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Hero section - overall score */}
      <OverallScoreCard
        score={Math.round(analysis.overall_score)}
        summary={analysis.summary}
      />

      {/* Category breakdown - staggered entrance */}
      <div>
        <h2 className="text-lg font-medium text-slate-900 mb-4">Score breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.category_scores.map((score, idx) => (
            <CategoryScoreCard
              key={score.name}
              score={score}
              index={idx}
              onClick={() => {
                setExpandedCategory(
                  expandedCategory === score.name ? null : score.name
                );
                onExplainClick?.(score.name);
              }}
            />
          ))}
        </div>
      </div>

      {/* Actionable insights - organized by urgency */}
      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issues">
            Issues
            {analysis.ats_warnings.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {analysis.ats_warnings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="gaps">
            Gaps
            {analysis.gap_flags.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {analysis.gap_flags.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="wins">Strengths</TabsTrigger>
        </TabsList>

        {/* ATS Issues Tab */}
        <TabsContent value="issues" className="space-y-3 mt-4">
          {analysis.ats_warnings.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm">No ATS compatibility issues detected</p>
            </div>
          ) : (
            analysis.ats_warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-slideInUp"
                style={{
                  animation: `slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 100}ms both`,
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-900">{warning}</div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps" className="space-y-3 mt-4">
          {analysis.gap_flags.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm">No career gaps or red flags detected</p>
            </div>
          ) : (
            analysis.gap_flags.map((gap, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                style={{
                  animation: `slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 100}ms both`,
                }}
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">{gap.description}</div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Strengths Tab */}
        <TabsContent value="wins" className="space-y-3 mt-4">
          {analysis.semantic_matches
            .filter((m) => m.matched)
            .slice(0, 5)
            .map((match, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                style={{
                  animation: `slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 100}ms both`,
                }}
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-900">
                  <p className="font-medium">{match.requirement}</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Matched with: {match.best_matching_bullet}
                  </p>
                </div>
              </div>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Skeleton loader - shown while analysis is processing
 * Uses shimmer animation to indicate loading
 */
const ScoreDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-xl p-8 h-48 animate-shimmer" />

      {/* Category skeletons */}
      <div>
        <div className="h-6 w-32 bg-slate-200 rounded mb-4 animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-24 bg-slate-100 rounded-lg animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreDashboard;
