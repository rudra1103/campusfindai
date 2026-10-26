import React from 'react';
import { ScoreBreakdown } from '../../types';
import { getScoreBadgeColor } from '../../lib/utils';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

interface ScoreMeterProps {
  score: number;
  breakdown?: ScoreBreakdown;
  method?: string;
  showBreakdown?: boolean;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  breakdown,
  method = 'multi_signal_deterministic',
  showBreakdown = true,
}) => {
  const badgeInfo = getScoreBadgeColor(score);

  const signalLabels: { key: keyof ScoreBreakdown; label: string; weight: string }[] = [
    { key: 'text_similarity', label: 'Item Name & Description overlap', weight: '30%' },
    { key: 'category_compatibility', label: 'Category compatibility', weight: '15%' },
    { key: 'location_proximity', label: 'Location & building proximity', weight: '15%' },
    { key: 'date_proximity', label: 'Date & timestamp alignment', weight: '15%' },
    { key: 'colour_attribute', label: 'Color match', weight: '10%' },
    { key: 'brand_attribute', label: 'Brand & manufacturer match', weight: '10%' },
    { key: 'image_or_visual_match', label: 'Visual attributes present', weight: '5%' },
  ];

  return (
    <div className="bg-surface rounded-xl p-4 border border-brand-border">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-brand-secondary">
            AI Similarity Score
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-extrabold text-brand-main">{score}</span>
            <span className="text-sm font-semibold text-brand-secondary">/ 100</span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${badgeInfo.bg} ${badgeInfo.border}`}>
          <Sparkles className="w-3.5 h-3.5" />
          {badgeInfo.label}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-electric' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      {/* Engine Method Label */}
      <div className="flex items-center gap-1.5 text-xs text-brand-secondary mb-4 pb-3 border-b border-brand-border">
        <Info className="w-3.5 h-3.5 text-electric shrink-0" />
        <span>
          Computed via <strong className="text-brand-main">7-Signal Multi-Agent Engine</strong> ({method.replace(/_/g, ' ')})
        </span>
      </div>

      {/* Breakdown Signals */}
      {showBreakdown && breakdown && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase text-brand-secondary tracking-wider">
            Signal Weight Breakdown
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {signalLabels.map(s => {
              const val = breakdown[s.key] ?? 0;
              return (
                <div key={s.key} className="text-xs">
                  <div className="flex items-center justify-between text-brand-main mb-1">
                    <span className="font-medium text-slate-700">
                      {s.label} <span className="text-brand-secondary">({s.weight})</span>
                    </span>
                    <span className="font-semibold">{val}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        val >= 80 ? 'bg-emerald-500' : val >= 50 ? 'bg-blue-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safeguard Footer */}
      <div className="mt-4 pt-3 border-t border-brand-border flex items-start gap-2 text-xs text-brand-secondary">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-700">Safeguard Guarantee:</strong> Algorithmic similarity ranks potential matches. Official ownership verification is required before item handover.
        </p>
      </div>
    </div>
  );
};
