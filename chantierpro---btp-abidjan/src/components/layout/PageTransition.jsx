/**
 * Enveloppe d'animation de transition de page
 * Fondu subtil et léger glissement vers le haut, respectueux de prefers-reduced-motion
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
