/**
 * Système de notifications toast avec support d'action (ex: Annuler la sortie de stock)
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useData } from '../../context/DataContext.jsx';

export function ToastContainer() {
  const { toasts, removeToast } = useData();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, type = 'info', message, duration = 5000, action } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const configs = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-500',
      bg: 'bg-white dark:bg-slate-900',
      iconColor: 'text-emerald-500',
      stripe: 'bg-emerald-500'
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500',
      bg: 'bg-white dark:bg-slate-900',
      iconColor: 'text-amber-500',
      stripe: 'bg-amber-500'
    },
    error: {
      icon: AlertCircle,
      border: 'border-rose-500',
      bg: 'bg-white dark:bg-slate-900',
      iconColor: 'text-rose-500',
      stripe: 'bg-rose-500'
    },
    info: {
      icon: Info,
      border: 'border-[#0B1B3A] dark:border-blue-500',
      bg: 'bg-white dark:bg-slate-900',
      iconColor: 'text-[#0B1B3A] dark:text-blue-400',
      stripe: 'bg-[#0B1B3A]'
    }
  };

  const currentConfig = configs[type] || configs.info;
  const Icon = currentConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto relative flex items-start gap-3 p-3.5 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 ${currentConfig.bg} overflow-hidden`}
    >
      {/* Accent strip */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${currentConfig.stripe}`} />

      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ml-1 ${currentConfig.iconColor}`} />

      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          {message}
        </p>

        {action && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                action.onClick();
                onDismiss();
              }}
              className="text-xs font-bold text-[#F26B1D] hover:underline uppercase tracking-wider cursor-pointer"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default ToastContainer;
