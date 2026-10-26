import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ItemMatch } from '../../types';
import { db } from '../../lib/storage';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: ItemMatch | null;
  onClaimSubmitted?: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  match,
  onClaimSubmitted,
}) => {
  const [description, setDescription] = useState('');
  const [distinctiveMarks, setDistinctiveMarks] = useState('');
  const [lossCircumstances, setLossCircumstances] = useState('');
  const [privateEvidence, setPrivateEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!match || !match.found_report) return null;
  const found = match.found_report;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !distinctiveMarks.trim()) return;

    setIsSubmitting(true);
    try {
      db.createClaim({
        matchId: match.id,
        foundReportId: found.id,
        description,
        distinctiveMarks,
        lossCircumstances,
        privateEvidenceReference: privateEvidence,
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmittedSuccess(false);
        onClose();
        if (onClaimSubmitted) onClaimSubmitted();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit claim');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initiate Ownership Claim & Verification"
      description={`Claiming Found Item: ${found.item_name} (REF: ${found.id.toUpperCase()})`}
      maxWidth="lg"
    >
      {submittedSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-brand-main">Claim Submitted Successfully!</h3>
          <p className="text-xs text-brand-secondary max-w-sm mx-auto">
            Your verification evidence has been securely routed to campus security and the lost-and-found moderation queue.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Safeguard Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-electric shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zero-Knowledge Ownership Protocol:</strong> Provide identifying details that only the true owner would know (e.g. engravings, wallpaper, lock pin pattern, stickers, contents of pockets). Your private evidence is hidden from other students and reviewed solely by authorized campus moderators.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Your Description of the Missing Item <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item in your own words (e.g. color, condition, scratches)..."
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Distinctive Markings or Specific Features <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={distinctiveMarks}
              onChange={e => setDistinctiveMarks(e.target.value)}
              placeholder="e.g. initials engraved, specific sticker, dent on top corner, color of case"
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Where and When Did You Misplace It?
            </label>
            <input
              type="text"
              value={lossCircumstances}
              onChange={e => setLossCircumstances(e.target.value)}
              placeholder="e.g. left on desk 14 on 2nd floor library around 2:00 PM Tuesday"
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>

          {/* Private Evidence Field */}
          <div className="bg-slate-50 p-3 rounded-xl border border-brand-border space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-accent-teal" />
              Private Verification Secret (Staff Eyes Only)
            </label>
            <input
              type="text"
              value={privateEvidence}
              onChange={e => setPrivateEvidence(e.target.value)}
              placeholder="e.g. Serial number, student ID number, lockscreen image, purchase receipt ref"
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 bg-white focus:ring-2 focus:ring-electric focus:outline-none"
            />
            <p className="text-[11px] text-brand-secondary">
              This field is encrypted and never revealed publicly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Submit Claim for Review
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
