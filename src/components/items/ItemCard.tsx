import React from 'react';
import { Link } from 'react-router-dom';
import { ItemReport, ItemMatch } from '../../types';
import { formatDate, getStatusBadge } from '../../lib/utils';
import { Badge } from '../common/Badge';
import { MapPin, Calendar, Sparkles, Tag, ShieldAlert } from 'lucide-react';

interface ItemCardProps {
  report: ItemReport;
  matches?: ItemMatch[];
  viewMode?: 'grid' | 'list';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  report,
  matches = [],
  viewMode = 'grid',
}) => {
  const isLost = report.report_type === 'lost';
  const statusInfo = getStatusBadge(report.status);

  // Highest match score
  const topMatch = matches.length > 0
    ? matches.reduce((max, m) => (m.matching_score > max.matching_score ? m : max), matches[0])
    : null;

  const fallbackImage = isLost
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80';

  const imageSrc = report.image_paths.length > 0 ? report.image_paths[0] : fallbackImage;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-card border border-brand-border p-4 shadow-card hover:shadow-elevated transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={imageSrc}
            alt={report.item_name}
            className="w-20 h-20 rounded-xl object-cover border border-brand-border shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isLost ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {report.report_type}
              </span>
              <span className="text-xs text-brand-secondary font-mono">{report.id.toUpperCase()}</span>
              <Badge variant={report.status === 'recovered' ? 'success' : report.status === 'matched' ? 'purple' : 'default'} size="sm">
                {statusInfo.label}
              </Badge>
            </div>

            <Link
              to={`/item/${report.id}`}
              className="text-base font-semibold text-brand-main hover:text-electric transition-colors"
            >
              {report.item_name}
            </Link>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-secondary mt-1">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {report.category}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {report.location_name_cache}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(report.event_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {topMatch && (
            <Link
              to={`/match-results/${report.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Match: {topMatch.matching_score}%</span>
            </Link>
          )}

          <Link
            to={`/item/${report.id}`}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-slate-200 text-brand-main transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-brand-border overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col group">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        <img
          src={imageSrc}
          alt={report.item_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm ${
              isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {report.report_type}
          </span>
          <span className="bg-navy/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            {report.category}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm ${statusInfo.bg} ${statusInfo.text}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Sensitive Item Warning if ID */}
        {report.category === 'ID Cards & Documents' && (
          <div className="absolute bottom-2 left-2 right-2 bg-navy-dark/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[11px] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-accent-teal shrink-0" />
            <span className="truncate">Sensitive ID — Protected verification required</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-brand-secondary font-mono mb-1">
            <span>{report.id.toUpperCase()}</span>
            <span>{formatDate(report.event_date)}</span>
          </div>

          <Link
            to={`/item/${report.id}`}
            className="font-semibold text-brand-main text-base line-clamp-1 hover:text-electric transition-colors"
          >
            {report.item_name}
          </Link>

          <p className="text-xs text-brand-secondary line-clamp-2 mt-1 leading-relaxed">
            {report.description}
          </p>

          <div className="mt-3 flex items-center gap-1 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{report.location_name_cache}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
          {topMatch ? (
            <Link
              to={`/match-results/${report.id}`}
              className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Match: {topMatch.matching_score}%</span>
            </Link>
          ) : (
            <span className="text-[11px] text-brand-secondary">No match candidate yet</span>
          )}

          <Link
            to={`/item/${report.id}`}
            className="text-xs font-semibold text-electric hover:underline"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
};
