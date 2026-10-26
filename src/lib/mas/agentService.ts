import { db } from '../storage';
import { CoordinatorAgent } from './coordinatorAgent';
import { ItemMatch } from '../../types';

export class AgentService {
  /**
   * Rescan a specific report against all opposite reports
   */
  public static rescanReport(reportId: string): { matches: ItemMatch[]; count: number } {
    const report = db.getReportById(reportId);
    if (!report) throw new Error('Report not found');

    const allReports = db.getReports();
    const existingMatches = db.getMatches();

    const result = CoordinatorAgent.executeWorkflow({
      report,
      triggerSource: 'manual_rescan',
      targetOppositeReports: allReports,
      existingMatches,
    });

    if (result.upsertedMatches.length > 0) {
      db.upsertMatches(result.upsertedMatches);
    }
    db.addAgentRuns(result.agentRuns);
    result.generatedNotifications.forEach(n => db.addNotification(n));

    return {
      matches: result.rankedMatches,
      count: result.upsertedMatches.length,
    };
  }

  /**
   * Rescan entire database of active reports
   */
  public static rescanAll(): { totalMatches: number; runsExecuted: number } {
    const allReports = db.getReports();
    const activeLost = allReports.filter(r => r.report_type === 'lost' && r.status !== 'closed' && r.status !== 'recovered');
    let totalMatches = 0;
    let runsExecuted = 0;

    for (const lostReport of activeLost) {
      const res = this.rescanReport(lostReport.id);
      totalMatches += res.count;
      runsExecuted += 3; // 3 agents per lost report
    }

    return { totalMatches, runsExecuted };
  }

  /**
   * Calculate live Agent Operations metrics
   */
  public static getMetrics() {
    const runs = db.getAgentRuns();
    const matches = db.getMatches();
    const reports = db.getReports();

    const totalProcessed = reports.length;
    const candidatesGenerated = matches.length;
    const highPriority = matches.filter(m => m.verification_status === 'high_priority').length;
    const awaitingReview = matches.filter(m => m.verification_status === 'human_review_required' || m.verification_status === 'contradiction_flagged').length;
    const failedRuns = runs.filter(r => r.status === 'failed').length;

    const completedRunsWithDuration = runs.filter(r => r.duration_ms !== undefined && r.duration_ms > 0);
    const avgDuration = completedRunsWithDuration.length > 0
      ? Math.round(completedRunsWithDuration.reduce((acc, r) => acc + (r.duration_ms || 0), 0) / completedRunsWithDuration.length)
      : 350;

    return {
      totalProcessed,
      candidatesGenerated,
      highPriority,
      awaitingReview,
      failedRuns,
      avgDuration,
    };
  }
}
