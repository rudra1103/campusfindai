import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/storage';
import { ItemReport, ItemMatch, Profile } from '../types';
import { formatDate, getStatusBadge } from '../lib/utils';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ClaimModal } from '../components/items/ClaimModal';
import { Modal } from '../components/common/Modal';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Flag, 
  ArrowLeft,
  Share2,
  CheckCircle2,
  Building,
  AlertTriangle
} from 'lucide-react';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<ItemReport | undefined>(undefined);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedMatchForClaim, setSelectedMatchForClaim] = useState<ItemMatch | null>(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = () => {
      const r = db.getReportById(id);
      setReport(r);
      const m = db.getMatchesForReport(id);
      setMatches(m);
      setCurrentUser(db.getCurrentUser());
    };
    load();
    const unsub = db.subscribe(load);
    return () => unsub();
  }, [id]);

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-main">Report Not Found</h2>
        <p className="text-xs text-brand-secondary">
          The requested lost or found listing does not exist or may have been archived.
        </p>
        <Link to="/browse">
          <Button variant="secondary" size="sm">Back to Browse</Button>
        </Link>
      </div>
    );
  }

  const isLost = report.report_type === 'lost';
  const isReporter = currentUser.id === report.reporter_id;
  const isStaffOrAdmin = currentUser.role === 'staff' || currentUser.role === 'admin';
  const statusInfo = getStatusBadge(report.status);

  const handleCloseReport = () => {
    if (confirm('Are you sure you want to close this report?')) {
      db.updateReportStatus(report.id, 'closed');
    }
  };

  const handleFlagReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason.trim()) return;
    db.logAudit(currentUser.id, 'FLAG_REPORT', 'item_reports', report.id, flagReason);
    setFlagSubmitted(true);
    setTimeout(() => {
      setFlagSubmitted(false);
      setFlagModalOpen(false);
      setFlagReason('');
    }, 1500);
  };

  const fallbackImage = isLost
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';

  const imageSrc = report.image_paths.length > 0 ? report.image_paths[0] : fallbackImage;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-brand-secondary hover:text-brand-main transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Grid: Left Photo, Right Details */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left 5 cols: Image Gallery */}
        <div className="md:col-span-5 bg-slate-100 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-brand-border relative">
          <div className="w-full aspect-square rounded-xl overflow-hidden border border-brand-border shadow-xs bg-white">
            <img
              src={imageSrc}
              alt={report.item_name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-4 flex items-center justify-between w-full text-xs text-brand-secondary">
            <span className="font-mono">REF: {report.id.toUpperCase()}</span>
            <span>{report.image_paths.length} photo(s)</span>
          </div>
        </div>

        {/* Right 7 cols: Report Metadata & Actions */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    isLost ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {report.report_type} Item
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-navy text-white">
                  {report.category}
                </span>
              </div>

              <Badge variant={report.status === 'recovered' ? 'success' : 'default'} size="md">
                {statusInfo.label}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-main">
              {report.item_name}
            </h1>

            <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
              {report.description}
            </p>

            {/* Structured Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-border text-xs text-slate-700">
              <div className="space-y-1">
                <span className="text-brand-secondary">Primary Color:</span>
                <p className="font-semibold">{report.colour || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-brand-secondary">Brand / Make:</span>
                <p className="font-semibold">{report.brand || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-brand-secondary">Event Date & Time:</span>
                <p className="font-semibold">
                  {formatDate(report.event_date)} {report.event_time ? `at ${report.event_time}` : ''}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-brand-secondary">Location:</span>
                <p className="font-semibold truncate">{report.location_name_cache}</p>
              </div>
            </div>

            {/* Found Custody Info */}
            {!isLost && report.custody_status && (
              <div className="bg-surface rounded-xl p-3 border border-brand-border text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-brand-main">
                  <Building className="w-3.5 h-3.5 text-electric" />
                  <span>Physical Custody: {report.custody_status.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                {report.safe_handover_location && (
                  <p className="text-brand-secondary">
                    Handover Point: {report.safe_handover_location}
                  </p>
                )}
              </div>
            )}

            {/* Private Attributes (Visible ONLY to Reporter or Staff/Admin) */}
            {report.private_attributes && Object.keys(report.private_attributes).length > 0 && (
              <div className="bg-accent-teal-light/30 border border-teal-200 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-accent-teal-dark">
                  <Lock className="w-3.5 h-3.5 text-accent-teal" />
                  <span>Private Verification Attributes (Protected by RLS)</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-0.5">
                  {Object.entries(report.private_attributes).map(([k, v]) => (
                    <div key={k}>
                      <strong className="capitalize">{k.replace(/_/g, ' ')}:</strong> {v}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-brand-border flex flex-wrap items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2">
              {/* If found item, allow claiming */}
              {!isLost && report.status !== 'recovered' && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    // Find or create synthetic match context
                    const existingMatch = matches[0] || ({
                      id: 'adhoc-claim',
                      lost_report_id: '',
                      found_report_id: report.id,
                      matching_score: 75,
                      score_breakdown: {
                        text_similarity: 70,
                        category_compatibility: 100,
                        location_proximity: 70,
                        date_proximity: 80,
                        colour_attribute: 50,
                        brand_attribute: 50,
                        image_or_visual_match: 50,
                      },
                      matching_method: 'multi_signal_deterministic',
                      matching_explanation: 'Direct user candidate claim',
                      positive_signals: [],
                      missing_information: [],
                      possible_contradictions: [],
                      verification_status: 'possible_match',
                      priority: 'medium',
                      status: 'active',
                      last_evaluated_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      found_report: report,
                    } as ItemMatch);

                    setSelectedMatchForClaim(existingMatch);
                    setClaimModalOpen(true);
                  }}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  This Might Be Mine (Claim)
                </Button>
              )}

              {/* If lost item, allow viewing matches */}
              {isLost && matches.length > 0 && (
                <Link to={`/match-results/${report.id}`}>
                  <Button variant="secondary" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                    View {matches.length} AI Match Candidate(s)
                  </Button>
                </Link>
              )}

              {/* Reporter edit/close options */}
              {isReporter && report.status !== 'recovered' && report.status !== 'closed' && (
                <Button variant="outline" size="md" onClick={handleCloseReport}>
                  Mark Closed
                </Button>
              )}
            </div>

            <button
              onClick={() => setFlagModalOpen(true)}
              className="text-xs text-brand-secondary hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Abuse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Matches Section */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Match Candidates for this Report
            </h2>
            <Link
              to={`/match-results/${report.id}`}
              className="text-xs font-semibold text-electric hover:underline"
            >
              Detailed Comparison View →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(m => {
              const other = isLost ? m.found_report : m.lost_report;
              if (!other) return null;
              return (
                <div
                  key={m.id}
                  className="bg-white rounded-xl p-4 border border-brand-border shadow-xs hover:shadow-card transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {m.matching_score}% Match
                      </span>
                      <span className="text-[10px] text-brand-secondary uppercase font-semibold">
                        {m.verification_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-brand-main line-clamp-1">{other.item_name}</h4>
                    <p className="text-xs text-brand-secondary">{other.location_name_cache}</p>
                  </div>

                  <Link to={`/match-results/${report.id}`}>
                    <Button size="sm" variant="outline">
                      Compare
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        match={selectedMatchForClaim}
        onClaimSubmitted={() => {
          navigate('/claims');
        }}
      />

      {/* Report Flag Modal */}
      <Modal
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        title="Report Suspicious or Inappropriate Listing"
        description="Flag this report for campus safety administration review."
      >
        {flagSubmitted ? (
          <div className="py-6 text-center text-xs text-emerald-700 font-semibold space-y-1">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-600" />
            <p>Thank you. Your report has been flagged for campus moderation.</p>
          </div>
        ) : (
          <form onSubmit={handleFlagReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Reason for report
              </label>
              <textarea
                required
                rows={3}
                value={flagReason}
                onChange={e => setFlagReason(e.target.value)}
                placeholder="Describe spam, duplicate, abusive language, or fraudulent claims..."
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setFlagModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Submit Flag
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
