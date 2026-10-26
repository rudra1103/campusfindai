export type UserRole = 'student' | 'staff' | 'admin';

export type VerificationStatusType = 'unverified' | 'verified_student' | 'verified_staff' | 'system_admin';

export type ReportType = 'lost' | 'found';

export type ReportStatus = 'active' | 'matched' | 'claim_pending' | 'recovered' | 'closed' | 'archived';

export type CustodyStatus = 'reporter_custody' | 'campus_security' | 'lost_and_found_office' | 'department_desk';

export type MatchVerificationStatus = 
  | 'pending_evaluation' 
  | 'high_priority' 
  | 'possible_match' 
  | 'contradiction_flagged' 
  | 'human_review_required' 
  | 'suppressed';

export type MatchLifecycleStatus = 'active' | 'claim_in_progress' | 'resolved' | 'dismissed';

export type AgentType = 'matching_agent' | 'verification_agent' | 'coordinator_agent';

export type AgentRunStatus = 'started' | 'completed' | 'failed' | 'retried';

export type ClaimStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'info_requested' 
  | 'approved' 
  | 'rejected' 
  | 'handover_scheduled' 
  | 'recovered' 
  | 'closed' 
  | 'disputed';

export type FlagStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  full_name: string;
  college_email: string;
  institution_id: string;
  institution_name?: string;
  campus_id: string;
  campus_name?: string;
  department: string;
  academic_year?: string;
  role: UserRole;
  verification_status: VerificationStatusType;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  approved_email_domains: string[];
  settings: {
    allow_guest_browse: boolean;
    require_staff_handover_for_id: boolean;
  };
  created_at: string;
}

export interface Campus {
  id: string;
  institution_id: string;
  name: string;
  address: string;
  timezone: string;
  created_at: string;
}

export interface CampusLocation {
  id: string;
  campus_id: string;
  name: string;
  location_type: 'library' | 'cafeteria' | 'lab' | 'classroom' | 'hostel' | 'sports_ground' | 'parking' | 'other';
  building_or_area: string;
  is_active: boolean;
}

export interface ItemReport {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_role?: UserRole;
  institution_id: string;
  campus_id: string;
  report_type: ReportType;
  item_name: string;
  category: string;
  description: string;
  colour?: string;
  brand?: string;
  public_attributes: Record<string, string>;
  private_attributes?: Record<string, string>; // Private: serial, engraving, lock screen, secret mark
  event_date: string;
  event_time?: string;
  location_id?: string;
  location_name_cache: string;
  image_paths: string[];
  status: ReportStatus;
  custody_status?: CustodyStatus;
  safe_handover_location?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface ScoreBreakdown {
  text_similarity: number;       // Weight 30%
  category_compatibility: number;// Weight 15%
  location_proximity: number;    // Weight 15%
  date_proximity: number;        // Weight 15%
  colour_attribute: number;      // Weight 10%
  brand_attribute: number;       // Weight 10%
  image_or_visual_match: number; // Weight 5%
}

export interface ItemMatch {
  id: string;
  lost_report_id: string;
  found_report_id: string;
  matching_score: number;        // 0-100
  score_breakdown: ScoreBreakdown;
  matching_method: 'multi_signal_deterministic' | 'semantic_ai_hybrid';
  matching_explanation: string;
  positive_signals: string[];
  missing_information: string[];
  possible_contradictions: string[];
  verification_status: MatchVerificationStatus;
  priority: 'high' | 'medium' | 'low';
  status: MatchLifecycleStatus;
  last_evaluated_at: string;
  created_at: string;
  updated_at: string;

  // Joined fields for convenience
  lost_report?: ItemReport;
  found_report?: ItemReport;
}

export interface AgentRun {
  id: string;
  agent_type: AgentType;
  trigger_source: 'report_created' | 'report_updated' | 'manual_rescan' | 'scheduled_job' | 'admin_retry';
  report_id?: string;
  match_id?: string;
  status: AgentRunStatus;
  input_summary: Record<string, any>;
  output_summary: Record<string, any>;
  error_code?: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  retry_count: number;
}

export interface Claim {
  id: string;
  match_id: string;
  found_report_id: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  claim_description: string;
  distinctive_marks?: string;
  loss_circumstances?: string;
  private_evidence_reference?: string; // Visible ONLY to authorized reviewers
  status: ClaimStatus;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewer_notes?: string;
  decision_reason?: string;
  handover_scheduled_at?: string;
  handover_location?: string;
  claimant_confirmed_recovery: boolean;
  finder_confirmed_recovery: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;

  // Joined report references
  found_report?: ItemReport;
  match?: ItemMatch;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: 'match_detected' | 'claim_received' | 'claim_status_updated' | 'handover_scheduled' | 'recovery_confirmed' | 'admin_alert';
  title: string;
  message: string;
  related_report_id?: string;
  related_match_id?: string;
  related_claim_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  report_id?: string;
  claim_id?: string;
  members: string[]; // User IDs
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  message_text: string;
  created_at: string;
}

export interface ReportFlag {
  id: string;
  report_id: string;
  reporter_id: string;
  reporter_name?: string;
  reason: string;
  status: FlagStatus;
  reviewer_id?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  reason?: string;
  metadata: Record<string, any>;
  created_at: string;
}
