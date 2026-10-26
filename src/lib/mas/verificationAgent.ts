import { ItemReport, MatchVerificationStatus } from '../../types';
import { MatchingAgentResult } from './matchingAgent';

export interface VerificationAgentResult {
  matchId?: string;
  verificationStatus: MatchVerificationStatus;
  priority: 'high' | 'medium' | 'low';
  explanation: string;
  contradictionFlags: string[];
  supportingEvidence: string[];
  requiresHumanReview: boolean;
  recommendation: 'show_candidate' | 'suppress' | 'escalate_review';
  confidenceDisclaimer: string;
}

export class VerificationAgent {
  /**
   * Evaluate a candidate pair that has been scored by the Matching Agent
   */
  public static evaluateCandidate(
    lostReport: ItemReport,
    foundReport: ItemReport,
    matchingResult: MatchingAgentResult
  ): VerificationAgentResult {
    const contradictionFlags = [...matchingResult.possibleContradictions];
    const supportingEvidence = [...matchingResult.positiveSignals];
    const score = matchingResult.score;

    // Detect deep contradictions or inconsistencies
    let hasCriticalContradiction = false;

    // Check for explicit conflicting brand if both specified
    if (lostReport.brand && foundReport.brand) {
      if (lostReport.brand.toLowerCase() !== foundReport.brand.toLowerCase() &&
          !lostReport.brand.toLowerCase().includes(foundReport.brand.toLowerCase()) &&
          !foundReport.brand.toLowerCase().includes(lostReport.brand.toLowerCase())) {
        hasCriticalContradiction = true;
      }
    }

    // Check for explicit conflicting colors
    if (lostReport.colour && foundReport.colour) {
      const c1 = lostReport.colour.toLowerCase();
      const c2 = foundReport.colour.toLowerCase();
      if (c1 !== c2 && !c1.includes(c2) && !c2.includes(c1)) {
        // Distinct basic colors (e.g. black vs brown, red vs blue)
        hasCriticalContradiction = true;
      }
    }

    // High risk categories (IDs, wallets, credit cards, high-value electronics)
    const isSensitiveCategory = 
      lostReport.category === 'ID Cards & Documents' ||
      lostReport.category === 'Bags & Wallets' ||
      lostReport.category === 'Electronics';

    let verificationStatus: MatchVerificationStatus = 'pending_evaluation';
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let recommendation: 'show_candidate' | 'suppress' | 'escalate_review' = 'show_candidate';
    let requiresHumanReview = false;

    if (hasCriticalContradiction) {
      verificationStatus = 'contradiction_flagged';
      priority = 'low';
      recommendation = 'escalate_review';
      requiresHumanReview = true;
    } else if (score >= 80) {
      verificationStatus = 'high_priority';
      priority = 'high';
      recommendation = 'show_candidate';
      requiresHumanReview = isSensitiveCategory; // Sensitive high-priority items always require staff sign-off
    } else if (score >= 60) {
      verificationStatus = 'possible_match';
      priority = 'medium';
      recommendation = 'show_candidate';
      requiresHumanReview = isSensitiveCategory;
    } else if (score >= 40) {
      verificationStatus = 'human_review_required';
      priority = 'low';
      recommendation = 'escalate_review';
      requiresHumanReview = true;
    } else {
      verificationStatus = 'suppressed';
      priority = 'low';
      recommendation = 'suppress';
      requiresHumanReview = false;
    }

    // Concise, audit-safe explanation
    let explanation = '';
    if (hasCriticalContradiction) {
      explanation = `Verification Agent detected contradictory attributes (${contradictionFlags.join(', ')}). Match is marked for campus staff inspection before any ownership claims proceed.`;
    } else if (score >= 80) {
      explanation = `Potential strong candidate: "${lostReport.item_name}" reported lost in ${lostReport.location_name_cache} and found in ${foundReport.location_name_cache} on ${foundReport.event_date}. High attribute correlation (${score}/100). Verification safeguards active: similarity score does not establish definitive legal ownership.`;
    } else if (score >= 60) {
      explanation = `Possible match: General descriptive compatibility between items. Category and dates align, but specific distinctive characteristics require user verification.`;
    } else {
      explanation = `Weak correlation or insufficient matching signals (${score}/100). Candidate suppressed from automated prompts to prevent false claims.`;
    }

    const confidenceDisclaimer = 
      'Safeguard Notice: Algorithmic similarity scores indicate ranking relevance only, not verified ownership. Ownership is established solely via authorized campus staff verification of private credentials.';

    return {
      verificationStatus,
      priority,
      explanation,
      contradictionFlags,
      supportingEvidence,
      requiresHumanReview,
      recommendation,
      confidenceDisclaimer,
    };
  }
}
