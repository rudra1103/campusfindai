import { describe, it, expect } from 'vitest';
import { MatchingAgent } from '../lib/mas/matchingAgent';
import { VerificationAgent } from '../lib/mas/verificationAgent';
import { CoordinatorAgent } from '../lib/mas/coordinatorAgent';
import { ItemReport, ItemMatch } from '../types';

describe('Matching Agent', () => {
  const baseLost: ItemReport = {
    id: 'test-lost-1',
    reporter_id: 'user-1',
    institution_id: 'inst-1',
    campus_id: 'camp-1',
    report_type: 'lost',
    item_name: 'Apple AirPods Pro 2nd Generation',
    category: 'Electronics',
    description: 'White wireless earbud case with both earbuds inside lost near library study carrels.',
    colour: 'White',
    brand: 'Apple',
    public_attributes: {},
    event_date: '2026-10-24',
    location_name_cache: 'Main Library 2nd Floor',
    image_paths: ['https://example.com/image.jpg'],
    status: 'active',
    created_at: '2026-10-24T12:00:00Z',
    updated_at: '2026-10-24T12:00:00Z',
  };

  const compatibleFound: ItemReport = {
    id: 'test-found-1',
    reporter_id: 'user-2',
    institution_id: 'inst-1',
    campus_id: 'camp-1',
    report_type: 'found',
    item_name: 'Apple AirPods Pro Case',
    category: 'Electronics',
    description: 'White charging case and earbuds found near the library entrance.',
    colour: 'White',
    brand: 'Apple',
    public_attributes: {},
    event_date: '2026-10-24',
    location_name_cache: 'Main Library Lobby',
    image_paths: ['https://example.com/found.jpg'],
    status: 'active',
    created_at: '2026-10-24T14:00:00Z',
    updated_at: '2026-10-24T14:00:00Z',
  };

  it('assigns a high similarity score (>= 80%) for highly compatible items', () => {
    const result = MatchingAgent.evaluatePair(baseLost, compatibleFound);
    expect(result.eligible).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.scoreBreakdown.category_compatibility).toBe(100);
    expect(result.scoreBreakdown.brand_attribute).toBe(100);
    expect(result.scoreBreakdown.colour_attribute).toBe(100);
    expect(result.positiveSignals.length).toBeGreaterThan(0);
  });

  it('filters or heavily penalizes incompatible categories', () => {
    const incompatibleFound: ItemReport = {
      ...compatibleFound,
      category: 'Books & Stationery',
      item_name: 'Calculus Textbook',
      description: 'Hardcover mathematics textbook',
      brand: 'Pearson',
    };
    const result = MatchingAgent.evaluatePair(baseLost, incompatibleFound);
    expect(result.scoreBreakdown.category_compatibility).toBe(0);
    expect(result.score).toBeLessThanOrEqual(40);
  });

  it('rejects pairs with identical report types (both lost or both found)', () => {
    const invalidPair = MatchingAgent.evaluatePair(baseLost, { ...compatibleFound, report_type: 'lost' });
    expect(invalidPair.eligible).toBe(false);
    expect(invalidPair.score).toBe(0);
  });

  it('rejects pairs from different campuses', () => {
    const crossCampus = MatchingAgent.evaluatePair(baseLost, { ...compatibleFound, campus_id: 'other-campus' });
    expect(crossCampus.eligible).toBe(false);
  });
});

