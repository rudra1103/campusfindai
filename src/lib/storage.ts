import { 
  Profile, 
  ItemReport, 
  ItemMatch, 
  Claim, 
  Notification, 
  AgentRun, 
  AuditLog, 
  CampusLocation, 
  UserRole 
} from '../types';
import { 
  SEED_USERS, 
  SEED_REPORTS, 
  SEED_MATCHES, 
  SEED_CLAIMS, 
  SEED_AGENT_RUNS, 
  SEED_NOTIFICATIONS, 
  SEED_AUDIT_LOGS, 
  SEED_LOCATIONS 
} from '../data/seedData';
import { generateUUID } from './utils';
import { CoordinatorAgent } from './mas/coordinatorAgent';

// Memory fallback for environments without window.localStorage (e.g. Node tests / SSR)
class MemoryStorage {
  private store: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const safeStorage = typeof window !== 'undefined' && window.localStorage
  ? window.localStorage
  : new MemoryStorage();

const STORAGE_KEYS = {
  CURRENT_USER: 'campusfind_current_user_v1',
  PROFILES: 'campusfind_profiles_v1',
  REPORTS: 'campusfind_reports_v1',
  MATCHES: 'campusfind_matches_v1',
  CLAIMS: 'campusfind_claims_v1',
  NOTIFICATIONS: 'campusfind_notifications_v1',
  AGENT_RUNS: 'campusfind_agent_runs_v1',
  AUDIT_LOGS: 'campusfind_audit_logs_v1',
  LOCATIONS: 'campusfind_locations_v1',
};

type Listener = () => void;

class DatabaseStore {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initializeIfEmpty();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public initializeIfEmpty(forceReset: boolean = false) {
    if (forceReset || !safeStorage.getItem(STORAGE_KEYS.PROFILES)) {
      safeStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_USERS));
      safeStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
      safeStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(SEED_MATCHES));
      safeStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(SEED_CLAIMS));
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      safeStorage.setItem(STORAGE_KEYS.AGENT_RUNS, JSON.stringify(SEED_AGENT_RUNS));
      safeStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
      safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(SEED_LOCATIONS));
      // Default logged in user is Alex Chen
      safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
      this.notify();
    }
  }

  public resetToSeed() {
    this.initializeIfEmpty(true);
  }

  // --------------------------------------------------------------------------
  // USER / AUTH
  // --------------------------------------------------------------------------
  public getCurrentUser(): Profile {
    const raw = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      return SEED_USERS[0];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_USERS[0];
    }
  }

  public setCurrentUser(user: Profile) {
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify();
  }

  public getAllProfiles(): Profile[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.PROFILES);
    return raw ? JSON.parse(raw) : SEED_USERS;
  }

  public registerUser(profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile {
    const profiles = this.getAllProfiles();
    const newUser: Profile = {
      ...profileData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    profiles.push(newUser);
    safeStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    this.setCurrentUser(newUser);
    this.logAudit(newUser.id, 'USER_REGISTER', 'profiles', newUser.id, 'New user self-registered', {
      email: newUser.college_email,
      role: newUser.role,
    });
    return newUser;
  }

  // --------------------------------------------------------------------------
  // LOCATIONS
  // --------------------------------------------------------------------------
  public getLocations(): CampusLocation[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return raw ? JSON.parse(raw) : SEED_LOCATIONS;
  }

  public addLocation(location: Omit<CampusLocation, 'id'>): CampusLocation {
    const locations = this.getLocations();
    const newLoc: CampusLocation = {
      ...location,
      id: generateUUID(),
    };
    locations.push(newLoc);
    safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.notify();
    return newLoc;
  }

  // --------------------------------------------------------------------------
  // REPORTS
  // --------------------------------------------------------------------------
  public getReports(options?: { applyRLS?: boolean }): ItemReport[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports: ItemReport[] = raw ? JSON.parse(raw) : [];
    const currentUser = this.getCurrentUser();

    if (options?.applyRLS) {
      // RLS Policy: Non-staff/admin cannot view private_attributes unless they created the report
      return reports.map(r => {
        if (currentUser.role === 'admin' || currentUser.role === 'staff' || r.reporter_id === currentUser.id) {
          return r;
        }
        const sanitized = { ...r };
        delete sanitized.private_attributes;
        return sanitized;
      });
    }

    return reports;
  }

  public getReportById(id: string): ItemReport | undefined {
    const reports = this.getReports();
    const report = reports.find(r => r.id === id);
    if (!report) return undefined;

    const currentUser = this.getCurrentUser();
    // Enforce private attribute protection
    if (currentUser.role !== 'admin' && currentUser.role !== 'staff' && report.reporter_id !== currentUser.id) {
      const sanitized = { ...report };
      delete sanitized.private_attributes;
      return sanitized;
    }
    return report;
  }

  public createReport(reportData: Omit<ItemReport, 'id' | 'created_at' | 'updated_at' | 'status' | 'reporter_id'>): {
    report: ItemReport;
    matches: ItemMatch[];
  } {
    const currentUser = this.getCurrentUser();
    const newReport: ItemReport = {
      ...reportData,
      id: generateUUID(),
      reporter_id: currentUser.id,
      reporter_name: currentUser.full_name,
      reporter_role: currentUser.role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const reports = this.getReports();
    reports.unshift(newReport);
    safeStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    this.logAudit(currentUser.id, 'CREATE_REPORT', 'item_reports', newReport.id, `Reported ${newReport.report_type} item: ${newReport.item_name}`, {
      category: newReport.category,
      location: newReport.location_name_cache,
    });

    // TRIGGER COORDINATOR AGENT AUTOMATICALLY
    const existingMatches = this.getMatches();
    const coordinatorResult = CoordinatorAgent.executeWorkflow({
      report: newReport,
      triggerSource: 'report_created',
      targetOppositeReports: reports,
      existingMatches,
    });

    // Persist new matches
    if (coordinatorResult.upsertedMatches.length > 0) {
      this.upsertMatches(coordinatorResult.upsertedMatches);
      // Update report status to 'matched' if high or medium priority found
      const hasHighMatch = coordinatorResult.upsertedMatches.some(m => m.matching_score >= 60);
      if (hasHighMatch) {
        newReport.status = 'matched';
        this.updateReportStatus(newReport.id, 'matched');
      }
    }

    // Persist agent runs
    this.addAgentRuns(coordinatorResult.agentRuns);

    // Persist notifications
    coordinatorResult.generatedNotifications.forEach(n => this.addNotification(n));

    this.notify();
    return {
      report: newReport,
      matches: coordinatorResult.rankedMatches,
    };
  }

  public updateReportStatus(reportId: string, status: ItemReport['status'], resolvedAt?: string) {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === reportId);
    if (index !== -1) {
      reports[index].status = status;
      reports[index].updated_at = new Date().toISOString();
      if (resolvedAt || status === 'recovered' || status === 'closed') {
        reports[index].resolved_at = resolvedAt || new Date().toISOString();
      }
      safeStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      this.notify();
    }
  }

  // --------------------------------------------------------------------------
  // MATCHES
  // --------------------------------------------------------------------------
  public getMatches(): ItemMatch[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.MATCHES);
    const matches: ItemMatch[] = raw ? JSON.parse(raw) : [];
    const reports = this.getReports();

    // Populate joined reports
    return matches.map(m => ({
      ...m,
      lost_report: reports.find(r => r.id === m.lost_report_id),
      found_report: reports.find(r => r.id === m.found_report_id),
    }));
  }

  public getMatchesForReport(reportId: string): ItemMatch[] {
    const all = this.getMatches();
    return all.filter(m => m.lost_report_id === reportId || m.found_report_id === reportId);
  }

  public getMatchById(matchId: string): ItemMatch | undefined {
    return this.getMatches().find(m => m.id === matchId);
  }

  public upsertMatches(newMatches: ItemMatch[]) {
    const currentMatches = this.getMatches();
    const map = new Map<string, ItemMatch>();
    currentMatches.forEach(m => map.set(m.id, m));
    newMatches.forEach(m => map.set(m.id, m));
    safeStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(Array.from(map.values())));
    this.notify();
  }

  // --------------------------------------------------------------------------
  // CLAIMS & RECOVERY WORKFLOW
  // --------------------------------------------------------------------------
  public getClaims(): Claim[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.CLAIMS);
    const claims: Claim[] = raw ? JSON.parse(raw) : [];
    const reports = this.getReports();
    const matches = this.getMatches();

    return claims.map(c => ({
      ...c,
      found_report: reports.find(r => r.id === c.found_report_id),
      match: matches.find(m => m.id === c.match_id),
    }));
  }

  public createClaim(claimData: {
    matchId: string;
    foundReportId: string;
    description: string;
    distinctiveMarks: string;
    lossCircumstances: string;
    privateEvidenceReference?: string;
  }): Claim {
    const currentUser = this.getCurrentUser();
    const claims = this.getClaims();

    const newClaim: Claim = {
      id: generateUUID(),
      match_id: claimData.matchId,
      found_report_id: claimData.foundReportId,
      claimant_id: currentUser.id,
      claimant_name: currentUser.full_name,
      claimant_email: currentUser.college_email,
      claim_description: claimData.description,
      distinctive_marks: claimData.distinctiveMarks,
      loss_circumstances: claimData.lossCircumstances,
      private_evidence_reference: claimData.privateEvidenceReference,
      status: 'submitted',
      claimant_confirmed_recovery: false,
      finder_confirmed_recovery: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    claims.unshift(newClaim);
    safeStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

    // Update match status to 'claim_in_progress'
    const matches = this.getMatches();
    const match = matches.find(m => m.id === claimData.matchId);
    if (match) {
      match.status = 'claim_in_progress';
      this.upsertMatches([match]);
    }

    // Update report status to claim_pending
    this.updateReportStatus(claimData.foundReportId, 'claim_pending');

    // Notify staff
    const staffMembers = this.getAllProfiles().filter(p => p.role === 'staff' || p.role === 'admin');
    staffMembers.forEach(staff => {
      this.addNotification({
        id: generateUUID(),
        user_id: staff.id,
        notification_type: 'claim_received',
        title: 'New Ownership Claim Submitted',
        message: `${currentUser.full_name} submitted a claim for review.`,
        related_claim_id: newClaim.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    this.logAudit(currentUser.id, 'SUBMIT_CLAIM', 'claims', newClaim.id, 'User submitted ownership claim', {
      claimant: currentUser.full_name,
      found_report_id: claimData.foundReportId,
    });

    this.notify();
    return newClaim;
  }

  public updateClaimReview(claimId: string, updates: {
    status: Claim['status'];
    reviewerNotes?: string;
    decisionReason?: string;
    handoverScheduledAt?: string;
    handoverLocation?: string;
  }): Claim | undefined {
    const currentUser = this.getCurrentUser();
    // Security check: only staff or admin can review claims
    if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only campus staff or administrators can review claims.');
    }

    const claims = this.getClaims();
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return undefined;

    claim.status = updates.status;
    claim.reviewer_id = currentUser.id;
    claim.reviewer_name = currentUser.full_name;
    if (updates.reviewerNotes !== undefined) claim.reviewer_notes = updates.reviewerNotes;
    if (updates.decisionReason !== undefined) claim.decision_reason = updates.decisionReason;
    if (updates.handoverScheduledAt !== undefined) claim.handover_scheduled_at = updates.handoverScheduledAt;
    if (updates.handoverLocation !== undefined) claim.handover_location = updates.handoverLocation;
    claim.updated_at = new Date().toISOString();

    safeStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

    // Notify Claimant
    this.addNotification({
      id: generateUUID(),
      user_id: claim.claimant_id,
      notification_type: 'claim_status_updated',
      title: `Claim Status: ${updates.status.replace('_', ' ').toUpperCase()}`,
      message: updates.reviewerNotes || `Your claim status has been updated by ${currentUser.full_name}.`,
      related_claim_id: claim.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.logAudit(currentUser.id, 'REVIEW_CLAIM', 'claims', claim.id, `Claim status updated to ${updates.status}`, {
      reviewer: currentUser.full_name,
      status: updates.status,
    });

    this.notify();
    return claim;
  }

  public confirmRecovery(claimId: string, isClaimant: boolean): Claim | undefined {
    const currentUser = this.getCurrentUser();
    const claims = this.getClaims();
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return undefined;

    if (isClaimant) {
      claim.claimant_confirmed_recovery = true;
    } else {
      claim.finder_confirmed_recovery = true;
    }

    // If both confirmed or staff approves
    if ((claim.claimant_confirmed_recovery && claim.finder_confirmed_recovery) || currentUser.role === 'staff' || currentUser.role === 'admin') {
      claim.status = 'recovered';
      claim.resolved_at = new Date().toISOString();

      // Update both reports to recovered
      if (claim.found_report_id) {
        this.updateReportStatus(claim.found_report_id, 'recovered');
      }
      if (claim.match?.lost_report_id) {
        this.updateReportStatus(claim.match.lost_report_id, 'recovered');
      }
      if (claim.match_id) {
        const matches = this.getMatches();
        const m = matches.find(item => item.id === claim.match_id);
        if (m) {
          m.status = 'resolved';
          this.upsertMatches([m]);
        }
      }

      this.addNotification({
        id: generateUUID(),
        user_id: claim.claimant_id,
        notification_type: 'recovery_confirmed',
        title: 'Item Successfully Recovered!',
        message: 'Your lost item recovery is officially confirmed and closed. Thank you for using CampusFind AI!',
        related_claim_id: claim.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    claim.updated_at = new Date().toISOString();
    safeStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    this.notify();
    return claim;
  }

  // --------------------------------------------------------------------------
  // AGENT RUNS
  // --------------------------------------------------------------------------
  public getAgentRuns(): AgentRun[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.AGENT_RUNS);
    return raw ? JSON.parse(raw) : [];
  }

  public addAgentRuns(newRuns: AgentRun[]) {
    const current = this.getAgentRuns();
    const combined = [...newRuns, ...current];
    safeStorage.setItem(STORAGE_KEYS.AGENT_RUNS, JSON.stringify(combined.slice(0, 100)));
    this.notify();
  }

  public retryAgentRun(runId: string): AgentRun | undefined {
    const runs = this.getAgentRuns();
    const target = runs.find(r => r.id === runId);
    if (!target) return undefined;

    target.retry_count += 1;
    target.status = 'completed';
    target.error_code = undefined;
    target.completed_at = new Date().toISOString();
    target.duration_ms = 450;
    target.output_summary = {
      retry_success: true,
      note: 'Executed successfully via administrator operational retry dispatch.',
    };

    safeStorage.setItem(STORAGE_KEYS.AGENT_RUNS, JSON.stringify(runs));
    this.logAudit(this.getCurrentUser().id, 'RETRY_AGENT_RUN', 'agent_runs', runId, 'Admin triggered manual retry on failed agent task', {
      agent_type: target.agent_type,
    });
    this.notify();
    return target;
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  public getNotificationsForUser(userId: string): Notification[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = raw ? JSON.parse(raw) : [];
    return all.filter(n => n.user_id === userId);
  }

  public addNotification(notification: Notification) {
    const raw = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = raw ? JSON.parse(raw) : [];
    all.unshift(notification);
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const raw = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = raw ? JSON.parse(raw) : [];
    const notif = all.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    const raw = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = raw ? JSON.parse(raw) : [];
    all.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify();
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  public getAuditLogs(): AuditLog[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public logAudit(actorId: string, action: string, entityType: string, entityId: string, reason: string, metadata: Record<string, any> = {}) {
    const logs = this.getAuditLogs();
    const user = this.getCurrentUser();
    const entry: AuditLog = {
      id: generateUUID(),
      actor_id: actorId,
      actor_name: user.full_name,
      action,
      entity_type: entityType,
      entity_id: entityId,
      reason,
      metadata,
      created_at: new Date().toISOString(),
    };
    logs.unshift(entry);
    safeStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  }
}

export const db = new DatabaseStore();
