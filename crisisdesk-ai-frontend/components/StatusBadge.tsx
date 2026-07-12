import React from 'react';

interface StatusBadgeProps {
  type: 'status' | 'urgency';
  value: string | null;
}

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  if (!value) {
    return <span className="text-slate-300 text-xs italic">Unset</span>;
  }

  const valLower = value.toLowerCase();
  let styles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ';

  if (type === 'urgency') {
    switch (valLower) {
      case 'critical':
        styles += 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'high':
        styles += 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'medium':
        styles += 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'low':
        styles += 'bg-slate-100 text-slate-600 border-slate-200';
        break;
      default:
        styles += 'bg-slate-50 text-slate-600 border-slate-200';
        break;
    }
  } else {
    switch (valLower) {
      case 'pending':
        styles += 'bg-yellow-50 text-yellow-700 border-yellow-200';
        break;
      case 'in_review':
        styles += 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'assigned':
        styles += 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'resolved':
        styles += 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'rejected':
        styles += 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      default:
        styles += 'bg-slate-50 text-slate-600 border-slate-200';
        break;
    }
  }

  const label = value.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return <span className={styles}>{label}</span>;
}
