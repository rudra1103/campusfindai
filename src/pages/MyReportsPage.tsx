import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/storage';
import { ItemReport, ItemMatch, Claim, Profile } from '../types';
import { ItemCard } from '../components/items/ItemCard';
import { MatchComparisonCard } from '../components/items/MatchComparisonCard';
import { Button } from '../components/common/Button';
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Archive, 
  PlusCircle,
  Clock
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'matches' | 'claims' | 'resolved'>('all');

  const loadData = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);

    const allReports = db.getReports({ applyRLS: true });
    const userReps = allReports.filter(r => r.reporter_id === user.id);
    setReports(userReps);

    const allMatches = db.getMatches();
    const userMatches = allMatches.filter(m => {
      const lost = m.lost_report;
      const found = m.found_report;
      return (lost && lost.reporter_id === user.id) || (found && found.reporter_id === user.id);
    });
    setMatches(userMatches);

    const allClaims = db.getClaims();
    const userClaims = allClaims.filter(c => c.claimant_id === user.id);
    setClaims(userClaims);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const lostReports = reports.filter(r => r.report_type === 'lost' && r.status !== 'recovered' && r.status !== 'closed');
  const foundReports = reports.filter(r => r.report_type === 'found' && r.status !== 'recovered' && r.status !== 'closed');
  const resolvedReports = reports.filter(r => r.status === 'recovered' || r.status === 'closed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">My Reports & Activity</h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Manage your submissions, track candidate matches, and review resolved belongings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/report-lost">
            <Button size="sm" variant="secondary" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Report Lost
            </Button>
          </Link>
          <Link to="/report-found">
            <Button size="sm" variant="outline" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Report Found
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-brand-border overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'all'
              ? 'border-electric text-electric'
              : 'border-transparent text-brand-secondary hover:text-brand-main'
          }`}
        >
          All Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'lost'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-brand-secondary hover:text-brand-main'
          }`}
        >
          Lost Items ({lostReports.length})
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'found'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-brand-secondary hover:text-brand-main'
          }`}
        >
          Found Items ({foundReports.length})
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'matches'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-brand-secondary hover:text-brand-main'
          }`}
        >
          Potential AI Matches ({matches.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'claims'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-brand-secondary hover:text-brand-main'
          }`}
        >
          Active Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`pb-3 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'resolved'
              ? 'border-slate-800 text-slate-800'
              : 'border-transparent text-brand-secondary hover:text-brand-main'
          }`}
        >
          Resolved / Recovered ({resolvedReports.length})
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'matches' ? (
          <div className="space-y-6">
            {matches.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-brand-border text-xs text-brand-secondary">
                No potential matches currently calculated for your items.
              </div>
            ) : (
              matches.map(m => <MatchComparisonCard key={m.id} match={m} />)
            )}
          </div>
        ) : activeTab === 'claims' ? (
          <div className="space-y-4">
            {claims.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-brand-border text-xs text-brand-secondary">
                You have not submitted any ownership claims yet.
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map(c => (
                  <div key={c.id} className="bg-white rounded-xl p-4 border border-brand-border shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {c.status.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-semibold text-sm text-brand-main mt-1">
                        Claim for: {c.found_report?.item_name || 'Found item'}
                      </h4>
                      <p className="text-xs text-brand-secondary line-clamp-1">{c.claim_description}</p>
                    </div>
                    <Link to="/claims">
                      <Button size="sm" variant="outline">View Timeline</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'lost'
              ? lostReports
              : activeTab === 'found'
              ? foundReports
              : activeTab === 'resolved'
              ? resolvedReports
              : reports
            ).map(rep => (
              <ItemCard
                key={rep.id}
                report={rep}
                matches={matches.filter(m => m.lost_report_id === rep.id || m.found_report_id === rep.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
