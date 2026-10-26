import React, { useState, useEffect } from 'react';
import { db } from '../lib/storage';
import { ItemReport, Claim, ItemMatch } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PieChart, 
  Tag, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);

  useEffect(() => {
    setReports(db.getReports());
    setClaims(db.getClaims());
    setMatches(db.getMatches());
  }, []);

  const lostCount = reports.filter(r => r.report_type === 'lost').length;
  const foundCount = reports.filter(r => r.report_type === 'found').length;
  const recoveredCount = reports.filter(r => r.status === 'recovered').length;
  const totalReports = reports.length;

  // Category counts
  const categoryCounts = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Location counts
  const locationCounts = reports.reduce((acc, r) => {
    acc[r.location_name_cache] = (acc[r.location_name_cache] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const sortedLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);

  const recoveryRate = totalReports > 0 ? Math.round((recoveredCount / totalReports) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2 border border-blue-200">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Campus Analytics & Impact Metrics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy">Campus Lost & Found Analytics</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          Aggregated database metrics measuring recovery success, lost vs found distributions, and location hotspots.
        </p>
      </div>

      {/* 4 Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Total Reports Filed
          </span>
          <div className="text-3xl font-extrabold text-navy mt-2">{totalReports}</div>
          <div className="text-[11px] text-brand-secondary mt-1">
            {lostCount} Lost • {foundCount} Found
          </div>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Confirmed Recoveries
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{recoveredCount}</div>
          <div className="text-[11px] text-brand-secondary mt-1">
            Reunited with verified owners
          </div>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Recovery Rate
          </span>
          <div className="text-3xl font-extrabold text-purple-600 mt-2">{recoveryRate}%</div>
          <div className="text-[11px] text-brand-secondary mt-1">
            Confirmed return ratio
          </div>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Avg Time to AI Match
          </span>
          <div className="text-3xl font-extrabold text-electric mt-2">&lt; 1.2s</div>
          <div className="text-[11px] text-brand-secondary mt-1">
            Autonomous agent trigger
          </div>
        </div>
      </div>

      {/* 2-Col Distribution Bars: Categories & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <h3 className="font-bold text-base text-navy flex items-center gap-2">
              <Tag className="w-4 h-4 text-electric" />
              Reports by Category
            </h3>
            <span className="text-xs text-brand-secondary font-mono">{sortedCategories.length} Categories</span>
          </div>

          <div className="space-y-3">
            {sortedCategories.map(([cat, count]) => {
              const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-brand-main">
                    <span className="font-semibold">{cat}</span>
                    <span className="font-mono text-brand-secondary">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-electric h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Hotspots */}
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <h3 className="font-bold text-base text-navy flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-teal" />
              Campus Location Hotspots
            </h3>
            <span className="text-xs text-brand-secondary font-mono">Frequent Zones</span>
          </div>

          <div className="space-y-3">
            {sortedLocations.map(([loc, count]) => {
              const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
              return (
                <div key={loc} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-brand-main">
                    <span className="font-semibold truncate max-w-[240px]">{loc}</span>
                    <span className="font-mono text-brand-secondary shrink-0">{count} reports</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-accent-teal h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lost vs Found Ratio Visual */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-card space-y-4">
        <h3 className="font-bold text-base text-navy flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          Lost vs. Found Volume Distribution
        </h3>

        <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden flex">
          <div
            className="bg-rose-500 h-full text-white text-[10px] font-bold flex items-center justify-center transition-all"
            style={{ width: `${totalReports > 0 ? (lostCount / totalReports) * 100 : 50}%` }}
          >
            Lost ({totalReports > 0 ? Math.round((lostCount / totalReports) * 100) : 0}%)
          </div>
          <div
            className="bg-emerald-500 h-full text-white text-[10px] font-bold flex items-center justify-center transition-all"
            style={{ width: `${totalReports > 0 ? (foundCount / totalReports) * 100 : 50}%` }}
          >
            Found ({totalReports > 0 ? Math.round((foundCount / totalReports) * 100) : 0}%)
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-brand-secondary pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Lost Reports ({lostCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Found Reports ({foundCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
