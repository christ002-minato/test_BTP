/**
 * Compteur numérique animé pour KPIs
 * Montée fluide de 0 jusqu'à la valeur cible avec respect de prefers-reduced-motion
 */

import React, { useState, useEffect } from 'react';

export default function CountUp({
  end = 0,
  start = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  isCurrency = false,
  decimals = 0,
  className = ''
}) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    // Vérification prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setValue(end);
      return;
    }

    let startTime = null;
    let animationFrame;

    const target = Number(end);
    const initial = Number(start);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = initial + (target - initial) * easeProgress;

      setValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, start, duration]);

  const formatted = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}
      {formatted}
      {isCurrency ? ' FCFA' : suffix}
    </span>
  );
}
