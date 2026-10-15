/**
 * Jauge horizontale animée pour les niveaux de stock
 * Affiche la jauge de remplissage avec repère physique du seuil critique
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function Gauge({
  current = 0,
  threshold = 100,
  optimal = 400,
  unit = 'unités',
  showLabels = true,
  height = 'h-2.5',
  className = ''
}) {
  const maxScale = Math.max(optimal, threshold * 1.5, current * 1.1, 10);
  const fillPercentage = Math.min(100, Math.max(0, (current / maxScale) * 100));
  const thresholdPercentage = Math.min(100, Math.max(0, (threshold / maxScale) * 100));

  // Couleur de la barre en fonction du stock par rapport au seuil
  let barColor = 'bg-emerald-500';
  if (current === 0) {
    barColor = 'bg-rose-600';
  } else if (current <= threshold) {
    barColor = 'bg-rose-500';
  } else if (current <= threshold * 1.3) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Barre de jauge */}
      <div className={`relative w-full ${height} bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60`}>
        {/* Remplissage animé */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />

        {/* Repère vertical du seuil d'alerte (curseur de sécurité) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 opacity-70"
          style={{ left: `${thresholdPercentage}%` }}
          title={`Seuil d'alerte: ${threshold} ${unit}`}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {current.toLocaleString('fr-FR')}
            </span>
            <span>{unit}</span>
          </span>
          <span className="text-[10px] text-slate-400">
            Seuil min: <strong className="text-rose-600 dark:text-rose-400">{threshold}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
