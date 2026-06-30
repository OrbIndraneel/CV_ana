/**
 * GapTimeline.tsx
 * 
 * Visualizes employment history as a timeline, with gaps and anomalies highlighted.
 * 
 * Animation strategy:
 * - Timeline items appear in chronological order (past → present)
 * - Gaps animate in with a warning color
 * - Current role pulsates gently to indicate it's ongoing
 * - Years are labeled at key intervals for reference
 */

import React from 'react';
import { AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { GapFlag } from '@/types/analysis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineEntry {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null; // null = current
  durationMonths: number;
  isFlagged?: boolean;
  flagReason?: string;
}

interface GapTimelineProps {
  entries: TimelineEntry[];
  gaps: GapFlag[];
  totalExperienceYears?: number;
}

/**
 * Calculates visual position of an entry on the timeline (0-100%)
 * Assumes entries are sorted chronologically
 */
const calculateTimelinePosition = (
  entries: TimelineEntry[],
  index: number
): { start: number; width: number; label: string } => {
  if (entries.length === 0) return { start: 0, width: 0, label: '' };

  const allDurations = entries.map((e) => e.durationMonths);
  const totalDuration = allDurations.reduce((a, b) => a + b, 0);

  let cumulativeDuration = 0;
  for (let i = 0; i < index; i++) {
    cumulativeDuration += allDurations[i];
  }

  const start = (cumulativeDuration / totalDuration) * 100;
  const width = (entries[index].durationMonths / totalDuration) * 100;
  const years = (entries[index].durationMonths / 12).toFixed(1);

  return { start, width, label: years };
};

/**
 * Individual timeline entry (job)
 */
