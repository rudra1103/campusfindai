import React, { useState, useEffect } from 'react';
import { db } from '../lib/storage';
import { AgentRun, Profile } from '../types';
import { formatDateTime } from '../lib/utils';
import { AgentService } from '../lib/mas/agentService';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Bot, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Filter, 
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

export const AgentOperationsPage: React.FC = () => {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [metrics, setMetrics] = useState(AgentService.getMetrics());
  const [filterAgent, setFilterAgent] = useState<'all' | 'matching_agent' | 'verification_agent' | 'coordinator_agent'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed' | 'started'>('all');
  const [isRetryingId, setIsRetryingId] = useState<string | null>(null);
  const [rescanAllLoading, setRescanAllLoading] = useState(false);

  const loadData = () => {
    setCurrentUser(db.getCurrentUser());
    setRuns(db.getAgentRuns());
    setMetrics(AgentService.getMetrics());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleRetryRun = (runId: string) => {
    setIsRetryingId(runId);
    setTimeout(() => {
      db.retryAgentRun(runId);
      setIsRetryingId(null);
    }, 600);
  };

  const handleRunFullRescan = () => {
    setRescanAllLoading(true);
    setTimeout(() => {
      AgentService.rescanAll();
      setRescanAllLoading(false);
    }, 1000);
  };

  const filteredRuns = runs.filter(r => {
    if (filterAgent !== 'all' && r.agent_type !== filterAgent) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2 border border-purple-200">
            <Bot className="w-3.5 h-3.5" />
            <span>Multi-Agent System Telemetry & Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy">MAS Agent Operations</h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Real-time audit records for the Matching, Verification, and Coordinator autonomous backend agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRunFullRescan}
            isLoading={rescanAllLoading}
            leftIcon={<Zap className="w-3.5 h-3.5 text-accent-teal" />}
          >
            Dispatch Global MAS Rescan
          </Button>
        </div>
      </div>

      {/* 5 Real Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-card p-4 border border-brand-border shadow-card">
          <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
            Reports Processed
          </span>
          <div className="text-2xl font-extrabold text-navy mt-1">{metrics.totalProcessed}</div>
          <span className="text-[10px] text-brand-secondary">Evaluated in pipeline</span>
        </div>

        <div className="bg-white rounded-card p-4 border border-brand-border shadow-card">
          <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
            Candidate Pairs
          </span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">{metrics.candidatesGenerated}</div>
          <span className="text-[10px] text-brand-secondary">Matches generated</span>
        </div>

        <div className="bg-white rounded-card p-4 border border-brand-border shadow-card">
          <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
            High-Priority Candidates
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.highPriority}</div>
          <span className="text-[10px] text-brand-secondary">Score ≥ 80 / 100</span>
        </div>

        <div className="bg-white rounded-card p-4 border border-brand-border shadow-card">
          <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
            Human Review Queue
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.awaitingReview}</div>
          <span className="text-[10px] text-brand-secondary">Flagged or sensitive</span>
        </div>

        <div className="bg-white rounded-card p-4 border border-brand-border shadow-card col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
            Avg Execution Time
          </span>
          <div className="text-2xl font-extrabold text-electric mt-1">{metrics.avgDuration} ms</div>
          <span className="text-[10px] text-brand-secondary">Bounded latency</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-brand-border shadow-card flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-brand-main">
            <Filter className="w-4 h-4 text-brand-secondary" />
            <span>Filter Agent:</span>
          </div>

          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value as any)}
            className="p-1.5 rounded-lg border border-brand-border bg-surface text-xs font-medium focus:ring-1 focus:ring-electric"
          >
            <option value="all">All Agents</option>
            <option value="matching_agent">Matching Agent</option>
            <option value="verification_agent">Verification Agent</option>
            <option value="coordinator_agent">Coordinator Agent</option>
          </select>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1.5 font-semibold text-brand-main">
            <span>Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="p-1.5 rounded-lg border border-brand-border bg-surface text-xs font-medium focus:ring-1 focus:ring-electric"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed (Requires Retry)</option>
            <option value="started">Started</option>
          </select>
        </div>

        <span className="text-xs text-brand-secondary font-mono">
          Showing {filteredRuns.length} of {runs.length} Agent Runs
        </span>
      </div>

      {/* Agent Execution Logs Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-surface text-brand-secondary uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Run ID & Agent</th>
                <th className="py-3 px-4">Trigger Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Execution Summary & Notes</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRuns.map(run => {
                const isFailed = run.status === 'failed';
                const isMatching = run.agent_type === 'matching_agent';
                const isVerification = run.agent_type === 'verification_agent';

                return (
                  <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                    {/* Run ID & Agent */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isFailed
                              ? 'bg-rose-500'
                              : isMatching
                              ? 'bg-emerald-500'
                              : isVerification
                              ? 'bg-purple-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <div>
                          <div className="font-bold text-brand-main capitalize">
                            {run.agent_type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[10px] text-brand-secondary font-mono">
                            {run.id.slice(0, 12)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Trigger */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700 font-mono">
                        {run.trigger_source}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        variant={isFailed ? 'error' : run.status === 'completed' ? 'success' : 'default'}
                        size="sm"
                      >
                        {run.status.toUpperCase()}
                        {run.retry_count > 0 && ` (r${run.retry_count})`}
                      </Badge>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      {run.duration_ms !== undefined ? `${run.duration_ms} ms` : '—'}
                    </td>

                    {/* Output summary */}
                    <td className="py-3 px-4 max-w-xs">
                      {isFailed ? (
                        <div className="text-rose-700 font-medium">
                          Error: {run.error_code || 'Execution error'}
                          {run.output_summary?.error && (
                            <span className="block text-[11px] text-rose-600 font-normal truncate">
                              {run.output_summary.error}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-600 font-mono text-[11px] truncate">
                          {JSON.stringify(run.output_summary)}
                        </div>
                      )}
                    </td>

                    {/* Started At */}
                    <td className="py-3 px-4 whitespace-nowrap text-brand-secondary font-mono text-[11px]">
                      {formatDateTime(run.started_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {isFailed ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRetryRun(run.id)}
                          isLoading={isRetryingId === run.id}
                          leftIcon={<RotateCcw className="w-3 h-3" />}
                        >
                          Retry
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">Verified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
