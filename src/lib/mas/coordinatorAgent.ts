import { 
  ItemReport, 
  ItemMatch, 
  AgentRun, 
  Notification, 
  MatchVerificationStatus 
} from '../../types';
import { MatchingAgent, MatchingAgentResult } from './matchingAgent';
import { VerificationAgent, VerificationAgentResult } from './verificationAgent';
import { generateUUID } from '../utils';

export interface CoordinatorEventPayload {
  report: ItemReport;
  triggerSource: 'report_created' | 'report_updated' | 'manual_rescan' | 'admin_retry';
  targetOppositeReports: ItemReport[];
  existingMatches: ItemMatch[];
}

export interface CoordinatorExecutionResult {
  agentRuns: AgentRun[];
  upsertedMatches: ItemMatch[];
  generatedNotifications: Notification[];
  rankedMatches: ItemMatch[];
  reportsProcessedCount: number;
}

export class CoordinatorAgent {
  /**
   * Orchestrates the MAS workflow for an incoming report event
   */
  public static executeWorkflow(payload: CoordinatorEventPayload): CoordinatorExecutionResult {
    const startTime = Date.now();
    const { report, triggerSource, targetOppositeReports, existingMatches } = payload;
    const runs: AgentRun[] = [];
    const upsertedMatches: ItemMatch[] = [];
    const notifications: Notification[] = [];

    // Filter opposite active reports
    const oppositeType = report.report_type === 'lost' ? 'found' : 'lost';
    const candidateOpposites = targetOppositeReports.filter(r => 
      r.id !== report.id &&
      r.report_type === oppositeType &&
      r.status !== 'recovered' &&
      r.status !== 'closed' &&
      r.status !== 'archived'
    );

    // 1. Log Coordinator Run Start
    const coordinatorRunId = generateUUID();
    const matchingRunId = generateUUID();
    const verificationRunId = generateUUID();

    const matchingRun: AgentRun = {
      id: matchingRunId,
      agent_type: 'matching_agent',
      trigger_source: triggerSource,
      report_id: report.id,
      status: 'started',
      input_summary: {
        report_id: report.id,
        item_name: report.item_name,
        category: report.category,
        candidate_count: candidateOpposites.length,
      },
      output_summary: {},
      started_at: new Date().toISOString(),
      retry_count: 0,
    };

    // Run Matching Agent against all candidates
    const matchingResults: { candidate: ItemReport; result: MatchingAgentResult }[] = [];
    for (const candidate of candidateOpposites) {
      const lost = report.report_type === 'lost' ? report : candidate;
      const found = report.report_type === 'found' ? report : candidate;
      const res = MatchingAgent.evaluatePair(lost, found);
      if (res.eligible && res.score >= 35) {
        matchingResults.push({ candidate, result: res });
      }
    }

    matchingRun.status = 'completed';
    matchingRun.completed_at = new Date().toISOString();
    matchingRun.duration_ms = Date.now() - startTime;
    matchingRun.output_summary = {
      evaluated_count: candidateOpposites.length,
      eligible_matches_found: matchingResults.length,
      top_score: matchingResults.length > 0 ? Math.max(...matchingResults.map(m => m.result.score)) : 0,
    };
    runs.push(matchingRun);

    // 2. Run Verification Agent for each match
    const verificationStartTime = Date.now();
    const verificationRun: AgentRun = {
      id: verificationRunId,
      agent_type: 'verification_agent',
      trigger_source: triggerSource,
      report_id: report.id,
      status: 'started',
      input_summary: {
        candidates_to_verify: matchingResults.length,
      },
      output_summary: {},
      started_at: new Date().toISOString(),
      retry_count: 0,
    };

    let highPriorityCount = 0;
    let contradictionsFlaggedCount = 0;

    for (const { candidate, result: mRes } of matchingResults) {
      const lost = report.report_type === 'lost' ? report : candidate;
      const found = report.report_type === 'found' ? report : candidate;

      const vRes: VerificationAgentResult = VerificationAgent.evaluateCandidate(lost, found, mRes);

      if (vRes.verificationStatus === 'high_priority') highPriorityCount++;
      if (vRes.verificationStatus === 'contradiction_flagged') contradictionsFlaggedCount++;

      // Check if match already exists in existingMatches
      const existing = existingMatches.find(m => 
        m.lost_report_id === lost.id && m.found_report_id === found.id
      );

      const matchRecord: ItemMatch = {
        id: existing ? existing.id : generateUUID(),
        lost_report_id: lost.id,
        found_report_id: found.id,
        matching_score: mRes.score,
        score_breakdown: mRes.scoreBreakdown,
        matching_method: mRes.matchingMethod,
        matching_explanation: vRes.explanation,
        positive_signals: vRes.supportingEvidence,
        missing_information: mRes.missingInformation,
        possible_contradictions: vRes.contradictionFlags,
        verification_status: vRes.verificationStatus,
        priority: vRes.priority,
        status: existing ? existing.status : 'active',
        last_evaluated_at: new Date().toISOString(),
        created_at: existing ? existing.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lost_report: lost,
        found_report: found,
      };

      upsertedMatches.push(matchRecord);

      // Generate notifications for both reporters if high or medium priority and new or updated
      if (vRes.verificationStatus === 'high_priority' || vRes.verificationStatus === 'possible_match') {
        const notifRecipient = report.report_type === 'lost' ? candidate.reporter_id : report.reporter_id;
        const otherReport = report.report_type === 'lost' ? report : candidate;

        notifications.push({
          id: generateUUID(),
          user_id: notifRecipient,
          notification_type: 'match_detected',
          title: 'Potential Match Discovered by CampusFind AI',
          message: `A candidate matching "${otherReport.item_name}" was identified (${mRes.score}/100 match score). Review the verification details.`,
          related_report_id: otherReport.id,
          related_match_id: matchRecord.id,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    verificationRun.status = 'completed';
    verificationRun.completed_at = new Date().toISOString();
    verificationRun.duration_ms = Date.now() - verificationStartTime;
    verificationRun.output_summary = {
      verified_count: matchingResults.length,
      high_priority_matches: highPriorityCount,
      contradictions_flagged: contradictionsFlaggedCount,
    };
    runs.push(verificationRun);

    // 3. Coordinator Orchestration Run Record
    const coordinatorRun: AgentRun = {
      id: coordinatorRunId,
      agent_type: 'coordinator_agent',
      trigger_source: triggerSource,
      report_id: report.id,
      status: 'completed',
      input_summary: {
        trigger_source: triggerSource,
        report_id: report.id,
        category: report.category,
      },
      output_summary: {
        total_matches_persisted: upsertedMatches.length,
        notifications_dispatched: notifications.length,
        workflow_status: 'SUCCESS',
      },
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      retry_count: 0,
    };
    runs.push(coordinatorRun);

    // Rank matches by score descending, prioritizing verified
    const rankedMatches = [...upsertedMatches].sort((a, b) => {
      // High priority first
      if (a.verification_status === 'high_priority' && b.verification_status !== 'high_priority') return -1;
      if (b.verification_status === 'high_priority' && a.verification_status !== 'high_priority') return 1;
      return b.matching_score - a.matching_score;
    });

    return {
      agentRuns: runs,
      upsertedMatches,
      generatedNotifications: notifications,
      rankedMatches,
      reportsProcessedCount: candidateOpposites.length,
    };
  }
}
