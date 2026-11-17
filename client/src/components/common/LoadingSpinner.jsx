import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size] || 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className={`${sizeClasses} animate-spin text-emerald-600 mb-2`} />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
}
