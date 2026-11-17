import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-100'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      badge: 'text-blue-700 bg-blue-100'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      badge: 'text-purple-700 bg-purple-100'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      badge: 'text-rose-700 bg-rose-100'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      badge: 'text-amber-700 bg-amber-100'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-white rounded-2xl p-6 border ${scheme.border} shadow-sm hover:shadow-md transition duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {subtitle && (
          <span className="text-xs font-medium text-slate-500 ml-2">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
