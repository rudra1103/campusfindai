import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function getScoreBadgeColor(score: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (score >= 80) {
    return {
      bg: 'bg-emerald-50 text-emerald-700',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'High Priority Match',
    };
  } else if (score >= 60) {
    return {
      bg: 'bg-blue-50 text-blue-700',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Possible Match',
    };
  } else {
    return {
      bg: 'bg-amber-50 text-amber-700',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Low Priority Match',
    };
  }
}

export function getStatusBadge(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case 'active':
      return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active' };
    case 'matched':
      return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Match Found' };
    case 'claim_pending':
      return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Claim Pending' };
    case 'recovered':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Recovered' };
    case 'closed':
      return { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Closed' };
    case 'submitted':
      return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' };
    case 'under_review':
      return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Under Review' };
    case 'info_requested':
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Info Requested' };
    case 'approved':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Approved' };
    case 'rejected':
      return { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Rejected' };
    case 'handover_scheduled':
      return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Handover Scheduled' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-800', label: status };
  }
}

// Tokenize text into normalized words
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
}

// Jaccard token similarity (0 - 1)
export function jaccardSimilarity(textA: string, textB: string): number {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));
  if (tokensA.size === 0 && tokensB.size === 0) return 1;
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  tokensA.forEach(t => {
    if (tokensB.has(t)) intersectionCount++;
  });

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

// Days between two YYYY-MM-DD dates
export function daysBetweenDates(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