describe('Verification Agent', () => {
  it('detects attribute contradictions such as conflicting colors', () => {
    const lost: ItemReport = {
      id: 'l1',
      reporter_id: 'u1',
      institution_id: 'i1',
      campus_id: 'c1',
      report_type: 'lost',
      item_name: 'Leather Wallet',
      category: 'Bags & Wallets',
      description: 'Brown trifold leather wallet',
      colour: 'Brown',
      brand: 'Fossil',
      public_attributes: {},
      event_date: '2026-10-20',
      location_name_cache: 'Student Union',
      image_paths: [],
      status: 'active',
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
    };

    const found: ItemReport = {
      id: 'f1',
      reporter_id: 'u2',
      institution_id: 'i1',
      campus_id: 'c1',
      report_type: 'found',
      item_name: 'Cardholder',
      category: 'Bags & Wallets',
      description: 'Black slim metal cardholder',
      colour: 'Black',
      brand: 'Ridge',
      public_attributes: {},
      event_date: '2026-10-20',
      location_name_cache: 'Cafeteria',
      image_paths: [],
      status: 'active',
      created_at: '2026-10-20T12:00:00Z',
      updated_at: '2026-10-20T12:00:00Z',
    };

    const matchingRes = MatchingAgent.evaluatePair(lost, found);
    const verificationRes = VerificationAgent.evaluateCandidate(lost, found, matchingRes);

    expect(verificationRes.verificationStatus).toBe('contradiction_flagged');
    expect(verificationRes.requiresHumanReview).toBe(true);
    expect(verificationRes.recommendation).toBe('escalate_review');
  });

  it('maintains explicit safeguard notice that similarity does not equal verified ownership', () => {
    const lost = { id: 'l1', report_type: 'lost', category: 'Electronics', item_name: 'Phone', description: 'Phone', event_date: '2026-10-20', location_name_cache: 'Lab', image_paths: [], status: 'active', institution_id: 'i', campus_id: 'c', reporter_id: 'u', public_attributes: {}, created_at: '', updated_at: '' } as ItemReport;
    const found = { id: 'f1', report_type: 'found', category: 'Electronics', item_name: 'Phone', description: 'Phone', event_date: '2026-10-20', location_name_cache: 'Lab', image_paths: [], status: 'active', institution_id: 'i', campus_id: 'c', reporter_id: 'u2', public_attributes: {}, created_at: '', updated_at: '' } as ItemReport;

    const m = MatchingAgent.evaluatePair(lost, found);
    const v = VerificationAgent.evaluateCandidate(lost, found, m);

    expect(v.confidenceDisclaimer).toContain('similarity scores indicate ranking relevance only');
  });
});

describe('Coordinator Agent', () => {
  it('orchestrates workflow and persists deduplicated matches with audit logs', () => {
    const lostReport: ItemReport = {
      id: 'lost-coord-1',
      reporter_id: 'u1',
      institution_id: 'i1',
      campus_id: 'c1',
      report_type: 'lost',
      item_name: 'Water Bottle',
      category: 'Other',
      description: 'Blue Hydro Flask 32oz',
      colour: 'Blue',
      brand: 'Hydro Flask',
      public_attributes: {},
      event_date: '2026-10-25',
      location_name_cache: 'Engineering 101',
      image_paths: [],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const foundReport: ItemReport = {
      id: 'found-coord-1',
      reporter_id: 'u2',
      institution_id: 'i1',
      campus_id: 'c1',
      report_type: 'found',
      item_name: 'Blue Flask',
      category: 'Other',
      description: 'Hydro Flask blue flask found in Engineering 101',
      colour: 'Blue',
      brand: 'Hydro Flask',
      public_attributes: {},
      event_date: '2026-10-25',
      location_name_cache: 'Engineering 101',
      image_paths: [],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = CoordinatorAgent.executeWorkflow({
      report: lostReport,
      triggerSource: 'report_created',
      targetOppositeReports: [foundReport],
      existingMatches: [],
    });

    // Should create agent runs for all 3 agents
    expect(result.agentRuns.length).toBe(3);
    expect(result.agentRuns.map(r => r.agent_type)).toEqual([
      'matching_agent',
      'verification_agent',
      'coordinator_agent',
    ]);

    // Match should be created
    expect(result.upsertedMatches.length).toBe(1);
    expect(result.upsertedMatches[0].matching_score).toBeGreaterThanOrEqual(70);

    // Notification generated for recipient
    expect(result.generatedNotifications.length).toBeGreaterThan(0);
  });
});
