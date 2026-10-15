/**
 * Carte métier technique ChantierPro
 * Style plan d'ingénieur, bords précis, touches de signalétique chantier
 */

import React from 'react';

export default function Card({
  children,
  className = '',
  title = null,
  subtitle = null,
  icon: Icon = null,
  action = null,
  accent = null, // 'orange' | 'blue' | 'safety' | 'danger' | null
  footer = null,
  noPadding = false,
  ...props
}) {
  const accentBorders = {
    orange: 'border-t-2 border-t-[#F26B1D]',
    blue: 'border-t-2 border-t-[#0B1B3A] dark:border-t-blue-500',
    safety: 'relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-stripes-safety before:rounded-t-lg',
    danger: 'border-t-2 border-t-rose-600',
    success: 'border-t-2 border-t-emerald-500'
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden transition-all duration-150 ${accentBorders[accent] || ''} ${className}`}
      {...props}
    >
      {(title || action || Icon) && (
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-md bg-[#0B1B3A]/5 dark:bg-blue-900/30 text-[#0B1B3A] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
