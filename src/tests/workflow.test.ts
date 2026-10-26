import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/storage';
import { SEED_USERS } from '../data/seedData';

describe('CampusFind AI Database & Workflow Engine', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  it('initializes seed data properly with users, reports, matches, and claims', () => {
    const profiles = db.getAllProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(4);

    const reports = db.getReports();
    expect(reports.length).toBeGreaterThanOrEqual(8);

    const matches = db.getMatches();
    expect(matches.length).toBeGreaterThanOrEqual(3);

    const claims = db.getClaims();
    expect(claims.length).toBeGreaterThanOrEqual(1);
  });

  it('enforces Row Level Security by stripping private verification attributes from unauthorized viewers', () => {
    // Current user is student Alex Chen
    db.setCurrentUser(SEED_USERS[0]);

    // Query reports with RLS applied
    const sanitizedReports = db.getReports({ applyRLS: true });

    // Find Sarah's report (not Alex's)
    const sarahFoundReport = sanitizedReports.find(r => r.id === 'rep-found-003');
    expect(sarahFoundReport).toBeDefined();

    // Sarah's report had private_attributes (student ID number) in seed, which must be stripped for Alex
    expect(sarahFoundReport?.private_attributes).toBeUndefined();

    // Now switch to Officer Marcus (staff)
    db.setCurrentUser(SEED_USERS[2]);
    const staffReports = db.getReports({ applyRLS: true });
    const staffView = staffReports.find(r => r.id === 'rep-found-003');
    expect(staffView?.private_attributes).toBeDefined();
    expect(staffView?.private_attributes?.full_student_id_number).toBe('MSU-8842109');
  });

  it('creates a new report and automatically triggers Coordinator Agent to persist matches', () => {
    db.setCurrentUser(SEED_USERS[0]); // Alex

    const initialMatchesCount = db.getMatches().length;

    const res = db.createReport({
      institution_id: 'inst-001',
      campus_id: 'camp-001',
      report_type: 'lost',
      item_name: 'Blue Stainless Steel Water Bottle',
      category: 'Other',
      description: 'Lost my blue metal flask in engineering room 101 yesterday.',
      colour: 'Blue',
      brand: 'Hydro Flask',
      public_attributes: {},
      event_date: '2026-10-25',
      location_name_cache: 'Engineering Hall — Room 101 Lecture Theatre',
      image_paths: [],
    });

    expect(res.report.id).toBeDefined();
    expect(res.report.status).toBe('matched'); // Should automatically find Officer Marcus's found bottle!

    const newMatchesCount = db.getMatches().length;
    expect(newMatchesCount).toBeGreaterThanOrEqual(initialMatchesCount);
  });

  it('prevents non-staff students from approving or reviewing claims', () => {
    // Student Alex Chen tries to approve a claim
    db.setCurrentUser(SEED_USERS[0]);

    const claims = db.getClaims();
    const activeClaim = claims[0];

    expect(() => {
      db.updateClaimReview(activeClaim.id, {
        status: 'approved',
      });
    }).toThrow(/Unauthorized/);
  });

  it('allows staff to approve claims and schedule handover', () => {
    // Switch to Officer Marcus (staff)
    db.setCurrentUser(SEED_USERS[2]);

    const claims = db.getClaims();
    const activeClaim = claims[0];

    const updated = db.updateClaimReview(activeClaim.id, {
      status: 'handover_scheduled',
      reviewerNotes: 'Bring your student ID to Campus Safety Dispatch.',
      handoverLocation: 'Campus Safety Office',
    });

    expect(updated?.status).toBe('handover_scheduled');
    expect(updated?.reviewer_id).toBe(SEED_USERS[2].id);
  });

  it('transitions report and claim to recovered upon dual confirmation', () => {
    const claims = db.getClaims();
    const activeClaim = claims[0];

    // Staff Marcus confirms recovery
    db.setCurrentUser(SEED_USERS[2]);
    const res = db.confirmRecovery(activeClaim.id, false);

    expect(res?.status).toBe('recovered');
    expect(res?.resolved_at).toBeDefined();

    // Report should now be updated to recovered
    const report = db.getReportById(activeClaim.found_report_id);
    expect(report?.status).toBe('recovered');
  });
});
