import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/storage';
import { Profile, ItemReport, ItemMatch, Claim, Notification } from '../types';
import { 
  PlusCircle, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Bell
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ItemCard } from '../components/items/ItemCard';
import { formatDate } from '../lib/utils';
import { Badge } from '../components/common/Badge';

export const DashboardPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [userReports, setUserReports] = useState<ItemReport[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<ItemMatch[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadData = () => {
      const user = db.getCurrentUser();
      setCurrentUser(user);

      const allReports = db.getReports({ applyRLS: true });
      const myReports = allReports.filter(r => r.reporter_id === user.id);
      setUserReports(myReports);

      const allMatches = db.getMatches();
      const myMatches = allMatches.filter(m => {
        const lost = m.lost_report;
        const found = m.found_report;
        return (lost && lost.reporter_id === user.id) || (found && found.reporter_id === user.id);
      });
      setPotentialMatches(myMatches);

      const allClaims = db.getClaims();
      const myClaims = allClaims.filter(c => c.claimant_id === user.id);
      setUserClaims(myClaims);

      const notifs = db.getNotificationsForUser(user.id);
      setNotifications(notifs);
    };

    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const lostCount = userReports.filter(r => r.report_type === 'lost' && r.status !== 'recovered').length;
  const foundCount = userReports.filter(r => r.report_type === 'found' && r.status !== 'recovered').length;
  const recoveredCount = userReports.filter(r => r.status === 'recovered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-brand-secondary text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {currentUser.institution_name || 'Metro State University'} • {currentUser.department}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
            Welcome back, {currentUser.full_name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Track your reports, inspect AI-generated candidate matches, and verify ownership.
          </p>
        </div>

        {/* Quick Report Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/report-lost">
            <Button variant="secondary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Report Lost Item
            </Button>
          </Link>
          <Link to="/report-found">
            <Button variant="outline" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Report Found Item
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <div className="text-xs font-semibold uppercase text-brand-secondary tracking-wider">
            Active Lost Reports
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-rose-600">{lostCount}</span>
            <FileText className="w-5 h-5 text-rose-300" />
          </div>
          <div className="text-[11px] text-brand-secondary mt-2">
            {lostCount === 0 ? 'No active lost items' : 'Under active agent scanning'}
          </div>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <div className="text-xs font-semibold uppercase text-brand-secondary tracking-wider">
            Active Found Reports
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">{foundCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="text-[11px] text-brand-secondary mt-2">
            Awaiting owner identification
          </div>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <div className="text-xs font-semibold uppercase text-brand-secondary tracking-wider">
            Potential AI Matches
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-purple-600">{potentialMatches.length}</span>
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div className="text-[11px] text-brand-secondary mt-2">
            Generated by Matching Agent
          </div>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <div className="text-xs font-semibold uppercase text-brand-secondary tracking-wider">
            Pending Claims
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-blue-600">{userClaims.length}</span>
            <ShieldCheck className="w-5 h-5 text-blue-300" />
          </div>
          <div className="text-[11px] text-brand-secondary mt-2">
            Under staff review or handover
          </div>
        </div>
      </div>

      {/* Main Grid: AI Matches & My Active Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: AI Matches */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI-Detected Matches for Your Items
              </h2>
              <p className="text-xs text-brand-secondary">
                Candidate items ranked by the 7-signal deterministic engine.
              </p>
            </div>
            <Link to="/my-reports" className="text-xs font-semibold text-electric hover:underline">
              View All ({potentialMatches.length})
            </Link>
          </div>

          {potentialMatches.length === 0 ? (
            <div className="bg-white rounded-card p-8 text-center border border-brand-border shadow-card">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-brand-main">No Match Candidates Yet</h4>
              <p className="text-xs text-brand-secondary max-w-sm mx-auto mt-1">
                The Matching Agent automatically triggers whenever a new lost or found report is submitted on campus.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {potentialMatches.map(m => (
                <div
                  key={m.id}
                  className="bg-white rounded-card p-4 border border-brand-border shadow-card hover:shadow-elevated transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-extrabold text-lg shrink-0">
                      {m.matching_score}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                          {m.verification_status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-brand-secondary font-mono">{m.id.slice(0, 8)}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-brand-main line-clamp-1">
                        {m.lost_report?.item_name} ↔ {m.found_report?.item_name}
                      </h4>
                      <p className="text-xs text-brand-secondary line-clamp-1 mt-0.5">
                        {m.matching_explanation}
                      </p>
                    </div>
                  </div>

                  <Link to={`/match-results/${m.lost_report_id}`}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Compare
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 cols: Notifications & Quick Reports */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Notifications */}
          <div className="bg-white rounded-card p-5 border border-brand-border shadow-card space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="font-bold text-sm text-brand-main flex items-center gap-2">
                <Bell className="w-4 h-4 text-electric" />
                Recent Activity & Updates
              </h3>
              <Link to="/notifications" className="text-xs text-electric hover:underline font-medium">
                All
              </Link>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 4).map(n => (
                <div key={n.id} className="text-xs p-2.5 rounded-lg bg-surface border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-brand-main">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-brand-secondary font-normal">
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                  <p className="text-brand-secondary line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* User's Reports Snapshot */}
          <div className="bg-white rounded-card p-5 border border-brand-border shadow-card space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="font-bold text-sm text-brand-main">Your Submitted Reports</h3>
              <Link to="/my-reports" className="text-xs text-electric hover:underline font-medium">
                Manage
              </Link>
            </div>

            {userReports.length === 0 ? (
              <p className="text-xs text-brand-secondary text-center py-4">
                You haven't submitted any lost or found reports yet.
              </p>
            ) : (
              <div className="space-y-2">
                {userReports.slice(0, 3).map(rep => (
                  <div key={rep.id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-surface transition-colors">
                    <div className="truncate pr-2">
                      <div className="font-medium text-brand-main truncate">{rep.item_name}</div>
                      <div className="text-[10px] text-brand-secondary">{rep.location_name_cache}</div>
                    </div>
                    <Badge variant={rep.status === 'recovered' ? 'success' : 'default'} size="sm">
                      {rep.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
