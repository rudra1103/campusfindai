import React from 'react';
import { Link } from 'react-router-dom';
import { ItemMatch } from '../../types';
import { formatDate, getScoreBadgeColor } from '../../lib/utils';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';
import { Button } from '../common/Button';

interface MatchComparisonCardProps {
  match: ItemMatch;
  onInitiateClaim?: (match: ItemMatch) => void;
  canClaim?: boolean;
}

export const MatchComparisonCard: React.FC<MatchComparisonCardProps> = ({
  match,
  onInitiateClaim,
  canClaim = true,
}) => {
  const lost = match.lost_report;
  const found = match.found_report;

  if (!lost || !found) return null;

  const badgeInfo = getScoreBadgeColor(match.matching_score);

  return (
    <div className="bg-white rounded-card border border-brand-border shadow-card overflow-hidden transition-all hover:shadow-elevated">
      {/* Top Match Header Banner */}
      <div className="bg-surface px-6 py-4 border-b border-brand-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-brand-border flex items-center justify-center font-extrabold text-xl text-navy shadow-sm">
            {match.matching_score}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeInfo.bg} ${badgeInfo.border}`}>
                {badgeInfo.label}
              </span>
              <span className="text-xs text-brand-secondary font-mono">
                PAIR: {match.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-brand-secondary mt-0.5">
              Evaluated by Matching & Verification Agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canClaim && found.status !== 'recovered' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onInitiateClaim && onInitiateClaim(match)}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Verify & Claim This Item
            </Button>
          )}
          <Link to={`/item/${found.id}`}>
            <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Found Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Lost Item Card */}
          <div className="bg-rose-50/40 rounded-xl p-4 border border-rose-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Reported Lost
                </span>
                <span className="text-xs text-rose-700 font-mono">{lost.id.toUpperCase()}</span>
              </div>

              <div className="flex gap-3 mb-3">
                {lost.image_paths.length > 0 ? (
                  <img
                    src={lost.image_paths[0]}
                    alt={lost.item_name}
                    className="w-16 h-16 rounded-lg object-cover border border-rose-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-rose-100/50 flex items-center justify-center text-rose-400 text-xs text-center p-1 shrink-0">
                    No Photo
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-brand-main text-sm">{lost.item_name}</h4>
                  <p className="text-xs text-brand-secondary mt-0.5 line-clamp-2">{lost.description}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 border-t border-rose-100 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Category:</span>
                  <span className="font-medium">{lost.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Color / Brand:</span>
                  <span className="font-medium">{lost.colour || 'Unstated'} / {lost.brand || 'Unstated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Lost Location:</span>
                  <span className="font-medium text-right truncate max-w-[180px]">{lost.location_name_cache}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Date Lost:</span>
                  <span className="font-medium">{formatDate(lost.event_date)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-rose-800 flex items-center gap-1">
              <span>Reported by: {lost.reporter_name || 'Student'}</span>
            </div>
          </div>

          {/* Found Item Card */}
          <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Reported Found
                </span>
                <span className="text-xs text-emerald-700 font-mono">{found.id.toUpperCase()}</span>
              </div>

              <div className="flex gap-3 mb-3">
                {found.image_paths.length > 0 ? (
                  <img
                    src={found.image_paths[0]}
                    alt={found.item_name}
                    className="w-16 h-16 rounded-lg object-cover border border-emerald-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-emerald-100/50 flex items-center justify-center text-emerald-400 text-xs text-center p-1 shrink-0">
                    No Photo
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-brand-main text-sm">{found.item_name}</h4>
                  <p className="text-xs text-brand-secondary mt-0.5 line-clamp-2">{found.description}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 border-t border-emerald-100 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Category:</span>
                  <span className="font-medium">{found.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Color / Brand:</span>
                  <span className="font-medium">{found.colour || 'Unstated'} / {found.brand || 'Unstated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Found Location:</span>
                  <span className="font-medium text-right truncate max-w-[180px]">{found.location_name_cache}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Date Found:</span>
                  <span className="font-medium">{formatDate(found.event_date)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-emerald-800 flex items-center gap-1">
              <span>Custody: {found.custody_status?.replace(/_/g, ' ') || 'Reporter Custody'}</span>
            </div>
          </div>
        </div>

        {/* Verification Explanation */}
        <div className="mt-5 bg-surface rounded-xl p-4 border border-brand-border">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-electric" />
            <h4 className="text-xs font-bold text-brand-main uppercase tracking-wider">
              Verification Agent Analysis & Rationale
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            {match.matching_explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-brand-border">
            {/* Supporting Evidence */}
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Supporting Correlation Signals
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                {match.positive_signals.map((sig, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contradictions & Caveats */}
            <div>
              {match.possible_contradictions.length > 0 ? (
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Detected Contradictions / Discrepancies
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {match.possible_contradictions.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    Missing Verification Attributes
                  </span>
                  <ul className="space-y-1 text-xs text-slate-500">
                    {match.missing_information.length > 0 ? (
                      match.missing_information.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))
                    ) : (
                      <li className="italic text-emerald-700">All required attributes specified on both reports.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
