/**
 * Composants Skeleton de chargement pour ChantierPro
 * Permet d'éviter les sauts d'interface lors du chargement des données
 */

import React from 'react';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const variants = {
    rect: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full'
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${variants[variant]} ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <div className="pt-2 flex justify-between">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