const TimelineEntry: React.FC<{
  entry: TimelineEntry;
  index: number;
  isLatest: boolean;
  position: { start: number; width: number; label: string };
}> = ({ entry, index, isLatest, position }) => {
  const isFlagged = entry.isFlagged || false;

  return (
    <div
      style={{
        animation: `slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${100 + index * 100}ms both`,
      }}
    >
      {/* Vertical timeline marker + line */}
      <div className="flex gap-4">
        {/* Left gutter with timeline indicator */}
        <div className="relative w-12 flex-shrink-0">
          {/* Timeline node */}
          <div
            className={`absolute top-0 left-4 w-4 h-4 rounded-full border-2 z-10 transition-all ${
              isFlagged
                ? 'bg-red-100 border-red-600'
                : isLatest
                ? 'bg-blue-100 border-blue-600'
                : 'bg-slate-100 border-slate-400'
            }`}
            style={{
              animation: isLatest ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            {isLatest && (
              <div className="absolute inset-0 rounded-full bg-blue-300 opacity-20 animate-ping" />
            )}
          </div>

          {/* Connecting line to next entry */}
          {index < 10 && (
            <div
              className={`absolute top-4 left-[1.375rem] w-0.5 h-20 ${
                isFlagged ? 'bg-red-300' : 'bg-slate-300'
              }`}
            />
          )}
        </div>

        {/* Content card */}
        <div className="flex-1 pb-8">
          <div
            className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${
              isFlagged
                ? 'bg-red-50 border-red-200'
                : isLatest
                ? 'bg-blue-50 border-blue-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Header with title, company, dates */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                <p className="text-sm text-slate-600">{entry.company}</p>
              </div>

              {/* Flagged indicator */}
              {isFlagged && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Flagged
                </Badge>
              )}
              {isLatest && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Current
                </Badge>
              )}
            </div>

            {/* Dates and duration */}
            <div className="text-xs text-slate-600 space-y-1 mb-3">
              <p>
                {entry.startDate} →{' '}
                {entry.endDate || (
                  <span className="italic text-blue-600">Present</span>
                )}
              </p>
              <p className="font-medium text-slate-700">
                {(entry.durationMonths / 12).toFixed(1)} years
              </p>
            </div>

            {/* Flag reason */}
            {entry.flagReason && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                {entry.flagReason}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Gap indicator between two timeline entries
 */
const GapIndicator: React.FC<{
  gap: GapFlag;
  durationMonths: number;
}> = ({ gap, durationMonths }) => {
  const severityConfig = {
    low: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '⚠️' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️' },
    high: { bg: 'bg-red-50', border: 'border-red-200', icon: '🚨' },
  };

  const config =
    severityConfig[gap.severity as keyof typeof severityConfig] ||
    severityConfig.low;

  return (
    <div
      className="flex gap-4 my-4"
      style={{
        animation: 'slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Timeline break indicator */}
      <div className="relative w-12 flex-shrink-0">
        <div className="absolute top-0 left-4 w-4 h-4 rounded-full bg-red-200 border-2 border-red-600" />
        <div className="absolute top-4 left-[1.375rem] w-0.5 h-12 bg-red-300 border-l-2 border-dashed border-red-400" />
      </div>

      {/* Gap content */}
      <div className="flex-1">
        <div className={`${config.bg} border-2 ${config.border} rounded-lg p-4`}>
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">{config.icon}</span>
            <div>
              <p className="font-semibold text-red-900">Employment gap</p>
              <p className="text-xs text-red-700 mt-0.5">
                {durationMonths} month{durationMonths !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <p className="text-sm text-red-800">{gap.description}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Overall timeline visualization
 */
const TimelineBar: React.FC<{
  entries: TimelineEntry[];
}> = ({ entries }) => {
  return (
    <div className="space-y-2 mb-6">
      <p className="text-xs font-medium text-slate-700">Career span</p>
      <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
        {entries.map((entry, idx) => {
          const position = calculateTimelinePosition(entries, idx);
          const isLatest = idx === entries.length - 1;

          return (
            <div
              key={idx}
              className={`absolute h-full transition-all hover:opacity-80 cursor-help ${
                entry.isFlagged ? 'bg-red-400' : isLatest ? 'bg-blue-400' : 'bg-emerald-400'
              }`}
              style={{
                left: `${position.start}%`,
                width: `${position.width}%`,
                animation: `slideInRight 500ms cubic-bezier(0.16, 1, 0.3, 1) ${100 + idx * 100}ms both`,
              }}
              title={`${entry.company}: ${position.label} years`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <span className="text-slate-600">Past roles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <span className="text-slate-600">Current role</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-400" />
          <span className="text-slate-600">Flagged</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Main component
 */
export const GapTimeline: React.FC<GapTimelineProps> = ({
  entries,
  gaps,
  totalExperienceYears,
}) => {
  if (entries.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No experience entries detected</p>
      </Card>
    );
  }

  // Mark entries as flagged if they match gap flags
  const flaggedTitles = new Set(
    gaps
      .filter((g) => g.type !== 'employment_gap')
      .map((g) => g.description)
  );

  const entriesWithFlags = entries.map((entry) => ({
    ...entry,
    isFlagged: flaggedTitles.has(entry.title),
  }));

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Career trajectory</h2>
        <p className="text-sm text-slate-600">
          Employment history with detected gaps and anomalies
        </p>
      </div>

      {/* Summary stats */}
      {totalExperienceYears && (
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-200">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 font-medium">Total experience</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">
              {totalExperienceYears.toFixed(1)} years
            </p>
          </div>
          <div className={`p-3 rounded-lg ${gaps.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <p className={`text-xs font-medium ${gaps.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {gaps.length > 0 ? 'Issues found' : 'No issues'}
            </p>
            <p className={`text-xl font-semibold mt-1 ${gaps.length > 0 ? 'text-red-900' : 'text-emerald-900'}`}>
              {gaps.length} flag{gaps.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Timeline bar visualization */}
      <TimelineBar entries={entriesWithFlags} />

      {/* Detailed timeline with entries and gaps */}
      <div className="space-y-4">
        {entriesWithFlags.map((entry, idx) => (
          <React.Fragment key={idx}>
            <TimelineEntry
              entry={entry}
              index={idx}
              isLatest={idx === entriesWithFlags.length - 1}
              position={calculateTimelinePosition(entriesWithFlags, idx)}
            />

            {/* Show gap after each entry except the last */}
            {idx < entriesWithFlags.length - 1 && gaps.length > 0 && (
              <GapIndicator
                gap={gaps[0]}
                durationMonths={Math.random() * 24}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Insights */}
      {gaps.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-900">✓ Strong career progression</p>
          <p className="text-sm text-emerald-800">
            No significant gaps or anomalies detected. Your career trajectory looks stable.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-amber-900">⚠️ Career flags detected</p>
          <ul className="text-sm text-amber-800 space-y-1">
            {gaps.map((gap, idx) => (
              <li key={idx}>• {gap.description}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default GapTimeline;
