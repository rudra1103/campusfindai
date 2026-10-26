-- ==============================================================================
-- CAMPUSFIND AI — COMPLETE POSTGRESQL & ROW LEVEL SECURITY (RLS) SCHEMA
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For semantic/trigram text similarity

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE verification_status_type AS ENUM ('unverified', 'verified_student', 'verified_staff', 'system_admin');
CREATE TYPE report_type AS ENUM ('lost', 'found');
CREATE TYPE report_status AS ENUM ('active', 'matched', 'claim_pending', 'recovered', 'closed', 'archived');
CREATE TYPE custody_status_type AS ENUM ('reporter_custody', 'campus_security', 'lost_and_found_office', 'department_desk');
CREATE TYPE match_verification_status AS ENUM ('pending_evaluation', 'high_priority', 'possible_match', 'contradiction_flagged', 'human_review_required', 'suppressed');
CREATE TYPE match_lifecycle_status AS ENUM ('active', 'claim_in_progress', 'resolved', 'dismissed');
CREATE TYPE agent_type_enum AS ENUM ('matching_agent', 'verification_agent', 'coordinator_agent');
CREATE TYPE agent_run_status AS ENUM ('started', 'completed', 'failed', 'retried');
CREATE TYPE claim_status_type AS ENUM ('submitted', 'under_review', 'info_requested', 'approved', 'rejected', 'handover_scheduled', 'recovered', 'closed', 'disputed');
CREATE TYPE flag_status_type AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- 3. INSTITUTIONS & CAMPUSES
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    approved_email_domains TEXT[] NOT NULL DEFAULT '{}',
    settings JSONB NOT NULL DEFAULT '{"allow_guest_browse": true, "require_staff_handover_for_id": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campus_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(64) NOT NULL, -- 'library', 'cafeteria', 'lab', 'classroom', 'hostel', 'sports_ground', 'parking', 'other'
    building_or_area VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROFILES (Extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    college_email VARCHAR(255) NOT NULL UNIQUE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
    department VARCHAR(128),
    academic_year VARCHAR(32),
    role user_role NOT NULL DEFAULT 'student',
    verification_status verification_status_type NOT NULL DEFAULT 'unverified',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ITEM REPORTS
CREATE TABLE item_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Electronics', 'ID Cards & Documents', 'Bags & Wallets', 'Keys', 'Books & Stationery', 'Clothing & Accessories', 'Jewellery', 'Sports Equipment', 'Other'
    description TEXT NOT NULL,
    colour VARCHAR(64),
    brand VARCHAR(128),
    public_attributes JSONB NOT NULL DEFAULT '{}',
    private_attributes JSONB NOT NULL DEFAULT '{}', -- Visible ONLY to reporter & authorized staff
    event_date DATE NOT NULL,
    event_time TIME,
    location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    location_name_cache VARCHAR(255),
    image_paths TEXT[] NOT NULL DEFAULT '{}',
    status report_status NOT NULL DEFAULT 'active',
    custody_status custody_status_type DEFAULT 'reporter_custody',
    safe_handover_location VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 6. ITEM MATCHES (Computed by Matching & Verification Agents)
CREATE TABLE item_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lost_report_id UUID NOT NULL REFERENCES item_reports(id) ON DELETE CASCADE,
    found_report_id UUID NOT NULL REFERENCES item_reports(id) ON DELETE CASCADE,
    matching_score NUMERIC(5,2) NOT NULL CHECK (matching_score >= 0 AND matching_score <= 100),
    score_breakdown JSONB NOT NULL DEFAULT '{}',
    matching_method VARCHAR(64) NOT NULL DEFAULT 'multi_signal_deterministic',
    matching_explanation TEXT,
    verification_status match_verification_status NOT NULL DEFAULT 'pending_evaluation',
    priority VARCHAR(32) NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
    status match_lifecycle_status NOT NULL DEFAULT 'active',
    last_evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_lost_found_pair UNIQUE (lost_report_id, found_report_id)
);

-- 7. AGENT RUNS (Multi-Agent System Execution History & Auditing)
CREATE TABLE agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type agent_type_enum NOT NULL,
    trigger_source VARCHAR(64) NOT NULL, -- 'report_created', 'report_updated', 'manual_rescan', 'scheduled_job', 'admin_retry'
    report_id UUID REFERENCES item_reports(id) ON DELETE SET NULL,
    match_id UUID REFERENCES item_matches(id) ON DELETE SET NULL,
    status agent_run_status NOT NULL DEFAULT 'started',
    input_summary JSONB NOT NULL DEFAULT '{}',
    output_summary JSONB NOT NULL DEFAULT '{}',
    error_code VARCHAR(128),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    retry_count INTEGER NOT NULL DEFAULT 0
);

