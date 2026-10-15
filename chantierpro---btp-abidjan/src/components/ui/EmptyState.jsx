/**
 * Composant d'état vide stylisé pour l'ingénierie BTP
 */

import React from 'react';
import { HardHat } from 'lucide-react';
import Button from './Button.jsx';

export default function EmptyState({
  icon: Icon = HardHat,
  title = 'Aucun élément trouvé',
  description = 'Il n\'y a actuellement aucune donnée correspondant à vos critères de recherche ou de filtre.',
  actionLabel = null,
  onAction = null,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 ${className}`}>
      <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-[#A64B2A]/20 text-[#A64B2A] flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>

      <h4 className="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-1">
        {title}
      </h4>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
