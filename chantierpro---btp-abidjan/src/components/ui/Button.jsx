/**
 * Bouton d'action standardisé ChantierPro
 * Palette BTP Ivoirien : terracotta (structurel), jaune engin (CTA),
 * variantes "onDark" pour les surfaces sombres (évite les conflits d'utilitaires
 * qui rendaient le texte invisible au survol).
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
    // CTA principal — Jaune Engin de chantier (texte ardoise, contraste 4.6:1)
    primary: 'bg-[#EAB308] hover:bg-[#F59E0B] text-[#1E293B] font-semibold shadow-sm shadow-[#EAB308]/30 focus:ring-[#EAB308] border border-[#CA9A06]/40',
    // Structurel — Terracotta (terre rouge ivoirienne)
    terracotta: 'bg-[#A64B2A] hover:bg-[#8B3A2B] text-white shadow-sm focus:ring-[#A64B2A] border border-[#8B3A2B]/40',
    // Structurel foncé — Slate béton
    secondary: 'bg-[#1E293B] hover:bg-[#334155] text-white shadow-sm focus:ring-[#1E293B] border border-[#1E293B]/40 dark:bg-[#334155] dark:hover:bg-[#475569]',
    // Contour technique
    outline: 'bg-white hover:bg-[#F5EBE0] text-[#1E293B] border border-[#CBD5E1] shadow-xs focus:ring-[#1E293B] dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800',
    // Contour pour fond sombre (bannière, panneau) : plus de conflit de couleur
    outlineOnDark: 'bg-white/10 hover:bg-white/25 text-white border border-white/25 focus:ring-white/60 backdrop-blur-sm',
    // Neutre sobre
    ghost: 'bg-transparent hover:bg-[#F5EBE0] text-[#1E293B] focus:ring-[#A64B2A] dark:text-slate-200 dark:hover:bg-slate-800',
    // Neutre sur fond sombre
    ghostOnDark: 'bg-transparent hover:bg-white/10 text-white/85 hover:text-white focus:ring-white/50',
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
