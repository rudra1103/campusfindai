import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/storage';
import { ItemReport, ItemMatch } from '../types';
import { ItemCard } from '../components/items/ItemCard';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Sparkles, 
  RotateCcw,
  Tag,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '../components/common/Button';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'ID Cards & Documents',
  'Bags & Wallets',
  'Keys',
  'Books & Stationery',
  'Clothing & Accessories',
  'Jewellery',
  'Sports Equipment',
  'Other',
];

export const BrowsePage: React.FC = () => {
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const locations = db.getLocations();

  useEffect(() => {
    const loadData = () => {
      setReports(db.getReports({ applyRLS: true }));
      setMatches(db.getMatches());
    };
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredReports = useMemo(() => {
    return reports
      .filter(r => {
        // Exclude archived from public discovery
        if (r.status === 'archived') return false;

        // Type filter
        if (typeFilter !== 'all' && r.report_type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'All Categories' && r.category !== categoryFilter) return false;

        // Location filter
        if (locationFilter !== 'all' && r.location_id !== locationFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = r.item_name.toLowerCase().includes(q);
          const matchDesc = r.description.toLowerCase().includes(q);
          const matchColor = r.colour?.toLowerCase().includes(q);
          const matchBrand = r.brand?.toLowerCase().includes(q);
          const matchLoc = r.location_name_cache.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchColor && !matchBrand && !matchLoc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.event_date).getTime();
        const timeB = new Date(b.event_date).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [reports, typeFilter, categoryFilter, locationFilter, searchQuery, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('All Categories');
    setLocationFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-navy">Browse Campus Belongings</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          Explore lost and found listings across campus. Search descriptions, filter by building, and find potential AI matches.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-border shadow-card space-y-4">
        {/* Top Search Input & View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, brand, color (e.g. AirPods, Hydro Flask, black)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-electric focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-brand-secondary hover:text-brand-main"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Toggle & View Mode Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="inline-flex rounded-xl p-1 bg-surface border border-brand-border text-xs font-semibold">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  typeFilter === 'all' ? 'bg-navy text-white shadow-xs' : 'text-brand-secondary hover:text-brand-main'
                }`}
              >
                All ({reports.length})
              </button>
              <button
                onClick={() => setTypeFilter('lost')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  typeFilter === 'lost' ? 'bg-rose-600 text-white shadow-xs' : 'text-brand-secondary hover:text-brand-main'
                }`}
              >
                Lost ({reports.filter(r => r.report_type === 'lost').length})
              </button>
              <button
                onClick={() => setTypeFilter('found')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  typeFilter === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'text-brand-secondary hover:text-brand-main'
                }`}
              >
                Found ({reports.filter(r => r.report_type === 'found').length})
              </button>
            </div>

            <div className="flex items-center gap-1 border-l border-brand-border pl-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs ${
                  viewMode === 'grid' ? 'bg-slate-100 text-navy' : 'text-brand-secondary hover:bg-surface'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs ${
                  viewMode === 'list' ? 'bg-slate-100 text-navy' : 'text-brand-secondary hover:bg-surface'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-brand-border text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-brand-secondary mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-brand-border p-2 focus:ring-1 focus:ring-electric focus:outline-none bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brand-secondary mb-1">
              Campus Location
            </label>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-brand-border p-2 focus:ring-1 focus:ring-electric focus:outline-none bg-white"
            >
              <option value="all">All Campus Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brand-secondary mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="w-full text-xs rounded-lg border border-brand-border p-2 focus:ring-1 focus:ring-electric focus:outline-none bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 rounded-lg border border-brand-border text-brand-secondary hover:text-brand-main hover:bg-surface flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-brand-secondary">
        <div>
          Showing <strong className="text-brand-main">{filteredReports.length}</strong> listings
          {typeFilter !== 'all' && ` (${typeFilter.toUpperCase()})`}
        </div>
      </div>

      {/* Reports Grid / List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-border shadow-card max-w-lg mx-auto space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-brand-main">No Items Found</h3>
          <p className="text-xs text-brand-secondary leading-relaxed">
            No active reports matched your current search filters. Try adjusting your search term, clearing location filters, or submit a new report.
          </p>
          <div className="pt-2">
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredReports.map(report => (
            <ItemCard
              key={report.id}
              report={report}
              matches={matches.filter(m => m.lost_report_id === report.id || m.found_report_id === report.id)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
