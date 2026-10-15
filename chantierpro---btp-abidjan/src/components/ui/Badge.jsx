/**
 * Badge de statut technique pour ChantierPro
 * Indicateurs visuels nets, pastilles avec pulsation pour les ruptures et alertes critiques
 */

import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className = ''
}) {
  const normalized = typeof children === 'string' ? children.toLowerCase() : '';

  // Détection automatique intelligente si non spécifiée
  let computedVariant = variant;
  if (variant === 'default') {
    if (normalized.includes('rupture') || normalized.includes('urgent') || normalized.includes('absent')) {
      computedVariant = 'rupture';
    } else if (normalized.includes('critique') || normalized.includes('retard')) {
      computedVariant = 'critique';
    } else if (normalized.includes('surveiller') || normalized.includes('attente') || normalized.includes('brouillon')) {
      computedVariant = 'warning';
    } else if (normalized.includes('normal') || normalized.includes('livré') || normalized.includes('présent') || normalized.includes('en cours')) {
      computedVariant = 'success';
    } else if (normalized.includes('finition') || normalized.includes('envoyé')) {
      computedVariant = 'info';
    } else if (normalized.includes('préparation')) {
      computedVariant = 'neutral';
    }
  }

  const variants = {
    // Rupture de stock (rouge violent + pulse)
    rupture: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800',
    // Stock critique
    critique: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800',
    // À surveiller
    warning: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    // Normal / Validé
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    // Information / Bleu
    info: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    // Neutre / Gris ardoise
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    // Sécurité chantier — jaune engin (accent marque)
    safety: 'bg-yellow-50 dark:bg-[#EAB308]/15 text-[#8B6A05] dark:text-[#EAB308] border border-[#EAB308]/50 dark:border-[#EAB308]/40'
  };

  const dotColors = {
    rupture: 'bg-rose-600',
    critique: 'bg-amber-600',
    warning: 'bg-yellow-500',
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
    safety: 'bg-[#EAB308]'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
    lg: 'text-sm px-3 py-1 font-semibold'
  };

  const shouldPulse = pulse || computedVariant === 'rupture';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full tracking-wide select-none ${variants[computedVariant] || variants.neutral} ${sizes[size]} ${className}`}
    >
      {(dot || shouldPulse) && (
        <span className="relative flex h-2 w-2">
          {shouldPulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[computedVariant] || 'bg-slate-500'}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[computedVariant] || 'bg-slate-500'}`} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
