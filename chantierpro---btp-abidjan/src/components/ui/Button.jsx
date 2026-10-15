/**
 * Bouton d'action standardisé ChantierPro
 * Rigueur technique BTP, micro-interaction Framer Motion et état de chargement
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-md';

  const variants = {
    // Orange sécurité BTP #F26B1D
    primary: 'bg-[#F26B1D] hover:bg-[#d9590f] text-white shadow-sm shadow-[#F26B1D]/20 focus:ring-[#F26B1D] border border-[#d9590f]/30',
    // Bleu nuit #0B1B3A
    secondary: 'bg-[#0B1B3A] hover:bg-[#152a55] text-white shadow-sm focus:ring-[#0B1B3A] border border-[#0B1B3A]/40 dark:bg-[#1E293B] dark:hover:bg-[#334155]',
    // Contour technique
    outline: 'bg-white hover:bg-[#F8FAFC] text-[#0B1B3A] border border-[#CBD5E1] shadow-xs focus:ring-[#0B1B3A] dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    // Neutre sobre
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800',
    // Rouge danger / incident
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-rose-700/40',
    // Succès
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500'
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1.5 h-7',
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-9',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11'
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Traitement...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </motion.button>
  );
}
