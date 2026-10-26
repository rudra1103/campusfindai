import React from 'react';
import { Bot, Sparkles, ShieldCheck, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';

export const MASWorkflowDiagram: React.FC = () => {
  return (
    <div className="bg-navy text-white rounded-2xl p-6 sm:p-8 shadow-elevated border border-navy-light overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-electric/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/20 text-accent-teal text-xs font-semibold uppercase tracking-wider mb-3">
          <Cpu className="w-3.5 h-3.5" />
          Autonomous Multi-Agent Architecture
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          How the 3-Tier Multi-Agent System (MAS) Operates
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Every report submission triggers an auditable sequence across three specialized agents. Each agent maintains modular responsibilities, strict separation of concerns, and full execution logging in PostgreSQL.
        </p>
      </div>

      {/* 3 Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Agent 1 */}
        <div className="bg-navy-light/60 backdrop-blur-md rounded-xl p-5 border border-navy-light/80 hover:border-electric/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              01
            </span>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Signal Engine
            </span>
          </div>
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            Matching Agent
          </h4>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Filters opposite eligible reports by campus, category, and active status. Computes a 7-signal weighted similarity score (0–100) across text TF-IDF, category, location, date, color, and brand.
          </p>
          <div className="mt-4 pt-3 border-t border-navy-light/80 flex items-center gap-1.5 text-[11px] text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Multi-signal breakdown output</span>
          </div>
        </div>

        {/* Agent 2 */}
        <div className="bg-navy-light/60 backdrop-blur-md rounded-xl p-5 border border-navy-light/80 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              02
            </span>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
              Safeguards & Audit
            </span>
          </div>
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Verification Agent
          </h4>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Evaluates candidate pairs for logical contradictions (color mismatches, timeline paradoxes). Categorizes into decision bands: High Priority (80–100), Possible (60–79), or Flagged Contradiction.
          </p>
          <div className="mt-4 pt-3 border-t border-navy-light/80 flex items-center gap-1.5 text-[11px] text-purple-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero-knowledge evidence audit</span>
          </div>
        </div>

        {/* Agent 3 */}
        <div className="bg-navy-light/60 backdrop-blur-md rounded-xl p-5 border border-navy-light/80 hover:border-accent-teal/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="w-8 h-8 rounded-lg bg-accent-teal/20 text-accent-teal flex items-center justify-center font-bold text-xs">
              03
            </span>
            <span className="text-[10px] font-mono text-accent-teal uppercase tracking-wider font-semibold">
              Workflow Master
            </span>
          </div>
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-teal" />
            Coordinator Agent
          </h4>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Orchestrates event triggers, persists deduplicated matches, dispatches notifications to students, logs runs in `agent_runs` table, and enforces deterministic state transitions for claims.
          </p>
          <div className="mt-4 pt-3 border-t border-navy-light/80 flex items-center gap-1.5 text-[11px] text-teal-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Idempotency & bounded retries</span>
          </div>
        </div>
      </div>

      {/* Linear Pipeline Ribbon */}
      <div className="mt-8 pt-6 border-t border-navy-light/80">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-3">
          Complete Lifecycle Pipeline:
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="bg-navy-light px-2.5 py-1 rounded-md font-medium text-white">Report Submitted</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-md font-medium">Matching Agent</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <span className="bg-purple-950/80 text-purple-300 border border-purple-800 px-2.5 py-1 rounded-md font-medium">Verification Agent</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <span className="bg-blue-950/80 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-md font-medium">Coordinator Ranking</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <span className="bg-navy-light px-2.5 py-1 rounded-md font-medium text-white">Notification</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <span className="bg-amber-950/80 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-md font-medium">Ownership Claim</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <span className="bg-navy-light px-2.5 py-1 rounded-md font-medium text-white">Human Review</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md font-semibold">Dual Recovery Confirmed</span>
        </div>
      </div>
    </div>
  );
};
