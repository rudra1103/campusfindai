import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Bot, 
  Clock, 
  Lock, 
  MapPin, 
  HelpCircle,
  FileCheck,
  ChevronRight,
  RefreshCw,
  Users
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MASWorkflowDiagram } from '../components/mas/MASWorkflowDiagram';
import { ItemCard } from '../components/items/ItemCard';
import { db } from '../lib/storage';
import { ItemReport } from '../types';

export const LandingPage: React.FC = () => {
  const [recentFoundItems, setRecentFoundItems] = useState<ItemReport[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const reports = db.getReports();
    const found = reports.filter(r => r.report_type === 'found' && r.status !== 'archived').slice(0, 3);
    setRecentFoundItems(found);
  }, []);

  const faqs = [
    {
      q: 'How does the AI matching system work?',
      a: 'CampusFind AI uses a Multi-Agent System (MAS). When an item is reported, the Matching Agent evaluates a 7-signal deterministic score (name overlap, category, location, date, color, brand, and photos). The Verification Agent then audits candidate pairs for contradictions before recommending human review.',
    },
    {
      q: 'Can other students see my private verification details or serial numbers?',
      a: 'No. CampusFind AI strictly enforces field-level security. Private attributes (such as lockscreen codes, engravings, or student ID numbers) are never returned in public searches and are visible solely to authorized campus safety officers.',
    },
    {
      q: 'Does an 89% AI match prove I own the item?',
      a: 'No. High similarity scores rank candidate probability; they never establish legal ownership. A human staff member reviews the private evidence submitted with your claim before authorizing handover.',
    },
    {
      q: 'Where do physical item handovers take place?',
      a: 'For high-risk items like electronics, student IDs, and wallets, items are securely routed through designated campus points such as the Campus Safety Dispatch Office or Student Union desk.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-white via-surface to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-subtle border border-blue-200 text-electric text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Autonomous Multi-Agent Lost & Found</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy tracking-tight leading-[1.1]">
                Your Lost Belongings Deserve a <span className="text-electric">Way Back.</span>
              </h1>

              <p className="text-base sm:text-lg text-brand-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                CampusFind AI connects lost and found reports across your campus using intelligent multi-agent matching, zero-knowledge verification, and a campus community that looks out for one another.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/report-lost" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Report a Lost Item
                  </Button>
                </Link>
                <Link to="/browse" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" leftIcon={<Search className="w-4 h-4" />}>
                    Explore Found Items
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-brand-border/60 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-lg font-extrabold text-navy">7-Signal</div>
                  <div className="text-xs text-brand-secondary">Deterministic AI Scorer</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-navy">100% Private</div>
                  <div className="text-xs text-brand-secondary">RLS Secret Protection</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-navy">Human-in-Loop</div>
                  <div className="text-xs text-brand-secondary">Staff Handover Sign-off</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Connected Lost & Found Pair */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl p-5 shadow-elevated border border-brand-border">
                {/* Simulated Match Connection Header */}
                <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-brand-main">Live Match Detected</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    89% AI Similarity
                  </span>
                </div>

                {/* Lost Card Preview */}
                <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-200 mb-3 text-xs">
                  <div className="flex justify-between items-center text-rose-800 font-bold mb-1">
                    <span>LOST REPORT</span>
                    <span className="font-mono text-[10px]">REP-LOST-001</span>
                  </div>
                  <div className="font-semibold text-brand-main">Apple AirPods Pro (2nd Gen)</div>
                  <div className="text-brand-secondary text-[11px] mt-0.5">Main Library — 2nd Floor Commons</div>
                </div>

                {/* Connecting Pulse Agent Graphic */}
                <div className="my-2 py-2 bg-navy text-white rounded-xl px-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-accent-teal" />
                    <span className="font-medium text-[11px]">Verification Agent Audit:</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">No Contradictions</span>
                </div>

                {/* Found Card Preview */}
                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200 text-xs">
                  <div className="flex justify-between items-center text-emerald-800 font-bold mb-1">
                    <span>FOUND REPORT</span>
                    <span className="font-mono text-[10px]">REP-FOUND-001</span>
                  </div>
                  <div className="font-semibold text-brand-main">AirPods Pro Earbud Case with Buds</div>
                  <div className="text-brand-secondary text-[11px] mt-0.5">Main Library — Circulation Desk</div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-border text-center">
                  <Link
                    to="/match-results/rep-lost-001"
                    className="text-xs font-semibold text-electric hover:underline inline-flex items-center gap-1"
                  >
                    View Interactive AI Comparison Demonstration →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-electric bg-electric-subtle px-3 py-1 rounded-full">
            Intuitive Campus Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-navy mt-3">
            How CampusFind AI Works
          </h2>
          <p className="text-sm text-brand-secondary mt-2">
            A seamless four-step journey from losing an item to safe verified recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-card p-6 border border-brand-border shadow-card relative">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-base text-brand-main mb-2">Report</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Submit your lost or found item in under 60 seconds with location, category, photos, and optional private attributes.
            </p>
          </div>

          <div className="bg-white rounded-card p-6 border border-brand-border shadow-card relative">
            <div className="w-10 h-10 rounded-xl bg-electric text-white flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-base text-brand-main mb-2">Match</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              The autonomous Matching Agent instantly evaluates opposite records across 7 signals, calculating explainable similarity scores.
            </p>
          </div>

          <div className="bg-white rounded-card p-6 border border-brand-border shadow-card relative">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-base text-brand-main mb-2">Verify</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Verification Agent identifies inconsistencies. True owners submit zero-knowledge evidence checked solely by campus staff.
            </p>
          </div>

          <div className="bg-white rounded-card p-6 border border-brand-border shadow-card relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-base text-brand-main mb-2">Recover</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Schedule handover at the Campus Safety office. Both parties confirm recovery, officially closing the loop.
            </p>
          </div>
        </div>
      </section>

      {/* 3. MULTI-AGENT SYSTEM ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MASWorkflowDiagram />
      </section>

      {/* 4. RECENT FOUND ITEMS (Real DB records) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Active Found Registry
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mt-3">
              Recently Found Items on Campus
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary mt-1">
              Live records stored in the campus PostgreSQL database awaiting claimant identification.
            </p>
          </div>

          <Link to="/browse">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              View All Active Items
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentFoundItems.map(item => (
            <ItemCard key={item.id} report={item} />
          ))}
        </div>
      </section>

      {/* 5. CAMPUS TRUST & SAFETY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-2xl p-8 border border-brand-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand-main text-base mb-1">
                  Private Verification Attributes
                </h4>
                <p className="text-xs text-brand-secondary leading-relaxed">
                  Engravings, lock patterns, and student ID numbers are protected by PostgreSQL Row Level Security (RLS) and never displayed to other students.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand-main text-base mb-1">
                  Staff-Mediated Handover
                </h4>
                <p className="text-xs text-brand-secondary leading-relaxed">
                  High-value electronics, wallets, and government IDs are routed directly through campus security dispatch for secure physical handover.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand-main text-base mb-1">
                  Full Audit Logging
                </h4>
                <p className="text-xs text-brand-secondary leading-relaxed">
                  Every claim review, agent execution, and status transition is recorded in an immutable audit log for administrative oversight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Learn more about the technology and safeguards behind CampusFind AI.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-brand-border overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-brand-main hover:bg-surface transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-brand-secondary transition-transform duration-200 ${
                    activeFaq === idx ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-brand-secondary leading-relaxed border-t border-slate-100 bg-surface/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
