import React from 'react';

export function Badge({ status, count, className = '' }) {
  const normalized = status ? status.toUpperCase() : '';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized === 'BORROWED') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'OVERDUE') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
  } else if (normalized === 'RETURNED') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'AVAILABLE') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'UNAVAILABLE' || normalized === 'OUT OF STOCK') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'ADMIN') {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (normalized === 'MEMBER') {
    colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}>
      {status}
      {count !== undefined && <span className="ml-1.5 font-bold">({count})</span>}
    </span>
  );
}
