import { ItemReport, ScoreBreakdown } from '../../types';
import { jaccardSimilarity, daysBetweenDates } from '../utils';

export interface MatchingAgentResult {
  lostReportId: string;
  foundReportId: string;
  score: number; // 0-100
  scoreBreakdown: ScoreBreakdown;
  positiveSignals: string[];
  missingInformation: string[];
  possibleContradictions: string[];
  matchingMethod: 'multi_signal_deterministic' | 'semantic_ai_hybrid';
  summaryExplanation: string;
  eligible: boolean;
  ineligibilityReason?: string;
}

export class MatchingAgent {
  // Weights defined in Section 5
  private static WEIGHTS = {
    text: 0.30,       // 30%
    category: 0.15,   // 15%
    location: 0.15,   // 15%
    date: 0.15,       // 15%
    colour: 0.10,     // 10%
    brand: 0.10,      // 10%
    visual: 0.05,     // 5%
  };

  /**
   * Run matching on a single pair of reports
   */
  public static evaluatePair(lostReport: ItemReport, foundReport: ItemReport): MatchingAgentResult {
    // 1. Eligibility Checks
    if (lostReport.report_type === foundReport.report_type) {
      return this.ineligibleResult(lostReport.id, foundReport.id, 'Both reports have the same report type');
    }

    if (lostReport.status === 'recovered' || lostReport.status === 'closed' ||
        foundReport.status === 'recovered' || foundReport.status === 'closed') {
      return this.ineligibleResult(lostReport.id, foundReport.id, 'One or both reports are already resolved');
    }

    if (lostReport.campus_id && foundReport.campus_id && lostReport.campus_id !== foundReport.campus_id) {
      return this.ineligibleResult(lostReport.id, foundReport.id, 'Reports originate from different campuses');
    }

    const positiveSignals: string[] = [];
    const missingInformation: string[] = [];
    const possibleContradictions: string[] = [];

    // 2. Category Signal (15%)
    let categoryScore = 0;
    if (lostReport.category.toLowerCase() === foundReport.category.toLowerCase()) {
      categoryScore = 1.0;
      positiveSignals.push(`Exact category match: "${lostReport.category}"`);
    } else {
      // Related categories partial credit
      const catA = lostReport.category.toLowerCase();
      const catB = foundReport.category.toLowerCase();
      if ((catA.includes('bag') && catB.includes('wallet')) || (catA.includes('wallet') && catB.includes('bag'))) {
        categoryScore = 0.6;
        positiveSignals.push('Compatible related category (Bags & Wallets)');
      } else if ((catA.includes('electronic') && catB.includes('accessories')) || (catA.includes('accessories') && catB.includes('electronic'))) {
        categoryScore = 0.5;
        positiveSignals.push('Compatible sub-category');
      } else {
        categoryScore = 0.0;
        possibleContradictions.push(`Incompatible categories: "${lostReport.category}" vs "${foundReport.category}"`);
      }
    }

    // 3. Text & Description Signal (30%)
    const nameSim = jaccardSimilarity(lostReport.item_name, foundReport.item_name);
    const descSim = jaccardSimilarity(
      `${lostReport.item_name} ${lostReport.description}`,
      `${foundReport.item_name} ${foundReport.description}`
    );
    // Combine name (40%) and combined desc (60%)
    const textScore = Math.min(1.0, (nameSim * 0.4) + (descSim * 0.6) * 1.5);
    if (textScore > 0.45) {
      positiveSignals.push(`Strong vocabulary overlap in item description (similarity: ${Math.round(textScore * 100)}%)`);
    } else if (textScore > 0.2) {
      positiveSignals.push(`Moderate descriptive similarity (${Math.round(textScore * 100)}%)`);
    }

    // 4. Location Proximity Signal (15%)
    let locationScore = 0.2; // default campus baseline
    if (lostReport.location_name_cache && foundReport.location_name_cache) {
      const locA = lostReport.location_name_cache.toLowerCase();
      const locB = foundReport.location_name_cache.toLowerCase();
      if (locA === locB || (lostReport.location_id && lostReport.location_id === foundReport.location_id)) {
        locationScore = 1.0;
        positiveSignals.push(`Identical location: ${lostReport.location_name_cache}`);
      } else if (locA.includes(locB) || locB.includes(locA) || jaccardSimilarity(locA, locB) > 0.3) {
        locationScore = 0.75;
        positiveSignals.push(`Proximity or adjacent area: "${lostReport.location_name_cache}" & "${foundReport.location_name_cache}"`);
      } else {
        locationScore = 0.25;
        possibleContradictions.push(`Different locations reported: "${lostReport.location_name_cache}" vs "${foundReport.location_name_cache}"`);
      }
    } else {
      missingInformation.push('One report lacks detailed campus location coordinates');
    }

    // 5. Date & Time Signal (15%)
    const daysDiff = daysBetweenDates(lostReport.event_date, foundReport.event_date);
    let dateScore = 0;
    
    // Found date should ideally be on or after lost date
    const lostTime = new Date(lostReport.event_date).getTime();
    const foundTime = new Date(foundReport.event_date).getTime();

    if (foundTime < lostTime - 86400000 * 2) {
      // Found more than 2 days before lost date -> contradiction
      dateScore = 0.1;
      possibleContradictions.push(`Timeline discrepancy: Item was marked found on ${foundReport.event_date}, which is before reported loss date ${lostReport.event_date}`);
    } else if (daysDiff === 0) {
      dateScore = 1.0;
      positiveSignals.push(`Reported on the exact same date (${lostReport.event_date})`);
    } else if (daysDiff <= 2) {
      dateScore = 0.9;
      positiveSignals.push(`Date within 48 hours (${daysDiff} days difference)`);
    } else if (daysDiff <= 7) {
      dateScore = 0.75;
      positiveSignals.push(`Within 1 week timeframe`);
    } else if (daysDiff <= 30) {
      dateScore = 0.45;
    } else {
      dateScore = 0.15;
      possibleContradictions.push(`Long interval between events (${daysDiff} days)`);
    }

    // 6. Colour Signal (10%)
    let colourScore = 0.5; // neutral if unstated
    if (lostReport.colour && foundReport.colour) {
      const colA = lostReport.colour.trim().toLowerCase();
      const colB = foundReport.colour.trim().toLowerCase();
      if (colA === colB || colA.includes(colB) || colB.includes(colA)) {
        colourScore = 1.0;
        positiveSignals.push(`Matching color attribute: ${lostReport.colour}`);
      } else {
        colourScore = 0.05;
        possibleContradictions.push(`Conflicting color reported: "${lostReport.colour}" vs "${foundReport.colour}"`);
      }
    } else {
      missingInformation.push('Missing color specification on one or both items');
    }

    // 7. Brand Signal (10%)
    let brandScore = 0.5; // neutral if unstated
    if (lostReport.brand && foundReport.brand) {
      const brA = lostReport.brand.trim().toLowerCase();
      const brB = foundReport.brand.trim().toLowerCase();
      if (brA === brB || brA.includes(brB) || brB.includes(brA)) {
        brandScore = 1.0;
        positiveSignals.push(`Matching brand/manufacturer: ${lostReport.brand}`);
      } else {
        brandScore = 0.0;
        possibleContradictions.push(`Different brands indicated: "${lostReport.brand}" vs "${foundReport.brand}"`);
      }
    } else {
      missingInformation.push('Brand or manufacturer not specified on both records');
    }

    // 8. Visual / Image Signal (5%)
    let visualScore = 0.5;
    if (lostReport.image_paths.length > 0 && foundReport.image_paths.length > 0) {
      visualScore = 0.8;
      positiveSignals.push('Images present on both reports for visual verification');
    } else if (lostReport.image_paths.length > 0 || foundReport.image_paths.length > 0) {
      visualScore = 0.5;
      missingInformation.push('Image available on only one report');
    } else {
      visualScore = 0.3;
      missingInformation.push('No photos uploaded on either report');
    }

    // Compute Weighted Score
    const rawScore = 
      (textScore * this.WEIGHTS.text) +
      (categoryScore * this.WEIGHTS.category) +
      (locationScore * this.WEIGHTS.location) +
      (dateScore * this.WEIGHTS.date) +
      (colourScore * this.WEIGHTS.colour) +
      (brandScore * this.WEIGHTS.brand) +
      (visualScore * this.WEIGHTS.visual);

    const normalizedScore = Math.min(100, Math.max(0, Math.round(rawScore * 100)));

    const scoreBreakdown: ScoreBreakdown = {
      text_similarity: Math.round(textScore * 100),
      category_compatibility: Math.round(categoryScore * 100),
      location_proximity: Math.round(locationScore * 100),
      date_proximity: Math.round(dateScore * 100),
      colour_attribute: Math.round(colourScore * 100),
      brand_attribute: Math.round(brandScore * 100),
      image_or_visual_match: Math.round(visualScore * 100),
    };

    let summaryExplanation = `Matching Agent analyzed 7 attribute dimensions. Category: ${Math.round(categoryScore * 100)}%, Text: ${Math.round(textScore * 100)}%, Location: ${Math.round(locationScore * 100)}%, Date: ${Math.round(dateScore * 100)}%. Overall score calculated at ${normalizedScore}/100.`;

    return {
      lostReportId: lostReport.id,
      foundReportId: foundReport.id,
      score: normalizedScore,
      scoreBreakdown,
      positiveSignals,
      missingInformation,
      possibleContradictions,
      matchingMethod: 'multi_signal_deterministic',
      summaryExplanation,
      eligible: true,
    };
  }

  private static ineligibleResult(lostId: string, foundId: string, reason: string): MatchingAgentResult {
    return {
      lostReportId: lostId,
      foundReportId: foundId,
      score: 0,
      scoreBreakdown: {
        text_similarity: 0,
        category_compatibility: 0,
        location_proximity: 0,
        date_proximity: 0,
        colour_attribute: 0,
        brand_attribute: 0,
        image_or_visual_match: 0,
      },
      positiveSignals: [],
      missingInformation: [],
      possibleContradictions: [reason],
      matchingMethod: 'multi_signal_deterministic',
      summaryExplanation: `Ineligible for matching: ${reason}`,
      eligible: false,
      ineligibilityReason: reason,
    };
  }
}