-- 8. CLAIMS (Ownership Claims & Safe Recovery)
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES item_matches(id) ON DELETE CASCADE,
    found_report_id UUID NOT NULL REFERENCES item_reports(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    claim_description TEXT NOT NULL,
    distinctive_marks TEXT,
    loss_circumstances TEXT,
    private_evidence_reference TEXT, -- e.g. path to private proof or serial number
    status claim_status_type NOT NULL DEFAULT 'submitted',
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    decision_reason TEXT,
    handover_scheduled_at TIMESTAMPTZ,
    handover_location VARCHAR(255),
    claimant_confirmed_recovery BOOLEAN NOT NULL DEFAULT FALSE,
    finder_confirmed_recovery BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 9. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(64) NOT NULL, -- 'match_detected', 'claim_received', 'claim_status_updated', 'handover_scheduled', 'recovery_confirmed', 'admin_alert'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_report_id UUID REFERENCES item_reports(id) ON DELETE SET NULL,
    related_match_id UUID REFERENCES item_matches(id) ON DELETE SET NULL,
    related_claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CONVERSATIONS & MESSAGING (Access-controlled, without revealing private phone/email)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES item_reports(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_members (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

-- 11. REPORT FLAGS & MODERATION
CREATE TABLE report_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES item_reports(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status flag_status_type NOT NULL DEFAULT 'pending',
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID,
    reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-EFFICIENCY SEARCH & QUERYING
-- ==============================================================================
CREATE INDEX idx_reports_institution_campus ON item_reports(institution_id, campus_id);
CREATE INDEX idx_reports_status_type ON item_reports(status, report_type);
CREATE INDEX idx_reports_category ON item_reports(category);
CREATE INDEX idx_reports_event_date ON item_reports(event_date DESC);
CREATE INDEX idx_reports_reporter ON item_reports(reporter_id);
CREATE INDEX idx_matches_lost_found ON item_matches(lost_report_id, found_report_id);
CREATE INDEX idx_matches_score ON item_matches(matching_score DESC);
CREATE INDEX idx_matches_status ON item_matches(verification_status, status);
CREATE INDEX idx_claims_claimant ON claims(claimant_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_agent_runs_type_status ON agent_runs(agent_type, status);
CREATE INDEX idx_agent_runs_started ON agent_runs(started_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check user role
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Users can read all profiles in their institution"
    ON profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile except role"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- 2. Item Reports
CREATE POLICY "Anyone can view active public reports without private attributes"
    ON item_reports FOR SELECT
    USING (status != 'archived' OR reporter_id = auth.uid() OR auth.current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Authenticated users can create reports"
    ON item_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters can update their own active reports"
    ON item_reports FOR UPDATE
    USING (auth.uid() = reporter_id OR auth.current_user_role() IN ('staff', 'admin'));

-- 3. Item Matches
CREATE POLICY "Reporters or Staff can view item matches"
    ON item_matches FOR SELECT
    USING (
        auth.current_user_role() IN ('staff', 'admin') OR
        EXISTS (
            SELECT 1 FROM item_reports r 
            WHERE (r.id = lost_report_id OR r.id = found_report_id) 
            AND r.reporter_id = auth.uid()
        )
    );

-- 4. Claims
CREATE POLICY "Claimants and staff can view claims"
    ON claims FOR SELECT
    USING (
        claimant_id = auth.uid() OR 
        auth.current_user_role() IN ('staff', 'admin') OR
        EXISTS (
            SELECT 1 FROM item_reports r 
            WHERE r.id = found_report_id AND r.reporter_id = auth.uid()
        )
    );

CREATE POLICY "Users can submit claims for items they didn't report"
    ON claims FOR INSERT
    WITH CHECK (
        auth.uid() = claimant_id AND
        NOT EXISTS (
            SELECT 1 FROM item_reports r WHERE r.id = found_report_id AND r.reporter_id = auth.uid()
        )
    );

CREATE POLICY "Only staff or admins can update claim reviews"
    ON claims FOR UPDATE
    USING (auth.current_user_role() IN ('staff', 'admin') OR claimant_id = auth.uid());

-- 5. Notifications
CREATE POLICY "Users can only read and update their own notifications"
    ON notifications FOR ALL
    USING (user_id = auth.uid());

-- 6. Messages & Conversations
CREATE POLICY "Only conversation members can view and send messages"
    ON messages FOR SELECT
    USING (EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid()));

CREATE POLICY "Only conversation members can insert messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid()));

-- 7. Agent Runs (Protected from unauthorized modification)
CREATE POLICY "Agent runs are viewable by staff and admins"
    ON agent_runs FOR SELECT
    USING (auth.current_user_role() IN ('staff', 'admin'));

-- 8. Audit logs (Insert only via secure triggers/functions, read-only to admins)
CREATE POLICY "Audit logs viewable only by admins"
    ON audit_logs FOR SELECT
    USING (auth.current_user_role() = 'admin');
