import React, { useState, useEffect } from 'react';
import { db } from '../lib/storage';
import { Claim, Profile } from '../types';
import { formatDate, formatDateTime, getStatusBadge } from '../lib/utils';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Building,
  Calendar,
  Lock,
  UserCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const ClaimsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Review form states
  const [reviewStatus, setReviewStatus] = useState<Claim['status']>('approved');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [handoverTime, setHandoverTime] = useState('2026-10-27T14:00');
  const [handoverLocation, setHandoverLocation] = useState('Campus Safety Dispatch Office, Student Union Room 104');

  const isStaffOrAdmin = currentUser.role === 'staff' || currentUser.role === 'admin';

  const loadClaims = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    const all = db.getClaims();
    if (user.role === 'staff' || user.role === 'admin') {
      setClaims(all);
    } else {
      setClaims(all.filter(c => c.claimant_id === user.id));
    }
  };

  useEffect(() => {
    loadClaims();
    const unsub = db.subscribe(loadClaims);
    return () => unsub();
  }, []);

  const handleOpenReview = (claim: Claim) => {
    setSelectedClaim(claim);
    setReviewStatus(claim.status === 'submitted' ? 'under_review' : 'approved');
    setReviewerNotes(claim.reviewer_notes || '');
    setReviewModalOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    db.updateClaimReview(selectedClaim.id, {
      status: reviewStatus,
      reviewerNotes,
      handoverScheduledAt: reviewStatus === 'handover_scheduled' ? handoverTime : undefined,
      handoverLocation: reviewStatus === 'handover_scheduled' ? handoverLocation : undefined,
    });

    setReviewModalOpen(false);
  };

  const handleConfirmRecovery = (claim: Claim) => {
    const isClaimant = claim.claimant_id === currentUser.id;
    const updated = db.confirmRecovery(claim.id, isClaimant);

    if (updated?.status === 'recovered') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ownership Verification Workflow</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy">Ownership Claims & Safe Handover</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          {isStaffOrAdmin
            ? 'Moderation queue: Inspect evidence, authorize handovers, and confirm item returns.'
            : 'Track the verification progress of your submitted claims and schedule item pickup.'}
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-border shadow-card space-y-3 max-w-lg mx-auto">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-brand-main">No Claims Active</h3>
          <p className="text-xs text-brand-secondary leading-relaxed">
            You haven't initiated any ownership claims. When you spot a matching found item in browse or AI matches, click "Verify & Claim".
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map(claim => {
            const found = claim.found_report;
            const statusInfo = getStatusBadge(claim.status);
            const isClaimant = claim.claimant_id === currentUser.id;

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden transition-all hover:shadow-elevated"
              >
                {/* Header Strip */}
                <div className="bg-surface px-6 py-4 border-b border-brand-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-navy bg-white px-2.5 py-1 rounded-md border border-brand-border shadow-xs">
                      CLAIM: {claim.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-brand-secondary">
                      Submitted {formatDate(claim.created_at)}
                    </span>
                  </div>

                  {/* Staff Review Button */}
                  {isStaffOrAdmin && claim.status !== 'recovered' && claim.status !== 'closed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenReview(claim)}
                      leftIcon={<UserCheck className="w-4 h-4" />}
                    >
                      Moderate & Decide Claim
                    </Button>
                  )}
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left 7 cols: Claim Evidence & Item Info */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
                        Target Found Item
                      </span>
                      <h3 className="text-lg font-bold text-brand-main">
                        {found?.item_name || 'Found Item'}
                      </h3>
                      <p className="text-xs text-brand-secondary mt-0.5">
                        Location: {found?.location_name_cache} • Found on {found ? formatDate(found.event_date) : ''}
                      </p>
                    </div>

                    {/* Claimant's Statement */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-brand-border space-y-2 text-xs">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>Claimant's Statement ({claim.claimant_name})</span>
                        <span className="text-[10px] font-normal text-slate-500 font-mono">
                          {claim.claimant_email}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed italic">
                        "{claim.claim_description}"
                      </p>
                      <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                        <div>
                          <strong>Distinctive markings:</strong> {claim.distinctive_marks}
                        </div>
                        {claim.loss_circumstances && (
                          <div>
                            <strong>Loss context:</strong> {claim.loss_circumstances}
                          </div>
                        )}
                        {/* Private evidence (Visible ONLY to staff or claimant) */}
                        {claim.private_evidence_reference && (isStaffOrAdmin || isClaimant) && (
                          <div className="mt-2 bg-emerald-50 text-emerald-900 p-2 rounded border border-emerald-200">
                            <strong>Confidential Private Evidence:</strong> {claim.private_evidence_reference}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reviewer Notes if present */}
                    {claim.reviewer_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-electric" />
                          <span>Staff Reviewer Notes ({claim.reviewer_name || 'Campus Safety'})</span>
                        </div>
                        <p className="leading-relaxed">{claim.reviewer_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right 5 cols: Lifecycle Status & Handover Details */}
                  <div className="md:col-span-5 bg-surface rounded-xl p-5 border border-brand-border flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">
                        Recovery Milestones
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-brand-main">Claim Submitted</span>
                            <p className="text-[11px] text-brand-secondary">Evidence filed under zero-knowledge protocol.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                              claim.status !== 'submitted' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-white'
                            }`}
                          >
                            ✓
                          </div>
                          <div>
                            <span className="font-semibold text-brand-main">Staff Verification</span>
                            <p className="text-[11px] text-brand-secondary">
                              {claim.reviewer_name ? `Audited by ${claim.reviewer_name}` : 'Awaiting reviewer assignment'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                              claim.status === 'handover_scheduled' || claim.status === 'recovered'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-white'
                            }`}
                          >
                            ✓
                          </div>
                          <div>
                            <span className="font-semibold text-brand-main">Safe Handover</span>
                            <p className="text-[11px] text-brand-secondary">
                              {claim.handover_location || 'Campus Safety Dispatch Office'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dual Confirmation Actions */}
                    {claim.status !== 'recovered' && claim.status !== 'rejected' && (
                      <div className="pt-3 border-t border-brand-border space-y-2">
                        <div className="text-[11px] text-brand-secondary">
                          Dual confirmation required before official recovery sign-off:
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleConfirmRecovery(claim)}
                            disabled={claim.claimant_confirmed_recovery && isClaimant}
                            className="w-full text-xs"
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            {isClaimant
                              ? claim.claimant_confirmed_recovery ? 'You Confirmed Receipt' : 'Confirm I Received Item'
                              : 'Staff / Finder Confirm Handover'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {claim.status === 'recovered' && (
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Item Successfully Recovered & Closed!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Decide Claim & Schedule Handover"
        description="Authorized campus staff moderation."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Decision Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={reviewStatus}
              onChange={e => setReviewStatus(e.target.value as Claim['status'])}
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none bg-white font-semibold"
            >
              <option value="under_review">Under Active Review</option>
              <option value="approved">Approve Claim (Evidence Verified)</option>
              <option value="handover_scheduled">Schedule Physical Handover Appointment</option>
              <option value="info_requested">Request More Information / Additional Evidence</option>
              <option value="rejected">Reject Claim (Insufficient Proof)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Reviewer Notes to Claimant
            </label>
            <textarea
              rows={3}
              value={reviewerNotes}
              onChange={e => setReviewerNotes(e.target.value)}
              placeholder="Provide instructions to claimant, e.g. 'Bring your student ID to Dispatch Office'..."
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>

          {reviewStatus === 'handover_scheduled' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-3 rounded-xl border border-blue-200">
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  Handover Appointment Time
                </label>
                <input
                  type="datetime-local"
                  value={handoverTime}
                  onChange={e => setHandoverTime(e.target.value)}
                  className="w-full text-xs rounded-lg border border-brand-border p-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  Handover Location
                </label>
                <input
                  type="text"
                  value={handoverLocation}
                  onChange={e => setHandoverLocation(e.target.value)}
                  className="w-full text-xs rounded-lg border border-brand-border p-2 bg-white"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm">
              Save & Dispatch Notification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
