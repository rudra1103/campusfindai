import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/storage';
import { ItemReport, ItemMatch } from '../types';
import { MatchComparisonCard } from '../components/items/MatchComparisonCard';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { ClaimModal } from '../components/items/ClaimModal';
import { AgentService } from '../lib/mas/agentService';
import { Button } from '../components/common/Button';
import { 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const MatchResultsPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<ItemReport | undefined>(undefined);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [selectedMatchForClaim, setSelectedMatchForClaim] = useState<ItemMatch | null>(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanSuccess, setRescanSuccess] = useState(false);

  const loadData = () => {
    if (!reportId) return;
    const r = db.getReportById(reportId);
    setReport(r);
    const m = db.getMatchesForReport(reportId);
    setMatches(m);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [reportId]);

  const handleRescan = () => {
    if (!reportId) return;
    setIsRescanning(true);
    try {
      AgentService.rescanReport(reportId);
      setRescanSuccess(true);
      setTimeout(() => setRescanSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Rescan failed');
    } finally {
      setIsRescanning(false);
    }
  };

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-main">Report Not Found</h2>
        <Link to="/browse">
          <Button variant="secondary" size="sm">Back to Browse</Button>
        </Link>
      </div>
    );
  }

  const topMatch = matches.length > 0 ? matches[0] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-brand-secondary hover:text-brand-main transition-colors font-medium mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Report</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
              AI Match Results & Verification
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Analyzing candidate matches for: <strong className="text-brand-main">{report.item_name}</strong> ({report.report_type.toUpperCase()})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRescan}
            isLoading={isRescanning}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {rescanSuccess ? 'Rescan Complete!' : 'Rescan with MAS'}
          </Button>
        </div>
      </div>

      {/* Top Match Radar / Score Meter Widget */}
      {topMatch && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-brand-border shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Highest Correlation Candidate ({topMatch.matching_score}/100)
            </h3>
            <ScoreMeter
              score={topMatch.matching_score}
              breakdown={topMatch.score_breakdown}
              method={topMatch.matching_method}
              showBreakdown={true}
            />
          </div>

          <div className="lg:col-span-6 bg-navy text-white rounded-2xl p-6 border border-navy-light shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-teal">
                MAS Decision Protocol
              </span>
              <span className="text-[10px] bg-electric/30 text-white font-mono px-2 py-0.5 rounded">
                AUDITED
              </span>
            </div>
            <h4 className="text-lg font-bold">
              Autonomous Verification Safeguards
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              CampusFind AI strictly decouples mathematical correlation from verified ownership. A score of {topMatch.matching_score}% prompts human review; it does not grant automated access to items or reveal private reporter credentials.
            </p>

            <div className="pt-3 border-t border-navy-light text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic 7-signal scoring prevents AI hallucinations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-knowledge claim evidence submission</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Campus safety office mediated recovery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Comparisons List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Layers className="w-5 h-5 text-electric" />
            Comparison Cards ({matches.length} Candidates Identified)
          </h2>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-brand-border shadow-card space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-brand-main">No Match Candidates Found Yet</h3>
            <p className="text-xs text-brand-secondary max-w-md mx-auto leading-relaxed">
              The Matching Agent did not find eligible candidate reports exceeding the threshold for this item. Whenever a matching report is submitted anywhere on campus, you will receive an automatic notification.
            </p>
            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={handleRescan}>
                Trigger Rescan Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map(m => (
              <MatchComparisonCard
                key={m.id}
                match={m}
                onInitiateClaim={selected => {
                  setSelectedMatchForClaim(selected);
                  setClaimModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        match={selectedMatchForClaim}
        onClaimSubmitted={() => navigate('/claims')}
      />
    </div>
  );
};
